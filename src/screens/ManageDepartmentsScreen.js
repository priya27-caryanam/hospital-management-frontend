/**
 * ManageDepartmentsScreen
 *
 * Provides functionalities to:
 *  1. Create a new Department (Form with Name, Description, Floor Number, and Status)
 *  2. Get/Fetch Department details by ID (Retrieves and displays department info)
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {departmentAPI} from '../services/api';
import {localDB} from '../utils/localDB';
import Colors from '../constants/colors';
import {FontSize, FontWeight} from '../constants/typography';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ManageDepartmentsScreen = () => {
  // ─── Create Form State ───────────────────────────────────────────────────
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  // ─── Get/Search State ────────────────────────────────────────────────────
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // ─── Helper: Format Date ─────────────────────────────────────────────────
  const formatDate = dateString => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // ─── Handle Create Department ────────────────────────────────────────────
  const handleCreate = async () => {
    const errors = {};
    if (!departmentName.trim()) {
      errors.departmentName = 'Department name is required';
    } else if (departmentName.length > 100) {
      errors.departmentName = 'Name must not exceed 100 characters';
    }

    if (description.length > 255) {
      errors.description = 'Description must not exceed 255 characters';
    }

    if (!floorNumber.trim()) {
      errors.floorNumber = 'Floor number is required';
    } else {
      const parsedFloor = parseInt(floorNumber, 10);
      if (isNaN(parsedFloor)) {
        errors.floorNumber = 'Floor number must be a valid integer';
      }
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreateErrors({});
    setCreateLoading(true);

    try {
      const payload = {
        departmentName: departmentName.trim(),
        description: description.trim(),
        floorNumber: parseInt(floorNumber, 10),
        status,
      };

      let response = null;
      try {
        response = await departmentAPI.createDepartment(payload);
      } catch (apiErr) {
        console.warn('[ManageDepartments API Error, saving locally only]:', apiErr);
      }
      
      const savedDept = {
        ...payload,
        id: response?.data?.id || Date.now(),
      };
      await localDB.addDepartment(savedDept);

      Alert.alert(
        'Success',
        `Department "${savedDept.departmentName}" created successfully with ID: ${savedDept.id}`,
        [{text: 'OK'}],
      );

      // Reset form fields
      setDepartmentName('');
      setDescription('');
      setFloorNumber('');
      setStatus('ACTIVE');
    } catch (error) {
      console.error('[Create Department] Failed:', error);
      Alert.alert(
        'Failure',
        error.message || 'Could not complete department creation.',
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // ─── Handle Search Department by ID ──────────────────────────────────────
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setSearchError('Please enter a Department ID');
      setSearchResult(null);
      return;
    }

    const parsedId = parseInt(searchId, 10);
    if (isNaN(parsedId)) {
      setSearchError('Department ID must be a valid number');
      setSearchResult(null);
      return;
    }

    setSearchError('');
    setSearchLoading(true);
    setSearchResult(null);

    try {
      const response = await departmentAPI.getDepartmentById(parsedId);
      setSearchResult(response.data);
    } catch (error) {
      console.error('[Search Department] Failed:', error);
      setSearchError(error.message || 'Department not found');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryDark}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ─── Create Department Section ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>🏢 Create Department</Text>
          <View style={styles.divider} />

          {/* Department Name */}
          <Input
            label="Department Name"
            value={departmentName}
            onChangeText={text => {
              setDepartmentName(text);
              if (createErrors.departmentName) {
                setCreateErrors(prev => ({...prev, departmentName: undefined}));
              }
            }}
            placeholder="e.g. Cardiology, Pediatrics"
            error={createErrors.departmentName}
            leftIcon={<Text style={styles.fieldIcon}>📝</Text>}
          />

          {/* Description */}
          <Input
            label="Description"
            value={description}
            onChangeText={text => {
              setDescription(text);
              if (createErrors.description) {
                setCreateErrors(prev => ({...prev, description: undefined}));
              }
            }}
            placeholder="Describe the department services"
            error={createErrors.description}
            multiline
            numberOfLines={3}
            leftIcon={<Text style={styles.fieldIcon}>ℹ️</Text>}
          />

          {/* Floor Number */}
          <Input
            label="Floor Number"
            value={floorNumber}
            onChangeText={text => {
              setFloorNumber(text);
              if (createErrors.floorNumber) {
                setCreateErrors(prev => ({...prev, floorNumber: undefined}));
              }
            }}
            placeholder="e.g. 1, 2, -1 for basement"
            keyboardType="numeric"
            error={createErrors.floorNumber}
            leftIcon={<Text style={styles.fieldIcon}>🔢</Text>}
          />

          {/* Status Selector */}
          <View style={styles.statusWrapper}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'ACTIVE' && styles.statusButtonActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setStatus('ACTIVE')}>
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'ACTIVE' && styles.statusButtonTextActive,
                  ]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'INACTIVE' && styles.statusButtonInactive,
                ]}
                activeOpacity={0.8}
                onPress={() => setStatus('INACTIVE')}>
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'INACTIVE' && styles.statusButtonTextActive,
                  ]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <Button
            title="Save Department"
            onPress={handleCreate}
            loading={createLoading}
            style={styles.actionButton}
          />
        </View>

        {/* ─── Get Department Section ─── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>🔍 Get Department by ID</Text>
          <View style={styles.divider} />

          {/* Search ID Input */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <Input
                label="Enter Department ID"
                value={searchId}
                onChangeText={text => {
                  setSearchId(text);
                  if (searchError) {
                    setSearchError('');
                  }
                }}
                placeholder="e.g. 1, 5"
                keyboardType="numeric"
                style={styles.searchInputWrapper}
              />
            </View>
            <Button
              title="Search"
              onPress={handleSearch}
              loading={searchLoading}
              style={styles.searchButton}
              textStyle={styles.searchButtonText}
            />
          </View>

          {searchError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {searchError}</Text>
            </View>
          ) : null}

          {/* Search Result display */}
          {searchResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Department Details</Text>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>ID</Text>
                <Text style={styles.resultValue}>{searchResult.id}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Name</Text>
                <Text style={styles.resultValue}>
                  {searchResult.departmentName}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Description</Text>
                <Text style={styles.resultValue}>
                  {searchResult.description || 'No description provided'}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Floor Number</Text>
                <Text style={styles.resultValue}>
                  {searchResult.floorNumber}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    searchResult.status === 'ACTIVE'
                      ? styles.statusBadgeActive
                      : styles.statusBadgeInactive,
                  ]}>
                  <Text
                    style={[
                      styles.statusBadgeText,
                      searchResult.status === 'ACTIVE'
                        ? styles.statusBadgeTextActive
                        : styles.statusBadgeTextInactive,
                    ]}>
                    {searchResult.status}
                  </Text>
                </View>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Created At</Text>
                <Text style={styles.resultValue}>
                  {formatDate(searchResult.createdAt)}
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Updated At</Text>
                <Text style={styles.resultValue}>
                  {formatDate(searchResult.updatedAt)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Loading overlay */}
      <LoadingSpinner visible={createLoading} message="Saving department..." />
      <LoadingSpinner
        visible={searchLoading}
        message="Searching department..."
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.divider,
    marginVertical: 14,
  },
  fieldIcon: {
    fontSize: 16,
  },

  // Status selection selector styles
  statusWrapper: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 4,
    backgroundColor: Colors.surface,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    backgroundColor: Colors.success,
  },
  statusButtonInactive: {
    backgroundColor: Colors.error,
  },
  statusButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textSecondary,
  },
  statusButtonTextActive: {
    color: Colors.white,
  },

  actionButton: {
    marginTop: 8,
    width: '100%',
  },

  // Get department search layout
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  searchInputWrapper: {
    marginBottom: 0, // Override default margin bottom of Input component
  },
  searchButton: {
    height: 52, // Align perfectly with input height
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  searchButtonText: {
    fontSize: FontSize.sm,
  },

  errorContainer: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },

  // Search Results details box
  resultContainer: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  resultValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },

  // Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: Colors.successLight,
  },
  statusBadgeInactive: {
    backgroundColor: Colors.errorLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  statusBadgeTextActive: {
    color: Colors.success,
  },
  statusBadgeTextInactive: {
    color: Colors.error,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default ManageDepartmentsScreen;
