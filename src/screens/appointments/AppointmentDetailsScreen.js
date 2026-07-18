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
import {appointmentAPI} from '../../services/api';
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

const AppointmentDetailsScreen = ({navigation, route}) => {
  const {appointmentId} = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAppointment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await appointmentAPI.getById(appointmentId);
      setAppointment(response.data);
    } catch (err) {
      try {
        const localAppt = await localDB.getAppointmentById(appointmentId);
        if (localAppt) {
          setAppointment(localAppt);
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
      loadAppointment();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointmentId],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner
          visible={true}
          message="Loading appointment details..."
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadAppointment}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>Appointment details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(appointment.status || 'SCHEDULED');

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.statusSection}>
            <View
              style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
              <Text style={[styles.statusText, {color: statusStyle.text}]}>
                {(appointment.status || 'SCHEDULED').toUpperCase()}
              </Text>
            </View>
          </View>

          <DetailRow label="Appointment ID" value={String(appointment.id)} />
          <DetailRow label="Patient ID" value={String(appointment.patientId)} />
          <DetailRow label="Doctor ID" value={String(appointment.doctorId)} />
          <DetailRow
            label="Appointment Date"
            value={formatDate(appointment.appointmentDate)}
          />
          <DetailRow
            label="Appointment Time"
            value={appointment.appointmentTime}
          />
          <DetailRow label="Reason" value={appointment.reason} />
          <DetailRow
            label="Created At"
            value={formatDate(appointment.createdAt)}
          />
        </View>

        {/* View Prescription and View Bill Actions */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.outlineBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREENS.PRESCRIPTION_DETAILS, {
                appointmentId: appointment.id,
              })
            }>
            <Text style={styles.outlineBtnText}>💊 View Prescription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.outlineBtn, styles.billBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREENS.BILL_DETAILS, {
                appointmentId: appointment.id,
              })
            }>
            <Text style={[styles.outlineBtnText, styles.billBtnText]}>
              💰 View Bill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change status button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(SCREENS.UPDATE_APPT_STATUS, {
              appointment,
            })
          }>
          <Text style={styles.primaryBtnText}>
            ⚙️ Update Appointment Status
          </Text>
        </TouchableOpacity>
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
  statusSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  outlineBtn: {
    backgroundColor: Colors.white,
  },
  outlineBtnText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  billBtn: {
    borderColor: Colors.accent,
  },
  billBtnText: {
    color: Colors.accent,
  },
  primaryBtn: {
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
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
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
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
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

export default AppointmentDetailsScreen;
