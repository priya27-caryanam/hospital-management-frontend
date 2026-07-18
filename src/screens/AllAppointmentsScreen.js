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
import {formatDate, getStatusColor} from '../utils/apiHelpers';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import {SCREENS} from '../navigation/AppNavigator';

const AllAppointmentsScreen = ({navigation}) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadAppointments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await localDB.getAppointments();
      setAppointments(data);
      applyFilter(activeFilter, data);
    } catch (err) {
      console.error('[AllAppointments] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter, dataList = appointments) => {
    if (filter === 'ALL') {
      setFilteredAppointments(dataList);
    } else {
      setFilteredAppointments(dataList.filter(item => (item.status || 'SCHEDULED').toUpperCase() === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(filter);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments();
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const renderItem = ({item}) => {
    const statusStyle = getStatusColor(item.status || 'SCHEDULED');
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(SCREENS.APPT_DETAILS, {appointmentId: item.id})
        }>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatar}>📅</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.patient}>Patient ID: MC-{item.patientId}</Text>
            <Text style={styles.doctor}>Doctor ID: MC-{item.doctorId}</Text>
            <Text style={styles.date}>{formatDate(item.appointmentDate)} at {item.appointmentTime}</Text>
          </View>
          <View style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.statusText, {color: statusStyle.text}]}>
              {(item.status || 'SCHEDULED').toUpperCase()}
            </Text>
          </View>
        </View>
        {item.reason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText} numberOfLines={1}>
              💬 {item.reason}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(filter => (
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
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredAppointments.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>📅</Text>
          <Text style={styles.emptyText}>No Appointments Found</Text>
          <Text style={styles.subtitle}>
            {activeFilter === 'ALL'
              ? 'Book appointments to see them listed here.'
              : `There are no ${activeFilter.toLowerCase()} appointments.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAppointments(true)}
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
    marginHorizontal: 3,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryExtraLight,
  },
  filterTabText: {
    fontSize: 11,
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
  patient: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  doctor: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  reasonBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  reasonText: {
    fontSize: FontSize.sm,
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

export default AllAppointmentsScreen;
