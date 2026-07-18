import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {prescriptionAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const AddPrescriptionScreen = ({navigation}) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([
    {medicineName: '', dosage: '', frequency: '', duration: ''},
  ]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const addMedicationRow = () => {
    setMedications(prev => [
      ...prev,
      {medicineName: '', dosage: '', frequency: '', duration: ''},
    ]);
  };

  const removeMedicationRow = index => {
    if (medications.length === 1) {
      return;
    }
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    setMedications(prev =>
      prev.map((med, i) => (i === index ? {...med, [field]: value} : med)),
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!appointmentId.trim()) {
      newErrors.appointmentId = 'Appointment ID is required';
    } else if (isNaN(appointmentId)) {
      newErrors.appointmentId = 'Appointment ID must be a number';
    }

    let medicationError = false;
    medications.forEach((med, idx) => {
      if (!med.medicineName.trim()) {
        medicationError = true;
      }
    });

    if (medicationError) {
      newErrors.medications = 'All medication names must be filled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    try {
      await prescriptionAPI.add({
        appointmentId: parseInt(appointmentId, 10),
        medications,
        notes: notes.trim(),
      });
      Alert.alert('Success', 'Prescription added successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate(SCREENS.PRESCRIPTION_DETAILS, {
              appointmentId: parseInt(appointmentId, 10),
            }),
        },
      ]);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      Alert.alert('Error', apiErr.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        <Input
          label="Appointment ID"
          value={appointmentId}
          onChangeText={setAppointmentId}
          placeholder="e.g. 1"
          keyboardType="numeric"
          error={errors.appointmentId}
          leftIcon={<Text style={styles.fieldIcon}>📅</Text>}
        />

        <Text style={styles.sectionTitle}>Medications</Text>

        {medications.map((med, index) => (
          <View key={index} style={styles.medCard}>
            <View style={styles.medHeader}>
              <Text style={styles.medIndex}>Medication #{index + 1}</Text>
              {medications.length > 1 && (
                <TouchableOpacity onPress={() => removeMedicationRow(index)}>
                  <Text style={styles.removeText}>❌ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Input
              label="Medicine Name"
              value={med.medicineName}
              onChangeText={text =>
                updateMedication(index, 'medicineName', text)
              }
              placeholder="e.g. Paracetamol"
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Dosage"
                  value={med.dosage}
                  onChangeText={text => updateMedication(index, 'dosage', text)}
                  placeholder="e.g. 500mg"
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Frequency"
                  value={med.frequency}
                  onChangeText={text =>
                    updateMedication(index, 'frequency', text)
                  }
                  placeholder="e.g. 1-0-1"
                />
              </View>
            </View>

            <Input
              label="Duration"
              value={med.duration}
              onChangeText={text => updateMedication(index, 'duration', text)}
              placeholder="e.g. 5 Days"
            />
          </View>
        ))}

        {errors.medications && (
          <Text style={styles.errorText}>{errors.medications}</Text>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={addMedicationRow}>
          <Text style={styles.addBtnText}>➕ Add Medication</Text>
        </TouchableOpacity>

        <Input
          label="Prescription Notes / Instructions"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Take after meals, plenty of water..."
          multiline
          leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
        />

        <Button
          title="Save & Submit"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
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
  fieldIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  medCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medIndex: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  removeText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  addBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginBottom: 12,
    fontWeight: FontWeight.medium,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default AddPrescriptionScreen;
