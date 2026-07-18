import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {billingAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const PaymentScreen = ({navigation, route}) => {
  const {bill} = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setSubmitting(true);
    try {
      try {
        await billingAPI.pay(bill.id);
      } catch (apiErr) {
        console.warn('[Payment API error, updating locally only]:', apiErr);
      }
      await localDB.payBill(bill.id);
      setSuccess(true);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      Alert.alert('Payment Failed', apiErr.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your payment of ₹{parseFloat(bill.amount).toFixed(2)} has been
            processed. The invoice has been updated to PAID.
          </Text>

          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.8}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: SCREENS.BILL_DETAILS,
                    params: {appointmentId: bill.appointmentId},
                  },
                ],
              })
            }>
            <Text style={styles.doneBtnText}>Go to Invoice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Bill Reference</Text>
            <Text style={styles.value}>BILL-2026-{bill.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Particulars</Text>
            <Text style={styles.value}>{bill.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>
              ₹{parseFloat(bill.amount).toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.notice}>
          Note: This is a simulation payment gateway. Confirming this action
          will update the system record instantly.
        </Text>

        <Button
          title={`Confirm Payment ₹${parseFloat(bill.amount).toFixed(2)}`}
          onPress={handlePayment}
          loading={submitting}
          style={styles.payBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
  },
  summaryCard: {
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
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  totalLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  notice: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  payBtn: {
    backgroundColor: Colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});

export default PaymentScreen;
