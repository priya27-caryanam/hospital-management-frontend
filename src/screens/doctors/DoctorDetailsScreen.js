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
import {doctorAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError, getStatusColor} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const DetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const DoctorDetailsScreen = ({navigation, route}) => {
  const {doctorId} = route.params;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDoctor = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorAPI.getById(doctorId);
      setDoctor(response.data);
    } catch (err) {
      try {
        const localDoc = await localDB.getDoctorById(doctorId);
        if (localDoc) {
          setDoctor(localDoc);
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
      loadDoctor();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doctorId],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner visible={true} message="Loading doctor profile..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadDoctor}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>Doctor profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(doctor.status || 'ACTIVE');

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarBg}>
              <Text style={styles.avatarText}>👨‍⚕️</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.docName}>
                {doctor.name || `${doctor.firstName} ${doctor.lastName}`}
              </Text>
              <Text style={styles.docSpecialty}>
                {doctor.specialization || 'General Physician'}
              </Text>
              <View
                style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
                <Text style={[styles.statusText, {color: statusStyle.text}]}>
                  {(doctor.status || 'ACTIVE').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Qualification" value={doctor.qualification} />
          <DetailRow
            label="Experience"
            value={`${doctor.experience || 0} Years`}
          />
          <DetailRow
            label="Consultation Fee"
            value={`₹${doctor.consultationFee || 0}`}
          />
          <DetailRow
            label="Department ID"
            value={String(doctor.departmentId || 'N/A')}
          />
          <DetailRow label="License Number" value={doctor.licenseNumber} />
          <DetailRow label="Email" value={doctor.email} />
        </View>
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 36,
  },
  headerInfo: {
    flex: 1,
  },
  docName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  docSpecialty: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    lineHeight: 22,
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

export default DoctorDetailsScreen;
