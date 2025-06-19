import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, Dimensions, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import { Theme } from '@/constants/Theme';
import Button from '@/components/ui/Button';

const { width } = Dimensions.get('window');

export default function Setup(){
    const router = useRouter();
    const [showPinSetup, setShowPinSetup] = useState(false);
    const [showPinLogin, setShowPinLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [savedPin, setSavedPin] = useState('');

    useEffect(() => {
        checkExistingPin();
    }, []);

    const checkExistingPin = async () => {
        try {
            const fileUri = `${FileSystem.documentDirectory}user_pin.txt`;
            const pinExists = await FileSystem.getInfoAsync(fileUri);
            
            if (pinExists.exists) {
                // PIN already exists, read it and show login
                const pinContent = await FileSystem.readAsStringAsync(fileUri);
                setSavedPin(pinContent);
                setShowPinLogin(true);
            } else {
                // No PIN exists, check fingerprint first
                checkFingerprint();
            }
        } catch (error) {
            console.error('Error checking existing PIN:', error);
            checkFingerprint();
        } finally {
            setIsLoading(false);
        }
    };

    const checkFingerprint = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Set up fingerprint for secure access',
                    cancelLabel: 'Skip',
                    fallbackLabel: 'Use PIN instead',
                });
                
                if (result.success) {
                    // Fingerprint setup successful, save this preference
                    saveAuthPreference('fingerprint');
                    router.replace('/(tabs)');
                } else {
                    // User cancelled or failed, show PIN setup
                    setShowPinSetup(true);
                }
            } else {
                // No fingerprint hardware or not enrolled, go directly to PIN
                setShowPinSetup(true);
            }
        } catch (error) {
            console.error('Fingerprint error:', error);
            setShowPinSetup(true);
        }
    };

    const saveAuthPreference = async (method: string) => {
        try {
            const fileUri = `${FileSystem.documentDirectory}auth_method.txt`;
            await FileSystem.writeAsStringAsync(fileUri, method, {
                encoding: FileSystem.EncodingType.UTF8,
            });
        } catch (error) {
            console.error('Error saving auth preference:', error);
        }
    };

    const handlePinSubmit = () => {
        if (pin.length !== 6) {
            Alert.alert('Invalid PIN', 'Please enter a 6-digit PIN');
            return;
        }

        if (!isConfirming) {
            setIsConfirming(true);
            setConfirmPin('');
        } else {
            if (pin === confirmPin) {
                // Save PIN and complete setup
                savePin();
                saveAuthPreference('pin');
                router.replace('/(tabs)');
            } else {
                Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
                setPin('');
                setConfirmPin('');
                setIsConfirming(false);
            }
        }
    };

    const handlePinLogin = () => {
        if (pin === savedPin) {
            // PIN matches, proceed to main app
            router.replace('/(tabs)');
        } else {
            Alert.alert('Incorrect PIN', 'Please enter the correct PIN');
            setPin('');
        }
    };

    const savePin = async () => {
        try {
            const fileUri = `${FileSystem.documentDirectory}user_pin.txt`;
            await FileSystem.writeAsStringAsync(fileUri, pin, {
                encoding: FileSystem.EncodingType.UTF8,
            });
        } catch (error) {
            console.error('Error saving PIN:', error);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Loading...</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (showPinLogin) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Enter PIN</Text>
                        <Text style={styles.subtitle}>Enter your 6-digit PIN</Text>
                    </View>
                    <View style={styles.pinContainer}>
                        <TextInput
                            style={styles.pinInput}
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="numeric"
                            maxLength={6}
                            secureTextEntry
                            placeholder="000000"
                            placeholderTextColor={Theme.colors.textSecondary}
                            textAlign="center"
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button 
                            title="Login" 
                            onPress={handlePinLogin}
                            variant="primary"
                            style={styles.button}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (showPinSetup) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('@/assets/images/icon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>
                            {isConfirming ? 'Confirm PIN' : 'Set up PIN'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isConfirming ? 'Enter your PIN again' : 'Enter a 6-digit PIN'}
                        </Text>
                    </View>
                    <View style={styles.pinContainer}>
                        <TextInput
                            style={styles.pinInput}
                            value={isConfirming ? confirmPin : pin}
                            onChangeText={isConfirming ? setConfirmPin : setPin}
                            keyboardType="numeric"
                            maxLength={6}
                            secureTextEntry
                            placeholder="000000"
                            placeholderTextColor={Theme.colors.textSecondary}
                            textAlign="center"
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button 
                            title={isConfirming ? "Confirm" : "Continue"} 
                            onPress={handlePinSubmit}
                            variant="primary"
                            style={styles.button}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.xl,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
    },
    icon: {
        width: Math.min(width * 0.3, 150),
        height: Math.min(width * 0.3, 150),
        borderRadius: Theme.borderRadius.lg,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
    },
    title: {
        fontSize: Math.max(28, width * 0.07),
        fontWeight: 'bold' as const,
        color: Theme.colors.textPrimary,
        textAlign: 'center',
        lineHeight: Math.max(36, width * 0.09),
    },
    subtitle: {
        fontSize: Math.max(16, width * 0.04),
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: Theme.spacing.sm,
    },
    pinContainer: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        width: '100%',
    },
    pinInput: {
        width: Math.min(width * 0.7, 280),
        height: 60,
        borderRadius: Theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.accent,
        padding: Theme.spacing.md,
        fontSize: Math.max(20, width * 0.05),
        color: Theme.colors.textPrimary,
        textAlign: 'center',
        backgroundColor: Theme.colors.surface,
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    button: {
        width: Math.min(width * 0.7, 280),
        borderRadius: Theme.borderRadius.lg,
        height: 56,
    }
}) 