import { AddBudgetModal, CategoryPickerModal, DeleteConfirmModal, UpdateBudgetModal } from '@/components/modals/BudgetModals';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { Theme } from '@/constants/Theme';
import { styles } from '@/css/budget.styles';
import { Budget, Category, Transaction } from '@/types/budget';
import { FileSystemManager } from '@/utils/fileSystemManager';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, DeviceEventEmitter, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function BudgetScreen() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [targetDate, setTargetDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [error, setError] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error' | null;
    } | null>(null);

    const budgetManager = new FileSystemManager<Budget>('budgets.json');
    const categoryManager = new FileSystemManager<Category>('categories.json');
    const transactionManager = new FileSystemManager<Transaction>('transactions.json');

    useEffect(() => {
        initializeAndLoadBudgets();
        initializeAndLoadCategories();
        initializeAndLoadTransactions();
    }, []);

    const initializeAndLoadBudgets = async () => {
        try {
            await budgetManager.initialize();
            const loadedBudgets = await budgetManager.getAll();
            setBudgets(loadedBudgets);
        } catch (error) {
            console.error('Failed to load budgets:', error);
            Alert.alert('Error', 'Failed to load budgets');
        }
    };

    const initializeAndLoadCategories = async () => {
        try {
            await categoryManager.initialize();
            const loadedCategories = await categoryManager.getAll();
            setCategories(loadedCategories);
        } catch (error) {
            console.error('Failed to load categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        }
    };

    const initializeAndLoadTransactions = async () => {
        try {
            await transactionManager.initialize();
            const loadedTransactions = await transactionManager.getAll();
            setTransactions(loadedTransactions);
        } catch (error) {
            console.error('Failed to load transactions:', error);
            Alert.alert('Error', 'Failed to load transactions');
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        try {
            await budgetManager.delete(budget.id);
            setBudgets(budgets.filter(b => b.id !== budget.id));
            setShowDeleteConfirm(false);
            setSelectedBudget(null);
        } catch (error) {
            console.error('Failed to delete budget:', error);
            Alert.alert('Error', 'Failed to delete budget');
        }
    };

    const handleMarkAsDone = async (budget: Budget) => {
        if (budget.currentAmount !== budget.targetAmount) {
            setError({
                title: 'Cannot Complete Budget',
                message: `Current amount (₱${budget.currentAmount.toFixed(2)}) must match target amount (₱${budget.targetAmount.toFixed(2)}) to mark as complete.`,
                type: 'error'
            });
            return;
        }

        try {
            const transaction = await transactionManager.create({
                type: 'expense',
                category: budget.category,
                amount: budget.targetAmount,
                date: new Date().toISOString(),
                description: `Budget goal completed: ${budget.title}`,
            });

            const updatedBudget = await budgetManager.update(budget.id, {
                ...budget,
                status: 'completed',
                completedAt: new Date().toISOString(),
            });

            setTransactions(prevTransactions => [...prevTransactions, transaction]);
            setBudgets(budgets.map(b => 
                b.id === updatedBudget.id ? updatedBudget : b
            ));

            DeviceEventEmitter.emit('transactionUpdated', transaction);

            setError({
                title: 'Budget Completed',
                message: 'Budget goal has been marked as completed and recorded as an expense.',
                type: 'success'
            });
        } catch (error) {
            console.error('Failed to mark budget as done:', error);
            setError({
                title: 'Error',
                message: 'Failed to update budget status. Please try again.',
                type: 'error'
            });
        }
    };

    const handleAddBudget = async () => {
        if (!title || !category || !targetAmount || !currentAmount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const numericTargetAmount = parseFloat(targetAmount);
        const numericCurrentAmount = parseFloat(currentAmount);

        if (isNaN(numericTargetAmount) || numericTargetAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid target amount');
            return;
        }

        if (isNaN(numericCurrentAmount) || numericCurrentAmount < 0) {
            Alert.alert('Error', 'Please enter a valid current amount');
            return;
        }

        try {
            const newBudget = await budgetManager.create({
                title,
                category,
                targetAmount: numericTargetAmount,
                currentAmount: numericCurrentAmount,
                targetDate: targetDate.toISOString(),
                note,
                status: 'active',
                priority: 'medium',
            });

            setBudgets([...budgets, newBudget]);
            setIsModalVisible(false);
            resetForm();
        } catch (error) {
            console.error('Failed to add budget:', error);
            Alert.alert('Error', 'Failed to add budget');
        }
    };

    const handleUpdateProgress = async (operation: 'add' | 'subtract') => {
        if (!selectedBudget || !currentAmount) {
            return;
        }

        const numericAmount = parseFloat(currentAmount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError({
                title: 'Invalid Amount',
                message: 'Please enter a valid amount.',
                type: 'error'
            });
            return;
        }

        if (operation === 'add') {
            const remainingAmount = selectedBudget.targetAmount - selectedBudget.currentAmount;
            if (numericAmount > remainingAmount) {
                setError({
                    title: 'Amount Too High',
                    message: `You can only add up to ₱${remainingAmount.toFixed(2)} to reach your target.`,
                    type: 'error'
                });
                return;
            }
        } else {
            if (numericAmount > selectedBudget.currentAmount) {
                setError({
                    title: 'Amount Too High',
                    message: `You can only subtract up to ₱${selectedBudget.currentAmount.toFixed(2)} from your current progress.`,
                    type: 'error'
                });
                return;
            }
        }

        try {
            const newTotal = selectedBudget.currentAmount + (operation === 'add' ? numericAmount : -numericAmount);
            const updatedBudget = await budgetManager.update(selectedBudget.id, {
                ...selectedBudget,
                currentAmount: newTotal,
            });

            setBudgets(budgets.map(b => 
                b.id === updatedBudget.id ? updatedBudget : b
            ));
            setIsUpdateModalVisible(false);
            setCurrentAmount('');
            setSelectedBudget(null);

            setError({
                title: 'Progress Updated',
                message: `Successfully ${operation === 'add' ? 'added' : 'subtracted'} ₱${numericAmount.toFixed(2)} ${operation === 'add' ? 'to' : 'from'} your budget progress.`,
                type: 'success'
            });
        } catch (error) {
            console.error('Failed to update budget:', error);
            setError({
                title: 'Error',
                message: 'Failed to update budget progress. Please try again.',
                type: 'error'
            });
        }
    };

    const resetForm = () => {
        setTitle('');
        setCategory('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate(new Date());
        setNote('');
    };

    const getDaysRemaining = (targetDate: string) => {
        const today = new Date();
        const target = new Date(targetDate);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getProgressColor = (current: number, target: number) => {
        const progress = (current / target) * 100;
        if (progress >= 100) return Theme.colors.success;
        if (progress >= 75) return Theme.colors.warning;
        return Theme.colors.primary;
    };

    const getBudgetAllocation = () => {
        // Calculate total income and expenses
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Get active budgets and calculate remaining amounts
        const activeBudgets = budgets.filter(budget => budget.status === 'active');
        const totalBudgeted = activeBudgets.reduce((sum, budget) => {
            // Calculate remaining amount needed for each budget
            const remaining = budget.targetAmount - budget.currentAmount;
            return sum + (remaining > 0 ? remaining : 0);
        }, 0);

        // Calculate available balance (total balance minus remaining budget amounts)
        const availableBalance = balance - totalBudgeted;
        
        // Calculate allocation percentage based on total budgeted vs balance
        const allocationPercentage = balance > 0 ? Math.min(100, (totalBudgeted / balance) * 100) : 0;

        return {
            totalBudgeted,
            availableBalance,
            allocationPercentage,
            totalBalance: balance
        };
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setTargetDate(date);
        }
    };

    const renderBudget = ({ item }: { item: Budget }) => {
        const daysRemaining = getDaysRemaining(item.targetDate);
        const progress = (item.currentAmount / item.targetAmount) * 100;
        const isCompleted = item.status === 'completed';

        const handleBudgetPress = () => {
            if (!isCompleted && viewMode === 'active') {
                setSelectedBudget(item);
                setIsUpdateModalVisible(true);
            }
        };

        return (
            <TouchableOpacity 
                style={[styles.budgetItem, isCompleted && styles.completedBudget]}
                onPress={handleBudgetPress}
                activeOpacity={viewMode === 'active' && !isCompleted ? 0.7 : 1}
            >
                <View style={styles.budgetHeader}>
                    <View style={styles.budgetTitleSection}>
                        <Text style={styles.budgetTitle}>{item.title}</Text>
                        <Text style={styles.budgetCategory}>{item.category}</Text>
                    </View>
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
                            <Text style={styles.completedText}>Completed</Text>
                        </View>
                    )}
                </View>

                {viewMode === 'history' ? (
                    <View style={styles.historyDetails}>
                        <View style={styles.historySection}>
                            <View style={styles.historyInfo}>
                                <Ionicons name="calendar-outline" size={16} color={Theme.colors.textSecondary} />
                                <Text style={styles.historyLabel}>Completed:</Text>
                                <Text style={styles.historyValue}>
                                    {new Date(item.completedAt!).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.historyInfo}>
                                <Ionicons name="flag-outline" size={16} color={Theme.colors.textSecondary} />
                                <Text style={styles.historyLabel}>Target:</Text>
                                <Text style={styles.historyValue}>₱{item.targetAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                        
                        {item.note && (
                            <View style={styles.historyNoteContainer}>
                                <Ionicons name="document-text-outline" size={16} color={Theme.colors.textSecondary} />
                                <Text style={styles.historyNote}>{item.note}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View 
                                    style={[
                                        styles.progressFill,
                                        { 
                                            width: `${Math.min(progress, 100)}%`,
                                            backgroundColor: getProgressColor(item.currentAmount, item.targetAmount)
                                        }
                                    ]} 
                                />
                            </View>
                            <View style={styles.progressLabels}>
                                <Text style={styles.progressText}>
                                    ₱{item.currentAmount.toFixed(2)}
                                </Text>
                                <Text style={styles.targetText}>
                                    ₱{item.targetAmount.toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.budgetFooter}>
                            <Text style={[
                                styles.daysRemaining,
                                daysRemaining < 0 ? styles.overdue : null
                            ]}>
                                {daysRemaining < 0 
                                    ? 'Overdue'
                                    : daysRemaining === 0 
                                        ? 'Due today'
                                        : `${daysRemaining} days remaining`
                                }
                            </Text>
                            <View style={styles.budgetActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.completeButton]}
                                    onPress={() => handleMarkAsDone(item)}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color={Theme.colors.success} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => {
                                        setSelectedBudget(item);
                                        setShowDeleteConfirm(true);
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {item.note && (
                            <Text style={styles.budgetNote}>{item.note}</Text>
                        )}
                    </>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Budget Goals</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color={Theme.colors.background} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            viewMode === 'active' && styles.tabButtonActive
                        ]}
                        onPress={() => setViewMode('active')}
                    >
                        <Ionicons 
                            name="wallet-outline" 
                            size={20} 
                            color={viewMode === 'active' ? Theme.colors.primary : Theme.colors.textSecondary} 
                        />
                        <Text style={[
                            styles.tabText,
                            viewMode === 'active' && styles.tabTextActive
                        ]}>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            viewMode === 'history' && styles.tabButtonActive
                        ]}
                        onPress={() => setViewMode('history')}
                    >
                        <Ionicons 
                            name="time-outline" 
                            size={20} 
                            color={viewMode === 'history' ? Theme.colors.primary : Theme.colors.textSecondary} 
                        />
                        <Text style={[
                            styles.tabText,
                            viewMode === 'history' && styles.tabTextActive
                        ]}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {viewMode === 'active' && (
                <View style={styles.balanceOverview}>
                    {(() => {
                        const { totalBudgeted, availableBalance, allocationPercentage, totalBalance } = getBudgetAllocation();
                        return (
                            <>
                                <View style={styles.balanceRow}>
                                    <View style={styles.balanceColumn}>
                                        <Text style={styles.balanceLabel}>Total Balance</Text>
                                        <Text style={styles.balanceAmount}>₱{totalBalance.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.balanceColumn}>
                                        <Text style={styles.balanceLabel}>Available</Text>
                                        <Text style={[styles.balanceAmount, styles.availableAmount]}>
                                            ₱{availableBalance.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.balanceColumn}>
                                        <Text style={styles.balanceLabel}>Budgeted</Text>
                                        <Text style={[styles.balanceAmount, styles.budgetedAmount]}>
                                            ₱{totalBudgeted.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.allocationBar}>
                                    <View style={[styles.allocationFill, { width: `${allocationPercentage}%` }]} />
                                </View>
                            </>
                        );
                    })()}
                </View>
            )}

            <FlatList
                data={budgets.filter(b => viewMode === 'active' ? b.status === 'active' : b.status === 'completed')
                    .sort((a, b) => {
                        if (viewMode === 'history') {
                            return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
                        }
                        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
                    })}
                renderItem={renderBudget}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.budgetList}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons 
                            name={viewMode === 'active' ? "wallet-outline" : "time-outline"} 
                            size={64} 
                            color={Theme.colors.textSecondary} 
                        />
                        <Text style={styles.emptyText}>
                            {viewMode === 'active' 
                                ? 'No active budget goals' 
                                : 'No completed budgets yet'
                            }
                        </Text>
                        <Text style={styles.emptySubText}>
                            {viewMode === 'active'
                                ? 'Start by adding your first goal'
                                : 'Complete some budget goals to see them here'
                            }
                        </Text>
                    </View>
                )}
            />

            <ErrorModal
                visible={!!error}
                onClose={() => setError(null)}
                error={error}
            />

            <AddBudgetModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title={title}
                category={category}
                targetAmount={targetAmount}
                currentAmount={currentAmount}
                note={note}
                targetDate={targetDate}
                showDatePicker={showDatePicker}
                onTitleChange={setTitle}
                onShowCategoryPicker={() => setShowCategoryPicker(true)}
                onTargetAmountChange={setTargetAmount}
                onCurrentAmountChange={setCurrentAmount}
                onNoteChange={setNote}
                onDateChange={handleDateChange}
                onShowDatePicker={() => setShowDatePicker(true)}
                onSubmit={handleAddBudget}
            />

            <UpdateBudgetModal
                visible={isUpdateModalVisible}
                onClose={() => setIsUpdateModalVisible(false)}
                budget={selectedBudget}
                currentAmount={currentAmount}
                onCurrentAmountChange={setCurrentAmount}
                onUpdateProgress={handleUpdateProgress}
            />

            <CategoryPickerModal
                visible={showCategoryPicker}
                onClose={() => setShowCategoryPicker(false)}
                categories={categories}
                selectedCategory={category}
                onSelectCategory={setCategory}
            />

            <DeleteConfirmModal
                visible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => selectedBudget && handleDeleteBudget(selectedBudget)}
            />
        </SafeAreaView>
    );
} 