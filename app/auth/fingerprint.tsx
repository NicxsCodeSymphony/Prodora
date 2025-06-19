import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Theme } from '@/constants/Theme';

export default function FingerprintAuth() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkBiometricAvailability();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for fingerprint icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const checkBiometricAvailability = async () => {
    try {
      // Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setHasBiometricHardware(hasHardware);

      if (hasHardware) {
        // Check if biometric is enrolled
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricEnrolled(isEnrolled);

        // Get supported biometric types
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        }

        // If biometric is available and enrolled, start authentication
        if (isEnrolled) {
          setTimeout(() => {
            authenticateWithBiometrics();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      showBiometricError('Unable to access biometric authentication');
    }
  };

  const authenticateWithBiometrics = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${biometricType}`,
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Authentication successful
        setIsAuthenticating(false);
        Alert.alert(
          'Authentication Successful',
          'Welcome back!',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        // Authentication failed or cancelled
        setIsAuthenticating(false);
        if (result.error && result.error.includes('cancel')) {
          // User cancelled, show options
          showCancelOptions();
        } else {
          showBiometricError('Authentication failed. Please try again.');
        }
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Biometric authentication error:', error);
      showBiometricError('Authentication failed. Please try again.');
    }
  };

  const showBiometricError = (message: string) => {
    Alert.alert(
      'Authentication Error',
      message,
      [
        {
          text: 'Try Again',
          onPress: () => authenticateWithBiometrics(),
        },
        {
          text: 'Use PIN Instead',
          onPress: () => router.replace('/auth/pin-login'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const showCancelOptions = () => {
    Alert.alert(
      'Authentication Cancelled',
      'How would you like to proceed?',
      [
        {
          text: 'Try Again',
          onPress: () => authenticateWithBiometrics(),
        },
        {
          text: 'Use PIN Instead',
          onPress: () => router.replace('/auth/pin-login'),
        },
        {
          text: 'Go Back',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return '👤';
    } else if (biometricType === 'Iris') {
      return '👁️';
    } else {
      return '👆';
    }
  };

  const getBiometricText = () => {
    if (biometricType === 'Face ID') {
      return 'Face ID';
    } else if (biometricType === 'Iris') {
      return 'Iris Scan';
    } else {
      return 'Fingerprint';
    }
  };

  if (!hasBiometricHardware) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📱</Text>
            <Text style={styles.errorTitle}>Biometric Not Available</Text>
            <Text style={styles.errorMessage}>
              Your device doesn't support biometric authentication or it's not properly configured.
            </Text>
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={() => router.replace('/auth/pin-login')}
            >
              <Text style={styles.fallbackButtonText}>Use PIN Instead</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!isBiometricEnrolled) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🔒</Text>
            <Text style={styles.errorTitle}>Biometric Not Set Up</Text>
            <Text style={styles.errorMessage}>
              Please set up {biometricType.toLowerCase()} in your device settings to use this feature.
            </Text>
            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={() => router.replace('/auth/pin-login')}
            >
              <Text style={styles.fallbackButtonText}>Use PIN Instead</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Authenticate with {getBiometricText()}</Text>
          <Text style={styles.subtitle}>
            Use your {biometricType.toLowerCase()} to access your account
          </Text>
        </View>

        {/* Biometric Icon */}
        <View style={styles.biometricContainer}>
          <Animated.View
            style={[
              styles.biometricIconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
          </Animated.View>
          
          {isAuthenticating && (
            <Text style={styles.authenticatingText}>
              Authenticating...
            </Text>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Place your {biometricType.toLowerCase()} on the sensor to continue
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/auth/pin-login')}
            disabled={isAuthenticating}
          >
            <Text style={styles.secondaryButtonText}>Use PIN Instead</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={authenticateWithBiometrics}
            disabled={isAuthenticating}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    padding: Theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  biometricContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.large,
  },
  biometricIcon: {
    fontSize: 48,
  },
  authenticatingText: {
    fontSize: 16,
    color: Theme.colors.primary,
    fontWeight: '600',
    marginTop: Theme.spacing.md,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  instructionText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  secondaryButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  retryButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.surface,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.lg,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
  },
  fallbackButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.small,
  },
  fallbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.surface,
  },
  backButton: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.textSecondary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
}); 