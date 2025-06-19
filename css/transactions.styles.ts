import { Theme } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        height: 40,
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: Theme.colors.textPrimary,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: Theme.colors.surface,
    },
    filterButtonActive: {
        backgroundColor: Theme.colors.primary,
    },
    filterButtonText: {
        color: Theme.colors.textSecondary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: Theme.colors.surface,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: Theme.colors.surface,
    },
    sortButtonText: {
        color: Theme.colors.textPrimary,
        fontWeight: '500',
    },
    transactionList: {
        padding: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: 4,
    },
    transactionDescription: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Theme.colors.background,
        borderRadius: 16,
        padding: 16,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    input: {
        height: 48,
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 12,
        marginBottom: 16,
        color: Theme.colors.textPrimary,
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
    descriptionInput: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        backgroundColor: Theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    datePickerButtonText: {
        flex: 1,
        marginLeft: 8,
        color: Theme.colors.textPrimary,
    },
    submitButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: Theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    categoryPickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
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
        padding: 16,
        textAlign: 'center',
        color: Theme.colors.textSecondary,
    },
}); 