import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';
import SafeStorage from '../utils/storage';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';
import { API_URLS } from '../constants/config';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill in all the password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const token = await SafeStorage.getItem('token');
      const storedUser = await SafeStorage.getItem('user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      const mobile = userObj?.mobile || '';
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch(API_URLS.profile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          password: newPassword,
          mobile
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password. Please verify your old password.');
      }

      // If token is returned, update it in local storage
      if (data.token) {
        await SafeStorage.setItem('token', data.token);
      }

      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      Alert.alert('Error', (error as any).message || 'Something went wrong. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const Container = RNPlatform.OS === 'web' ? View : KeyboardAvoidingView;

  return (
    <Container
      {...(RNPlatform.OS !== 'web' ? { behavior: RNPlatform.OS === 'ios' ? 'padding' : 'height' } : {})}
      style={tw`flex-1 bg-[#f6f7fb]`}
    >
      {/* Top Header */}
      <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-12 rounded-b-3xl relative overflow-hidden`}>
        <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-25%', left: '-15%' }]} />
        <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-35%', right: '-15%' }]} />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`absolute left-6 top-14 w-10 h-10 rounded-2xl bg-white/10 items-center justify-center border border-white/10 z-20`}
        >
          <Feather name="arrow-left" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Header Title */}
        <View style={tw`items-center mt-6`}>
          <View style={tw`w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 items-center justify-center mb-3`}>
            <Feather name="lock" size={22} color="#c084fc" />
          </View>
          <Text style={tw`text-2xl font-black text-white relative z-10`}>Change Password</Text>
          <Text style={tw`text-slate-400 text-xs text-center mt-1 relative z-10 px-8`}>
            Ensure your account stays secure by choosing a strong password.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`flex-grow px-6 py-8`} keyboardShouldPersistTaps="handled">
        {/* Form Container */}
        <View style={tw`bg-white rounded-3xl p-6 shadow-sm border border-slate-100`}>
          
          {/* Old Password */}
          <View style={tw`mb-5`}>
            <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2`}>
              Current Password
            </Text>
            <View style={tw`flex-row items-center border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50/50`}>
              <Feather name="shield" size={16} style={tw`text-slate-400 mr-3`} />
              <TextInput
                placeholder="Enter current password"
                placeholderTextColor="#94a3b8"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry={!showOldPassword}
                autoCapitalize="none"
                style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <Feather name={showOldPassword ? 'eye-off' : 'eye'} size={16} style={tw`text-slate-400`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={tw`mb-5`}>
            <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2`}>
              New Password
            </Text>
            <View style={tw`flex-row items-center border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50/50`}>
              <Feather name="lock" size={16} style={tw`text-slate-400 mr-3`} />
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor="#94a3b8"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={16} style={tw`text-slate-400`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={tw`mb-8`}>
            <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2`}>
              Confirm New Password
            </Text>
            <View style={tw`flex-row items-center border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50/50`}>
              <Feather name="check" size={16} style={tw`text-slate-400 mr-3`} />
              <TextInput
                placeholder="Confirm new password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={16} style={tw`text-slate-400`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={isLoading}
            style={[
              tw`w-full py-4.5 rounded-2xl flex-row items-center justify-center shadow-lg`,
              { backgroundColor: '#7c3aed' }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={tw`text-white font-black text-sm mr-2`}>
                  Update Password
                </Text>
                <Feather name="arrow-right" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}
