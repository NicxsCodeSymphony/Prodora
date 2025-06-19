import { Theme } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    calendar: {
        marginVertical: Theme.spacing.lg,
        marginHorizontal: Theme.spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderTopLeftRadius: Theme.borderRadius.xl,
        borderTopRightRadius: Theme.borderRadius.xl,
        padding: Theme.spacing.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
    },
    modalDate: {
        fontSize: 24,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    closeButton: {
        padding: Theme.spacing.sm,
    },
    dailySummary: {
        marginBottom: Theme.spacing.xl,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Theme.spacing.sm,
    },
    summaryLabel: {
        fontSize: 15,
        color: Theme.colors.textSecondary,
    },
    summaryAmount: {
        fontSize: 17,
        fontWeight: '600',
    },
    transactionList: {
        flex: 1,
    },
    transactionItem: {
        padding: Theme.spacing.lg,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        marginBottom: Theme.spacing.md,
    },
    transactionMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
    },
    transactionDescription: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginTop: Theme.spacing.sm,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    incomeText: {
        color: Theme.colors.success,
    },
    expenseText: {
        color: Theme.colors.error,
    },
    emptyDay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.xl,
    },
    emptyDayText: {
        fontSize: 15,
        color: Theme.colors.textSecondary,
    },
}); 