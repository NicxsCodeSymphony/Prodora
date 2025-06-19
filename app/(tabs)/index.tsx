import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/Theme';
import { features, type Feature } from '@/utils/navigation';

export default function HomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Calculate dynamic sizes based on screen dimensions
  const getFontSize = (baseSize: number) => Math.max(baseSize, width * (baseSize / 400));
  const getSpacing = (baseSize: number) => Math.max(baseSize, width * (baseSize / 400));
  
  const getFeatureCardSize = () => {
    const isLandscape = width > height;
    const columns = isLandscape ? 6 : 4;
    const horizontalPadding = Theme.spacing.lg * 2;
    const gapSpace = Theme.spacing.sm * (columns - 1);
    return (width - horizontalPadding - gapSpace) / columns;
  };

  const handleFeaturePress = (feature: Feature) => {
    if (feature.route) {
      router.push(feature.route);
    }
  };

  const dynamicStyles = StyleSheet.create({
    header: {
      paddingVertical: getSpacing(40),
      paddingHorizontal: Theme.spacing.lg,
      marginTop: getSpacing(20),
    },
    appName: {
      fontSize: getFontSize(28),
      fontWeight: 'bold',
      color: Theme.colors.textPrimary,
      marginBottom: Theme.spacing.xs,
    },
    appTagline: {
      fontSize: getFontSize(16),
      color: Theme.colors.textSecondary,
      fontWeight: '500',
    },
    featureCard: {
      width: getFeatureCardSize(),
      aspectRatio: 1,
      borderRadius: Theme.borderRadius.md,
      padding: getSpacing(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureIconContainer: {
      width: getFeatureCardSize() * 0.63,
      height: getFeatureCardSize() * 0.63,
      borderRadius: getFeatureCardSize() * 0.375,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Theme.spacing.xs,
    },
    featureIcon: {
      fontSize: getFontSize(24),
    },
    featureTitle: {
      fontSize: getFontSize(12),
      fontWeight: 'bold',
      color: Theme.colors.textPrimary,
      textAlign: 'center',
    },
    statNumber: {
      fontSize: getFontSize(24),
      fontWeight: 'bold',
      color: Theme.colors.primary,
      marginBottom: Theme.spacing.xs,
    },
    statLabel: {
      fontSize: getFontSize(12),
      color: Theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with App Name */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.appName}>Prodora</Text>
          <Text style={dynamicStyles.appTagline}>Your Productivity Companion</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity 
                key={feature.id} 
                style={dynamicStyles.featureCard}
                onPress={() => handleFeaturePress(feature)}
                activeOpacity={0.7}
              >
                <View style={[dynamicStyles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <Text style={dynamicStyles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={dynamicStyles.featureTitle}>{feature.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { fontSize: getFontSize(20) }]}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={dynamicStyles.statNumber}>3</Text>
              <Text style={dynamicStyles.statLabel}>Tasks Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={dynamicStyles.statNumber}>25</Text>
              <Text style={dynamicStyles.statLabel}>Minutes Focused</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={dynamicStyles.statNumber}>2</Text>
              <Text style={dynamicStyles.statLabel}>Reminders Set</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  featuresSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: Theme.spacing.sm,
  },
  statsSection: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadows.small,
  },
});