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
import {patientAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError, formatDate} from '../../utils/apiHelpers';
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

const PatientProfileScreen = ({navigation, route}) => {
  const {patientId} = route.params;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPatient = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await patientAPI.getById(patientId);
      setPatient(response.data);
    } catch (err) {
      try {
        const localPat = await localDB.getPatientById(patientId);
        if (localPat) {
          setPatient(localPat);
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
      loadPatient();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patientId],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner visible={true} message="Loading patient profile..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadPatient}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>Patient profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const patientName =
    patient.name ||
    `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
    'Unnamed Patient';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarBg}>
              <Text style={styles.avatarText}>🏥</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.patientName}>{patientName}</Text>
              <Text style={styles.patientId}>ID: MC-{patient.id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow
            label="Date of Birth"
            value={formatDate(patient.dateOfBirth)}
          />
          <DetailRow label="Gender" value={patient.gender} />
          <DetailRow label="Blood Group" value={patient.bloodGroup} />
          <DetailRow
            label="Height"
            value={patient.height ? `${patient.height} cm` : 'N/A'}
          />
          <DetailRow
            label="Weight"
            value={patient.weight ? `${patient.weight} kg` : 'N/A'}
          />
          <DetailRow
            label="Contact Number"
            value={patient.phoneNumber || patient.mobile}
          />
          <DetailRow label="Email" value={patient.email} />
          <DetailRow
            label="Emergency Contact"
            value={patient.emergencyContact}
          />
          <DetailRow
            label="Address"
            value={
              patient.address
                ? `${patient.address}, ${patient.city || ''}, ${
                    patient.state || ''
                  } - ${patient.pincode || ''}`
                : 'N/A'
            }
          />
        </View>

        {/* Quick Navigate Buttons */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(SCREENS.PATIENT_APPTS, {patientId: patient.id})
          }>
          <Text style={styles.actionBtnText}>📅 View Appointment History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.prescriptionBtn]}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(SCREENS.PRESCRIPTION_DETAILS, {
              appointmentId: null,
            })
          }>
          <Text style={styles.actionBtnText}>💊 View Prescriptions</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  patientId: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
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
    lineHeight: 22,
  },
  actionBtn: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  prescriptionBtn: {
    borderColor: Colors.accent,
  },
  actionBtnText: {
    color: Colors.textPrimary,
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

export default PatientProfileScreen;
