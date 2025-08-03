import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    Animated,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../utils/auth';

// --- A Beautiful & Attractive SignUp Screen ---
const SignUpScreen = ({ navigation }) => {
    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // State for password visibility
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Animation values
    const formElements = [
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

    // Form validation
    const validateForm = () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    // Handle signup
    const handleSignUp = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await AuthService.signUp(email.trim(), password, fullName.trim());
            
            if (result.success) {
                Alert.alert(
                    'Success!',
                    'Account created successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Main')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to create account');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Start your journey with us.</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <Animated.View style={[styles.inputContainer, createAnimatedStyle(formElements[0])]}>
                        <Ionicons name="person-outline" size={20} color="#6C5EFF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Full Name"
                            style={styles.input}
                            placeholderTextColor="#A9A9A9"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                            editable={!isLoading}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.inputContainer, createAnimatedStyle(formElements[1])]}>
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
                            editable={!isLoading}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.inputContainer, createAnimatedStyle(formElements[2])]}>
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
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            style={styles.eyeIcon}
                            disabled={isLoading}
                        >
                            <Ionicons
                                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#A9A9A9"
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View style={createAnimatedStyle(formElements[3])}>
                        <TouchableOpacity 
                            style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]} 
                            activeOpacity={0.8} 
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.signUpButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.footerText}>
                        Already have an account? <Text style={styles.signInText}>Sign In</Text>
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
        marginTop: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
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
        color: '#111827',
    },
    signUpButton: {
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
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signUpButtonDisabled: {
        backgroundColor: '#A0A0A0',
        shadowOpacity: 0.1,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
        marginTop: 40,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signInText: {
        color: '#6C5EFF',
        fontWeight: 'bold',
    },
});

export default SignUpScreen;