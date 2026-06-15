import React from 'react';
import { View, Text, Alert } from 'react-native';
import tw from 'twrnc';
import DynamicForm from '../../components/DynamicForm';

// Fields that a user must fill when inquiring about a test
const inquiryFields = [
  { label: 'Your Name', key: 'name', placeholder: 'Enter your name', required: true },
  { label: 'Email', key: 'email', placeholder: 'you@example.com', required: true, keyboardType: 'email-address' },
  { label: 'Test Code', key: 'testCode', placeholder: 'Enter the test code provided by admin', required: true },
];

export default function TestInquiryScreen() {
  const handleSubmit = (values) => {
    // Placeholder: you would send this to your backend API
    console.log('Inquiry submitted:', values);
    Alert.alert('Inquiry Sent', `We received your inquiry for test code "${values.testCode}".`);
  };

  return (
    <View style={tw`flex-1 bg-[#f6f7fb] p-4`}>
      <Text style={tw`text-2xl font-bold text-purple-600 mb-4`}>Test Inquiry</Text>
      <DynamicForm fields={inquiryFields} onSubmit={handleSubmit} />
    </View>
  );
}
