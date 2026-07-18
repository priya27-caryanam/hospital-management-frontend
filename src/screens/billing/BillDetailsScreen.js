import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {billingAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {
  handleApiError,
  formatDate,
  getStatusColor,
} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const DetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const BillDetailsScreen = ({navigation, route}) => {
  const {appointmentId} = route.params;
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBill = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await billingAPI.getByAppointment(appointmentId);
      setBill(response.data);
    } catch (err) {
      try {
        const localBill = await localDB.getBillByAppointmentId(appointmentId);
        if (localBill) {
          setBill(localBill);
        } else {
          const apiErr = handleApiError(err, navigation);
          setError(apiErr.message);
        }
      } catch (localErr) {
        const apiErr = handleApiError(err, navigation);
        setError(apiErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      loadBill();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointmentId],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner visible={true} message="Loading bill details..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadBill}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>
            No billing record found for this appointment.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.navigate(SCREENS.GENERATE_BILL)}>
            <Text style={styles.retryText}>Generate Bill</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(bill.status || 'PENDING');
  const isPaid = (bill.status || '').toUpperCase() === 'PAID';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View
              style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
              <Text style={[styles.statusText, {color: statusStyle.text}]}>
                {(bill.status || 'PENDING').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Bill Reference ID" value={`BILL-2026-${bill.id}`} />
          <DetailRow
            label="Appointment ID"
            value={String(bill.appointmentId)}
          />
          <DetailRow label="Description" value={bill.description} />
          <DetailRow label="Billing Date" value={formatDate(bill.createdAt)} />

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text style={styles.totalValue}>
              ₹{parseFloat(bill.amount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {!isPaid ? (
          <TouchableOpacity
            style={styles.payBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(SCREENS.PAYMENT, {bill})}>
            <Text style={styles.payBtnText}>💳 Proceed to Payment</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.paidNotice}>
            <Text style={styles.paidNoticeText}>
              ✅ This bill has been fully settled.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      android: {elevation: 4},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadowDark,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  payBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  paidNotice: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  paidNoticeText: {
    color: Colors.success,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
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
    color: Colors.textSecondary,
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
  retryText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});

export default BillDetailsScreen;
