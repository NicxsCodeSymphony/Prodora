import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PIN_LENGTH = 6;

export default function AccountAuth() {
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [storedPin, setStoredPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    checkAuthMethod();
  }, []);

  const checkAuthMethod = async () => {
    try {
      // Check if there's a stored authentication preference
      const authMethodUri = `${FileSystem.documentDirectory}auth_method.txt`;
      const pinFileUri = `${FileSystem.documentDirectory}user_pin.txt`;
      
      const authMethodExists = await FileSystem.getInfoAsync(authMethodUri);
      const pinExists = await FileSystem.getInfoAsync(pinFileUri);
      
      if (pinExists.exists) {
        // Read the stored PIN
        const savedPin = await FileSystem.readAsStringAsync(pinFileUri);
        setStoredPin(savedPin);
      }

      if (authMethodExists.exists) {
        const authMethod = await FileSystem.readAsStringAsync(authMethodUri);
        if (authMethod === 'fingerprint') {
          checkBiometricSupport();
        } else {
          setShowPinInput(true);
        }
      } else {
        // Default to checking biometric support if no preference is set
        checkBiometricSupport();
      }
    } catch (error) {
      console.error('Error checking auth method:', error);
      setShowPinInput(true);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(compatible && enrolled);
      
      if (compatible && enrolled) {
        authenticateWithBiometric();
      } else {
        setShowPinInput(true);
      }
    } catch (error) {
      console.error('Biometric support check failed:', error);
      setShowPinInput(true);
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view accounts',
        fallbackLabel: 'Use PIN instead',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        router.replace('/(features)/account');
      } else if (result.error === 'user_cancel') {
        router.back();
      } else {
        setShowPinInput(true);
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      setShowPinInput(true);
    }
  };

  const handlePinInput = (value: string) => {
    const newPin = value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    setPin(newPin);
    setHasError(false);
    setIsSuccess(false);

    if (newPin.length === PIN_LENGTH) {
      validatePin(newPin);
    }
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === storedPin) {
      setIsSuccess(true);
      setTimeout(() => {
        router.replace('/(features)/account');
      }, 1000); // Wait 1 second before routing
    } else {
      setHasError(true);
      setPin('');
    }
  };

  const handleRetryBiometric = async () => {
    setShowPinInput(false);
    await authenticateWithBiometric();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.cancelButton}
          >
            <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Authentication Required</Text>
        </View>

        {showPinInput ? (
          <View style={styles.pinContainer}>
            <Text style={styles.subtitle}>Enter your PIN</Text>
            <TextInput
              style={[
                styles.pinInput,
                hasError && styles.pinInputError,
                isSuccess && styles.pinInputSuccess
              ]}
              value={pin}
              onChangeText={handlePinInput}
              keyboardType="numeric"
              maxLength={PIN_LENGTH}
              secureTextEntry
              autoFocus
              placeholder="• • • • • •"
              placeholderTextColor={Theme.colors.textSecondary}
            />
            {hasError && (
              <Text style={styles.errorText}>
                Incorrect PIN. Please try again.
              </Text>
            )}
            {isSuccess && (
              <Text style={styles.successText}>
                PIN correct! Redirecting...
              </Text>
            )}
            {biometricSupported && !hasError && !isSuccess && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleRetryBiometric}
              >
                <Ionicons name="finger-print" size={24} color={Theme.colors.primary} />
                <Text style={styles.biometricButtonText}>
                  Try Fingerprint Instead
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.biometricPrompt}>
            <Ionicons
              name="finger-print"
              size={64}
              color={Theme.colors.primary}
            />
            <Text style={styles.promptText}>
              Use fingerprint to access accounts
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  cancelButton: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  pinInput: {
    fontSize: 32,
    letterSpacing: 8,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    width: '80%',
    textAlign: 'center',
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.small,
  },
  pinInputError: {
    borderColor: Theme.colors.error || '#ff0000',
  },
  pinInputSuccess: {
    borderColor: Theme.colors.success || '#00c853',
  },
  errorText: {
    color: Theme.colors.error || '#ff0000',
    fontSize: 16,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  successText: {
    color: Theme.colors.success || '#00c853',
    fontSize: 16,
    marginTop: Theme.spacing.md,
    textAlign: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    padding: Theme.spacing.md,
  },
  biometricButtonText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Theme.spacing.sm,
  },
  biometricPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  promptText: {
    fontSize: 18,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
}); 