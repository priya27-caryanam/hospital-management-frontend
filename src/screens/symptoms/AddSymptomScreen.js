import React, {useState} from 'react';
import {Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {symptomsAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';

const AddSymptomScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Symptom name is required';
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
      await symptomsAPI.add({
        name: name.trim(),
        description: description.trim(),
      });
      Alert.alert('Success', 'Symptom added successfully!', [
        {text: 'OK', onPress: () => navigation.goBack()},
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
          label="Symptom Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Cough, Fever, Headache"
          error={errors.name}
          leftIcon={<Text style={styles.fieldIcon}>🩺</Text>}
        />

        <Input
          label="Description / Associated Details"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe symptoms briefly..."
          multiline
          leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
        />

        <Button
          title="Add Symptom"
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

export default AddSymptomScreen;
