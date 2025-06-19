import { Theme } from '@/constants/Theme';
import { styles } from '@/css/financial.styles';
import { FileSystemManager } from '@/utils/fileSystemManager';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    DeviceEventEmitter,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Transaction extends BaseEntity {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
}

interface BaseEntity {
    id: string;
    createdAt: number;
    updatedAt?: number;
}

interface Category extends BaseEntity {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
}

interface Budget extends BaseEntity {
    title: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'high' | 'medium' | 'low';
    note?: string;
    status: 'active' | 'completed' | 'archived';
    completedAt?: string;
}

export default function Financial() {
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('income');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isTransactionDetailsVisible, setIsTransactionDetailsVisible] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'transactions' | 'budget' | 'insights'>('overview');
    const [scrollY] = useState(new Animated.Value(0));
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<'income' | 'expense' | null>(null);
    const [isDayTransactionsVisible, setIsDayTransactionsVisible] = useState(false);
    const [selectedDayTransactions, setSelectedDayTransactions] = useState<Transaction[]>([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    const transactionManager = new FileSystemManager<Transaction>('transactions.json');
    const categoryManager = new FileSystemManager<Category>('categories.json');
    const budgetManager = new FileSystemManager<Budget>('budgets.json');
    const router = useRouter();

    useEffect(() => {
        initializeAndLoadTransactions();
        initializeAndLoadCategories();
        initializeAndLoadBudgets();

        // Add listener for transaction updates
        const transactionSubscription = DeviceEventEmitter.addListener(
            'transactionUpdated',
            (newTransaction: Transaction) => {
                setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
            }
        );

        // Cleanup subscription
        return () => {
            transactionSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (isTypePickerVisible) {
            setSelectedType(null);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 0.95,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isTypePickerVisible]);

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

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const getBudgetAllocation = () => {
        const activeBudgets = budgets.filter(budget => {
            const targetDate = new Date(budget.targetDate);
            const today = new Date();
            return targetDate >= today && budget.currentAmount < budget.targetAmount;
        });

        const totalBudgeted = activeBudgets.reduce((sum, budget) => 
            sum + (budget.targetAmount - budget.currentAmount), 0);

        const availableBalance = balance - totalBudgeted;
        const allocationPercentage = Math.min(100, (totalBudgeted / balance) * 100);

        return {
            totalBudgeted,
            availableBalance,
            allocationPercentage,
            hasBudgets: activeBudgets.length > 0
        };
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleAddTransaction = async () => {
        if (!amount || !category || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            const newTransaction = await transactionManager.create({
                type: modalType,
                category,
                amount: numericAmount,
                date: selectedDate.toISOString(),
                description,
            });

            setTransactions([...transactions, newTransaction]);
            setIsModalVisible(false);
            resetForm();
        } catch (error) {
            console.error('Failed to add transaction:', error);
            Alert.alert('Error', 'Failed to add transaction');
        }
    };

    const resetForm = () => {
        setAmount('');
        setCategory('');
        setDescription('');
        setSelectedDate(new Date());
    };

    const openModal = (type: 'income' | 'expense') => {
        setModalType(type);
        setIsModalVisible(true);
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        try {
            const category = await categoryManager.create({
                name: newCategory.trim(),
                type: categoryType,
            });
            setCategories([...categories, category]);
            setNewCategory('');
        } catch (error) {
            console.error('Failed to add category:', error);
            Alert.alert('Error', 'Failed to add category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category? This will not affect existing transactions.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await categoryManager.delete(categoryId);
                            setCategories(categories.filter(c => c.id !== categoryId));
                        } catch (error) {
                            console.error('Failed to delete category:', error);
                            Alert.alert('Error', 'Failed to delete category');
                        }
                    },
                },
            ]
        );
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={styles.transactionItem}
            onPress={() => {
                setSelectedTransaction(item);
                setIsTransactionDetailsVisible(true);
            }}
        >
            <View style={styles.transactionIcon}>
                <Ionicons
                    name={item.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                    size={24}
                    color={item.type === 'income' ? Theme.colors.success : Theme.colors.error}
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{item.category}</Text>
                <Text style={styles.transactionDate}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text
                style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeText : styles.expenseText
                ]}
            >
                {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
            </Text>
        </TouchableOpacity>
    );

    const EmptyTransactionList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Start adding your income and expenses</Text>
        </View>
    );

    const filteredCategories = categories.filter(c => c.type === modalType);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Financial Overview</Text>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setIsSettingsVisible(true)}
                >
                    <Ionicons name="settings-outline" size={24} color={Theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDebitCard = () => {
        const { hasBudgets } = getBudgetAllocation();

        return (
            <View style={styles.debitCardContainer}>
                <View style={styles.debitCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardChip} />
                        <Ionicons name="wifi-outline" size={24} color={Theme.colors.surface} />
                    </View>
                    <Text style={styles.cardBalance}>₱{balance.toFixed(2)}</Text>
                    <View style={styles.cardDetails}>
                        <View>
                            <Text style={styles.cardLabel}>TOTAL BALANCE</Text>
                            <Text style={styles.cardSubtext}>
                                {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.cardLogo}>
                            <Ionicons name="card" size={32} color={Theme.colors.surface} />
                        </View>
                    </View>
                </View>
                <View style={styles.balanceDetails}>
                    <View style={styles.balanceItem}>
                        <View style={[styles.balanceIcon, styles.incomeIcon]}>
                            <Ionicons name="arrow-down" size={20} color={Theme.colors.success} />
                        </View>
                        <View>
                            <Text style={styles.balanceLabel}>Income</Text>
                            <Text style={[styles.balanceAmount, styles.incomeText]}>
                                ₱{totalIncome.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.balanceItem}>
                        <View style={[styles.balanceIcon, styles.expenseIcon]}>
                            <Ionicons name="arrow-up" size={20} color={Theme.colors.error} />
                        </View>
                        <View>
                            <Text style={styles.balanceLabel}>Expenses</Text>
                            <Text style={[styles.balanceAmount, styles.expenseText]}>
                                ₱{totalExpenses.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>
                {!hasBudgets && balance > 0 && (
                    <TouchableOpacity 
                        style={styles.createBudgetPrompt}
                        onPress={() => router.push('/(features)/budget')}
                    >
                        <Text style={styles.createBudgetText}>
                            Start budgeting your ₱{balance.toFixed(2)}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={Theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const getTransactionsForDate = (date: Date) => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return (
                transactionDate.getDate() === date.getDate() &&
                transactionDate.getMonth() === date.getMonth() &&
                transactionDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleDayPress = (date: Date) => {
        const dayTransactions = getTransactionsForDate(date);
        setSelectedDate(date);
        setSelectedDayTransactions(dayTransactions);
        setIsDayTransactionsVisible(true);
    };

    const renderDayTransactionsModal = () => (
        <Modal
            visible={isDayTransactionsVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsDayTransactionsVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, styles.cloudModal]}>
                    <View style={styles.cloudPointer} />
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {selectedDate.toLocaleDateString('default', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setIsDayTransactionsVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dayTransactionsSummary}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Income</Text>
                            <Text style={[styles.summaryAmount, styles.incomeText]}>
                                +₱{selectedDayTransactions
                                    .filter(t => t.type === 'income')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Expenses</Text>
                            <Text style={[styles.summaryAmount, styles.expenseText]}>
                                -₱{selectedDayTransactions
                                    .filter(t => t.type === 'expense')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        data={selectedDayTransactions.sort((a, b) => b.createdAt - a.createdAt)}
                        renderItem={renderTransaction}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyDayContainer}>
                                <Ionicons name="calendar-outline" size={48} color={Theme.colors.textSecondary} />
                                <Text style={styles.emptyDayText}>No transactions on this day</Text>
                            </View>
                        )}
                        contentContainerStyle={styles.dayTransactionsList}
                    />

                    <TouchableOpacity
                        style={[styles.addButton, { marginTop: 10 }]}
                        onPress={() => {
                            setIsDayTransactionsVisible(false);
                            setIsTypePickerVisible(true);
                        }}
                    >
                        <Text style={styles.addButtonText}>Add Transaction</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderMiniCalendar = () => {
        const days = getDaysInMonth(selectedDate);
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <View style={styles.miniCalendar}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity
                        onPress={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setSelectedDate(newDate);
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.calendarTitle}>
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setSelectedDate(newDate);
                        }}
                    >
                        <Ionicons name="chevron-forward" size={24} color={Theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDays}>
                    {weekDays.map((day) => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                <View style={styles.calendarDays}>
                    {days.map((date, index) => {
                        if (!date) {
                            return <View key={`empty-${index}`} style={styles.calendarDay} />;
                        }

                        const dayTransactions = getTransactionsForDate(date);
                        const hasIncome = dayTransactions.some(t => t.type === 'income');
                        const hasExpense = dayTransactions.some(t => t.type === 'expense');

                        return (
                            <TouchableOpacity
                                key={date.getTime()}
                                style={[
                                    styles.calendarDay,
                                    date.getTime() === selectedDate.getTime() && styles.selectedDay
                                ]}
                                onPress={() => handleDayPress(date)}
                            >
                                <Text style={[
                                    styles.calendarDayText,
                                    date.getTime() === selectedDate.getTime() && styles.selectedDayText
                                ]}>
                                    {date.getDate()}
                                </Text>
                                {(hasIncome || hasExpense) && (
                                    <View style={styles.transactionDots}>
                                        {hasIncome && (
                                            <View style={[styles.transactionDot, { backgroundColor: Theme.colors.success }]} />
                                        )}
                                        {hasExpense && (
                                            <View style={[styles.transactionDot, { backgroundColor: Theme.colors.error }]} />
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderBudgetSection = () => {
        // Sort budgets by priority and date, but only show active budgets
        const sortedBudgets = budgets
            .filter(budget => budget.status === 'active') // Only show active budgets
            .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                if (a.priority !== b.priority) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
            })
            .slice(0, 2); // Show only top 2 priority budgets

        const getDaysRemaining = (targetDate: string) => {
            const today = new Date();
            const target = new Date(targetDate);
            const diffTime = target.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        };

        return (
            <View style={styles.budgetSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Priority Goals</Text>
                    <TouchableOpacity 
                        style={styles.viewAllButton}
                        onPress={() => router.push('/(features)/budget')}
                    >
                        <Text style={styles.viewAllText}>See All</Text>
                        <Ionicons name="chevron-forward" size={16} color={Theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.budgetCards}>
                    {sortedBudgets.map((budget) => {
                        const progress = (budget.currentAmount / budget.targetAmount) * 100;
                        const daysRemaining = getDaysRemaining(budget.targetDate);

                        return (
                            <View key={budget.id} style={styles.budgetCard}>
                                <View style={styles.budgetCardHeader}>
                                    <View style={styles.budgetTitleSection}>
                                        <View style={[
                                            styles.priorityIndicator,
                                            { 
                                                backgroundColor: 
                                                    budget.priority === 'high' ? Theme.colors.error + '20' :
                                                    budget.priority === 'medium' ? Theme.colors.warning + '20' :
                                                    Theme.colors.success + '20'
                                            }
                                        ]}>
                                            <Ionicons 
                                                name={
                                                    budget.priority === 'high' ? 'alert-circle' :
                                                    budget.priority === 'medium' ? 'time' : 'checkmark-circle'
                                                }
                                                size={20}
                                                color={
                                                    budget.priority === 'high' ? Theme.colors.error :
                                                    budget.priority === 'medium' ? Theme.colors.warning :
                                                    Theme.colors.success
                                                }
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.budgetTitle}>{budget.title}</Text>
                                            <Text style={styles.budgetCategory}>{budget.category}</Text>
                                        </View>
                                    </View>
                                    <Text style={[
                                        styles.daysRemaining,
                                        daysRemaining < 0 ? styles.overdue :
                                        daysRemaining <= 7 ? styles.urgent : null
                                    ]}>
                                        {daysRemaining < 0 
                                            ? 'Overdue'
                                            : daysRemaining === 0 
                                                ? 'Due today'
                                                : `${daysRemaining}d left`
                                        }
                                    </Text>
                                </View>

                                <View style={styles.budgetProgress}>
                                    <View style={styles.progressInfo}>
                                        <Text style={styles.progressAmount}>
                                            ₱{budget.currentAmount.toFixed(0)} / ₱{budget.targetAmount.toFixed(0)}
                                        </Text>
                                        <Text style={[
                                            styles.percentageText,
                                            progress >= 100 ? styles.completed : null
                                        ]}>
                                            {progress.toFixed(0)}%
                                        </Text>
                                    </View>
                                    <View style={styles.progressBarContainer}>
                                        <View style={[
                                            styles.progressBar,
                                            { 
                                                width: `${Math.min(progress, 100)}%`,
                                                backgroundColor: progress >= 100 ? 
                                                    Theme.colors.success : Theme.colors.primary
                                            }
                                        ]} />
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {sortedBudgets.length === 0 && (
                        <View style={styles.emptyBudgets}>
                            <Text style={styles.emptyBudgetsText}>No active budget goals</Text>
                            <TouchableOpacity 
                                style={styles.addBudgetButton}
                                onPress={() => router.push('/(features)/budget')}
                            >
                                <Text style={styles.addBudgetText}>Create a Goal</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const handleTypeSelect = (type: 'income' | 'expense') => {
        setSelectedType(type);
        // Add a small delay before closing the picker and opening the transaction modal
        setTimeout(() => {
            setIsTypePickerVisible(false);
            setModalType(type);
            setIsModalVisible(true);
        }, 150);
    };

    const renderTransactionTypePicker = () => (
        <Modal
            visible={isTypePickerVisible}
            transparent
            animationType="none"
            onRequestClose={() => setIsTypePickerVisible(false)}
        >
            <Animated.View 
                style={[
                    styles.modalOverlay,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableOpacity
                    style={styles.modalOverlayTouch}
                    activeOpacity={1}
                    onPress={() => setIsTypePickerVisible(false)}
                >
                    <Animated.View 
                        style={[
                            styles.modalContent,
                            styles.typePickerContent,
                            {
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <TouchableWithoutFeedback>
                            <View>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Add Transaction</Text>
                                    <TouchableOpacity
                                        onPress={() => setIsTypePickerVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        styles.incomeOption,
                                        selectedType === 'income' && styles.selectedTypeOption
                                    ]}
                                    onPress={() => handleTypeSelect('income')}
                                    activeOpacity={0.7}
                                >
                                    <Animated.View style={[
                                        styles.typeIconContainer,
                                        selectedType === 'income' && styles.selectedTypeIconContainer
                                    ]}>
                                        <Ionicons 
                                            name="arrow-down-circle" 
                                            size={24} 
                                            color={Theme.colors.success} 
                                        />
                                    </Animated.View>
                                    <View style={styles.typeTextContainer}>
                                        <Text style={[
                                            styles.typeTitle,
                                            selectedType === 'income' && styles.selectedTypeTitle
                                        ]}>Add Income</Text>
                                        <Text style={[
                                            styles.typeDescription,
                                            selectedType === 'income' && styles.selectedTypeDescription
                                        ]}>Record money coming in</Text>
                                    </View>
                                    <Ionicons 
                                        name="chevron-forward" 
                                        size={24} 
                                        color={Theme.colors.success}
                                        style={styles.typeArrow}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        styles.expenseOption,
                                        selectedType === 'expense' && styles.selectedTypeOption
                                    ]}
                                    onPress={() => handleTypeSelect('expense')}
                                    activeOpacity={0.7}
                                >
                                    <Animated.View style={[
                                        styles.typeIconContainer,
                                        selectedType === 'expense' && styles.selectedTypeIconContainer
                                    ]}>
                                        <Ionicons 
                                            name="arrow-up-circle" 
                                            size={24} 
                                            color={Theme.colors.error} 
                                        />
                                    </Animated.View>
                                    <View style={styles.typeTextContainer}>
                                        <Text style={[
                                            styles.typeTitle,
                                            selectedType === 'expense' && styles.selectedTypeTitle
                                        ]}>Add Expense</Text>
                                        <Text style={[
                                            styles.typeDescription,
                                            selectedType === 'expense' && styles.selectedTypeDescription
                                        ]}>Record money going out</Text>
                                    </View>
                                    <Ionicons 
                                        name="chevron-forward" 
                                        size={24} 
                                        color={Theme.colors.error}
                                        style={styles.typeArrow}
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            
            <ScrollView style={styles.scrollView}>
                {renderDebitCard()}
                {renderMiniCalendar()}
                {renderBudgetSection()}
                {renderDayTransactionsModal()}

                <View style={styles.recentActivity}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity 
                            style={styles.viewAllButton}
                            onPress={() => router.push('/(features)/transactions')}
                        >
                            <Text style={styles.viewAllText}>See More</Text>
                            <Ionicons name="chevron-forward" size={16} color={Theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={[...transactions]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 3)}
                        renderItem={renderTransaction}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ListEmptyComponent={EmptyTransactionList}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsTypePickerVisible(true)}
            >
                <Ionicons name="add" size={24} color={Theme.colors.surface} />
            </TouchableOpacity>

            {renderTransactionTypePicker()}
            
            {/* Add Transaction Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Add {modalType === 'income' ? 'Income' : 'Expense'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            placeholderTextColor={Theme.colors.textSecondary}
                        />

                        <TouchableOpacity
                            style={[styles.input, styles.categorySelector]}
                            onPress={() => setShowCategoryPicker(true)}
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
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            placeholderTextColor={Theme.colors.textSecondary}
                        />

                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={Theme.colors.textSecondary} />
                            <Text style={styles.datePickerButtonText}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                { backgroundColor: modalType === 'income' ? Theme.colors.success : Theme.colors.error }
                            ]}
                            onPress={handleAddTransaction}
                        >
                            <Text style={styles.addButtonText}>Add {modalType === 'income' ? 'Income' : 'Expense'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Transaction Details Modal */}
            <Modal
                visible={isTransactionDetailsVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsTransactionDetailsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Transaction Details</Text>
                            <TouchableOpacity
                                onPress={() => setIsTransactionDetailsVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedTransaction && (
                            <View style={styles.transactionDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Type</Text>
                                    <View style={styles.typeContainer}>
                                        <Ionicons
                                            name={selectedTransaction.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                                            size={20}
                                            color={selectedTransaction.type === 'income' ? Theme.colors.success : Theme.colors.error}
                                            style={styles.typeIcon}
                                        />
                                        <Text style={[
                                            styles.typeText,
                                            selectedTransaction.type === 'income' ? styles.incomeText : styles.expenseText
                                        ]}>
                                            {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Amount</Text>
                                    <Text style={[
                                        styles.detailValue,
                                        selectedTransaction.type === 'income' ? styles.incomeText : styles.expenseText
                                    ]}>
                                        {selectedTransaction.type === 'income' ? '+' : '-'}₱{selectedTransaction.amount.toFixed(2)}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Category</Text>
                                    <Text style={styles.detailValue}>{selectedTransaction.category}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(selectedTransaction.date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.descriptionContainer}>
                                    <Text style={styles.detailLabel}>Description</Text>
                                    <Text style={styles.descriptionText}>
                                        {selectedTransaction.description}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Category Picker Modal */}
            <Modal
                visible={showCategoryPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryPicker(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {filteredCategories.length === 0 ? (
                            <View style={styles.noCategoriesContainer}>
                                <Text style={styles.noCategoriesText}>
                                    No categories available for {modalType}s
                                </Text>
                                <TouchableOpacity
                                    style={styles.addCategoryFromPickerButton}
                                    onPress={() => {
                                        setShowCategoryPicker(false);
                                        setIsSettingsVisible(true);
                                        setCategoryType(modalType);
                                    }}
                                >
                                    <Text style={styles.addCategoryFromPickerText}>
                                        Add Categories in Settings
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredCategories}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.categoryPickerItem}
                                        onPress={() => {
                                            setCategory(item.name);
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.categoryPickerText,
                                            category === item.name && styles.categoryPickerTextSelected
                                        ]}>
                                            {item.name}
                                        </Text>
                                        {category === item.name && (
                                            <Ionicons 
                                                name="checkmark" 
                                                size={24} 
                                                color={Theme.colors.primary} 
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Settings Modal */}
            <Modal
                visible={isSettingsVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsSettingsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Financial Settings</Text>
                            <TouchableOpacity
                                onPress={() => setIsSettingsVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionTitle}>Categories</Text>
                            
                            <View style={styles.categoryTypeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryTypeButton,
                                        categoryType === 'expense' && styles.categoryTypeButtonActive
                                    ]}
                                    onPress={() => setCategoryType('expense')}
                                >
                                    <Text style={[
                                        styles.categoryTypeText,
                                        categoryType === 'expense' && styles.categoryTypeTextActive
                                    ]}>Expense</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.categoryTypeButton,
                                        categoryType === 'income' && styles.categoryTypeButtonActive
                                    ]}
                                    onPress={() => setCategoryType('income')}
                                >
                                    <Text style={[
                                        styles.categoryTypeText,
                                        categoryType === 'income' && styles.categoryTypeTextActive
                                    ]}>Income</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.addCategoryContainer}>
                                <TextInput
                                    style={styles.categoryInput}
                                    placeholder="New category name"
                                    value={newCategory}
                                    onChangeText={setNewCategory}
                                    placeholderTextColor={Theme.colors.textSecondary}
                                />
                                <TouchableOpacity
                                    style={styles.addCategoryButton}
                                    onPress={handleAddCategory}
                                >
                                    <Ionicons name="add" size={24} color={Theme.colors.background} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={categories.filter(c => c.type === categoryType)}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.categoryItem}>
                                        <Text style={styles.categoryName}>{item.name}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteCategory(item.id)}
                                            style={styles.deleteCategoryButton}
                                        >
                                            <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={() => (
                                    <Text style={styles.emptyCategoriesText}>
                                        No {categoryType} categories yet
                                    </Text>
                                )}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}