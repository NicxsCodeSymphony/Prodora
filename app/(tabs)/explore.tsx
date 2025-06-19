import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Theme } from '@/constants/Theme';

export default function TabTwoScreen() {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    // Rotation animation for the seal
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Scale animation for entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Seal */}
        <Animated.View
          style={[
            styles.sealContainer,
            {
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <View style={styles.seal}>
            <Text style={styles.sealIcon}>🚧</Text>
            <Text style={styles.sealTitle}>UNDER CONSTRUCTION</Text>
            <Text style={styles.sealSubtitle}>Coming Soon</Text>
          </View>
        </Animated.View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>We're Building Something Amazing</Text>
          <Text style={styles.infoDescription}>
            Our team is working hard to bring you the best productivity experience. 
            This page is currently under development and will be available soon.
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Development Progress: 2%</Text>
        </View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  sealContainer: {
    marginBottom: Theme.spacing.xl,
  },
  seal: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: Theme.colors.primaryDarker,
    ...Theme.shadows.large,
  },
  sealIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  sealTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.surface,
    textAlign: 'center',
    letterSpacing: 1,
  },
  sealSubtitle: {
    fontSize: 12,
    color: Theme.colors.accent,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  infoDescription: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    width: '100%',
  },
  progressBar: {
    width: 250,
    height: 8,
    backgroundColor: Theme.colors.accent,
    borderRadius: 4,
    marginBottom: Theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    width: '2%',
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  featuresSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.spacing.lg,
  },
  featureItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
});