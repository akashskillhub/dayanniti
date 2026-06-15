import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, Dimensions, Image } from 'react-native';
import SafeStorage from '../utils/storage';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5 } from '@expo/vector-icons';
import { API_URLS } from '../constants/config';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Check auth status
    const checkAuth = async () => {
      try {
        const userData = await SafeStorage.getItem('user');
        const token = await SafeStorage.getItem('token');
        
        // Wait at least 2 seconds for a premium splash presentation
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (userData && token) {
          // Verify token against backend
          const res = await fetch(API_URLS.profile, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            router.replace('/(tabs)');
            return;
          }
        }
        router.replace('/login');
      } catch (error) {
        console.error('Splash Screen Auth Check Error:', error);
        router.replace('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={tw`flex-1 items-center justify-center bg-[#0d0b2a]`}>
      {/* Background blobs simulating modern glow */}
      <View 
        style={[
          tw`absolute w-80 h-80 rounded-full bg-purple-600 opacity-10`,
          { top: '10%', left: '-20%', transform: [{ scale: 1.2 }] }
        ]} 
      />
      <View 
        style={[
          tw`absolute w-80 h-80 rounded-full bg-cyan-500 opacity-10`,
          { bottom: '15%', right: '-20%', transform: [{ scale: 1.2 }] }
        ]} 
      />

      <Animated.View style={[tw`items-center`, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Glowing Logo Container */}
        <View style={tw`w-28 h-28 rounded-full bg-white border border-purple-500/20 overflow-hidden flex items-center justify-center mb-6 shadow-2xl`}>
          <Image source={require('../assets/images/logo.png')} style={tw`w-28 h-28`} resizeMode="cover" />
        </View>
        
        <Text style={tw`text-3xl font-black text-white tracking-tight`}>
          DNYAN<Text style={tw`text-purple-400`}>NITI</Text>
        </Text>
        <Text style={tw`text-[11px] text-slate-500 font-extrabold uppercase tracking-widest mt-2`}>
          Training & Research
        </Text>
      </Animated.View>

      <ActivityIndicator size="small" color="#a855f7" style={tw`absolute bottom-20`} />
    </View>
  );
}
