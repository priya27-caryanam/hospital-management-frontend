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
import {doctorAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const DoctorsByDepartmentScreen = ({navigation, route}) => {
  const departmentId = route?.params?.departmentId;
  const departmentName = route?.params?.departmentName || 'Doctors';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDoctors = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      if (departmentId) {
        const response = await doctorAPI.getByDepartment(departmentId);
        const backendDoctors = Array.isArray(response.data) ? response.data : [];
        const local = await localDB.getDoctors();
        const localDeptDoctors = local.filter(d => String(d.departmentId) === String(departmentId));
        const merged = [...localDeptDoctors];
        backendDoctors.forEach(bd => {
          if (!merged.some(md => String(md.id) === String(bd.id))) {
            merged.push(bd);
          }
        });
        setDoctors(merged);
      } else {
        const allLocal = await localDB.getDoctors();
        setDoctors(allLocal);
      }
    } catch (err) {
      if (departmentId) {
        const local = await localDB.getDoctors();
        const localDeptDoctors = local.filter(d => String(d.departmentId) === String(departmentId));
        setDoctors(localDeptDoctors);
      } else {
        const allLocal = await localDB.getDoctors();
        setDoctors(allLocal);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(
    () => {
      loadDoctors();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departmentId],
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate(SCREENS.DOCTOR_DETAILS, {doctorId: item.id})
      }>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBg}>
          <Text style={styles.avatar}>👨‍⚕️</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>
            {item.name || `${item.firstName} ${item.lastName}`}
          </Text>
          <Text style={styles.specialty}>
            {item.specialization || 'Specialist'}
          </Text>
          <Text style={styles.qualification}>
            {item.qualification || 'MBBS'}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardFooter}>
        <Text style={styles.experience}>⏳ {item.experience || 0} yrs exp</Text>
        <View style={styles.feeBadge}>
          <Text style={styles.feeText}>₹{item.consultationFee || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Removed departmentId guard to allow displaying all doctors when departmentId is null.

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner visible={loading} message="Loading doctors..." />
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{departmentName}</Text>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadDoctors()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : doctors.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>👨‍⚕️</Text>
          <Text style={styles.errorText}>No Doctors Found</Text>
          <Text style={styles.subtitle}>
            No doctors are registered in this department yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDoctors(true)}
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
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      android: {elevation: 3},
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  specialty: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  qualification: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experience: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  feeBadge: {
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  feeText: {
    fontSize: FontSize.sm,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
});

export default DoctorsByDepartmentScreen;
