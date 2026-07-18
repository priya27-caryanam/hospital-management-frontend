import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {prescriptionAPI} from '../../services/api';
import {handleApiError, formatDate} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const PrescriptionDetailsScreen = ({navigation, route}) => {
  const initialApptId = route?.params?.appointmentId;

  const [appointmentId, setAppointmentId] = useState(
    initialApptId ? String(initialApptId) : '',
  );
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(!!initialApptId);

  const loadPrescription = async apptId => {
    const searchId = apptId || appointmentId;
    if (!searchId.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await prescriptionAPI.getByAppointment(
        parseInt(searchId, 10),
      );
      setPrescription(response.data);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      setError(apiErr.message);
      setPrescription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      if (initialApptId) {
        loadPrescription(String(initialApptId));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialApptId],
  );

  const renderMedication = ({item, index}) => (
    <View style={styles.medCard}>
      <View style={styles.medHeader}>
        <Text style={styles.medName}>{item.medicineName}</Text>
        <Text style={styles.medIndex}>#{index + 1}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.medGrid}>
        <View style={styles.medItem}>
          <Text style={styles.medLabel}>DOSAGE</Text>
          <Text style={styles.medVal}>{item.dosage || 'N/A'}</Text>
        </View>
        <View style={styles.medItem}>
          <Text style={styles.medLabel}>FREQUENCY</Text>
          <Text style={styles.medVal}>{item.frequency || 'N/A'}</Text>
        </View>
        <View style={styles.medItem}>
          <Text style={styles.medLabel}>DURATION</Text>
          <Text style={styles.medVal}>{item.duration || 'N/A'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner visible={loading} message="Loading prescription..." />

      {/* Input query section if appointmentId not originally provided */}
      {!initialApptId && (
        <View style={styles.searchBox}>
          <Input
            placeholder="Enter Appointment ID..."
            value={appointmentId}
            onChangeText={setAppointmentId}
            onSubmitEditing={() => loadPrescription()}
            keyboardType="numeric"
            leftIcon={<Text style={styles.icon}>📅</Text>}
            rightIcon={
              appointmentId.trim() ? (
                <TouchableOpacity
                  onPress={() => loadPrescription()}
                  style={styles.loadBtn}>
                  <Text style={styles.loadBtnText}>Load</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      )}

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadPrescription()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !searched ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>💊</Text>
          <Text style={styles.title}>Prescription Reader</Text>
          <Text style={styles.subtitle}>
            Enter the appointment ID above to display the prescribed medication
            catalog.
          </Text>
        </View>
      ) : !prescription ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>📭</Text>
          <Text style={styles.title}>No Prescription Record</Text>
          <Text style={styles.subtitle}>
            There is no prescription filed for Appointment ID: {appointmentId}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescription.medications || []}
          keyExtractor={(_, index) => String(index)}
          renderItem={renderMedication}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📋 Prescription Metadata</Text>
              <Text style={styles.infoText}>
                Appointment ID: {prescription.appointmentId}
              </Text>
              <Text style={styles.infoText}>
                Prescribed On: {formatDate(prescription.createdAt)}
              </Text>
              {prescription.notes ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.notesLabel}>Notes & Instructions:</Text>
                  <Text style={styles.notesVal}>{prescription.notes}</Text>
                </>
              ) : null}
            </View>
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
  searchBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.background,
  },
  icon: {
    fontSize: 18,
  },
  loadBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loadBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: FontSize.xs,
  },
  list: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  infoTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  notesVal: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  medCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    ...Platform.select({
      android: {elevation: 2},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  medIndex: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
  medGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medItem: {
    width: '30%',
  },
  medLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  medVal: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
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
  title: {
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
  errorText: {
    fontSize: FontSize.base,
    color: Colors.error,
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

export default PrescriptionDetailsScreen;
