import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Hide the splash screen
      SplashScreen.hideAsync();
      
      try {
        // Check if onboarding is completed
        const fileUri = `${FileSystem.documentDirectory}onboarding_completed.txt`;
        const onboardingExists = await FileSystem.getInfoAsync(fileUri);
        
        if (onboardingExists.exists) {
          // Onboarding completed, go directly to auth setup
          router.replace('/auth/setup');
        } else {
          // First time user, show getting started
          router.replace('/getting-started');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback to getting started if there's an error
        router.replace('/getting-started');
      }
    }, 2000); // Show splash for 2 seconds

    // Animate the logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logo}>Prodoro</Text>
        <Text style={styles.tagline}>Your Productivity Companion</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA94D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
    fontWeight: '300',
  },
}); 