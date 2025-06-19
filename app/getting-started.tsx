import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { Theme } from '@/constants/Theme';
import Button from '@/components/ui/Button';

const { width } = Dimensions.get('window');

interface Feature {
  id: number;
  title: string;
  description: string;
  image: any;
}

const features: Feature[] = [
  {
    id: 1,
    title: 'Welcome To Prodora',
    description: 'Your secure and intuitive productivity companion. Let\'s get you started with a personalized experience.',
    image: require('@/assets/images/icon.png'),
  },
  {
    id: 2,
    title: 'Self Management System',
    description: 'Take control of your productivity with our intelligent self-management tools that adapt to your workflow.',
    image: require('@/assets/images/icon.png'),
  },
  {
    id: 3,
    title: 'Account Reminder',
    description: 'Never miss important deadlines or tasks with our smart reminder system that keeps you on track.',
    image: require('@/assets/images/icon.png'),
  },
  {
    id: 4,
    title: 'Secure Data Protection',
    description: 'Your data is protected with enterprise-grade security and end-to-end encryption for complete peace of mind.',
    image: require('@/assets/images/icon.png'),
  },
];

export default function GettingStarted() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleButtonPress = async () => {
    try {
      // Save onboarding completion flag
      const fileUri = `${FileSystem.documentDirectory}onboarding_completed.txt`;
      await FileSystem.writeAsStringAsync(fileUri, 'true', {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Navigate to auth setup
      router.replace('/auth/setup');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Still navigate even if saving fails
      router.replace('/auth/setup');
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Feature Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {features.map((feature: Feature, index: number) => (
              <View key={feature.id} style={styles.slide}>
                <Image
                  source={feature.image}
                  style={styles.featureImage}
                  resizeMode="contain"
                />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {features.map((_: Feature, index: number) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleButtonPress}
            variant="primary"
            style={styles.button}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Theme.spacing.lg,
  },
  sliderContainer: {
    flex: 1,
    width: '100%',
    marginBottom: Theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width - Theme.spacing.lg * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
  },
  featureImage: {
    width: Math.min(width * 0.6, 280),
    height: Math.min(width * 0.6, 280),
    borderRadius: Theme.borderRadius.lg,
    marginBottom: 100,
  },
  featureTitle: {
    fontSize: Math.max(20, width * 0.06),
    fontWeight: 'bold' as const,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    lineHeight: Math.max(28, width * 0.08),
  },
  featureDescription: {
    fontSize: Math.max(14, width * 0.04),
    fontWeight: 'normal' as const,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Math.max(20, width * 0.06),
    paddingHorizontal: Theme.spacing.sm,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.accent,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: Theme.colors.primary,
    width: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  button: {
    width: '100%',
    borderRadius: 200,
    height: 56,
  },
}); 