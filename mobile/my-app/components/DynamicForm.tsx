import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import tw from 'twrnc';

/**
 * DynamicForm renders a list of input fields based on a schema.
 * `fields` is an array of objects: { label, key, placeholder?, required?, keyboardType? }.
 * `onSubmit` receives an object `{[key]: value}` when the user presses the Submit button.
 */
export default function DynamicForm({ fields, onSubmit }) {
  const initialState = {};
  fields.forEach((f) => (initialState[f.key] = ''));
  const [values, setValues] = useState(initialState);

  const handleChange = (key, text) => {
    setValues((prev) => ({ ...prev, [key]: text }));
  };

  const validate = () => {
    for (const f of fields) {
      if (f.required && !values[f.key].trim()) {
        Alert.alert('Validation', `${f.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handlePress = () => {
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <View style={tw`space-y-4`}>
      {fields.map((f) => (
        <View key={f.key} style={tw`flex-col mb-4`}>
          <Text style={tw`text-sm font-bold text-slate-700 mb-1`}>{f.label}</Text>
          <TextInput
            placeholder={f.placeholder || ''}
            keyboardType={f.keyboardType || 'default'}
            value={values[f.key]}
            onChangeText={(text) => handleChange(f.key, text)}
            style={tw`border border-slate-300 rounded-xl px-3 py-2 bg-white`}
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={handlePress}
        style={tw`mt-4 bg-purple-600 py-2.5 rounded-xl items-center`}
      >
        <Text style={tw`text-white font-bold`}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
