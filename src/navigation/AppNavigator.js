/**
 * AppNavigator — Root navigation stack
 *
 * Stack order:
 *   Splash → Welcome → Login → Register → [Role Dashboard] → [Module Screens]
 *
 * - Splash is shown first (no header)
 * - After login, user is replaced into role-specific dashboard (cannot go back)
 * - All module screens accessible from dashboards
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// ── Existing Screens (DO NOT MODIFY) ─────────────────────────────────────────
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import ManageDepartmentsScreen from '../screens/ManageDepartmentsScreen';

// ── Role Dashboards ────────────────────────────────────────────────────────────
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';
import NurseDashboardScreen from '../screens/NurseDashboardScreen';
import ReceptionistDashboardScreen from '../screens/ReceptionistDashboardScreen';

// ── Department Module ──────────────────────────────────────────────────────────
import DepartmentListScreen from '../screens/departments/DepartmentListScreen';
import DepartmentDetailsScreen from '../screens/departments/DepartmentDetailsScreen';
import CreateDepartmentScreen from '../screens/departments/CreateDepartmentScreen';
import EditDepartmentScreen from '../screens/departments/EditDepartmentScreen';

// ── Doctor Module ──────────────────────────────────────────────────────────────
import DoctorDetailsScreen from '../screens/doctors/DoctorDetailsScreen';
import DoctorsByDepartmentScreen from '../screens/doctors/DoctorsByDepartmentScreen';

// ── Patient Module ─────────────────────────────────────────────────────────────
import PatientProfileScreen from '../screens/patients/PatientProfileScreen';
import PatientSearchScreen from '../screens/patients/PatientSearchScreen';

// ── Appointment Module ─────────────────────────────────────────────────────────
import BookAppointmentScreen from '../screens/appointments/BookAppointmentScreen';
import AppointmentDetailsScreen from '../screens/appointments/AppointmentDetailsScreen';
import PatientAppointmentsScreen from '../screens/appointments/PatientAppointmentsScreen';
import DoctorAppointmentsScreen from '../screens/appointments/DoctorAppointmentsScreen';
import UpdateAppointmentStatusScreen from '../screens/appointments/UpdateAppointmentStatusScreen';

// ── Billing Module ─────────────────────────────────────────────────────────────
import GenerateBillScreen from '../screens/billing/GenerateBillScreen';
import BillDetailsScreen from '../screens/billing/BillDetailsScreen';
import PaymentScreen from '../screens/billing/PaymentScreen';

// ── Prescription Module ────────────────────────────────────────────────────────
import AddPrescriptionScreen from '../screens/prescriptions/AddPrescriptionScreen';
import PrescriptionDetailsScreen from '../screens/prescriptions/PrescriptionDetailsScreen';

// ── Symptoms Module ────────────────────────────────────────────────────────────
import SymptomsListScreen from '../screens/symptoms/SymptomsListScreen';
import AddSymptomScreen from '../screens/symptoms/AddSymptomScreen';
import SuggestDepartmentScreen from '../screens/symptoms/SuggestDepartmentScreen';

// ── Nurse Module ───────────────────────────────────────────────────────────────
import NurseProfileScreen from '../screens/nurses/NurseProfileScreen';
import AssignedPatientsScreen from '../screens/nurses/AssignedPatientsScreen';

// ── Receptionist Module ────────────────────────────────────────────────────────
import ReceptionistProfileScreen from '../screens/receptionists/ReceptionistProfileScreen';

// ── Admin Active Cards Modules ────────────────────────────────────────────────
import AllAppointmentsScreen from '../screens/AllAppointmentsScreen';
import StaffListScreen from '../screens/StaffListScreen';
import ReportsListScreen from '../screens/ReportsListScreen';

import Colors from '../constants/colors';
import {FontWeight, FontSize} from '../constants/typography';

const Stack = createNativeStackNavigator();

// ─── Screen Names (centralised to avoid typo bugs) ───────────────────────────
export const SCREENS = {
  // ── Auth & Onboarding ──
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',

  // ── Role Dashboards ──
  ADMIN_HOME: 'AdminHome',
  PATIENT_HOME: 'PatientHome',
  DOCTOR_HOME: 'DoctorHome',
  NURSE_HOME: 'NurseHome',
  RECEPTIONIST_HOME: 'ReceptionistHome',

  // ── Legacy (kept for ManageDepartmentsScreen) ──
  MANAGE_DEPARTMENTS: 'ManageDepartments',

  // ── Department Module ──
  DEPT_LIST: 'DepartmentList',
  DEPT_DETAILS: 'DepartmentDetails',
  DEPT_CREATE: 'CreateDepartment',
  DEPT_EDIT: 'EditDepartment',

  // ── Doctor Module ──
  DOCTOR_DETAILS: 'DoctorDetails',
  DOCTORS_BY_DEPT: 'DoctorsByDepartment',

  // ── Patient Module ──
  PATIENT_PROFILE: 'PatientProfile',
  PATIENT_SEARCH: 'PatientSearch',

  // ── Appointment Module ──
  BOOK_APPOINTMENT: 'BookAppointment',
  APPT_DETAILS: 'AppointmentDetails',
  PATIENT_APPTS: 'PatientAppointments',
  DOCTOR_APPTS: 'DoctorAppointments',
  UPDATE_APPT_STATUS: 'UpdateAppointmentStatus',

  // ── Billing Module ──
  GENERATE_BILL: 'GenerateBill',
  BILL_DETAILS: 'BillDetails',
  PAYMENT: 'Payment',

  // ── Prescription Module ──
  ADD_PRESCRIPTION: 'AddPrescription',
  PRESCRIPTION_DETAILS: 'PrescriptionDetails',

  // ── Symptoms Module ──
  SYMPTOMS_LIST: 'SymptomsList',
  ADD_SYMPTOM: 'AddSymptom',
  SUGGEST_DEPT: 'SuggestDepartment',

  // ── Nurse Module ──
  NURSE_PROFILE: 'NurseProfile',
  ASSIGNED_PATIENTS: 'AssignedPatients',

  // ── Receptionist Module ──
  RECEPTIONIST_PROFILE: 'ReceptionistProfile',

  // ── Admin Active Cards Modules ──
  ALL_APPOINTMENTS: 'AllAppointments',
  STAFF_LIST: 'StaffList',
  REPORTS_LIST: 'ReportsList',
};

// ─── Default header options for authenticated screens ─────────────────────────
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: FontWeight.semiBold,
    fontSize: FontSize.lg,
  },
  headerBackTitleVisible: false,
  animation: 'slide_from_right',
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={SCREENS.SPLASH}
        screenOptions={defaultScreenOptions}>
        {/* ── Splash ── */}
        <Stack.Screen
          name={SCREENS.SPLASH}
          component={SplashScreen}
          options={{headerShown: false}}
        />

        {/* ── Welcome ── */}
        <Stack.Screen
          name={SCREENS.WELCOME}
          component={WelcomeScreen}
          options={{headerShown: false}}
        />

        {/* ── Login ── */}
        <Stack.Screen
          name={SCREENS.LOGIN}
          component={LoginScreen}
          options={{headerShown: false}}
        />

        {/* ── Register ── */}
        <Stack.Screen
          name={SCREENS.REGISTER}
          component={RegisterScreen}
          options={{
            title: 'Register Patient',
            headerBackVisible: true,
          }}
        />

        {/* ── Role Dashboards ── */}
        <Stack.Screen
          name={SCREENS.ADMIN_HOME}
          component={AdminHomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.PATIENT_HOME}
          component={PatientHomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.DOCTOR_HOME}
          component={DoctorDashboardScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.NURSE_HOME}
          component={NurseDashboardScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={SCREENS.RECEPTIONIST_HOME}
          component={ReceptionistDashboardScreen}
          options={{headerShown: false}}
        />

        {/* ── Legacy: Manage Departments ── */}
        <Stack.Screen
          name={SCREENS.MANAGE_DEPARTMENTS}
          component={ManageDepartmentsScreen}
          options={{
            title: 'Manage Departments',
            headerBackVisible: true,
          }}
        />

        {/* ── Department Module ── */}
        <Stack.Screen
          name={SCREENS.DEPT_LIST}
          component={DepartmentListScreen}
          options={{title: 'Departments'}}
        />
        <Stack.Screen
          name={SCREENS.DEPT_DETAILS}
          component={DepartmentDetailsScreen}
          options={{title: 'Department Details'}}
        />
        <Stack.Screen
          name={SCREENS.DEPT_CREATE}
          component={CreateDepartmentScreen}
          options={{title: 'Add Department'}}
        />
        <Stack.Screen
          name={SCREENS.DEPT_EDIT}
          component={EditDepartmentScreen}
          options={{title: 'Edit Department'}}
        />

        {/* ── Doctor Module ── */}
        <Stack.Screen
          name={SCREENS.DOCTOR_DETAILS}
          component={DoctorDetailsScreen}
          options={{title: 'Doctor Profile'}}
        />
        <Stack.Screen
          name={SCREENS.DOCTORS_BY_DEPT}
          component={DoctorsByDepartmentScreen}
          options={{title: 'Doctors'}}
        />

        {/* ── Patient Module ── */}
        <Stack.Screen
          name={SCREENS.PATIENT_PROFILE}
          component={PatientProfileScreen}
          options={{title: 'Patient Profile'}}
        />
        <Stack.Screen
          name={SCREENS.PATIENT_SEARCH}
          component={PatientSearchScreen}
          options={{title: 'Search Patient'}}
        />

        {/* ── Appointment Module ── */}
        <Stack.Screen
          name={SCREENS.BOOK_APPOINTMENT}
          component={BookAppointmentScreen}
          options={{title: 'Book Appointment'}}
        />
        <Stack.Screen
          name={SCREENS.APPT_DETAILS}
          component={AppointmentDetailsScreen}
          options={{title: 'Appointment Details'}}
        />
        <Stack.Screen
          name={SCREENS.PATIENT_APPTS}
          component={PatientAppointmentsScreen}
          options={{title: 'My Appointments'}}
        />
        <Stack.Screen
          name={SCREENS.DOCTOR_APPTS}
          component={DoctorAppointmentsScreen}
          options={{title: 'Appointments'}}
        />
        <Stack.Screen
          name={SCREENS.UPDATE_APPT_STATUS}
          component={UpdateAppointmentStatusScreen}
          options={{title: 'Update Status'}}
        />

        {/* ── Billing Module ── */}
        <Stack.Screen
          name={SCREENS.GENERATE_BILL}
          component={GenerateBillScreen}
          options={{title: 'Generate Bill'}}
        />
        <Stack.Screen
          name={SCREENS.BILL_DETAILS}
          component={BillDetailsScreen}
          options={{title: 'Bill Details'}}
        />
        <Stack.Screen
          name={SCREENS.PAYMENT}
          component={PaymentScreen}
          options={{title: 'Payment'}}
        />

        {/* ── Prescription Module ── */}
        <Stack.Screen
          name={SCREENS.ADD_PRESCRIPTION}
          component={AddPrescriptionScreen}
          options={{title: 'Add Prescription'}}
        />
        <Stack.Screen
          name={SCREENS.PRESCRIPTION_DETAILS}
          component={PrescriptionDetailsScreen}
          options={{title: 'Prescription'}}
        />

        {/* ── Symptoms Module ── */}
        <Stack.Screen
          name={SCREENS.SYMPTOMS_LIST}
          component={SymptomsListScreen}
          options={{title: 'Symptoms'}}
        />
        <Stack.Screen
          name={SCREENS.ADD_SYMPTOM}
          component={AddSymptomScreen}
          options={{title: 'Add Symptom'}}
        />
        <Stack.Screen
          name={SCREENS.SUGGEST_DEPT}
          component={SuggestDepartmentScreen}
          options={{title: 'Find Department'}}
        />

        {/* ── Nurse Module ── */}
        <Stack.Screen
          name={SCREENS.NURSE_PROFILE}
          component={NurseProfileScreen}
          options={{title: 'Nurse Profile'}}
        />
        <Stack.Screen
          name={SCREENS.ASSIGNED_PATIENTS}
          component={AssignedPatientsScreen}
          options={{title: 'Assigned Patients'}}
        />

        {/* ── Receptionist Module ── */}
        <Stack.Screen
          name={SCREENS.RECEPTIONIST_PROFILE}
          component={ReceptionistProfileScreen}
          options={{title: 'Receptionist Profile'}}
        />

        {/* ── Admin Active Cards Modules ── */}
        <Stack.Screen
          name={SCREENS.ALL_APPOINTMENTS}
          component={AllAppointmentsScreen}
          options={{title: 'All Appointments'}}
        />
        <Stack.Screen
          name={SCREENS.STAFF_LIST}
          component={StaffListScreen}
          options={{title: 'Hospital Staff'}}
        />
        <Stack.Screen
          name={SCREENS.REPORTS_LIST}
          component={ReportsListScreen}
          options={{title: 'Reports & Analytics'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
