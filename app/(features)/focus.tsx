import { Theme } from '@/constants/Theme';
import { cancelAllNotifications, showNotification, updateNotification } from '@/utils/notifications';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CIRCLE_SIZE = Math.min(width * 0.7, 300);
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TIMER_NOTIFICATION_ID = 'timer-notification';
const TIMER_STATE_FILE = `${FileSystem.documentDirectory}timer_state.json`;

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DEFAULT_TIMER_MODES = {
  FOCUS: 25 * 60, // 25 minutes
  BREAK: 5 * 60, // 5 minutes
};

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_MODES.FOCUS);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('FOCUS');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    focus: '25',
    break: '5',
  });
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const appState = useRef(AppState.currentState);
  const timerEndTime = useRef<number | null>(null);

  // Load saved timer state
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(TIMER_STATE_FILE);
        if (fileInfo.exists) {
          const contents = await FileSystem.readAsStringAsync(TIMER_STATE_FILE);
          const savedState = JSON.parse(contents);
          
          if (savedState.isRunning && savedState.endTime) {
            const now = Date.now();
            const remainingTime = Math.max(0, Math.ceil((savedState.endTime - now) / 1000));
            if (remainingTime > 0) {
              setTimeLeft(remainingTime);
              setMode(savedState.mode);
              setIsRunning(true);
              timerEndTime.current = savedState.endTime;
            } else {
              handleTimerComplete();
            }
          } else {
            setTimeLeft(savedState.timeLeft);
            setMode(savedState.mode);
            setIsRunning(savedState.isRunning);
            timerEndTime.current = savedState.endTime;
          }
        }
      } catch (error) {
        console.log('Error loading timer state:', error);
      }
    };

    loadTimerState();
  }, []);

  // Save timer state when it changes
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        const state = {
          timeLeft,
          mode,
          isRunning,
          endTime: timerEndTime.current,
        };
        await FileSystem.writeAsStringAsync(TIMER_STATE_FILE, JSON.stringify(state));
      } catch (error) {
        console.log('Error saving timer state:', error);
      }
    };

    saveTimerState();
  }, [timeLeft, mode, isRunning]);

  // Set up notification handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(TIMER_STATE_FILE);
        if (fileInfo.exists) {
          const contents = await FileSystem.readAsStringAsync(TIMER_STATE_FILE);
          const savedState = JSON.parse(contents);
          
          // Always restore the saved state, even if not running
          setTimeLeft(savedState.timeLeft);
          setMode(savedState.mode);
          setIsRunning(savedState.isRunning);
          timerEndTime.current = savedState.endTime;

          // If timer was running, calculate remaining time
          if (savedState.isRunning && savedState.endTime) {
            const now = Date.now();
            const remainingTime = Math.max(0, Math.ceil((savedState.endTime - now) / 1000));
            if (remainingTime > 0) {
              setTimeLeft(remainingTime);
              setIsRunning(true);
            } else {
              handleTimerComplete();
            }
          }
        }
      } catch (error) {
        console.log('Error loading timer state from notification:', error);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle app state changes and timer
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isRunning) {
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          // App is going to background - show persistent notification
          if (!timerEndTime.current) {
            timerEndTime.current = Date.now() + (timeLeft * 1000);
          }
          showNotification({
            title: `${mode === 'FOCUS' ? 'Focus Timer' : 'Break Timer'} Running`,
            body: `${formatTime(timeLeft)} remaining`,
            ongoing: true,
            identifier: TIMER_NOTIFICATION_ID
          });
        } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          // App is coming to foreground - remove notification and update timer
          cancelAllNotifications();
          if (timerEndTime.current) {
            const remainingTime = Math.max(0, Math.ceil((timerEndTime.current - Date.now()) / 1000));
            if (remainingTime > 0) {
              setTimeLeft(remainingTime);
            } else {
              handleTimerComplete();
            }
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (appState.current !== 'active') {
        cancelAllNotifications();
      }
    };
  }, [isRunning, timeLeft, mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const currentModes = getCurrentTimerModes();
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const progress = 1 - (newTime / currentModes[mode as keyof typeof currentModes]);
          
          // Update notification if app is in background
          if (appState.current !== 'active') {
            updateNotification(TIMER_NOTIFICATION_ID, {
              title: `${mode === 'FOCUS' ? 'Focus Timer' : 'Break Timer'} Running`,
              body: `${formatTime(newTime)} remaining`,
              ongoing: true,
            });
          }

          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
          }).start();
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, timerSettings, appState.current]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    const currentModes = getCurrentTimerModes();
    
    if (mode === 'FOCUS') {
      setCompletedSessions(prev => prev + 1);
      setMode('BREAK');
      setTimeLeft(currentModes.BREAK);
      await showNotification({
        title: "Focus Session Complete! 🎉",
        body: "Great work! Time for a break.",
        sound: true,
      });
    } else if (mode === 'BREAK') {
      setMode('FOCUS');
      setTimeLeft(currentModes.FOCUS);
      await showNotification({
        title: "Break Time Over ⏰",
        body: "Ready to focus again?",
        sound: true,
      });
    }
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);
    if (newIsRunning) {
      timerEndTime.current = Date.now() + (timeLeft * 1000);
      if (appState.current !== 'active') {
        showNotification({
          title: `${mode === 'FOCUS' ? 'Focus Timer' : 'Break Timer'} Running`,
          body: `${formatTime(timeLeft)} remaining`,
          ongoing: true,
          identifier: TIMER_NOTIFICATION_ID
        });
      }
    } else {
      timerEndTime.current = null;
      cancelAllNotifications();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    const currentModes = getCurrentTimerModes();
    setTimeLeft(currentModes[mode as keyof typeof currentModes]);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const switchMode = (newMode: string) => {
    setMode(newMode);
    const currentModes = getCurrentTimerModes();
    setTimeLeft(currentModes[newMode as keyof typeof currentModes]);
    setIsRunning(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const saveSettings = () => {
    const currentModes = getCurrentTimerModes();
    setTimeLeft(currentModes[mode as keyof typeof currentModes]);
    setShowSettings(false);
    setIsRunning(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'FOCUS': return '#FF6B6B';
      case 'BREAK': return '#4ECDC4';
      default: return '#FF6B6B';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'FOCUS': return 'Focus Time';
      case 'BREAK': return 'Break Time';
      default: return 'Focus Time';
    }
  };

  const getCurrentTimerModes = () => ({
    FOCUS: parseInt(timerSettings.focus) * 60,
    BREAK: parseInt(timerSettings.break) * 60,
  });

  if (showSettings) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.settingsContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Timer Settings</Text>
            <Text style={styles.subtitle}>Customize your focus sessions</Text>
          </View>

          {/* Settings Form */}
          <View style={styles.settingsForm}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Focus Time (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                value={timerSettings.focus}
                onChangeText={(text) => setTimerSettings(prev => ({ ...prev, focus: text }))}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={Theme.colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Break Time (minutes)</Text>
              <TextInput
                style={styles.settingInput}
                value={timerSettings.break}
                onChangeText={(text) => setTimerSettings(prev => ({ ...prev, break: text }))}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={Theme.colors.textSecondary}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.settingsActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: getModeColor() }]} 
              onPress={saveSettings}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus Timer</Text>
          <Text style={styles.subtitle}>Stay productive, stay focused</Text>
        </View>

        {/* Timer Circle */}
        <Animated.View style={[styles.timerContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.timerCircle, { borderColor: 'transparent' }]}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={StyleSheet.absoluteFill}>
              {/* Background Circle */}
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={Theme.colors.accent}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                opacity={0.2}
              />
              {/* Progress Circle */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke={getModeColor()}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [CIRCUMFERENCE, 0],
                })}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.timerContent}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.modeText, { color: getModeColor() }]}>
                {getModeTitle()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: getModeColor() }]} 
            onPress={toggleTimer}
          >
            <Text style={styles.playButtonText}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={() => switchMode(mode === 'FOCUS' ? 'BREAK' : 'FOCUS')}>
            <Text style={styles.controlButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'FOCUS' && { backgroundColor: getModeColor() }]} 
            onPress={() => switchMode('FOCUS')}
          >
            <Text style={[styles.modeButtonText, mode === 'FOCUS' && styles.activeModeText]}>
              Focus
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'BREAK' && { backgroundColor: getModeColor() }]} 
            onPress={() => switchMode('BREAK')}
          >
            <Text style={[styles.modeButtonText, mode === 'BREAK' && styles.activeModeText]}>
              Break
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedSessions}</Text>
            <Text style={styles.statLabel}>Sessions Completed</Text>
          </View>
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl * 2,
    paddingBottom: Theme.spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Math.max(32, width * 0.08),
    fontWeight: 'bold' as const,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Math.max(16, width * 0.04),
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  timerContainer: {
    marginBottom: Theme.spacing.xl,
  },
  timerCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Theme.colors.surface,
    ...Theme.shadows.large,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: Math.max(48, width * 0.12),
    fontWeight: 'bold' as const,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  modeText: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  controlButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  controlButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  playButton: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: Math.max(18, width * 0.045),
    color: Theme.colors.surface,
    fontWeight: 'bold' as const,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  modeButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
  },
  modeButtonText: {
    fontSize: Math.max(14, width * 0.035),
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeModeText: {
    color: Theme.colors.surface,
  },
  stats: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Math.max(24, width * 0.06),
    fontWeight: 'bold' as const,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Math.max(14, width * 0.035),
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  settingsContent: {
    padding: Theme.spacing.xl,
  },
  settingsForm: {
    marginBottom: Theme.spacing.xl,
  },
  settingItem: {
    marginBottom: Theme.spacing.md,
  },
  settingLabel: {
    fontSize: Math.max(16, width * 0.04),
    fontWeight: 'bold' as const,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  settingInput: {
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.md,
    color: Theme.colors.textPrimary,
  },
  settingsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.md,
  },
  cancelButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.md,
  },
  saveButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: Theme.colors.surface,
    fontWeight: 'bold' as const,
  },
  settingsButton: {
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.md,
  },
  settingsButtonText: {
    fontSize: Math.max(16, width * 0.04),
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
});