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
import {symptomsAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const SymptomsListScreen = ({navigation}) => {
  const [symptoms, setSymptoms] = useState([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSymptoms = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const response = await symptomsAPI.getAll();
      const dataList = Array.isArray(response.data) ? response.data : [];
      setSymptoms(dataList);
      setFilteredSymptoms(dataList);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      setError(apiErr.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(
    () => {
      loadSymptoms();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSearch = text => {
    setQuery(text);
    if (!text.trim()) {
      setFilteredSymptoms(symptoms);
      return;
    }
    const filtered = symptoms.filter(s =>
      (s.name || '').toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredSymptoms(filtered);
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBg}>
          <Text style={styles.avatar}>🩺</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc}>
            {item.description || 'No description provided.'}
          </Text>
        </View>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>#{item.id}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner visible={loading} message="Loading symptoms..." />

      <View style={styles.searchBox}>
        <Input
          placeholder="Filter symptoms..."
          value={query}
          onChangeText={handleSearch}
          leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
        />
      </View>

      {/* Suggest Button */}
      <TouchableOpacity
        style={styles.suggestBtn}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(SCREENS.SUGGEST_DEPT)}>
        <Text style={styles.suggestBtnText}>
          🔍 Find Department for Symptoms
        </Text>
      </TouchableOpacity>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadSymptoms()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredSymptoms.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🩺</Text>
          <Text style={styles.errorText}>No Symptoms Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSymptoms}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSymptoms(true)}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(SCREENS.ADD_SYMPTOM)}>
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
  searchBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  searchIcon: {
    fontSize: 18,
  },
  suggestBtn: {
    backgroundColor: Colors.white,
    borderColor: Colors.accent,
    borderWidth: 2,
    borderRadius: 14,
    height: 48,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestBtnText: {
    color: Colors.accent,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  list: {
    padding: 16,
    paddingBottom: 88,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      android: {elevation: 2},
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
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  idBadge: {
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  centerContainer: {
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
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
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

export default SymptomsListScreen;
