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

const ReportsListScreen = ({navigation}) => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [totalRevenue, setTotalRevenue] = useState(0);

  const loadReports = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await localDB.getBills();
      setBills(data);
      applyFilter(activeFilter, data);
      
      // Calculate revenue (sum of PAID bills)
      const paidSum = data
        .filter(b => (b.status || '').toUpperCase() === 'PAID')
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      setTotalRevenue(paidSum);
    } catch (err) {
      console.error('[ReportsList] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter, dataList = bills) => {
    if (filter === 'ALL') {
      setFilteredBills(dataList);
    } else {
      setFilteredBills(dataList.filter(item => (item.status || 'PENDING').toUpperCase() === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(filter);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReports();
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const renderItem = ({item}) => {
    const isPaid = (item.status || 'PENDING').toUpperCase() === 'PAID';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(SCREENS.BILL_DETAILS, {appointmentId: item.appointmentId})
        }>
        <View style={styles.cardHeader}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatar}>💰</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.invoiceTitle}>Invoice #{item.id || 'N/A'}</Text>
            <Text style={styles.apptText}>Appt ID: MC-{item.appointmentId}</Text>
            <Text style={styles.descText} numberOfLines={1}>{item.description}</Text>
          </View>
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>₹{item.amount}</Text>
            <View style={[styles.statusIndicator, {backgroundColor: isPaid ? Colors.success : Colors.error}]} />
            <Text style={[styles.statusText, {color: isPaid ? Colors.success : Colors.error}]}>
              {(item.status || 'PENDING').toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Total Collected Revenue</Text>
        <Text style={styles.revenueAmount}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
        <Text style={styles.revenueSub}>Based on all settled bills</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['ALL', 'PAID', 'PENDING'].map(filter => (
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

      {filteredBills.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={styles.emptyText}>No Invoices Found</Text>
          <Text style={styles.subtitle}>
            Generate bills/invoices under Quick Actions -> Billing to populate these reports.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadReports(true)}
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
  revenueCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    margin: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      android: {elevation: 4},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
    }),
  },
  revenueLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  revenueAmount: {
    color: Colors.white,
    fontSize: FontSize.xxl + 4,
    fontWeight: FontWeight.bold,
    marginBottom: 6,
  },
  revenueSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.xs,
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
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  apptText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  descText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  amountBadge: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
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

export default ReportsListScreen;
