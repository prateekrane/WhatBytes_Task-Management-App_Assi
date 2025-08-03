import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SettingsScreen({ navigation }) {
    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove the stored token
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('userData');

                            // Navigate to Login screen and reset navigation stack
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingItemLeft}>
                            <Ionicons name="person-outline" size={24} color="#8A71FF" />
                            <Text style={styles.settingItemText}>Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                </View>

                {/* App Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => Alert.alert('Language', 'Current Language: English')}
                    >
                        <View style={styles.settingItemLeft}>
                            <Ionicons name="language-outline" size={24} color="#8A71FF" />
                            <Text style={styles.settingItemText}>Language</Text>
                        </View>
                        <View style={styles.settingItemRight}>
                            <Text style={styles.settingItemValue}>English</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => Alert.alert(
                            'Developer Details',
                            'Email: prateekrane7@gmail.com\nLinkedIn: prateek-rane-5a9496214/',
                            [{ text: 'OK' }]
                        )}
                    >
                        <View style={styles.settingItemLeft}>
                            <Ionicons name="help-circle-outline" size={24} color="#8A71FF" />
                            <Text style={styles.settingItemText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => Alert.alert(
                            'About Task Manager',
                            'App Name: Task Management App\nVersion: 1.0.0\n\nA simple and efficient task management application to help you organize your daily tasks.',
                            [{ text: 'OK' }]
                        )}
                    >
                        <View style={styles.settingItemLeft}>
                            <Ionicons name="information-circle-outline" size={24} color="#8A71FF" />
                            <Text style={styles.settingItemText}>About</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                    <Text style={styles.logoutText}>Logout</Text>
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
        paddingTop: Platform.OS === 'android' ? 25 : 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343A40',
        marginBottom: 15,
        marginLeft: 5,
    },
    settingItem: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#495057',
        marginLeft: 15,
    },
    settingItemValue: {
        fontSize: 14,
        color: '#8A71FF',
        marginRight: 8,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#FFE3E3',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B6B',
        marginLeft: 10,
    },
});