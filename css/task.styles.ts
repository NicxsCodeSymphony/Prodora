import { Theme } from '@/constants/Theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summary: {
        padding: 20,
        backgroundColor: Theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: Theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: Theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 4,
    },
    prioritySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priorityBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surfaceHighlight,
        borderRadius: 8,
        padding: 8,
        marginHorizontal: 4,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    priorityCount: {
        fontSize: 14,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    taskList: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    taskItem: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completed: {
        backgroundColor: Theme.colors.primary,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Theme.colors.textPrimary,
        marginBottom: 4,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: Theme.colors.textSecondary,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
    },
    filterSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Theme.colors.surfaceHighlight,
    },
    filterButtonActive: {
        backgroundColor: Theme.colors.primary,
    },
    filterButtonText: {
        fontSize: 12,
        color: Theme.colors.textSecondary,
        textTransform: 'capitalize',
    },
    filterButtonTextActive: {
        color: Theme.colors.background,
        fontWeight: '600',
    },
}); 