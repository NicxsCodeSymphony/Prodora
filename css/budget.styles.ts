import { Theme } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    budgetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    budgetCategory: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    historySection: {
        flexDirection: 'column',
        gap: 12,
    },
    historyDetails: {
        padding: 12,
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        marginTop: 8,
    },
    historyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    historyLabel: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginRight: 4,
    },
    historyValue: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
        fontWeight: '500',
    },
    historyNoteContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    historyNote: {
        flex: 1,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        lineHeight: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    addButton: {
        backgroundColor: Theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    budgetList: {
        padding: Theme.spacing.md,
    },
    budgetItem: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    progressContainer: {
        marginBottom: Theme.spacing.md,
    },
    progressBar: {
        height: 8,
        backgroundColor: Theme.colors.border,
        borderRadius: 4,
        marginBottom: Theme.spacing.sm,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        color: Theme.colors.textPrimary,
    },
    targetText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Theme.spacing.sm,
    },
    daysRemaining: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    overdue: {
        color: Theme.colors.error,
    },
    targetDate: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    budgetNote: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginTop: Theme.spacing.md,
        fontStyle: 'italic',
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
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    closeButton: {
        padding: Theme.spacing.sm,
    },
    input: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    placeholderText: {
        fontSize: 16,
        color: Theme.colors.textSecondary,
    },
    noteInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
        marginLeft: Theme.spacing.md,
    },
    submitButton: {
        padding: Theme.spacing.lg,
        borderRadius: Theme.borderRadius.lg,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.background,
    },
    updateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: Theme.spacing.sm,
    },
    updateTarget: {
        fontSize: 16,
        color: Theme.colors.textSecondary,
        marginBottom: Theme.spacing.lg,
    },
    categoryPickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    categoryPickerText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
    },
    categoryPickerTextSelected: {
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    noCategoriesText: {
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        padding: Theme.spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginTop: Theme.spacing.lg,
    },
    emptySubText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginTop: Theme.spacing.sm,
    },
    balanceOverview: {
        backgroundColor: Theme.colors.surface,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: Theme.colors.textSecondary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceColumn: {
        flex: 1,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    availableAmount: {
        color: Theme.colors.success,
    },
    budgetedAmount: {
        color: Theme.colors.primary,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: Theme.colors.border,
        marginHorizontal: 8,
    },
    allocationBar: {
        height: 4,
        backgroundColor: Theme.colors.border + '40',
        borderRadius: 2,
        overflow: 'hidden',
    },
    allocationFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    viewModeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Theme.colors.surface,
    },
    viewModeButtonActive: {
        backgroundColor: Theme.colors.primary,
    },
    viewModeText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
    },
    viewModeTextActive: {
        color: Theme.colors.surface,
        fontWeight: '600',
    },
    completedBudget: {
        opacity: 0.8,
    },
    budgetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    completedText: {
        fontSize: 12,
        color: Theme.colors.success,
        fontWeight: '500',
    },
    budgetActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    },
    completeButton: {
        backgroundColor: Theme.colors.success + '20',
    },
    deleteButton: {
        backgroundColor: Theme.colors.error + '20',
    },
    deleteConfirmText: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
        textAlign: 'center',
        marginVertical: 16,
    },
    deleteWarningText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    deleteActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Theme.colors.surface,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: Theme.colors.error,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: Theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: Theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    tabBar: {
        paddingHorizontal: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    tabs: {
        flexDirection: 'row',
        gap: 16,
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: Theme.colors.primary,
    },
    tabText: {
        fontSize: 16,
        color: Theme.colors.textSecondary,
    },
    tabTextActive: {
        color: Theme.colors.primary,
        fontWeight: '600',
    },
    budgetTitleSection: {
        flex: 1,
        gap: 4,
    },
    errorTitle: {
        color: Theme.colors.error,
    },
    successTitle: {
        color: Theme.colors.success,
    },
    errorMessage: {
        fontSize: 16,
        color: Theme.colors.textPrimary,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    updateButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
}); 