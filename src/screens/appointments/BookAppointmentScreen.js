import React, {useState} from 'react';
import {Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appointmentAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';

import {SCREENS} from '../../navigation/AppNavigator';

const BookAppointmentScreen = ({navigation}) => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    } else if (isNaN(patientId)) {
      newErrors.patientId = 'Patient ID must be a number';
    }

    if (!doctorId.trim()) {
      newErrors.doctorId = 'Doctor ID is required';
    } else if (isNaN(doctorId)) {
      newErrors.doctorId = 'Doctor ID must be a number';
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!appointmentDate.trim()) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else if (!dateRegex.test(appointmentDate.trim())) {
      newErrors.appointmentDate = 'Must be in YYYY-MM-DD format';
    }

    if (!appointmentTime.trim()) {
      newErrors.appointmentTime = 'Appointment time is required';
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
      const payload = {
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctorId, 10),
        appointmentDate: appointmentDate.trim(),
        appointmentTime: appointmentTime.trim(),
        reason: reason.trim(),
        status: 'SCHEDULED',
      };
      let response = null;
      try {
        response = await appointmentAPI.book(payload);
      } catch (apiErr) {
        console.warn('[BookAppointment API Error, saving locally only]:', apiErr);
      }
      
      const savedAppt = {
        ...payload,
        id: response?.data?.id || Date.now(),
      };
      await localDB.addAppointment(savedAppt);

      Alert.alert('Success', 'Appointment booked successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate(SCREENS.APPT_DETAILS, {
              appointmentId: savedAppt.id,
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
          label="Patient ID"
          value={patientId}
          onChangeText={setPatientId}
          placeholder="e.g. 1"
          keyboardType="numeric"
          error={errors.patientId}
          leftIcon={<Text style={styles.fieldIcon}>🏥</Text>}
        />

        <Input
          label="Doctor ID"
          value={doctorId}
          onChangeText={setDoctorId}
          placeholder="e.g. 2"
          keyboardType="numeric"
          error={errors.doctorId}
          leftIcon={<Text style={styles.fieldIcon}>👨‍⚕️</Text>}
        />

        <Input
          label="Appointment Date"
          value={appointmentDate}
          onChangeText={setAppointmentDate}
          placeholder="YYYY-MM-DD"
          error={errors.appointmentDate}
          leftIcon={<Text style={styles.fieldIcon}>📅</Text>}
        />

        <Input
          label="Appointment Time"
          value={appointmentTime}
          onChangeText={setAppointmentTime}
          placeholder="e.g. 10:30 AM"
          error={errors.appointmentTime}
          leftIcon={<Text style={styles.fieldIcon}>⏰</Text>}
        />

        <Input
          label="Reason for Visit"
          value={reason}
          onChangeText={setReason}
          placeholder="Briefly describe symptoms..."
          multiline
          leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
        />

        <Button
          title="Book Appointment"
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
  submitBtn: {
    marginTop: 8,
  },
});

export default BookAppointmentScreen;
