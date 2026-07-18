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
import {nurseAPI} from '../../services/api';
import {handleApiError, getStatusColor} from '../../utils/apiHelpers';
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

const NurseProfileScreen = ({navigation, route}) => {
  const {nurseId} = route.params;
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNurse = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await nurseAPI.getById(nurseId);
      setNurse(response.data);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      loadNurse();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nurseId],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner visible={true} message="Loading nurse profile..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadNurse}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!nurse) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🔍</Text>
          <Text style={styles.errorText}>Nurse profile not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(nurse.status || 'ACTIVE');
  const nurseName =
    nurse.name ||
    `${nurse.firstName || ''} ${nurse.lastName || ''}`.trim() ||
    'Nurse';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarBg}>
              <Text style={styles.avatarText}>👩‍⚕️</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.nurseName}>{nurseName}</Text>
              <Text style={styles.nurseTitle}>Nurse Practitioner</Text>
              <View
                style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
                <Text style={[styles.statusText, {color: statusStyle.text}]}>
                  {(nurse.status || 'ACTIVE').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow
            label="Department ID"
            value={String(nurse.departmentId || 'N/A')}
          />
          <DetailRow label="Work Shift" value={nurse.shift} />
          <DetailRow label="Qualification" value={nurse.qualification} />
          <DetailRow
            label="Experience"
            value={`${nurse.experience || 0} Years`}
          />
          <DetailRow label="License Number" value={nurse.licenseNumber} />
          <DetailRow label="Email" value={nurse.email} />
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(SCREENS.ASSIGNED_PATIENTS, {nurseId: nurse.id})
          }>
          <Text style={styles.actionBtnText}>🏥 View Assigned Patients</Text>
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
  nurseName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  nurseTitle: {
    fontSize: FontSize.sm,
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
  actionBtn: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
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

export default NurseProfileScreen;
