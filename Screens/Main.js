import React, { useRef, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Animated,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FirestoreService } from '../utils/firestore';

// --- Dummy Data ---
// This data mimics the structure shown in the UI.
const tasks = {
    today: [
        { id: '1', title: 'Schedule dentist appointment', status: 'Not Completed', priority: 'Mid' },
        { id: '2', title: 'Prepare Team Meeting', status: 'InProcess', priority: 'High' },
    ],
    tomorrow: [
        { id: '3', title: 'Call Charlotte', status: 'Not Completed', priority: 'Low' },
        { id: '4', title: 'Submit exercise 3.1', status: 'InProcess', priority: 'High' },
        { id: '5', title: 'Prepare A/B Test', status: 'Not Completed', priority: 'Mid' },
    ],
    thisWeek: [
        { id: '6', title: 'Submit exercise 3.2', status: 'Completed', priority: 'Low' },
        { id: '7', title: 'Water plants', status: 'Not Completed', priority: 'Low' },
    ],
};


// --- Reusable Components ---

// Helper function to get status color
const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return { bg: '#D4F0D4', text: '#63A363' };
        case 'InProcess': return { bg: '#FFE4B5', text: '#FF8C42' };
        case 'Not Completed': return { bg: '#FFE3E3', text: '#FF6B6B' };
        default: return { bg: '#F0F0F0', text: '#666' };
    }
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'High': return { bg: '#FFD6D6', text: '#FF6B6B' };
        case 'Mid': return { bg: '#FFDDC4', text: '#FF8C42' };
        case 'Low': return { bg: '#D6E4FF', text: '#6B9DFF' };
        default: return { bg: '#F0F0F0', text: '#666' };
    }
};

