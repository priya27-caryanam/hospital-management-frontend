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
import {nurseAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const AssignedPatientsScreen = ({navigation, route}) => {
  const {nurseId} = route.params;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPatients = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const response = await nurseAPI.getAssignedPatients(nurseId);
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      setError(apiErr.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(
    () => {
      loadPatients();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nurseId],
  );

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
            <Text style={styles.subtext}>Patient ID: MC-{item.id}</Text>
            <Text style={styles.subtext}>
              {item.phoneNumber || item.mobile || 'No contact phone'}
            </Text>
          </View>
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText}>
              Room {item.roomNumber || 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner
        visible={loading}
        message="Loading assigned patients..."
      />

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadPatients()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : patients.length === 0 && !loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>🏥</Text>
          <Text style={styles.errorText}>No Patients Assigned</Text>
          <Text style={styles.subtitle}>
            You currently do not have any patients assigned to your care shift.
          </Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPatients(true)}
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
    marginBottom: 4,
  },
  subtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  roomBadge: {
    backgroundColor: Colors.primaryExtraLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roomBadgeText: {
    fontSize: FontSize.xs,
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

export default AssignedPatientsScreen;
