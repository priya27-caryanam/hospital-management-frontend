import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {symptomsAPI} from '../../services/api';
import {handleApiError} from '../../utils/apiHelpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';
import {SCREENS} from '../../navigation/AppNavigator';

const SuggestDepartmentScreen = ({navigation}) => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const loadSymptoms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await symptomsAPI.getAll();
      setSymptoms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      loadSymptoms();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toggleSymptom = symptomName => {
    if (selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptomName));
    } else {
      setSelectedSymptoms(prev => [...prev, symptomName]);
    }
  };

  const handleSuggest = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one symptom.');
      return;
    }
    setSuggesting(true);
    try {
      // POST /api/symptoms/suggest
      // Payload: { symptoms: [name1, name2...] }
      const response = await symptomsAPI.suggest({
        symptoms: selectedSymptoms,
      });
      setResults(response.data);
    } catch (err) {
      const apiErr = handleApiError(err, navigation);
      Alert.alert('Error', apiErr.message);
    } finally {
      setSuggesting(false);
    }
  };

  const renderSymptom = ({item}) => {
    const isSelected = selectedSymptoms.includes(item.name);
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipActive]}
        activeOpacity={0.8}
        onPress={() => toggleSymptom(item.name)}>
        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
          {isSelected ? '✅ ' : '⬜ '}
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LoadingSpinner
        visible={loading || suggesting}
        message={suggesting ? 'Analyzing symptoms...' : 'Loading symptoms...'}
      />

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadSymptoms}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : results ? (
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          <Text style={styles.title}>Diagnosis Suggestion</Text>

          <View style={styles.card}>
            <Text style={styles.resultsLabel}>ANALYZED SYMPTOMS</Text>
            <Text style={styles.analyzedText}>
              {selectedSymptoms.join(', ')}
            </Text>
          </View>

          <View style={[styles.card, styles.deptCard]}>
            <Text style={styles.resultsLabel}>SUGGESTED DEPARTMENT</Text>
            <Text style={styles.deptName}>
              🏢 {results.departmentName || results.name || 'General Medicine'}
            </Text>
            <Text style={styles.deptDesc}>
              {results.description ||
                'Based on your selected symptoms, consulting this department is recommended.'}
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(SCREENS.DOCTORS_BY_DEPT, {
                  departmentId: results.departmentId || results.id,
                  departmentName: results.departmentName || results.name,
                })
              }>
              <Text style={styles.actionBtnText}>
                👨‍⚕️ View Specialists in Dept
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.8}
            onPress={() => {
              setResults(null);
              setSelectedSymptoms([]);
            }}>
            <Text style={styles.resetBtnText}>🔄 Reset & Start Over</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.container}>
          <Text style={styles.prompt}>Select your active symptoms below:</Text>
          <FlatList
            data={symptoms}
            keyExtractor={item => String(item.id)}
            renderItem={renderSymptom}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🩺</Text>
                  <Text style={styles.emptyText}>No symptoms in system.</Text>
                </View>
              )
            }
          />

          <Button
            title="Diagnose & Find Department"
            onPress={handleSuggest}
            style={styles.submitBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  prompt: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chip: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '48%',
    alignItems: 'flex-start',
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryExtraLight,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  submitBtn: {
    marginTop: 10,
  },
  resultsScroll: {
    padding: 20,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  deptCard: {
    borderLeftWidth: 5,
    borderLeftColor: Colors.accent,
  },
  resultsLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  analyzedText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  deptName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  deptDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  resetBtn: {
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  resetBtnText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: FontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

export default SuggestDepartmentScreen;
