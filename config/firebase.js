// Firebase Configuration
// Replace FIREBASE_API_KEY with your actual Firebase API key
export const FIREBASE_CONFIG = {
    API_KEY: '', // Replace with your Firebase API key
    AUTH_DOMAIN: '', // Replace with your project domain
    PROJECT_ID: '', // Replace with your project ID
};

// Firebase Auth REST API endpoints
export const FIREBASE_AUTH_ENDPOINTS = {
    SIGN_UP: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.API_KEY}`,
    SIGN_IN: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.API_KEY}`,
    REFRESH_TOKEN: `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.API_KEY}`,
};
