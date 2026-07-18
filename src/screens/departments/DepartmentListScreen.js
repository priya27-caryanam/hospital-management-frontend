import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SCREENS} from '../../navigation/AppNavigator';
import {departmentAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError, getStatusColor} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const DepartmentListScreen = ({navigation}) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDepartments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      let backendList = [];
      try {
        const response = await departmentAPI.getAll();
        backendList = Array.isArray(response.data) ? response.data : [];
      } catch (apiErr) {
        console.warn('[DepartmentList Screen API error, relying on localDB]:', apiErr);
      }
      const local = await localDB.getDepartments();
      const merged = [...local];
      backendList.forEach(bd => {
        if (!merged.some(md => String(md.id) === String(bd.id))) {
          merged.push(bd);
        }
      });
      setDepartments(merged);
    } catch (err) {
      const local = await localDB.getDepartments();
      setDepartments(local);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(
    () => {
      const unsubscribe = navigation.addListener('focus', () => {
        loadDepartments();
      });
      loadDepartments();
      return unsubscribe;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation],
  );

  const renderItem = ({item}) => {
    const statusStyle = getStatusColor(item.status || 'ACTIVE');
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(SCREENS.DEPT_DETAILS, {department: item})
        }>
        <View style={styles.cardContent}>
          <Text style={styles.deptName}>
            {item.departmentName || 'Unnamed Department'}
          </Text>
          <Text style={styles.deptDesc} numberOfLines={2}>
            {item.description || 'No description provided.'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.floorText}>
              🏢 Floor {item.floorNumber ?? 'N/A'}
            </Text>
            <View
              style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
              <Text style={[styles.statusText, {color: statusStyle.text}]}>
                {(item.status || 'ACTIVE').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner visible={loading} message="Loading departments..." />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadDepartments()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : departments.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏢</Text>
          <Text style={styles.emptyTitle}>No Departments Found</Text>
          <Text style={styles.emptySubtitle}>
            Click the "+" button to add a new department.
          </Text>
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDepartments(true)}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(SCREENS.DEPT_CREATE)}>
        <Text style={styles.fabText}>➕</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 88,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
    }),
  },
  cardContent: {
    padding: 16,
  },
  deptName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  deptDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floorText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: FontWeight.medium,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      android: {elevation: 6},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  fabText: {
    fontSize: 20,
    color: Colors.white,
  },
});

export default DepartmentListScreen;