// A single task item with swipe-to-delete
const TaskItem = ({ title, description, status, priority, onDelete, onStatusChange, taskId }) => {
    const statusColors = getStatusColor(status);
    const priorityColors = getPriorityColor(priority);

    return (
        <View style={styles.taskItemContainer}>
            <View style={styles.taskItem}>
                <View style={styles.taskDetails}>
                    <View style={styles.taskCircle} />
                    <View style={styles.taskTextContainer}>
                        <Text style={styles.taskTitle}>{title}</Text>
                        {description && description.trim() !== '' && (
                            <Text style={styles.taskDescription}>{description}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.tagsContainer}>
                    <TouchableOpacity
                        style={[styles.tag, styles.clickableTag, { backgroundColor: statusColors.bg }]}
                        onPress={() => onStatusChange(taskId, status)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tagText, { color: statusColors.text }]}>{status}</Text>
                    </TouchableOpacity>
                    <View style={[styles.tag, { backgroundColor: priorityColors.bg }]}>
                        <Text style={[styles.tagText, { color: priorityColors.text }]}>{priority}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                        <Ionicons name="trash" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// A section of tasks (e.g., "Today", "Tomorrow")
const TaskSection = ({ title, tasks, onDeleteTask, onStatusChange }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {tasks.map(task => (
            <TaskItem
                key={task.id}
                taskId={task.id}
                title={task.title}
                description={task.description}
                status={task.status}
                priority={task.priority}
                onDelete={() => onDeleteTask(task.id)}
                onStatusChange={onStatusChange}
            />
        ))}
    </View>
);


// --- Main Screen Component ---
export default function MyTasksScreen({ navigation, route }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [taskData, setTaskData] = useState({
        today: [],
        tomorrow: [],
        thisWeek: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [sortBy, setSortBy] = useState('priority'); // 'priority', 'status', 'default'
    const [filterBy, setFilterBy] = useState('all'); // 'all', 'high', 'mid', 'low', 'completed', 'inprogress', 'notcompleted'

    // Load tasks from Firestore on component mount
    useEffect(() => {
        loadTasksFromFirestore();
    }, []);

    // Reload tasks when screen comes into focus (after login)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Reload tasks when returning to this screen
            loadTasksFromFirestore();
        });

        return unsubscribe;
    }, [navigation]);

    // Handle new task from AddTask screen
    useEffect(() => {
        if (route.params?.newTask) {
            const newTask = route.params.newTask;

            // If task was saved to Firestore, reload all tasks
            if (route.params?.taskSaved) {
                loadTasksFromFirestore();
            } else {
                // Fallback: add to local state for immediate UI update
                setTaskData(prevData => {
                    const newData = { ...prevData };

                    // Determine which section to add the task to based on 'when'
                    let sectionKey;
                    switch (newTask.when) {
                        case 'Today':
                            sectionKey = 'today';
                            break;
                        case 'Tomorrow':
                            sectionKey = 'tomorrow';
                            break;
                        case 'This week':
                            sectionKey = 'thisWeek';
                            break;
                        default:
                            sectionKey = 'today';
                    }

                    // Add the new task to the appropriate section
                    newData[sectionKey] = [...newData[sectionKey], newTask];

                    return newData;
                });
            }

            // Clear the navigation parameter to prevent re-adding the task
            navigation.setParams({ newTask: null, taskSaved: null });
        }
    }, [route.params?.newTask, route.params?.taskSaved, navigation]);

    // Load tasks from Firestore
    const loadTasksFromFirestore = async () => {
        try {
            setIsLoading(true);

            // Add a small delay to ensure authentication data is loaded
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if user is authenticated before proceeding
            const isAuthenticated = await FirestoreService.isUserAuthenticated();
            if (!isAuthenticated) {
                console.log('User not authenticated, skipping Firestore load');
                setTaskData({ today: [], tomorrow: [], thisWeek: [] });
                return;
            }

            const firestoreTasks = await FirestoreService.getUserTasks();

            // Organize tasks by 'when' category
            const organizedTasks = {
                today: [],
                tomorrow: [],
                thisWeek: []
            };

            firestoreTasks.forEach(task => {
                switch (task.when) {
                    case 'Today':
                        organizedTasks.today.push(task);
                        break;
                    case 'Tomorrow':
                        organizedTasks.tomorrow.push(task);
                        break;
                    case 'This week':
                        organizedTasks.thisWeek.push(task);
                        break;
                    default:
                        organizedTasks.today.push(task);
                }
            });

            setTaskData(organizedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            Alert.alert(
                'Error',
                'Failed to load tasks. Please check your internet connection.',
                [
                    {
                        text: 'Retry',
                        onPress: () => loadTasksFromFirestore()
                    },
                    {
                        text: 'OK',
                        style: 'cancel'
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle task deletion
    const handleDeleteTask = async (taskId) => {
        try {
            // Show confirmation dialog
            Alert.alert(
                'Delete Task',
                'Are you sure you want to delete this task?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                // Delete from Firestore
                                await FirestoreService.deleteTask(taskId);

                                // Reload tasks from Firestore to update UI
                                await loadTasksFromFirestore();

                                Alert.alert('Success', 'Task deleted successfully!');
                            } catch (error) {
                                console.error('Error deleting task:', error);
                                Alert.alert(
                                    'Error',
                                    'Failed to delete task. Please try again.',
                                    [
                                        {
                                            text: 'Retry',
                                            onPress: () => handleDeleteTask(taskId)
                                        },
                                        {
                                            text: 'OK',
                                            style: 'cancel'
                                        }
                                    ]
                                );
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error in handleDeleteTask:', error);
        }
    };

    // Function to handle status change - show modal
    const handleStatusChange = (taskId, currentStatus) => {
        setSelectedTask({ id: taskId, currentStatus });
        setStatusModalVisible(true);
    };

    // Function to update status from modal selection
    const updateTaskStatus = async (newStatus) => {
        try {
            if (!selectedTask) return;

            console.log(`Changing status from ${selectedTask.currentStatus} to ${newStatus}`);

            // Update task status in Firestore
            await FirestoreService.updateTask(selectedTask.id, { status: newStatus });
            console.log('Task status updated successfully');

            // Close modal and reload tasks
            setStatusModalVisible(false);
            setSelectedTask(null);
            await loadTasksFromFirestore();
        } catch (error) {
            console.error('Error updating task status:', error);
            Alert.alert('Error', 'Failed to update task status. Please try again.');
            setStatusModalVisible(false);
            setSelectedTask(null);
        }
    };

    // Animate the header to shrink on scroll
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [180, 100],
        extrapolate: 'clamp',
    });

    // Helper function to sort tasks by priority
    const sortTasksByPriority = (tasks) => {
        const priorityOrder = { 'High': 1, 'Mid': 2, 'Low': 3 };
        return [...tasks].sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    };

    // Helper function to sort tasks by status
    const sortTasksByStatus = (tasks) => {
        const statusOrder = { 'In Progress': 1, 'Not Completed': 2, 'Completed': 3 };
        return [...tasks].sort((a, b) => {
            return statusOrder[a.status] - statusOrder[b.status];
        });
    };

    // Helper function to filter tasks
    const filterTasks = (tasks, filter) => {
        if (filter === 'all') return tasks;

        switch (filter) {
            case 'high':
                return tasks.filter(task => task.priority === 'High');
            case 'mid':
                return tasks.filter(task => task.priority === 'Mid');
            case 'low':
                return tasks.filter(task => task.priority === 'Low');
            case 'completed':
                return tasks.filter(task => task.status === 'Completed');
            case 'inprogress':
                return tasks.filter(task => task.status === 'In Progress');
            case 'notcompleted':
                return tasks.filter(task => task.status === 'Not Completed');
            default:
                return tasks;
        }
    };

    // Function to process tasks with sorting and filtering
    const processTasksForDisplay = (tasks) => {
        let processedTasks = { ...tasks };

        // Apply filtering and sorting to each category
        Object.keys(processedTasks).forEach(category => {
            let categoryTasks = processedTasks[category];

            // Apply filter
            categoryTasks = filterTasks(categoryTasks, filterBy);

            // Apply sorting
            if (sortBy === 'priority') {
                categoryTasks = sortTasksByPriority(categoryTasks);
            } else if (sortBy === 'status') {
                categoryTasks = sortTasksByStatus(categoryTasks);
            }

            processedTasks[category] = categoryTasks;
        });

        return processedTasks;
    };

    // Status selection modal component
    const StatusSelectionModal = () => {
        const statusOptions = [
            { value: 'Not Completed', color: { bg: '#FFE3E3', text: '#FF6B6B' } },
            { value: 'In Progress', color: { bg: '#FFE4B5', text: '#FF8C42' } },
            { value: 'Completed', color: { bg: '#D4F0D4', text: '#63A363' } }
        ];

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={statusModalVisible}
                onRequestClose={() => {
                    setStatusModalVisible(false);
                    setSelectedTask(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Status</Text>
                        <Text style={styles.modalSubtitle}>Choose a new status for this task</Text>

                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.statusOption,
                                    { backgroundColor: option.color.bg },
                                    selectedTask?.currentStatus === option.value && styles.currentStatusOption
                                ]}
                                onPress={() => updateTaskStatus(option.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.statusOptionText, { color: option.color.text }]}>
                                    {option.value}
                                </Text>
                                {selectedTask?.currentStatus === option.value && (
                                    <Ionicons name="checkmark-circle" size={20} color={option.color.text} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setStatusModalVisible(false);
                                setSelectedTask(null);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#7B61FF" />

            {/* --- Fixed Header --- */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <Text style={styles.headerDate}>Let's Get Things Done!</Text>
                <View style={styles.controlsContainer}>
                    <View style={styles.controlRow}>
                        <Text style={styles.controlLabel}>Sort by:</Text>
                        <TouchableOpacity
                            style={[styles.controlButton, sortBy === 'priority' && styles.activeControl]}
                            onPress={() => setSortBy('priority')}
                        >
                            <Text style={[styles.controlButtonText, sortBy === 'priority' && styles.activeControlText]}>Priority</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, sortBy === 'status' && styles.activeControl]}
                            onPress={() => setSortBy('status')}
                        >
                            <Text style={[styles.controlButtonText, sortBy === 'status' && styles.activeControlText]}>Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, sortBy === 'default' && styles.activeControl]}
                            onPress={() => setSortBy('default')}
                        >
                            <Text style={[styles.controlButtonText, sortBy === 'default' && styles.activeControlText]}>Default</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.controlRow}>
                        <Text style={styles.controlLabel}>Filter:</Text>
                        <TouchableOpacity
                            style={[styles.controlButton, filterBy === 'all' && styles.activeControl]}
                            onPress={() => setFilterBy('all')}
                        >
                            <Text style={[styles.controlButtonText, filterBy === 'all' && styles.activeControlText]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, filterBy === 'high' && styles.activeControl]}
                            onPress={() => setFilterBy('high')}
                        >
                            <Text style={[styles.controlButtonText, filterBy === 'high' && styles.activeControlText]}>High</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, filterBy === 'inprogress' && styles.activeControl]}
                            onPress={() => setFilterBy('inprogress')}
                        >
                            <Text style={[styles.controlButtonText, filterBy === 'inprogress' && styles.activeControlText]}>In Progress</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.controlButton, filterBy === 'completed' && styles.activeControl]}
                            onPress={() => setFilterBy('completed')}
                        >
                            <Text style={[styles.controlButtonText, filterBy === 'completed' && styles.activeControlText]}>Completed</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* --- Task List --- */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingTop: 0 }}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8A71FF" />
                        <Text style={styles.loadingText}>Loading your tasks...</Text>
                    </View>
                ) : (
                    <>
                        {(() => {
                            const processedTasks = processTasksForDisplay(taskData);
                            // Helper: sort tasks by Priority and Status order
                            const sortOrder = (a, b) => {
                                const priorityOrder = { 'High': 1, 'Mid': 2, 'Low': 3 };
                                const statusOrder = { 'In Progress': 1, 'Completed': 2, 'Not Completed': 3 };
                                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                                }
                                return statusOrder[a.status] - statusOrder[b.status];
                            };
                            return (
                                <>
                                    <TaskSection
                                        title="Today"
                                        tasks={[...processedTasks.today].sort(sortOrder)}
                                        onDeleteTask={handleDeleteTask}
                                        onStatusChange={handleStatusChange}
                                    />
                                    <TaskSection
                                        title="Tomorrow"
                                        tasks={[...processedTasks.tomorrow].sort(sortOrder)}
                                        onDeleteTask={handleDeleteTask}
                                        onStatusChange={handleStatusChange}
                                    />
                                    <TaskSection
                                        title="This week"
                                        tasks={[...processedTasks.thisWeek].sort(sortOrder)}
                                        onDeleteTask={handleDeleteTask}
                                        onStatusChange={handleStatusChange}
                                    />
                                    <View style={{ height: 100 }} />
                                </>
                            );
                        })()}
                    </>
                )}
            </ScrollView>

            {/* --- Floating Action Button & Bottom Nav --- */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddTask')}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={styles.bottomNav}>
                    <Ionicons name="home" size={24} color="#8A71FF" />
                    <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
                        <Ionicons name="settings" size={24} color="#C4C4C4" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Selection Modal */}
            <StatusSelectionModal />
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        backgroundColor: '#8A71FF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 25 : 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: 'space-between',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 16,
    },
    controlsContainer: {
        marginVertical: 10,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    controlLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 8,
        minWidth: 50,
    },
    controlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 6,
        marginBottom: 4,
    },
    activeControl: {
        backgroundColor: '#fff',
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    activeControlText: {
        color: '#8A71FF',
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: 12,
    },
    menuDot: {
        width: 4,
        height: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        marginHorizontal: 1.5,
    },
    headerBottomRow: {
        paddingBottom: 20,
    },
    headerDate: {
        color: '#D9D2FF',
        fontSize: 14,
        fontWeight: '500',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        minHeight: 300,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8A71FF',
        fontWeight: '500',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343A40',
        marginBottom: 15,
    },
    taskItemContainer: {
        marginBottom: 10,
    },
    taskItem: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        minHeight: 70,
    },
    fadedTask: {
        opacity: 0.5,
    },
    taskDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    taskCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#8A71FF',
        marginRight: 15,
        shadowColor: '#8A71FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    taskTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#495057',
        flexWrap: 'wrap',
    },
    taskDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        flexWrap: 'wrap',
        lineHeight: 18,
    },
    tagsContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 120,
    },
    tag: {
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginBottom: 4,
        alignSelf: 'flex-end',
        maxWidth: 100,
    },
    clickableTag: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        padding: 6,
        marginTop: 4,
        alignSelf: 'flex-end',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#7B61FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
    fabIcon: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '300',
    },
    bottomNav: {
        height: 70,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    statusOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    currentStatusOption: {
        borderWidth: 2,
        borderColor: '#8A71FF',
    },
    statusOptionText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },

});
