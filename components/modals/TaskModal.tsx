import { Theme } from '@/constants/Theme';
import { SubTask, Task, TaskPriority, TaskStatus } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
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

interface TaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (task: Partial<Task>) => void;
    task?: Task;
}

export function TaskModal({ visible, onClose, onSubmit, task }: TaskModalProps) {
    // Form state
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState<TaskStatus>(task ? task.status : 'not_started');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState<Date | undefined>(
        task?.dueDate ? new Date(task?.dueDate) : undefined
    );
    const [tags, setTags] = useState<string[]>(task?.tags || []);
    const [newTag, setNewTag] = useState('');
    const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Animation state
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').height));

    // Validation state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 30,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: Dimensions.get('window').height,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            // Reset form when modal opens
            setTitle(task?.title || '');
            setDescription(task?.description || '');
            setStatus(task?.status || 'not_started');
            setPriority(task?.priority || 'medium');
            setDueDate(task?.dueDate ? new Date(task?.dueDate) : undefined);
            setTags(task?.tags || []);
            setSubtasks(task?.subtasks || []);
            setNewTag('');
            setNewSubtask('');
            setErrors({});
            setTouched({});
        }
    }, [visible, task]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (description && description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        const isValid = validate();
        if (!isValid) {
            Alert.alert('Error', 'Please fix the errors before submitting');
            return;
        }

        onSubmit({
            title,
            description,
            status,
            priority,
            dueDate: dueDate?.toISOString(),
            tags,
            subtasks,
        });
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const newSubtaskItem: SubTask = {
                id: Date.now().toString(),
                title: newSubtask.trim(),
                completed: false,
            };
            setSubtasks([...subtasks, newSubtaskItem]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    };

    const handleToggleSubtask = (subtaskId: string) => {
        setSubtasks(
            subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
            )
        );
    };

    const renderPriorityButton = (value: TaskPriority, label: string) => (
        <TouchableOpacity
            style={[
                styles.priorityButton,
                priority === value && styles.priorityButtonActive,
                { backgroundColor: getPriorityColor(value) },
            ]}
            onPress={() => setPriority(value)}
        >
            <Text style={[
                styles.priorityButtonText,
                priority === value && styles.priorityButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderStatusButton = (value: TaskStatus, label: string) => (
        <TouchableOpacity
            style={[
                styles.statusButton,
                status === value && styles.statusButtonActive,
            ]}
            onPress={() => setStatus(value)}
        >
            <Text style={[
                styles.statusButtonText,
                status === value && styles.statusButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: fadeAnim },
                    ]}
                >
                    <TouchableOpacity style={styles.overlay} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {task ? 'Edit Task' : 'New Task'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.title && styles.inputError,
                                ]}
                                value={title}
                                onChangeText={setTitle}
                                onBlur={() => setTouched({ ...touched, title: true })}
                                placeholder="Enter task title"
                                placeholderTextColor={Theme.colors.textSecondary}
                            />
                            {errors.title && touched.title && (
                                <Text style={styles.errorText}>{errors.title}</Text>
                            )}
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    errors.description && styles.inputError,
                                ]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter task description"
                                placeholderTextColor={Theme.colors.textSecondary}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                            {errors.description && (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            )}
                        </View>

                        {/* Priority Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityButtons}>
                                {renderPriorityButton('low', 'Low')}
                                {renderPriorityButton('medium', 'Medium')}
                                {renderPriorityButton('high', 'High')}
                            </View>
                        </View>

                        {/* Status Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.statusButtons}>
                                {renderStatusButton('not_started', 'Not Started')}
                                {renderStatusButton('in_progress', 'In Progress')}
                                {renderStatusButton('completed', 'Completed')}
                                {renderStatusButton('archived', 'Archived')}
                            </View>
                        </View>

                        {/* Due Date Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Due Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={Theme.colors.textSecondary}
                                />
                                <Text style={styles.dateButtonText}>
                                    {dueDate
                                        ? format(dueDate, 'MMM dd, yyyy')
                                        : 'Select due date'}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dueDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setDueDate(selectedDate);
                                        }
                                    }}
                                    minimumDate={new Date()}
                                />
                            )}
                        </View>

                        {/* Tags Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tags</Text>
                            <View style={styles.tagInput}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={newTag}
                                    onChangeText={setNewTag}
                                    placeholder="Add a tag"
                                    placeholderTextColor={Theme.colors.textSecondary}
                                    onSubmitEditing={handleAddTag}
                                />
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddTag}
                                >
                                    <Ionicons name="add" size={20} color={Theme.colors.background} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.tagContainer}>
                                {tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveTag(tag)}
                                            style={styles.removeTagButton}
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={16}
                                                color={Theme.colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Subtasks Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subtasks</Text>
                            <View style={styles.subtaskInput}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={newSubtask}
                                    onChangeText={setNewSubtask}
                                    placeholder="Add a subtask"
                                    placeholderTextColor={Theme.colors.textSecondary}
                                    onSubmitEditing={handleAddSubtask}
                                />
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={handleAddSubtask}
                                >
                                    <Ionicons name="add" size={20} color={Theme.colors.background} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.subtaskList}>
                                {subtasks.map((subtask) => (
                                    <View key={subtask.id} style={styles.subtaskItem}>
                                        <TouchableOpacity
                                            style={styles.subtaskCheckbox}
                                            onPress={() => handleToggleSubtask(subtask.id)}
                                        >
                                            <Ionicons
                                                name={subtask.completed ? 'checkbox' : 'square-outline'}
                                                size={20}
                                                color={Theme.colors.primary}
                                            />
                                        </TouchableOpacity>
                                        <Text style={[
                                            styles.subtaskText,
                                            subtask.completed && styles.subtaskTextCompleted
                                        ]}>
                                            {subtask.title}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveSubtask(subtask.id)}
                                            style={styles.removeSubtaskButton}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={20}
                                                color={Theme.colors.error}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.footerButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.footerButton, styles.submitButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>
                                {task ? 'Update' : 'Create'} Task
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
        case 'high':
            return 'rgba(255, 86, 86, 0.15)';
        case 'medium':
            return 'rgba(255, 171, 64, 0.15)';
        case 'low':
            return 'rgba(76, 175, 80, 0.15)';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    closeButton: {
        padding: 8,
    },
    scrollContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 8,
        padding: 12,
        color: Theme.colors.textPrimary,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputError: {
        borderWidth: 1,
        borderColor: Theme.colors.error,
    },
    errorText: {
        color: Theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    priorityButtonActive: {
        borderWidth: 1,
        borderColor: Theme.colors.primary,
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
    },
    priorityButtonTextActive: {
        color: Theme.colors.primary,
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    statusButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Theme.colors.surfaceHighlight,
    },
    statusButtonActive: {
        backgroundColor: Theme.colors.primary,
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
    },
    statusButtonTextActive: {
        color: Theme.colors.background,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 8,
        padding: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    tagInput: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 8,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: Theme.colors.background,
        fontSize: 16,
        fontWeight: '500',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        gap: 4,
    },
    tagText: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    removeTagButton: {
        padding: 2,
    },
    subtaskInput: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    subtaskList: {
        gap: 8,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 8,
        padding: 8,
    },
    subtaskCheckbox: {
        padding: 4,
    },
    subtaskText: {
        flex: 1,
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    subtaskTextCompleted: {
        textDecorationLine: 'line-through',
        color: Theme.colors.textSecondary,
    },
    removeSubtaskButton: {
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    footerButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Theme.colors.surfaceHighlight,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
    },
    submitButton: {
        backgroundColor: Theme.colors.primary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.background,
    },
});
