import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FirestoreService } from '../utils/firestore';

export default function AddTask({ navigation }) {
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Not Completed');
    const [selectedPriority, setSelectedPriority] = useState('Mid');
    const [selectedWhen, setSelectedWhen] = useState('Today');

    const statusOptions = ['Not Completed', 'InProcess', 'Completed'];
    const priorityOptions = ['High', 'Mid', 'Low'];
    const whenOptions = ['Today', 'Tomorrow', 'This week'];

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

    // Helper function to get when color
    const getWhenColor = (when) => {
        switch (when) {
            case 'Today': return { bg: '#E8F5E8', text: '#4CAF50' };
            case 'Tomorrow': return { bg: '#FFF3E0', text: '#FF9800' };
            case 'This week': return { bg: '#E3F2FD', text: '#2196F3' };
            default: return { bg: '#F0F0F0', text: '#666' };
        }
    };

    const handleSaveTask = async () => {
        if (!taskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        try {
            // Show loading state
            Alert.alert('Saving...', 'Please wait while we save your task.');

            // Create new task object
            const newTask = {
                id: Date.now().toString(), // Simple ID generation
                title: taskTitle.trim(),
                description: taskDescription.trim(),
                status: selectedStatus,
                priority: selectedPriority,
                when: selectedWhen
            };

            // Save to Firestore
            await FirestoreService.addTask(newTask);

            // Show success message
            Alert.alert(
                'Success!', 
                'Task saved successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate back with the new task data for immediate UI update
                            navigation.navigate('Main', { newTask, taskSaved: true });
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('Error saving task:', error);
            Alert.alert(
                'Error', 
                'Failed to save task. Please check your internet connection and try again.',
                [
                    {
                        text: 'Retry',
                        onPress: () => handleSaveTask()
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
            );
        }
    };

    const renderOptionButton = (options, selectedValue, onSelect, getColor) => {
        return options.map((option) => {
            const isSelected = selectedValue === option;
            const colors = getColor(option);
            return (
                <TouchableOpacity
                    key={option}
                    style={[
                        styles.optionButton,
                        {
                            backgroundColor: isSelected ? colors.bg : '#F8F9FA',
                            borderColor: isSelected ? colors.text : '#E9ECEF',
                        }
                    ]}
                    onPress={() => onSelect(option)}
                >
                    <Text
                        style={[
                            styles.optionText,
                            { color: isSelected ? colors.text : '#6C757D' }
                        ]}
                    >
                        {option}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#8A71FF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Task</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Task Title */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Task Title</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter task title..."
                        placeholderTextColor="#A0A0A0"
                        value={taskTitle}
                        onChangeText={setTaskTitle}
                        maxLength={100}
                    />
                </View>

                {/* Task Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder="Enter task description..."
                        placeholderTextColor="#A0A0A0"
                        value={taskDescription}
                        onChangeText={setTaskDescription}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                    />
                </View>

                {/* Status Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.optionsContainer}>
                        {renderOptionButton(
                            statusOptions,
                            selectedStatus,
                            setSelectedStatus,
                            getStatusColor
                        )}
                    </View>
                </View>

                {/* Priority Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Priority</Text>
                    <View style={styles.optionsContainer}>
                        {renderOptionButton(
                            priorityOptions,
                            selectedPriority,
                            setSelectedPriority,
                            getPriorityColor
                        )}
                    </View>
                </View>

                {/* When Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>When</Text>
                    <View style={styles.optionsContainer}>
                        {renderOptionButton(
                            whenOptions,
                            selectedWhen,
                            setSelectedWhen,
                            getWhenColor
                        )}
                    </View>
                </View>

                {/* Preview Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preview</Text>
                    <View style={styles.previewCard}>
                        <View style={styles.previewContent}>
                            <View style={styles.previewLeft}>
                                <View style={styles.previewCircle} />
                                <Text style={styles.previewTitle}>
                                    {taskTitle || 'Task title will appear here'}
                                </Text>
                            </View>
                            <View style={styles.previewRight}>
                                <View style={[
                                    styles.previewTag,
                                    { backgroundColor: getStatusColor(selectedStatus).bg }
                                ]}>
                                    <Text style={[
                                        styles.previewTagText,
                                        { color: getStatusColor(selectedStatus).text }
                                    ]}>
                                        {selectedStatus}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.previewTag,
                                    { backgroundColor: getPriorityColor(selectedPriority).bg }
                                ]}>
                                    <Text style={[
                                        styles.previewTagText,
                                        { color: getPriorityColor(selectedPriority).text }
                                    ]}>
                                        {selectedPriority}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.previewTag,
                                    { backgroundColor: getWhenColor(selectedWhen).bg }
                                ]}>
                                    <Text style={[
                                        styles.previewTagText,
                                        { color: getWhenColor(selectedWhen).text }
                                    ]}>
                                        {selectedWhen}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Task</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
    },
    header: {
        backgroundColor: '#8A71FF',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 60,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#343A40',
        marginBottom: 12,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#495057',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        marginRight: 8,
        marginBottom: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    previewCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    previewContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    previewLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    previewCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8A71FF',
        marginRight: 12,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
        flex: 1,
    },
    previewRight: {
        alignItems: 'flex-end',
    },
    previewTag: {
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginBottom: 4,
        maxWidth: 100,
    },
    previewTagText: {
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    saveButton: {
        backgroundColor: '#8A71FF',
        borderRadius: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8A71FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});