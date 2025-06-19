import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'small' | 'medium' | 'large';
}

export default function Card({ children, style, padding = 'medium' }: CardProps) {
  const cardStyle = [
    styles.base,
    styles[padding],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.medium,
  },
  small: {
    padding: Theme.spacing.md,
  },
  medium: {
    padding: Theme.spacing.lg,
  },
  large: {
    padding: Theme.spacing.xl,
  },
}); 