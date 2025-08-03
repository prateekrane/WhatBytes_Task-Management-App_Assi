// Firebase Configuration
// Replace FIREBASE_API_KEY with your actual Firebase API key
export const FIREBASE_CONFIG = {
    API_KEY: 'AIzaSyAdPSm58ZSTwx02E-PgzWr36D9lwb0FZ04', // Replace with your Firebase API key
    AUTH_DOMAIN: 'taskmanager-f6bb4.firebaseapp.com', // Replace with your project domain
    PROJECT_ID: 'taskmanager-f6bb4', // Replace with your project ID
};

// Firebase Auth REST API endpoints
export const FIREBASE_AUTH_ENDPOINTS = {
    SIGN_UP: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.API_KEY}`,
    SIGN_IN: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.API_KEY}`,
    REFRESH_TOKEN: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.API_KEY}`,
};
