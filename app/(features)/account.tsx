import { Theme } from '@/constants/Theme';
import { credentialManager, type AccountCredential } from '@/utils/credentialManager';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VisiblePasswords {
  [key: string]: boolean;
}

export default function AccountScreen() {
  const [credentials, setCredentials] = useState<AccountCredential[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<VisiblePasswords>({});

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      await credentialManager.initialize();
      const loadedCredentials = await credentialManager.getAll();
      setCredentials(loadedCredentials);
    } catch (error) {
      Alert.alert('Error', 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async () => {
    if (!title || !service || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isEditing && editingId) {
        await credentialManager.update(editingId, {
          title,
          service,
          email,
          password,
        });
      } else {
        await credentialManager.create({
          title,
          service,
          email,
          password,
        });
      }
      
      await loadCredentials();
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save credential');
    }
  };

  const resetForm = () => {
    setTitle('');
    setService('');
    setEmail('');
    setPassword('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (credential: AccountCredential) => {
    setTitle(credential.title);
    setService(credential.service);
    setEmail(credential.email);
    setPassword(credential.password);
    setIsEditing(true);
    setEditingId(credential.id);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await credentialManager.delete(id);
              await loadCredentials();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete credential');
            }
          },
        },
      ]
    );
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Reminder</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <Ionicons name="add-circle" size={24} color={Theme.colors.primary} />
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <Text>Loading...</Text>
        </View>
      ) : credentials.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No credentials saved yet</Text>
          <Text style={styles.emptySubtext}>Tap the "Add New" button to get started</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {credentials.map((cred) => (
            <View key={cred.id} style={styles.credentialCard}>
              <View style={styles.credentialHeader}>
                <View style={styles.credentialTitleContainer}>
                  <Text style={styles.credentialTitle}>{cred.title}</Text>
                  <Text style={styles.credentialService}>{cred.service}</Text>
                </View>
                <View style={styles.credentialActions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(cred)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Ionicons name="pencil" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(cred.id)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.credentialDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{cred.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Password:</Text>
                  <View style={styles.passwordContainer}>
                    <Text style={styles.passwordValue} numberOfLines={1} ellipsizeMode="tail">
                      {visiblePasswords[cred.id] ? cred.password : '••••••••'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility(cred.id)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={visiblePasswords[cred.id] ? "eye-off" : "eye"}
                        size={20}
                        color={Theme.colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Credential' : 'Add New Credential'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScrollView}>
              <TextInput
                style={styles.input}
                placeholder="Title (e.g., Work Email)"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Service (e.g., Gmail, Twitter)"
                value={service}
                onChangeText={setService}
                placeholderTextColor={Theme.colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Email/Username"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Theme.colors.textSecondary}
              />
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!visiblePasswords['new']}
                  placeholderTextColor={Theme.colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => togglePasswordVisibility('new')}
                  style={styles.passwordInputEyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={visiblePasswords['new'] ? "eye-off" : "eye"}
                    size={20}
                    color={Theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update' : 'Save'} Credential
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  addButtonText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  credentialCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
    ...Theme.shadows.small,
  },
  credentialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surfaceHighlight,
  },
  credentialTitleContainer: {
    flex: 1,
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  credentialService: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  credentialActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: Theme.colors.error,
  },
  credentialDetails: {
    padding: Theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
    alignItems: 'center',
    minHeight: 40,
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
  },
  passwordValue: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    paddingRight: Theme.spacing.xl,
    marginRight: Theme.spacing.xs,
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    minHeight: 40,
  },
  eyeButton: {
    padding: Theme.spacing.xs,
    position: 'absolute',
    right: Theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  closeButton: {
    padding: Theme.spacing.xs,
  },
  formScrollView: {
    padding: Theme.spacing.lg,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    paddingRight: 50,
  },
  passwordInputEyeButton: {
    position: 'absolute',
    right: Theme.spacing.md,
    padding: Theme.spacing.xs,
    height: '100%',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
