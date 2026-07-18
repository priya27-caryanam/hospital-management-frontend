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
import {localDB} from '../utils/localDB';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import {SCREENS} from '../navigation/AppNavigator';

const StaffListScreen = ({navigation}) => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadStaff = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await localDB.getStaff();
      setStaff(data);
      applyFilter(activeFilter, data);
    } catch (err) {
      console.error('[StaffList] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter, dataList = staff) => {
    if (filter === 'ALL') {
      setFilteredStaff(dataList);
    } else {
      setFilteredStaff(dataList.filter(item => (item.role || '').toUpperCase() === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(filter);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStaff();
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const renderItem = ({item}) => {
    const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Staff Member';
    const isNurse = item.role === 'NURSE';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatar}>{isNurse ? '👩‍⚕️' : '👨‍💼'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.roleText}>{item.role}</Text>
            {item.departmentId ? (
              <Text style={styles.deptText}>Dept ID: {item.departmentId}</Text>
            ) : null}
          </View>
          {item.shift ? (
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftText}>⏱️ {item.shift}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>QUALIFICATION</Text>
            <Text style={styles.detailValue}>{item.qualification || 'N/A'}</Text>
          </View>
          {isNurse && (
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>EXPERIENCE</Text>
              <Text style={styles.detailValue}>{item.experience ? `${item.experience} Years` : 'N/A'}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.contactText}>📞 {item.mobile || 'No Phone'}</Text>
          <Text style={styles.contactText}>✉️ {item.email || 'No Email'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['ALL', 'NURSE', 'RECEPTIONIST'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => handleFilterChange(filter)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter && styles.filterTabTextActive,
              ]}>
              {filter}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredStaff.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>👥</Text>
          <Text style={styles.emptyText}>No Staff Registered</Text>
          <Text style={styles.subtitle}>
            Register staff members under Quick Actions -> Register Staff to populate this list.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadStaff(true)}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryExtraLight,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  deptText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  shiftBadge: {
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shiftText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
  },
  contactText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StaffListScreen;
