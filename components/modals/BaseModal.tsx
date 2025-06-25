import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    animationType?: 'none' | 'slide' | 'fade';
}

export function BaseModal({ visible, onClose, title, children, animationType = 'slide' }: BaseModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType={animationType}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {children}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderRadius: 12,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.textPrimary,
    },
    closeButton: {
        padding: 5,
    },
    scrollView: {
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1,
    },
}); 