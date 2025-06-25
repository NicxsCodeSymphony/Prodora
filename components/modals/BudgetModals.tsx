import { Theme } from '@/constants/Theme';
import { Budget, Category } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BaseModal } from './BaseModal';

interface AddBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    category: string;
    targetAmount: string;
    currentAmount: string;
    note: string;
    targetDate: Date;
    showDatePicker: boolean;
    onTitleChange: (text: string) => void;
    onShowCategoryPicker: () => void;
    onTargetAmountChange: (text: string) => void;
    onCurrentAmountChange: (text: string) => void;
    onNoteChange: (text: string) => void;
    onDateChange: (event: any, date?: Date) => void;
    onShowDatePicker: () => void;
    onSubmit: () => void;
}

interface UpdateBudgetModalProps {
    visible: boolean;
    onClose: () => void;
    budget: Budget | null;
    currentAmount: string;
    onCurrentAmountChange: (text: string) => void;
    onUpdateProgress: (operation: 'add' | 'subtract') => void;
}

interface CategoryPickerModalProps {
    visible: boolean;
    onClose: () => void;
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryName: string) => void;
}

interface DeleteConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function AddBudgetModal({
    visible,
    onClose,
    title,
    category,
    targetAmount,
    currentAmount,
    note,
    targetDate,
    showDatePicker,
    onTitleChange,
    onShowCategoryPicker,
    onTargetAmountChange,
    onCurrentAmountChange,
    onNoteChange,
    onDateChange,
    onShowDatePicker,
    onSubmit
}: AddBudgetModalProps) {
    return (
        <BaseModal visible={visible} onClose={onClose} title="Add Budget Goal">
            <TextInput
                style={styles.input}
                placeholder="Goal Title"
                value={title}
                onChangeText={onTitleChange}
                placeholderTextColor={Theme.colors.textSecondary}
            />

            <TouchableOpacity
                style={[styles.input, styles.categorySelector]}
                onPress={onShowCategoryPicker}
            >
                <Text style={category ? styles.categoryText : styles.placeholderText}>
                    {category || 'Select Category'}
                </Text>
                <Ionicons 
                    name="chevron-down" 
                    size={20} 
                    color={Theme.colors.textSecondary} 
                />
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Target Amount"
                value={targetAmount}
                onChangeText={onTargetAmountChange}
                keyboardType="numeric"
                placeholderTextColor={Theme.colors.textSecondary}
            />

            <TextInput
                style={styles.input}
                placeholder="Current Amount"
                value={currentAmount}
                onChangeText={onCurrentAmountChange}
                keyboardType="numeric"
                placeholderTextColor={Theme.colors.textSecondary}
            />

            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={onShowDatePicker}
            >
                <Ionicons name="calendar-outline" size={20} color={Theme.colors.textSecondary} />
                <Text style={styles.datePickerButtonText}>
                    {targetDate.toLocaleDateString()}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                />
            )}

            <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Note (optional)"
                value={note}
                onChangeText={onNoteChange}
                multiline
                placeholderTextColor={Theme.colors.textSecondary}
            />

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: Theme.colors.primary }]}
                onPress={onSubmit}
            >
                <Text style={styles.submitButtonText}>Add Goal</Text>
            </TouchableOpacity>
        </BaseModal>
    );
}

export function UpdateBudgetModal({
    visible,
    onClose,
    budget,
    currentAmount,
    onCurrentAmountChange,
    onUpdateProgress
}: UpdateBudgetModalProps) {
    if (!budget) return null;

    return (
        <BaseModal visible={visible} onClose={onClose} title="Update Progress">
            <Text style={styles.updateTitle}>{budget.title}</Text>
            <Text style={styles.updateTarget}>
                Target: ₱{budget.targetAmount.toFixed(2)}
            </Text>
            <Text style={styles.updateTarget}>
                Current: ₱{budget.currentAmount.toFixed(2)}
            </Text>
            <Text style={styles.updateTarget}>
                Remaining: ₱{(budget.targetAmount - budget.currentAmount).toFixed(2)}
            </Text>
            
            <TextInput
                style={styles.input}
                placeholder="Enter Amount"
                value={currentAmount}
                onChangeText={onCurrentAmountChange}
                keyboardType="numeric"
                placeholderTextColor={Theme.colors.textSecondary}
            />

            <View style={styles.updateButtons}>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: Theme.colors.error, flex: 1, marginRight: 5 }]}
                    onPress={() => onUpdateProgress('subtract')}
                >
                    <Text style={styles.submitButtonText}>Subtract Cash</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: Theme.colors.success, flex: 1, marginLeft: 5 }]}
                    onPress={() => onUpdateProgress('add')}
                >
                    <Text style={styles.submitButtonText}>Add Cash</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

export function CategoryPickerModal({
    visible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory
}: CategoryPickerModalProps) {
    return (
        <BaseModal visible={visible} onClose={onClose} title="Select Category">
            <FlatList
                data={categories}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoryPickerItem}
                        onPress={() => {
                            onSelectCategory(item.name);
                            onClose();
                        }}
                    >
                        <Text style={[
                            styles.categoryPickerText,
                            selectedCategory === item.name && styles.categoryPickerTextSelected
                        ]}>
                            {item.name}
                        </Text>
                        {selectedCategory === item.name && (
                            <Ionicons 
                                name="checkmark" 
                                size={24} 
                                color={Theme.colors.primary} 
                            />
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.noCategoriesText}>
                        No categories available
                    </Text>
                )}
            />
        </BaseModal>
    );
}

export function DeleteConfirmModal({
    visible,
    onClose,
    onConfirm
}: DeleteConfirmModalProps) {
    return (
        <BaseModal visible={visible} onClose={onClose} title="Delete Budget" animationType="fade">
            <Text style={styles.deleteConfirmText}>
                Are you sure you want to delete this budget goal?
            </Text>
            <Text style={styles.deleteWarningText}>
                This action cannot be undone.
            </Text>

            <View style={styles.deleteActions}>
                <TouchableOpacity
                    style={[styles.deleteButton, styles.cancelButton]}
                    onPress={onClose}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.deleteButton, styles.confirmButton]}
                    onPress={onConfirm}
                >
                    <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        color: Theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        color: Theme.colors.textPrimary,
    },
    placeholderText: {
        color: Theme.colors.textSecondary,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    datePickerButtonText: {
        marginLeft: 8,
        color: Theme.colors.textPrimary,
    },
    noteInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    updateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.textPrimary,
        marginBottom: 10,
    },
    updateTarget: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
        marginBottom: 5,
    },
    updateButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    categoryPickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    categoryPickerText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    categoryPickerTextSelected: {
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    noCategoriesText: {
        textAlign: 'center',
        color: Theme.colors.textSecondary,
        padding: 20,
    },
    deleteConfirmText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
        marginBottom: 10,
        textAlign: 'center',
    },
    deleteWarningText: {
        fontSize: 14,
        color: Theme.colors.error,
        marginBottom: 20,
        textAlign: 'center',
    },
    deleteActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    deleteButton: {
        flex: 1,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    confirmButton: {
        backgroundColor: Theme.colors.error,
    },
    cancelButtonText: {
        color: Theme.colors.textPrimary,
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
}); 