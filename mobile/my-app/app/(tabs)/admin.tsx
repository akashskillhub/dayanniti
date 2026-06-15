import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

export default function AdminScreen() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-white`}>
      <Text style={tw`text-2xl font-bold text-purple-600`}>Live Classes</Text>
      {/* TODO: Add live class streaming UI here */}
    </View>
  );
}
