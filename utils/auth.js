import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH_ENDPOINTS } from '../config/firebase';

// Storage keys
const TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';

// Firebase Auth API functions
export const AuthService = {
    // Sign up with email and password
    signUp: async (email, password, displayName = '') => {
        try {
            const response = await fetch(FIREBASE_AUTH_ENDPOINTS.SIGN_UP, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    displayName,
                    returnSecureToken: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Sign up failed');
            }

            // Store token and user data
            await AsyncStorage.setItem(TOKEN_KEY, data.idToken);
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
                uid: data.localId,
                email: data.email,
                displayName: displayName,
                refreshToken: data.refreshToken,
            }));

            return {
                success: true,
                user: {
                    uid: data.localId,
                    email: data.email,
                    displayName: displayName,
                    token: data.idToken,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            const response = await fetch(FIREBASE_AUTH_ENDPOINTS.SIGN_IN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Sign in failed');
            }

            // Store token and user data
            await AsyncStorage.setItem(TOKEN_KEY, data.idToken);
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
                uid: data.localId,
                email: data.email,
                displayName: data.displayName || '',
                refreshToken: data.refreshToken,
            }));

            return {
                success: true,
                user: {
                    uid: data.localId,
                    email: data.email,
                    displayName: data.displayName || '',
                    token: data.idToken,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },

    // Check if user is authenticated
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const userData = await AsyncStorage.getItem(USER_DATA_KEY);
            
            if (token && userData) {
                return {
                    isAuthenticated: true,
                    token,
                    user: JSON.parse(userData),
                };
            }
            
            return { isAuthenticated: false };
        } catch (error) {
            return { isAuthenticated: false };
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get stored token
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            return null;
        }
    },

    // Get stored user data
    getUserData: async () => {
        try {
            const userData = await AsyncStorage.getItem(USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    },
};
