import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '../config/firebase';

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.PROJECT_ID}/databases/(default)/documents`;

export class FirestoreService {
    // Get the current user's ID token for authentication
    static async getUserToken() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.log('No token found in AsyncStorage');
                return null;
            }
            return token;
        } catch (error) {
            console.error('Error getting user token:', error);
            return null;
        }
    }

    // Get the current user's ID
    static async getUserId() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                const userId = user.localId || user.uid;
                if (!userId) {
                    console.log('No user ID found in userData:', user);
                }
                return userId;
            }
            console.log('No userData found in AsyncStorage');
            return null;
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    }

    // Check if user is authenticated
    static async isUserAuthenticated() {
        const token = await this.getUserToken();
        const userId = await this.getUserId();
        const isAuthenticated = !!(token && userId);
        
        if (!isAuthenticated) {
            console.log('User authentication check failed:', { hasToken: !!token, hasUserId: !!userId });
        }
        
        return isAuthenticated;
    }

    // Add a new task to Firestore
    static async addTask(taskData) {
        try {
            const isAuthenticated = await this.isUserAuthenticated();
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const token = await this.getUserToken();
            const userId = await this.getUserId();

            // Create the document with user-specific path
            const documentPath = `users/${userId}/tasks`;
            const url = `${FIRESTORE_BASE_URL}/${documentPath}?key=${FIREBASE_CONFIG.API_KEY}`;

            // Prepare the task data in Firestore format
            const firestoreData = {
                fields: {
                    id: { stringValue: taskData.id },
                    title: { stringValue: taskData.title },
                    description: { stringValue: taskData.description || '' },
                    status: { stringValue: taskData.status },
                    priority: { stringValue: taskData.priority },
                    when: { stringValue: taskData.when },
                    createdAt: { timestampValue: new Date().toISOString() },
                    userId: { stringValue: userId }
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(firestoreData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Firestore error:', errorData);
                throw new Error(`Failed to add task: ${response.status}`);
            }

            const result = await response.json();
            console.log('Task added to Firestore:', result);
            return result;

        } catch (error) {
            console.error('Error adding task to Firestore:', error);
            throw error;
        }
    }

    // Get all tasks for the current user
    static async getUserTasks() {
        try {
            const isAuthenticated = await this.isUserAuthenticated();
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const token = await this.getUserToken();
            const userId = await this.getUserId();

            const collectionPath = `users/${userId}/tasks`;
            const url = `${FIRESTORE_BASE_URL}/${collectionPath}?key=${FIREBASE_CONFIG.API_KEY}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // No tasks collection exists yet, return empty array
                    return [];
                }
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }

            const result = await response.json();

            // Convert Firestore format to our app format
            const tasks = [];
            if (result.documents) {
                result.documents.forEach(doc => {
                    const fields = doc.fields;
                    const task = {
                        id: fields.id?.stringValue || '',
                        title: fields.title?.stringValue || '',
                        description: fields.description?.stringValue || '',
                        status: fields.status?.stringValue || 'Not Completed',
                        priority: fields.priority?.stringValue || 'Mid',
                        when: fields.when?.stringValue || 'Today',
                        createdAt: fields.createdAt?.timestampValue || new Date().toISOString()
                    };
                    tasks.push(task);
                });
            }

            return tasks;

        } catch (error) {
            console.error('Error fetching user tasks:', error);
            throw error;
        }
    }

    // Delete a task
    static async deleteTask(taskId) {
        try {
            const isAuthenticated = await this.isUserAuthenticated();
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const userId = await this.getUserId();

            // Get all documents to find the one with matching ID
            const collectionPath = `users/${userId}/tasks`;
            const url = `${FIRESTORE_BASE_URL}/${collectionPath}?key=${FIREBASE_CONFIG.API_KEY}`;

            console.log('Fetching documents to find task:', taskId);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.documents) {
                for (const doc of result.documents) {
                    if (doc.fields.id?.stringValue === taskId) {
                        console.log('Found document to delete:', doc.name);
                        
                        // Extract the document path from the full URL
                        // doc.name format: "projects/PROJECT_ID/databases/(default)/documents/users/USER_ID/tasks/DOC_ID"
                        const pathParts = doc.name.split('/documents/');
                        const documentPath = pathParts[1]; // "users/USER_ID/tasks/DOC_ID"
                        
                        // Construct the delete URL with API key
                        const deleteUrl = `${FIRESTORE_BASE_URL}/${documentPath}?key=${FIREBASE_CONFIG.API_KEY}`;
                        console.log('Delete URL:', deleteUrl);
                        
                        const deleteResponse = await fetch(deleteUrl, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!deleteResponse.ok) {
                            const errorText = await deleteResponse.text();
                            console.error('Delete response error:', errorText);
                            throw new Error(`Failed to delete task: ${deleteResponse.status}`);
                        }

                        console.log('Task deleted from Firestore successfully');
                        return true;
                    }
                }
            }

            throw new Error('Task document not found');

        } catch (error) {
            console.error('Error deleting task from Firestore:', error);
            throw error;
        }
    }

    // Update a task (e.g., change status)
    static async updateTask(taskId, updates) {
        try {
            const isAuthenticated = await this.isUserAuthenticated();
            if (!isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const userId = await this.getUserId();

            // Get all documents to find the one with matching ID
            const collectionPath = `users/${userId}/tasks`;
            const url = `${FIRESTORE_BASE_URL}/${collectionPath}?key=${FIREBASE_CONFIG.API_KEY}`;

            console.log('Fetching documents to find task for update:', taskId);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.documents) {
                for (const doc of result.documents) {
                    if (doc.fields.id?.stringValue === taskId) {
                        console.log('Found document to update:', doc.name);
                        
                        // Extract the document path from the full URL
                        const pathParts = doc.name.split('/documents/');
                        const documentPath = pathParts[1];
                        
                        // Prepare the update data in Firestore format
                        const updateData = {
                            fields: {
                                ...doc.fields, // Keep existing fields
                                ...Object.keys(updates).reduce((acc, key) => {
                                    acc[key] = { stringValue: updates[key] };
                                    return acc;
                                }, {})
                            }
                        };
                        
                        // Construct the update URL with API key
                        const updateUrl = `${FIRESTORE_BASE_URL}/${documentPath}?key=${FIREBASE_CONFIG.API_KEY}`;
                        console.log('Update URL:', updateUrl);
                        
                        const updateResponse = await fetch(updateUrl, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(updateData)
                        });

                        if (!updateResponse.ok) {
                            const errorText = await updateResponse.text();
                            console.error('Update response error:', errorText);
                            throw new Error(`Failed to update task: ${updateResponse.status}`);
                        }

                        console.log('Task updated in Firestore successfully');
                        return true;
                    }
                }
            }

            throw new Error('Task document not found for update');

        } catch (error) {
            console.error('Error updating task in Firestore:', error);
            throw error;
        }
    }
}
