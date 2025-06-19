import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" />
      <Stack.Screen name="pin-login" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="fingerprint" />
    </Stack>
  );
} 