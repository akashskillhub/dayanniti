import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image, Alert, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import SafeStorage from '../utils/storage';
import { API_BASE_URL } from '../constants/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.78;

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    Alert.alert('Confirm Logout', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await SafeStorage.clear();
          router.replace('/login');
        } 
      }
    ]);
  };

  const handleNavigate = (route: string) => {
    onClose();
    if (route === '/(tabs)') {
      router.replace(route as any);
    } else {
      router.push(route as any);
    }
  };

  return (
    <Modal
      transparent
      visible={isOpen}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={tw`flex-1 flex-row relative`}>
        {/* Semi-transparent Backdrop overlay */}
        <Animated.View 
          style={[
            tw`absolute inset-0 bg-black/60`,
            { opacity: fadeAnim }
          ]}
        >
          <Pressable style={tw`flex-1`} onPress={onClose} />
        </Animated.View>

        {/* Sidebar Drawer */}
        <Animated.View
          style={[
            tw`h-full bg-[#0d0b2a] shadow-2xl flex-col`,
            { 
              width: SIDEBAR_WIDTH,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Header section with branding & user info */}
          <View style={tw`pt-16 pb-8 px-6 bg-[#09071d] border-b border-purple-500/10`}>

            {/* Profile Info */}
            <View style={tw`flex-row items-center gap-3 mt-4`}>
              <View style={tw`w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 items-center justify-center overflow-hidden`}>
                {user?.profilePic ? (
                  <Image 
                    source={{ uri: `${API_BASE_URL}${user.profilePic}?t=${Date.now()}` }} 
                    style={tw`w-full h-full`} 
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome5 name="user" size={18} color="#c084fc" />
                )}
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white font-extrabold text-sm truncate`}>{user?.name || 'Student'}</Text>
                <Text style={tw`text-slate-400 text-xs truncate mt-0.5`}>{user?.email || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Links Section */}
          <View style={tw`flex-1 pt-6 px-4`}>
            {[
              { label: 'Home Dashboard', icon: 'home', route: '/(tabs)' },
              { label: 'Exam Bank', icon: 'book-open', route: '/(tabs)/tests' },
              { label: 'Published Study Materials:', icon: 'file-text', route: '/(tabs)/syllabus' },
              { label: 'Live Classes', icon: 'video', route: '/admin/live-classes' },
              { label: 'About Platform', icon: 'info', route: '/about' },
              { label: 'Terms & Conditions', icon: 'shield', route: '/terms' },
              { label: 'Change Password', icon: 'lock', route: '/change-password' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleNavigate(item.route)}
                style={tw`flex-row items-center gap-4 px-4 py-3.5 rounded-2xl mb-2 active:bg-white/5`}
              >
                <Feather name={item.icon as any} size={18} color="#c084fc" />
                <Text style={tw`text-slate-200 font-bold text-sm`}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer logout section */}
          <View style={tw`p-6 border-t border-purple-500/10`}>
            <TouchableOpacity
              onPress={handleLogout}
              style={tw`w-full py-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl flex-row items-center justify-center gap-2`}
            >
              <Feather name="log-out" size={16} color="#fb7185" />
              <Text style={tw`text-xl font-black text-white mt-0.5`}>Study Material</Text>
            </TouchableOpacity>
            <Text style={tw`text-center text-[10px] text-slate-600 font-bold mt-4`}>
              Version 1.0.0 • © DNYANNITI
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
