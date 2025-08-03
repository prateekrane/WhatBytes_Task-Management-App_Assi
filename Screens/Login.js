import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    Animated,
    TouchableOpacity,
    TextInput,
    ScrollView, // Use ScrollView for responsiveness
    KeyboardAvoidingView, // Helps with keyboard overlap
    Platform,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../utils/auth';

// --- A More Beautiful & Attractive Login Screen ---
const Login = ({ navigation }) => {
    // State for password visibility
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Animation values
    const formElements = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        // Staggered entrance animation for form elements
        const animations = formElements.map(val =>
            Animated.timing(val, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        );
        Animated.stagger(100, animations).start();
    }, []);

    // Function to create animated style for each element
    const createAnimatedStyle = (animValue) => ({
        opacity: animValue,
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
        ],
    });

    // Handle login functionality
    const handleLogin = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        try {
            setIsLoading(true);
            console.log('Attempting to login with:', email);
            
            const result = await AuthService.signIn(email.trim(), password);
            
            if (result.success) {
                console.log('Login successful:', result.user);
                Alert.alert(
                    'Success!',
                    'Login successful!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate to Main screen
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Main' }],
                                });
                            }
                        }
                    ]
                );
            } else {
                console.error('Login failed:', result.error);
                Alert.alert('Login Failed', result.error || 'Please check your credentials and try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#6C5EFF" />
                <LinearGradient
                    colors={['#8A7FFF', '#6C5EFF']}
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>Welcome Back!</Text>
                    <Text style={styles.headerSubtitle}>Sign in to continue your journey.</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <Animated.View style={[styles.inputContainer, createAnimatedStyle(formElements[0])]}>
                        <Ionicons name="mail-outline" size={20} color="#6C5EFF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Email Address"
                            style={styles.input}
                            keyboardType="email-address"
                            placeholderTextColor="#A9A9A9"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.inputContainer, createAnimatedStyle(formElements[1])]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#6C5EFF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor="#A9A9A9"
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#A9A9A9"
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={createAnimatedStyle(formElements[2])}>
                        <TouchableOpacity 
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                            activeOpacity={0.8} 
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
                <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.footerText}>
                        Don't have an account? <Text style={styles.signupText}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        height: 250,
        justifyContent: 'flex-end',
        paddingHorizontal: 30,
        paddingBottom: 50,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E2E9FF',
    },
    formContainer: {
        paddingHorizontal: 30,
        marginTop: 30, // Pulls the form up to overlap slightly with the header
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // A light grey background
        borderRadius: 15,
        paddingHorizontal: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    inputIcon: {
        marginRight: 10,
    },
    eyeIcon: {
        padding: 5,
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        fontSize: 16,
        color: '#111827', // Darker text for better contrast
    },
    loginButton: {
        backgroundColor: '#6C5EFF',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#6C5EFF",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    loginButtonDisabled: {
        backgroundColor: '#A9A9A9',
        shadowOpacity: 0.1,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#D1D5DB', // A subtle line color
    },
    separatorText: {
        marginHorizontal: 10,
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 12,
    },
    socialsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: 80,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIcon: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
        marginTop: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signupText: {
        color: '#6C5EFF',
        fontWeight: 'bold',
    },
});

export default Login; 