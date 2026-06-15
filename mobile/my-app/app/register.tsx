import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { API_URLS } from '../constants/config';

/* ─── Reusable Field Component ─── */
interface RegisterFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: any;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  required?: boolean;
}

const RegisterField = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  required = false,
}: RegisterFieldProps) => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5`}>
        {label}{required && <Text style={tw`text-rose-500`}> *</Text>}
      </Text>
      <View style={tw`flex-row items-center border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50`}>
        {icon && <Feather name={icon} size={15} style={tw`text-slate-400 mr-2.5`} />}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={tw`flex-1 text-sm font-semibold text-slate-800 p-0`}
        />
      </View>
    </View>
  );
};

/* ─── Reusable Section Card Component ─── */
interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon: string;
  headerBg: string;
  borderCol: string;
  children: React.ReactNode;
}

const FormSection = ({ title, subtitle, icon, headerBg, borderCol, children }: FormSectionProps) => {
  return (
    <View style={tw`bg-white rounded-3xl border ${borderCol} shadow-sm overflow-hidden mb-6`}>
      <View style={tw`${headerBg} px-5 py-3.5 flex-row items-center gap-3`}>
        <View style={tw`w-7 h-7 rounded-lg bg-white/20 items-center justify-center`}>
          <FontAwesome5 name={icon} size={13} color="#ffffff" />
        </View>
        <View>
          <Text style={tw`text-white font-extrabold text-sm`}>{title}</Text>
          {subtitle && <Text style={tw`text-white/70 text-[10px] font-medium`}>{subtitle}</Text>}
        </View>
      </View>
      <View style={tw`p-5`}>{children}</View>
    </View>
  );
};

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', mobile: '',
    schoolName: '', std: '', district: '', taluka: '', village: '',
    teacherName: '', teacherContact: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleRegister = async () => {
    const { name, email, password, mobile } = formData;
    if (!name || !email || !password || !mobile) {
      Alert.alert('Required Fields', 'Full Name, Email, Password, and Mobile Number are required.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_URLS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: email.trim().toLowerCase(),
          age: formData.age ? parseInt(formData.age) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      Alert.alert(
        'Account Created',
        'Your registration was successful! Please log in to your new account.',
        [{ text: 'Log In Now', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', (error as any).message || 'Something went wrong during registration.');
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
      <ScrollView contentContainerStyle={tw`p-6 pb-12`} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-xs font-black uppercase tracking-wider text-purple-600 mb-1`}>
            New Account
          </Text>
          <Text style={tw`text-3xl font-black text-slate-800`}>
            Create Account
          </Text>
          <TouchableOpacity onPress={() => router.replace('/login')} style={tw`mt-2`}>
            <Text style={tw`text-slate-500 text-sm font-semibold`}>
              Already registered?{' '}
              <Text style={tw`text-purple-600 font-extrabold underline`}>
                Sign in instead →
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Student Details */}
        <FormSection
          title="Student Details"
          subtitle="Your personal information"
          icon="user"
          headerBg="bg-purple-600"
          borderCol="border-purple-100"
        >
          <RegisterField
            label="Full Name"
            value={formData.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="John Doe"
            icon="user"
            required
          />
          <RegisterField
            label="Age"
            value={formData.age}
            onChangeText={(v) => updateField('age', v)}
            placeholder="15"
            icon="calendar"
            keyboardType="numeric"
          />
          <RegisterField
            label="Mobile Number"
            value={formData.mobile}
            onChangeText={(v) => updateField('mobile', v)}
            placeholder="+91 9876543210"
            icon="phone"
            keyboardType="phone-pad"
            required
          />
          <RegisterField
            label="Email Address"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="you@example.com"
            icon="mail"
            keyboardType="email-address"
            required
          />
          <RegisterField
            label="Password"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            placeholder="Create a strong password"
            icon="lock"
            secureTextEntry
            required
          />
        </FormSection>

        {/* Section 2: Academic Details */}
        <FormSection
          title="Academic Details"
          subtitle="Your school & class information"
          icon="graduation-cap"
          headerBg="bg-cyan-500"
          borderCol="border-cyan-100"
        >
          <RegisterField
            label="School Name"
            value={formData.schoolName}
            onChangeText={(v) => updateField('schoolName', v)}
            placeholder="Delhi Public School"
            icon="book-open"
          />
          <RegisterField
            label="Standard (Std.)"
            value={formData.std}
            onChangeText={(v) => updateField('std', v)}
            placeholder="10th"
            icon="server"
          />
        </FormSection>

        {/* Section 3: Address Details */}
        <FormSection
          title="Address Details"
          subtitle="Your home district & village"
          icon="map-marker-alt"
          headerBg="bg-rose-500"
          borderCol="border-rose-100"
        >
          <RegisterField
            label="District"
            value={formData.district}
            onChangeText={(v) => updateField('district', v)}
            placeholder="Pune"
            icon="map"
          />
          <RegisterField
            label="Taluka (Tq.)"
            value={formData.taluka}
            onChangeText={(v) => updateField('taluka', v)}
            placeholder="Haveli"
            icon="map-pin"
          />
          <RegisterField
            label="Village"
            value={formData.village}
            onChangeText={(v) => updateField('village', v)}
            placeholder="Koregaon"
            icon="home"
          />
        </FormSection>

        {/* Section 4: Teacher Information */}
        <FormSection
          title="Teacher Information"
          subtitle="Your guiding teacher's details"
          icon="user-check"
          headerBg="bg-emerald-600"
          borderCol="border-emerald-100"
        >
          <RegisterField
            label="Teacher Name"
            value={formData.teacherName}
            onChangeText={(v) => updateField('teacherName', v)}
            placeholder="Mr. Sharma"
            icon="user"
          />
          <RegisterField
            label="Teacher Contact No."
            value={formData.teacherContact}
            onChangeText={(v) => updateField('teacherContact', v)}
            placeholder="+91 9123456780"
            icon="phone"
            keyboardType="phone-pad"
          />
        </FormSection>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          style={[
            tw`w-full py-4.5 rounded-2xl flex-row items-center justify-center shadow-lg mt-2`,
            { backgroundColor: '#7c3aed' }
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={tw`text-white font-black text-base mr-2`}>
                Create My Account
              </Text>
              <Feather name="arrow-right" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        {/* Go to Login Button */}
        <TouchableOpacity
          onPress={() => router.replace('/login')}
          style={tw`w-full py-4 bg-white border border-purple-200 rounded-2xl flex-row items-center justify-center shadow-sm mt-3`}
        >
          <Feather name="log-in" size={16} style={tw`text-purple-600 mr-2`} />
          <Text style={tw`text-purple-600 font-extrabold text-sm`}>
            Already have an account? Log In
          </Text>
        </TouchableOpacity>

        <Text style={tw`text-center text-xs text-slate-400 font-semibold mt-5 leading-normal`}>
          By creating an account, you agree to Dnyanniti's{' '}
          <Text style={tw`text-purple-600 font-extrabold`}>Terms of Service</Text> &{' '}
          <Text style={tw`text-purple-600 font-extrabold`}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </Container>
  );
}
