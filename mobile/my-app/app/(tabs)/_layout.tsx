import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
// End time after which Live Classes tab disappears automatically
const LIVE_CLASS_END = new Date('2026-07-01T00:00:00Z');
export default function TabLayout() {
  return (
    <SafeAreaView style={{flex:1}}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 56,
          paddingBottom: 2,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Exams',
          tabBarIcon: ({ color }) => <Feather name="book-open" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="syllabus"
        options={{
          title: 'Syllabus',
          tabBarIcon: ({ color }) => <Feather name="file-text" size={20} color={color} />,
        }}
      />
        {/* Live Classes tab – visible until the end date */}
        {new Date() < LIVE_CLASS_END && (
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Live',
              tabBarIcon: ({ color }) => <Feather name="video" size={20} color={color} />, 
            }}
          />
        )}
    </Tabs>
    </SafeAreaView>
  );
}
