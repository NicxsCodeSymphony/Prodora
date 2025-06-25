import { TaskModal } from '@/components/modals/TaskModal';
import { NotionTaskItem } from '@/components/NotionTaskItem';
import { Theme } from '@/constants/Theme';
import { styles as taskStyles } from '@/css/task.styles';
import { SubTask, Task, TaskStatus } from '@/types/task';
import { FileSystemManager } from '@/utils/fileSystemManager';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

    const taskManager = new FileSystemManager<Task>('tasks.json');

    useEffect(() => {
        initializeAndLoadTasks();
    }, []);

    const initializeAndLoadTasks = async () => {
        try {
            await taskManager.initialize();
            const loadedTasks = await taskManager.getAll();
            setTasks(loadedTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            Alert.alert('Error', 'Failed to load tasks');
        }
    };

    const handleAddTask = async (taskData: Partial<Task>) => {
        try {
            const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
                title: taskData.title!,
                description: taskData.description,
                status: taskData.status || 'not_started',
                priority: taskData.priority || 'medium',
                subtasks: taskData.subtasks || [],
                tags: taskData.tags || [],
                dueDate: taskData.dueDate,
                order: tasks.length,
            };
            
            const createdTask = await taskManager.create(newTask);
            setTasks(prevTasks => [...prevTasks, createdTask]);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Failed to add task:', error);
            Alert.alert('Error', 'Failed to add task');
        }
    };

    const handleUpdateTask = async (taskData: Partial<Task>) => {
        if (!selectedTask) return;

        try {
            const updatedTask = await taskManager.update(selectedTask.id, {
                ...selectedTask,
                ...taskData,
                subtasks: taskData.subtasks || selectedTask.subtasks || [],
            });
            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
            );
            setSelectedTask(null);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Failed to update task:', error);
            Alert.alert('Error', 'Failed to update task');
        }
    };

    const handleDeleteTask = async (task: Task) => {
        try {
            await taskManager.delete(task.id);
            setTasks(tasks.filter(t => t.id !== task.id));
        } catch (error) {
            console.error('Failed to delete task:', error);
            Alert.alert('Error', 'Failed to delete task');
        }
    };

    const handleSubtaskAdd = async (taskId: string, subtask: SubTask) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const updatedTask = await taskManager.update(taskId, {
                ...task,
                subtasks: [...(task.subtasks || []), subtask],
            });

            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? updatedTask : t))
            );
        } catch (error) {
            console.error('Failed to add subtask:', error);
            Alert.alert('Error', 'Failed to add subtask');
        }
    };

    const handleSubtaskToggle = async (taskId: string, subtaskId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const updatedSubtasks = (task.subtasks || []).map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
            );

            // Calculate new status based on subtask completion
            let newStatus = task.status;
            if (task.status !== 'archived') {
                const totalSubtasks = updatedSubtasks.length;
                const completedSubtasks = updatedSubtasks.filter(st => st.completed).length;

                if (totalSubtasks > 0) {
                    if (completedSubtasks === 0) {
                        newStatus = 'not_started';
                    } else if (completedSubtasks === totalSubtasks) {
                        newStatus = 'completed';
                    } else {
                        newStatus = 'in_progress';
                    }
                }
            }

            const updatedTask = await taskManager.update(taskId, {
                ...task,
                subtasks: updatedSubtasks,
                status: newStatus
            });

            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? updatedTask : t))
            );
        } catch (error) {
            console.error('Failed to toggle subtask:', error);
            Alert.alert('Error', 'Failed to toggle subtask');
        }
    };

    const handleSubtaskDelete = async (taskId: string, subtaskId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const updatedTask = await taskManager.update(taskId, {
                ...task,
                subtasks: (task.subtasks || []).filter(st => st.id !== subtaskId),
            });

            setTasks(prevTasks =>
                prevTasks.map(t => (t.id === taskId ? updatedTask : t))
            );
        } catch (error) {
            console.error('Failed to delete subtask:', error);
            Alert.alert('Error', 'Failed to delete subtask');
        }
    };

    const getTaskStats = () => {
        const total = tasks.length;
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);

        const progress = total > 0 ? (statusCounts.completed || 0) / total * 100 : 0;

        return {
            total,
            statusCounts,
            progress,
        };
    };

    const renderSummary = () => {
        const stats = getTaskStats();
        const statusOrder: TaskStatus[] = ['not_started', 'in_progress', 'completed', 'archived'];

        return (
            <View style={taskStyles.summary}>
                <Text style={taskStyles.summaryTitle}>Task Overview</Text>
                
                <View style={taskStyles.statsContainer}>
                    <View style={taskStyles.statBox}>
                        <Text style={taskStyles.statNumber}>{stats.total}</Text>
                        <Text style={taskStyles.statLabel}>Total Tasks</Text>
                    </View>
                    <View style={taskStyles.statBox}>
                        <Text style={taskStyles.statNumber}>
                            {stats.statusCounts.completed || 0}
                        </Text>
                        <Text style={taskStyles.statLabel}>Completed</Text>
                    </View>
                    <View style={taskStyles.statBox}>
                        <Text style={taskStyles.statNumber}>
                            {stats.statusCounts.in_progress || 0}
                        </Text>
                        <Text style={taskStyles.statLabel}>In Progress</Text>
                    </View>
                </View>

                <View style={taskStyles.progressSection}>
                    <Text style={taskStyles.progressLabel}>
                        Overall Progress ({Math.round(stats.progress)}%)
                    </Text>
                    <View style={taskStyles.progressBar}>
                        <View 
                            style={[
                                taskStyles.progressFill,
                                { width: `${stats.progress}%` }
                            ]} 
                        />
                    </View>
                </View>

                <View style={taskStyles.filterSection}>
                    {['all' as const, ...statusOrder].map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                taskStyles.filterButton,
                                filter === status && taskStyles.filterButtonActive
                            ]}
                            onPress={() => setFilter(status)}
                        >
                            <Text style={[
                                taskStyles.filterButtonText,
                                filter === status && taskStyles.filterButtonTextActive
                            ]}>
                                {status === 'all' ? 'All' : status.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const filteredTasks = tasks
        .filter(task => filter === 'all' || task.status === filter)
        .sort((a, b) => {
            // Sort by status first
            const statusOrder = { not_started: 0, in_progress: 1, completed: 2, archived: 3 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            // Then by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            // Finally by order
            return a.order - b.order;
        });

    const renderTaskList = () => {
        const TaskListHeader = () => (
            <>
                {renderSummary()}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons 
                                name="list-outline" 
                                size={20} 
                                color={Theme.colors.textPrimary} 
                            />
                            <Text style={styles.sectionHeaderText}>Task List</Text>
                        </View>
                        <Text style={styles.sectionCount}>
                            {filteredTasks.length} {filter === 'all' ? 'total' : filter}
                        </Text>
                    </View>
                </View>
            </>
        );

        if (filter !== 'all') {
            return (
                <FlatList
                    data={filteredTasks}
                    renderItem={({ item }) => (
                        <NotionTaskItem
                            task={item}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                            onSubtaskAdd={handleSubtaskAdd}
                            onSubtaskToggle={handleSubtaskToggle}
                            onSubtaskDelete={handleSubtaskDelete}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={taskStyles.taskList}
                    ListHeaderComponent={TaskListHeader}
                    ListEmptyComponent={() => (
                        <View style={taskStyles.emptyContainer}>
                            <Ionicons 
                                name="document-text-outline"
                                size={64}
                                color={Theme.colors.textSecondary}
                                style={taskStyles.emptyIcon}
                            />
                            <Text style={taskStyles.emptyText}>No tasks found</Text>
                            <Text style={taskStyles.emptySubText}>
                                Try changing the filter or add a new task
                            </Text>
                        </View>
                    )}
                />
            );
        }

        return (
            <FlatList
                data={filteredTasks}
                renderItem={({ item }) => (
                    <NotionTaskItem
                        task={item}
                        onUpdate={handleUpdateTask}
                        onDelete={handleDeleteTask}
                        onSubtaskAdd={handleSubtaskAdd}
                        onSubtaskToggle={handleSubtaskToggle}
                        onSubtaskDelete={handleSubtaskDelete}
                    />
                )}
                keyExtractor={item => item.id}
                ListHeaderComponent={TaskListHeader}
                ListEmptyComponent={() => (
                    <View style={taskStyles.emptyContainer}>
                        <Ionicons 
                            name="document-text-outline"
                            size={64}
                            color={Theme.colors.textSecondary}
                            style={taskStyles.emptyIcon}
                        />
                        <Text style={taskStyles.emptyText}>No tasks yet</Text>
                        <Text style={taskStyles.emptySubText}>
                            Add a new task to get started
                        </Text>
                    </View>
                )}
                contentContainerStyle={taskStyles.taskList}
            />
        );
    };

    return (
        <SafeAreaView style={taskStyles.container}>
            <View style={taskStyles.header}>
                <Text style={taskStyles.headerTitle}>Tasks</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setIsModalVisible(true);
                        setSelectedTask(null);
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.addButtonInner}>
                        <Ionicons name="add" size={24} color={Theme.colors.background} />
                        <Text style={styles.addButtonText}>New Task</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {renderTaskList()}

            <TaskModal
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedTask(null);
                }}
                onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
                task={selectedTask || undefined}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addButtonText: {
        color: Theme.colors.background,
        fontSize: 16,
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
    },
    sectionCount: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
});