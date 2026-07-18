import React, {useState} from 'react';
import {Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {billingAPI} from '../../services/api';
import {localDB} from '../../utils/localDB';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';

import {SCREENS} from '../../navigation/AppNavigator';

const GenerateBillScreen = ({navigation}) => {
  const [appointmentId, setAppointmentId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!appointmentId.trim()) {
      newErrors.appointmentId = 'Appointment ID is required';
    } else if (isNaN(appointmentId)) {
      newErrors.appointmentId = 'Appointment ID must be a number';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Enter a valid positive amount';
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
        appointmentId: parseInt(appointmentId, 10),
        description: description.trim(),
        amount: parseFloat(amount),
        status: 'PENDING',
      };
      let response = null;
      try {
        response = await billingAPI.generate(payload);
      } catch (apiErr) {
        console.warn('[GenerateBill API Error, saving locally only]:', apiErr);
      }
      
      const savedBill = {
        ...payload,
        id: response?.data?.id || Date.now(),
      };
      await localDB.addBill(savedBill);

      Alert.alert('Success', 'Bill generated successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate(SCREENS.BILL_DETAILS, {
              appointmentId: savedBill.appointmentId,
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

        <Input
          label="Bill Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          placeholder="e.g. 500.00"
          keyboardType="numeric"
          error={errors.amount}
          leftIcon={<Text style={styles.fieldIcon}>₹</Text>}
        />

        <Input
          label="Description / Particulars"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. General Consultation & Blood Test"
          multiline
          leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
        />

        <Button
          title="Generate Invoice"
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

export default GenerateBillScreen;
