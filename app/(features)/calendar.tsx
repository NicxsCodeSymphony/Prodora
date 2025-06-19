import { Theme } from '@/constants/Theme';
import { styles } from '@/css/calendar.styles';
import { FileSystemManager } from '@/utils/fileSystemManager';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BaseEntity {
    id: string;
    createdAt: number;
    updatedAt?: number;
}

interface Transaction extends BaseEntity {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
}

interface MarkedDates {
    [date: string]: {
        dots: Array<{
            key: string;
            color: string;
            selectedDotColor: string;
        }>;
    };
}

export default function Calendar() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDayTransactions, setSelectedDayTransactions] = useState<Transaction[]>([]);

    const transactionManager = new FileSystemManager<Transaction>('transactions.json');

    useEffect(() => {
        initializeAndLoadTransactions();
    }, []);

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

    const getMarkedDates = (): MarkedDates => {
        const markedDates: MarkedDates = {};
        
        transactions.forEach(transaction => {
            const date = transaction.date.split('T')[0];
            if (!markedDates[date]) {
                markedDates[date] = {
                    dots: [],
                };
            }
            
            markedDates[date].dots.push({
                key: transaction.type,
                color: transaction.type === 'income' ? Theme.colors.success : Theme.colors.error,
                selectedDotColor: transaction.type === 'income' ? Theme.colors.success : Theme.colors.error,
            });
        });

        return markedDates;
    };

    const handleDayPress = (day: { dateString: string }) => {
        const dayTransactions = transactions.filter(
            t => t.date.split('T')[0] === day.dateString
        );
        setSelectedDate(day.dateString);
        setSelectedDayTransactions(dayTransactions);
        setIsModalVisible(true);
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionMain}>
                <Text style={styles.transactionCategory}>{item.category}</Text>
                <Text style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeText : styles.expenseText
                ]}>
                    {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
                </Text>
            </View>
            {item.description && (
                <Text style={styles.transactionDescription}>{item.description}</Text>
            )}
        </View>
    );

    const renderDailySummary = () => {
        const income = selectedDayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = selectedDayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return (
            <View style={styles.dailySummary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryAmount, styles.incomeText]}>
                        +₱{income.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={[styles.summaryAmount, styles.expenseText]}>
                        -₱{expenses.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Net</Text>
                    <Text style={[styles.summaryAmount, income - expenses >= 0 ? styles.incomeText : styles.expenseText]}>
                        ₱{(income - expenses).toFixed(2)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <RNCalendar
                style={styles.calendar}
                markingType="multi-dot"
                markedDates={getMarkedDates()}
                onDayPress={handleDayPress}
                theme={{
                    backgroundColor: Theme.colors.background,
                    calendarBackground: Theme.colors.background,
                    textSectionTitleColor: Theme.colors.textSecondary,
                    selectedDayBackgroundColor: Theme.colors.primary,
                    selectedDayTextColor: Theme.colors.background,
                    todayTextColor: Theme.colors.primary,
                    dayTextColor: Theme.colors.textPrimary,
                    textDisabledColor: Theme.colors.border,
                    dotColor: Theme.colors.primary,
                    selectedDotColor: Theme.colors.background,
                    arrowColor: Theme.colors.primary,
                    monthTextColor: Theme.colors.textPrimary,
                    textMonthFontWeight: '600',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                }}
            />

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalDate}>
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('default', { 
                                    month: 'long',
                                    day: 'numeric'
                                }) : ''}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedDayTransactions.length > 0 ? (
                            <>
                                {renderDailySummary()}
                                <FlatList
                                    data={selectedDayTransactions.sort((a, b) => 
                                        new Date(b.date).getTime() - new Date(a.date).getTime()
                                    )}
                                    renderItem={renderTransaction}
                                    keyExtractor={item => item.id}
                                    style={styles.transactionList}
                                    showsVerticalScrollIndicator={false}
                                />
                            </>
                        ) : (
                            <View style={styles.emptyDay}>
                                <Text style={styles.emptyDayText}>
                                    No transactions
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
} 