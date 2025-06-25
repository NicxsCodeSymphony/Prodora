import { Theme } from '@/constants/Theme';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { BaseModal } from './BaseModal';

interface ErrorModalProps {
    visible: boolean;
    onClose: () => void;
    error: {
        title: string;
        message: string;
        type: 'success' | 'error' | null;
    } | null;
}

export function ErrorModal({ visible, onClose, error }: ErrorModalProps) {
    if (!error) return null;

    return (
        <BaseModal 
            visible={visible} 
            onClose={onClose} 
            title={error.title}
            animationType="fade"
        >
            <Text style={{ 
                color: Theme.colors.textPrimary,
                fontSize: 16,
                marginBottom: 20,
                textAlign: 'center'
            }}>
                {error.message}
            </Text>
            <TouchableOpacity
                style={{
                    backgroundColor: error.type === 'error' ? Theme.colors.error : Theme.colors.success,
                    borderRadius: 8,
                    padding: 15,
                    alignItems: 'center',
                }}
                onPress={onClose}
            >
                <Text style={{
                    color: '#fff',
                    fontWeight: 'bold',
                }}>
                    OK
                </Text>
            </TouchableOpacity>
        </BaseModal>
    );
} 