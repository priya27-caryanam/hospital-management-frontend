import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {appointmentAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const STATUS_OPTIONS = ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const UpdateAppointmentStatusScreen = ({navigation, route}) => {
  const {appointment} = route.params;
  const [status, setStatus] = useState(appointment.status || 'SCHEDULED');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await appointmentAPI.updateStatus(appointment.id, status);
      Alert.alert('Success', 'Appointment status updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.APPT_DETAILS,
                  params: {appointmentId: appointment.id},
                },
              ],
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
      <View style={styles.container}>
        <Text style={styles.label}>Select New Status</Text>
        <View style={styles.optionsList}>
          {STATUS_OPTIONS.map(opt => {
            const isSelected = status === opt;
            let optColor = Colors.primary;
            if (opt === 'CANCELLED') {
              optColor = Colors.error;
            }
            if (opt === 'COMPLETED') {
              optColor = Colors.success;
            }

            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionCard,
                  isSelected && {
                    borderColor: optColor,
                    backgroundColor: optColor + '10',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setStatus(opt)}>
                <View style={styles.optionRow}>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && {borderColor: optColor},
                    ]}>
                    {isSelected && (
                      <View
                        style={[styles.radioDot, {backgroundColor: optColor}]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && {
                        color: optColor,
                        fontWeight: FontWeight.bold,
                      },
                    ]}>
                    {opt}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Update Status"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  optionsList: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default UpdateAppointmentStatusScreen;
