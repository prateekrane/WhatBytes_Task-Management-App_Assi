import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, Animated, Easing } from 'react-native';
// --- Reusable Icon Component ---
// This component creates the checkmark icon without using any image or SVG files.
const CheckmarkIcon = () => {
    const [scaleValue] = useState(new Animated.Value(0.5));
    const [opacityValue] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 3,
                tension: 60,
                useNativeDriver: true,
            })
        ]).start();
    }, []);


    return (
        <Animated.View style={[styles.iconContainer, { opacity: opacityValue, transform: [{ scale: scaleValue }] }]}>
            <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
            </View>
        </Animated.View>
    );
};


// --- Splash Screen Component ---
const Splash = () => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
    }, []);


    return (
        <View style={styles.splashContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
            <CheckmarkIcon />
            <Animated.Text style={[styles.splashTitle, { opacity: fadeAnim }]}>
                Get things done.
            </Animated.Text>
            <Animated.Text style={[styles.splashSubtitle, { opacity: fadeAnim }]}>
                Just a click away from planning your tasks.
            </Animated.Text>
            <View style={styles.bottomCircle}>
                <Text style={styles.arrow}>→</Text>
            </View>
        </View>
    );
};




// --- Main Splash Screen Component ---
export default function SplashScreen({ navigation }) {
    useEffect(() => {
        // This timer will navigate to login screen after 3.5 seconds.
        const timer = setTimeout(() => {
            navigation.navigate('Login');
        }, 3500);

        // Clear the timer if the component unmounts
        return () => clearTimeout(timer);
    }, [navigation]);

    return <Splash />;
}


// --- Styles ---
const styles = StyleSheet.create({
    // Splash Screen Styles
    splashContainer: {
        flex: 1,
        backgroundColor: '#f0f4ff', // A light, modern blue-white
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: '#6a5acd', // A vibrant purple
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    checkmarkContainer: {
        width: 110,
        height: 110,
        borderRadius: 25,
        backgroundColor: '#7b68ee', // A slightly lighter purple
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#fff',
        fontSize: 60,
        fontWeight: 'bold',
    },
    splashTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    splashSubtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    bottomCircle: {
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#6a5acd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 40,
        color: '#fff',
        transform: [{ translateX: -45 }, { translateY: -45 }]
    },
});
