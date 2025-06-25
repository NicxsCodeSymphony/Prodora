import { Theme } from '@/constants/Theme';
import { SubTask, Task } from '@/types/task';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotionTaskItemProps {
    task: Task;
    onUpdate: (task: Partial<Task>) => void;
    onDelete: (task: Task) => void;
    onSubtaskAdd: (taskId: string, subtask: SubTask) => void;
    onSubtaskToggle: (taskId: string, subtaskId: string) => void;
    onSubtaskDelete: (taskId: string, subtaskId: string) => void;
}

export function NotionTaskItem({
    task,
    onUpdate,
    onDelete,
    onSubtaskAdd,
    onSubtaskToggle,
    onSubtaskDelete,
}: NotionTaskItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const [rotateAnim] = useState(new Animated.Value(0));

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
        Animated.spring(rotateAnim, {
            toValue: isExpanded ? 0 : 1,
            useNativeDriver: true,
        }).start();
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const subtask: SubTask = {
                id: Date.now().toString(),
                title: newSubtask.trim(),
                completed: false,
            };
            onSubtaskAdd(task.id, subtask);
            setNewSubtask('');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => onDelete(task), style: 'destructive' },
            ]
        );
    };

    const getPriorityColor = () => {
        switch (task.priority) {
            case 'high':
                return Theme.colors.error;
            case 'medium':
                return Theme.colors.warning;
            case 'low':
                return Theme.colors.success;
            default:
                return Theme.colors.textSecondary;
        }
    };

    const getStatusColor = () => {
        switch (task.status) {
            case 'completed':
                return Theme.colors.success;
            case 'in_progress':
                return Theme.colors.warning;
            case 'archived':
                return Theme.colors.textSecondary;
            default:
                return Theme.colors.textPrimary;
        }
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return 'checkmark-circle';
            case 'in_progress':
                return 'time';
            case 'archived':
                return 'archive';
            default:
                return 'ellipse-outline';
        }
    };

    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={handleToggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.titleSection}>
                    <Ionicons
                        name={getStatusIcon()}
                        size={24}
                        color={getStatusColor()}
                        style={styles.statusIcon}
                    />
                    <View style={styles.titleContent}>
                        <Text style={[
                            styles.title,
                            task.status === 'completed' && styles.completedTitle
                        ]}>
                            {task.title}
                        </Text>
                        <View style={styles.metaInfo}>
                            {task.dueDate && (
                                <View style={styles.metaItem}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={14}
                                        color={Theme.colors.textSecondary}
                                    />
                                    <Text style={styles.metaText}>
                                        {format(new Date(task.dueDate), 'MMM d')}
                                    </Text>
                                </View>
                            )}
                            {totalSubtasks > 0 && (
                                <View style={styles.metaItem}>
                                    <Ionicons
                                        name="list-outline"
                                        size={14}
                                        color={Theme.colors.textSecondary}
                                    />
                                    <Text style={styles.metaText}>
                                        {completedSubtasks}/{totalSubtasks}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                                <Text style={styles.priorityText}>
                                    {task.priority}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.rightSection}>
                    {task.tags && task.tags.length > 0 && (
                        <View style={styles.tags}>
                            {task.tags.slice(0, 2).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                            {task.tags.length > 2 && (
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>+{task.tags.length - 2}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={Theme.colors.textSecondary}
                        />
                    </Animated.View>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    {task.description && (
                        <Text style={styles.description}>{task.description}</Text>
                    )}

                    {/* Progress Bar */}
                    {totalSubtasks > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progress}%` },
                                        { backgroundColor: getStatusColor() }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {Math.round(progress)}% Complete
                            </Text>
                        </View>
                    )}

                    {/* Subtasks */}
                    <View style={styles.subtasksContainer}>
                        {task.subtasks?.map(subtask => (
                            <View key={subtask.id} style={styles.subtaskItem}>
                                <TouchableOpacity
                                    onPress={() => onSubtaskToggle(task.id, subtask.id)}
                                    style={styles.subtaskCheckbox}
                                >
                                    <Ionicons
                                        name={subtask.completed ? 'checkbox' : 'square-outline'}
                                        size={20}
                                        color={Theme.colors.primary}
                                    />
                                </TouchableOpacity>
                                <Text style={[
                                    styles.subtaskText,
                                    subtask.completed && styles.completedSubtask
                                ]}>
                                    {subtask.title}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => onSubtaskDelete(task.id, subtask.id)}
                                    style={styles.deleteSubtask}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={18}
                                        color={Theme.colors.error}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Add Subtask Input */}
                        <View style={styles.addSubtaskContainer}>
                            <TextInput
                                style={styles.subtaskInput}
                                value={newSubtask}
                                onChangeText={setNewSubtask}
                                placeholder="Add a subtask"
                                placeholderTextColor={Theme.colors.textSecondary}
                                onSubmitEditing={handleAddSubtask}
                            />
                            <TouchableOpacity
                                style={styles.addSubtaskButton}
                                onPress={handleAddSubtask}
                            >
                                <Ionicons
                                    name="add"
                                    size={24}
                                    color={Theme.colors.background}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => onUpdate(task)}
                        >
                            <Ionicons
                                name="pencil"
                                size={18}
                                color={Theme.colors.primary}
                            />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDelete}
                        >
                            <Ionicons
                                name="trash"
                                size={18}
                                color={Theme.colors.error}
                            />
                            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    titleSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleContent: {
        flex: 1,
    },
    statusIcon: {
        width: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
        marginBottom: 4,
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: Theme.colors.textSecondary,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 12,
        color: Theme.colors.background,
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tags: {
        flexDirection: 'row',
        gap: 4,
    },
    tag: {
        backgroundColor: Theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
    },
    expandedContent: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    description: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 4,
        backgroundColor: Theme.colors.surface,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        textAlign: 'right',
    },
    subtasksContainer: {
        gap: 8,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Theme.colors.surface,
        padding: 8,
        borderRadius: 8,
    },
    subtaskCheckbox: {
        padding: 4,
    },
    subtaskText: {
        flex: 1,
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    completedSubtask: {
        textDecorationLine: 'line-through',
        color: Theme.colors.textSecondary,
    },
    deleteSubtask: {
        padding: 4,
    },
    addSubtaskContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    subtaskInput: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        padding: 8,
        color: Theme.colors.textPrimary,
        fontSize: 14,
    },
    addSubtaskButton: {
        backgroundColor: Theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    editButton: {
        borderColor: Theme.colors.primary,
        backgroundColor: 'transparent',
    },
    deleteButton: {
        borderColor: Theme.colors.error,
        backgroundColor: 'transparent',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Theme.colors.primary,
    },
    deleteButtonText: {
        color: Theme.colors.error,
    },
}); 