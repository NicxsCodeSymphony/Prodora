import { Theme } from '@/constants/Theme';
import { styles } from '@/css/transactions.styles';
import { FileSystemManager } from '@/utils/fileSystemManager';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    createdAt: number;
    updatedAt?: number;
}

interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    createdAt: number;
    updatedAt?: number;
}

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

    const transactionManager = new FileSystemManager<Transaction>('transactions.json');
    const categoryManager = new FileSystemManager<Category>('categories.json');
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [transactions, searchQuery, filterType, sortOrder]);

    const loadData = async () => {
        try {
            await transactionManager.initialize();
            await categoryManager.initialize();
            
            const [loadedTransactions, loadedCategories] = await Promise.all([
                transactionManager.getAll(),
                categoryManager.getAll()
            ]);

            setTransactions(loadedTransactions);
            setCategories(loadedCategories);
        } catch (error) {
            console.error('Failed to load data:', error);
            Alert.alert('Error', 'Failed to load data');
        }
    };

    const applyFilters = () => {
        let filtered = [...transactions];

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return b.createdAt - a.createdAt;
                case 'oldest':
                    return a.createdAt - b.createdAt;
                case 'highest':
                    return b.amount - a.amount;
                case 'lowest':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        setFilteredTransactions(filtered);
    };

    const handleEditTransaction = async () => {
        if (!selectedTransaction || !amount || !category || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            const updatedTransaction = await transactionManager.update(selectedTransaction.id, {
                ...selectedTransaction,
                amount: numericAmount,
                category,
                date: selectedDate.toISOString(),
                description,
            });

            setTransactions(transactions.map(t => 
                t.id === updatedTransaction.id ? updatedTransaction : t
            ));
            setIsEditModalVisible(false);
            resetForm();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            Alert.alert('Error', 'Failed to update transaction');
        }
    };

    const resetForm = () => {
        setAmount('');
        setCategory('');
        setDescription('');
        setSelectedDate(new Date());
        setSelectedTransaction(null);
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={styles.transactionItem}
            onPress={() => {
                setSelectedTransaction(item);
                setAmount(item.amount.toString());
                setCategory(item.category);
                setDescription(item.description);
                setSelectedDate(new Date(item.date));
                setIsEditModalVisible(true);
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
                <Text style={styles.transactionDescription}>{item.description}</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={Theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Theme.colors.textSecondary}
                />
            </View>

            <View style={styles.filterBar}>
                <View style={styles.filterButtons}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filterType === 'all' && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterType('all')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filterType === 'all' && styles.filterButtonTextActive
                        ]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filterType === 'income' && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterType('income')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filterType === 'income' && styles.filterButtonTextActive
                        ]}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            filterType === 'expense' && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterType('expense')}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filterType === 'expense' && styles.filterButtonTextActive
                        ]}>Expenses</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => {
                        const orders: typeof sortOrder[] = ['newest', 'oldest', 'highest', 'lowest'];
                        const currentIndex = orders.indexOf(sortOrder);
                        const nextIndex = (currentIndex + 1) % orders.length;
                        setSortOrder(orders[nextIndex]);
                    }}
                >
                    <Ionicons name="funnel-outline" size={20} color={Theme.colors.textPrimary} />
                    <Text style={styles.sortButtonText}>
                        {sortOrder.charAt(0).toUpperCase() + sortOrder.slice(1)}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTransactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.transactionList}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={Theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                        <Text style={styles.emptySubText}>Try adjusting your filters</Text>
                    </View>
                )}
            />

            {/* Edit Transaction Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Transaction</Text>
                            <TouchableOpacity
                                onPress={() => setIsEditModalVisible(false)}
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
                            style={[styles.submitButton, { backgroundColor: Theme.colors.primary }]}
                            onPress={handleEditTransaction}
                        >
                            <Text style={styles.submitButtonText}>Update Transaction</Text>
                        </TouchableOpacity>
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

                        <FlatList
                            data={categories.filter(c => 
                                selectedTransaction ? c.type === selectedTransaction.type : true
                            )}
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
                            ListEmptyComponent={() => (
                                <Text style={styles.noCategoriesText}>
                                    No categories available
                                </Text>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
} 