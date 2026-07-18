import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {departmentAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const EditDepartmentScreen = ({navigation, route}) => {
  const {department} = route.params;

  const [departmentName, setDepartmentName] = useState(
    department.departmentName || '',
  );
  const [description, setDescription] = useState(department.description || '');
  const [floorNumber, setFloorNumber] = useState(
    String(department.floorNumber ?? ''),
  );
  const [status, setStatus] = useState(department.status || 'ACTIVE');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!departmentName.trim()) {
      newErrors.departmentName = 'Department name is required';
    }
    if (!floorNumber.trim()) {
      newErrors.floorNumber = 'Floor number is required';
    } else if (isNaN(floorNumber)) {
      newErrors.floorNumber = 'Floor number must be numeric';
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
      await departmentAPI.update(department.id, {
        departmentName: departmentName.trim(),
        description: description.trim(),
        floorNumber: parseInt(floorNumber, 10),
        status,
      });
      Alert.alert('Success', 'Department updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: SCREENS.DEPT_LIST}],
            });
          },
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
          label="Department Name"
          value={departmentName}
          onChangeText={setDepartmentName}
          placeholder="e.g. Cardiology"
          error={errors.departmentName}
          leftIcon={<Text style={styles.fieldIcon}>🏢</Text>}
        />

        <Input
          label="Floor Number"
          value={floorNumber}
          onChangeText={setFloorNumber}
          placeholder="e.g. 3"
          keyboardType="numeric"
          error={errors.floorNumber}
          leftIcon={<Text style={styles.fieldIcon}>🔢</Text>}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter department details..."
          multiline
          leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
        />

        {/* Status Toggle Selector */}
        <Text style={styles.statusLabel}>STATUS</Text>
        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[
              styles.statusChip,
              status === 'ACTIVE' && styles.statusChipActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setStatus('ACTIVE')}>
            <Text
              style={[
                styles.statusChipText,
                status === 'ACTIVE' && styles.statusChipTextActive,
              ]}>
              ACTIVE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusChip,
              status === 'INACTIVE' && styles.statusChipInactiveActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setStatus('INACTIVE')}>
            <Text
              style={[
                styles.statusChipText,
                status === 'INACTIVE' && styles.statusChipTextActive,
              ]}>
              INACTIVE
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Save Changes"
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
  statusLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  statusChip: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusChipActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  statusChipInactiveActive: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  statusChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  statusChipTextActive: {
    color: Colors.textPrimary,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default EditDepartmentScreen;
