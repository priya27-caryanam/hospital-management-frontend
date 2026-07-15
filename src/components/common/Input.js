/**
 * Input — Reusable text input with icon, error state, and password toggle
 *
 * Props:
 *  label           {string}   — Field label shown above input
 *  value           {string}   — Controlled value
 *  onChangeText    {function} — Change handler
 *  onBlur          {function} — Blur handler (for validation triggers)
 *  placeholder     {string}   — Placeholder text
 *  error           {string}   — Error message to display below input
 *  leftIcon        {node}     — Icon node on the left side
 *  rightIcon       {node}     — Icon node on the right side
 *  secureTextEntry {boolean}  — Password field (adds eye toggle)
 *  keyboardType    {string}   — e.g. 'email-address', 'numeric'
 *  autoCapitalize  {string}   — 'none' | 'words' | 'sentences'
 *  multiline       {boolean}  — Multi-line textarea
 *  editable        {boolean}  — Whether input is editable
 *  style           {object}   — Extra container styles
 *  inputStyle      {object}   — Extra TextInput styles
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../constants/colors';
import {FontSize, FontWeight} from '../../constants/typography';

const Input = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  editable = true,
  style,
  inputStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = e => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(prev => !prev);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}>
        {/* Left icon */}
        {leftIcon ? (
          <View style={styles.iconLeft}>{leftIcon}</View>
        ) : null}

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
          selectionColor={Colors.primary}
          {...rest}
        />

        {/* Right icon or password toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.iconRight}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {/* Error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.white,
  },
  inputContainerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  inputContainerDisabled: {
    backgroundColor: Colors.offWhite,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 5,
    marginLeft: 2,
  },
});

export default Input;
