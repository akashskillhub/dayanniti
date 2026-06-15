import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import SafeStorage from '../utils/storage';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { API_URLS } from '../constants/config';

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await SafeStorage.getItem('token');
      if (token) {
        router.replace('/(tabs)');
      }
    })();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please fill in both Email and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_URLS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Store token and user data
      await SafeStorage.setItem('token', data.token);
      await SafeStorage.setItem('user', JSON.stringify(data));

      // Directly navigate to dashboard tabs
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login Failed', (error as any).message || 'Something went wrong. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={tw`flex-1 bg-[#f6f7fb]`}
    >
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`flex-grow`} keyboardShouldPersistTaps="always">
        {/* Top Header Card */}
        <View style={tw`bg-[#0d0b2a] px-8 pt-16 pb-12 items-center justify-center relative`}>
          <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-20`, { top: '-20%', left: '-20%' }]} />
          <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-30%', right: '-20%' }]} />

          {/* Logo */}
          <View style={tw`flex-row items-center gap-3 mb-6 relative z-10`}>
            <View style={tw`w-12 h-12 rounded-full bg-white overflow-hidden items-center justify-center border border-purple-500/20 shadow-md`}>
              <Image source={require('../assets/images/logo.png')} style={tw`w-12 h-12`} resizeMode="cover" />
            </View>
            <Text style={tw`text-2xl font-black text-white`}>
              DNYAN<Text style={tw`text-purple-400`}>NITI</Text>
            </Text>
          </View>

          <Text style={tw`text-3xl font-black text-white text-center relative z-10`}>
            Welcome Back
          </Text>
          <Text style={tw`text-slate-400 text-sm text-center mt-2 relative z-10`}>
            Sign in to start practicing exams and achievements
          </Text>
        </View>

        {/* Input Form Card */}
        <View style={tw`flex-1 px-6 py-8 -mt-6 bg-[#f6f7fb] rounded-t-3xl relative z-10`}>
          <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100`}>
            {/* Email Field */}
            <View style={tw`mb-5`}>
              <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2`}>
                Email Address
              </Text>
              <View style={tw`flex-row items-center border-2 border-slate-100 rounded-2xl px-4 py-3 bg-slate-50/50`}>
                <Feather name="mail" size={16} style={tw`text-slate-400 mr-3`} />
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={tw`mb-8`}>
              <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2`}>
                Password
              </Text>
              <View style={tw`flex-row items-center border-2 border-slate-100 rounded-2xl px-4 py-3 bg-slate-50/50`}>
                <Feather name="lock" size={16} style={tw`text-slate-400 mr-3`} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} style={tw`text-slate-400`} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                tw`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg`,
                { backgroundColor: '#7c3aed' }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={tw`text-white font-black text-base mr-2`}>
                    Sign In
                  </Text>
                  <Feather name="arrow-right" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Registration Redirect */}
          <TouchableOpacity 
            onPress={() => router.push('/register')}
            style={tw`mt-8 items-center`}
          >
            <Text style={tw`text-slate-500 text-sm font-semibold`}>
              Don't have an account?{' '}
              <Text style={tw`text-purple-600 font-extrabold underline`}>
                Register Now
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
