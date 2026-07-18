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
import {SCREENS} from '../../navigation/AppNavigator';
import {departmentAPI} from '../../services/api';
import {
  handleApiError,
  formatDate,
  getStatusColor,
} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const DetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const DepartmentDetailsScreen = ({navigation, route}) => {
  const {department} = route.params;
  const [deleting, setDeleting] = useState(false);

  const statusStyle = getStatusColor(department.status || 'ACTIVE');

  const handleDelete = () => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete ${department.departmentName}? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await departmentAPI.deleteById(department.id);
              Alert.alert('Success', 'Department deleted successfully.', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate(SCREENS.DEPT_LIST),
                },
              ]);
            } catch (err) {
              const apiErr = handleApiError(err, navigation);
              Alert.alert('Error', apiErr.message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner visible={deleting} message="Deleting department..." />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.deptIconBg}>
              <Text style={styles.deptIcon}>🏢</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.deptName}>{department.departmentName}</Text>
              <View
                style={[styles.statusBadge, {backgroundColor: statusStyle.bg}]}>
                <Text style={[styles.statusText, {color: statusStyle.text}]}>
                  {(department.status || 'ACTIVE').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Department ID" value={String(department.id)} />
          <DetailRow
            label="Floor Number"
            value={`Floor ${department.floorNumber}`}
          />
          <DetailRow label="Description" value={department.description} />
          <DetailRow
            label="Created At"
            value={formatDate(department.createdAt)}
          />
          <DetailRow
            label="Updated At"
            value={formatDate(department.updatedAt)}
          />
        </View>

        {/* View Doctors Button */}
        <TouchableOpacity
          style={styles.viewDoctorsBtn}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(SCREENS.DOCTORS_BY_DEPT, {
              departmentId: department.id,
              departmentName: department.departmentName,
            })
          }>
          <Text style={styles.viewDoctorsBtnText}>👨‍⚕️ View Doctors in Dept</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.editBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(SCREENS.DEPT_EDIT, {department})
            }>
            <Text style={styles.editBtnText}>✏️ Edit Department</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.deleteBtn]}
            activeOpacity={0.8}
            onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️ Delete Department</Text>
          </TouchableOpacity>
        </View>
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
  deptIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primaryExtraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deptIcon: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
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
  viewDoctorsBtn: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 2,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  viewDoctorsBtnText: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  editBtn: {
    backgroundColor: Colors.primaryExtraLight,
  },
  editBtnText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  deleteBtn: {
    backgroundColor: Colors.errorLight,
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});

export default DepartmentDetailsScreen;
