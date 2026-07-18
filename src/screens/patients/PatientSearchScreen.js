import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {patientAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError} from '../../utils/apiHelpers';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const PatientSearchScreen = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const local = await localDB.getPatients();
      setPatients(local);
      setSearched(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!query.trim()) {
        loadPatients();
      }
    });
    loadPatients();
    return unsubscribe;
  }, [navigation, query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      loadPatients();
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await patientAPI.search(query.trim());
      const backendPatients = Array.isArray(response.data) ? response.data : [];
      
      const local = await localDB.getPatients();
      const filteredLocal = local.filter(p => {
        const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const q = query.trim().toLowerCase();
        return name.includes(q) || (p.email && p.email.toLowerCase().includes(q)) || (p.mobile && p.mobile.includes(q));
      });

      const merged = [...filteredLocal];
      backendPatients.forEach(bp => {
        if (!merged.some(mp => String(mp.id) === String(bp.id))) {
          merged.push(bp);
        }
      });
      setPatients(merged);
    } catch (err) {
      const local = await localDB.getPatients();
      const filteredLocal = local.filter(p => {
        const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const q = query.trim().toLowerCase();
        return name.includes(q) || (p.email && p.email.toLowerCase().includes(q)) || (p.mobile && p.mobile.includes(q));
      });
      setPatients(filteredLocal);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => {
    const patientName =
      item.name ||
      `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
      'Patient';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(SCREENS.PATIENT_PROFILE, {patientId: item.id})
        }>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatar}>🏥</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{patientName}</Text>
            <Text style={styles.contact}>{item.email || 'No email'}</Text>
            <Text style={styles.contact}>
              {item.phoneNumber || item.mobile || 'No phone'}
            </Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>MC-{item.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by name, email or phone..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
          rightIcon={
            query.trim() ? (
              <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>Go</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Searching patients...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>{searched ? '📭' : '🏥'}</Text>
          <Text style={styles.title}>{searched ? 'No Patients Found' : 'No Patients Registered'}</Text>
          <Text style={styles.subtitle}>
            {searched
              ? `We couldn't find any patient matching "${query}". Try a different search.`
              : 'Register a patient to get started.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  searchBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSize.xs,
  },
  list: {
    padding: 16,
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
    marginBottom: 2,
  },
  contact: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  idBadge: {
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 10,
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
    padding: 32,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  emoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
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
  errorText: {
    fontSize: FontSize.base,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});

export default PatientSearchScreen;
