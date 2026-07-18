import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  DOCTORS: '@hms_local_doctors',
  PATIENTS: '@hms_local_patients',
  NURSES: '@hms_local_nurses',
  RECEPTIONISTS: '@hms_local_receptionists',
  APPOINTMENTS: '@hms_local_appointments',
  DEPARTMENTS: '@hms_local_departments',
  BILLS: '@hms_local_bills',
};

// Generic list getter
const getList = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error(`[LocalDB] Error getting key ${key}:`, error);
    return [];
  }
};

// Generic item adder
const addToList = async (key, item) => {
  try {
    const list = await getList(key);
    // Ensure item has a unique ID
    if (!item.id) {
      item.id = Date.now();
    }
    // Avoid duplicates by ID
    const exists = list.some(i => String(i.id) === String(item.id));
    if (!exists) {
      const updated = [item, ...list];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    }
    return item;
  } catch (error) {
    console.error(`[LocalDB] Error adding to key ${key}:`, error);
    throw error;
  }
};

// Generic item updater
const updateInList = async (key, itemId, updatedFields) => {
  try {
    const list = await getList(key);
    const updated = list.map(item => {
      if (String(item.id) === String(itemId)) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error(`[LocalDB] Error updating key ${key}:`, error);
    throw error;
  }
};

export const localDB = {
  // Doctors
  getDoctors: () => getList(KEYS.DOCTORS),
  addDoctor: (doctor) => addToList(KEYS.DOCTORS, doctor),
  getDoctorById: async (id) => {
    const list = await getList(KEYS.DOCTORS);
    return list.find(d => String(d.id) === String(id)) || null;
  },

  // Patients
  getPatients: () => getList(KEYS.PATIENTS),
  addPatient: (patient) => addToList(KEYS.PATIENTS, patient),
  getPatientById: async (id) => {
    const list = await getList(KEYS.PATIENTS);
    return list.find(p => String(p.id) === String(id)) || null;
  },

  // Staff (Nurses and Receptionists)
  getNurses: () => getList(KEYS.NURSES),
  addNurse: (nurse) => addToList(KEYS.NURSES, nurse),
  getReceptionists: () => getList(KEYS.RECEPTIONISTS),
  addReceptionist: (receptionist) => addToList(KEYS.RECEPTIONISTS, receptionist),
  getStaff: async () => {
    const nurses = await getList(KEYS.NURSES);
    const receptionists = await getList(KEYS.RECEPTIONISTS);
    // Add role identifier
    const formattedNurses = nurses.map(n => ({ ...n, role: 'NURSE' }));
    const formattedReceptionists = receptionists.map(r => ({ ...r, role: 'RECEPTIONIST' }));
    return [...formattedNurses, ...formattedReceptionists];
  },

  // Appointments
  getAppointments: () => getList(KEYS.APPOINTMENTS),
  addAppointment: (appointment) => addToList(KEYS.APPOINTMENTS, { status: 'SCHEDULED', ...appointment }),
  getAppointmentById: async (id) => {
    const list = await getList(KEYS.APPOINTMENTS);
    return list.find(a => String(a.id) === String(id)) || null;
  },
  updateAppointmentStatus: (id, status) => updateInList(KEYS.APPOINTMENTS, id, { status }),

  // Departments
  getDepartments: () => getList(KEYS.DEPARTMENTS),
  addDepartment: (department) => addToList(KEYS.DEPARTMENTS, department),
  getDepartmentById: async (id) => {
    const list = await getList(KEYS.DEPARTMENTS);
    return list.find(d => String(d.id) === String(id)) || null;
  },
  updateDepartment: (id, fields) => updateInList(KEYS.DEPARTMENTS, id, fields),

  // Bills (Reports)
  getBills: () => getList(KEYS.BILLS),
  addBill: (bill) => addToList(KEYS.BILLS, { status: 'PENDING', ...bill }),
  getBillById: async (id) => {
    const list = await getList(KEYS.BILLS);
    return list.find(b => String(b.id) === String(id)) || null;
  },
  getBillByAppointmentId: async (appointmentId) => {
    const list = await getList(KEYS.BILLS);
    return list.find(b => String(b.appointmentId) === String(appointmentId)) || null;
  },
  payBill: (id) => updateInList(KEYS.BILLS, id, { status: 'PAID' }),
};
export default localDB;
