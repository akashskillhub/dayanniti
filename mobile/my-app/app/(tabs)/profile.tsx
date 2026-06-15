import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  TextInput, 
  Image, 
  Platform 
} from 'react-native';
import SafeStorage from '../../utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { API_URLS, API_BASE_URL } from '../../constants/config';
import * as ImagePicker from 'expo-image-picker';
import Sidebar from '../../components/Sidebar';

/* ─── Detail Row Helper ─── */
interface DetailRowProps {
  label: string;
  value: string | undefined | null;
  icon?: any;
}

const DetailRow = ({ label, value, icon }: DetailRowProps) => (
  <View style={tw`flex-row items-center justify-between py-3.5 border-b border-slate-50`}>
    <View style={tw`flex-row items-center gap-3`}>
      {icon && <Feather name={icon} size={14} style={tw`text-slate-400`} />}
      <Text style={tw`text-xs font-semibold text-slate-500`}>{label}</Text>
    </View>
    <Text style={tw`text-sm font-extrabold text-slate-800 text-right flex-1 ml-4`}>{value || 'Not provided'}</Text>
  </View>
);

/* ─── Profile Section Helper ─── */
interface ProfileCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

const ProfileCard = ({ title, icon, children }: ProfileCardProps) => (
  <View style={tw`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6`}>
    <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
      <FontAwesome5 name={icon} size={15} color="#7c3aed" />
      <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>{title}</Text>
    </View>
    {children}
  </View>
);

/* ─── Edit Field Component ─── */
interface EditFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: any;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
}

const EditField = ({ label, value, onChangeText, icon, keyboardType = 'default' }: EditFieldProps) => (
  <View style={tw`mb-4`}>
    <Text style={tw`text-xs font-bold text-slate-500 mb-1.5 ml-1`}>{label}</Text>
    <View style={tw`flex-row items-center bg-slate-55/40 border border-slate-200/60 rounded-2xl px-4 py-3`}>
      {icon && <Feather name={icon} size={14} style={tw`text-slate-400 mr-2.5`} />}
      <TextInput
        style={tw`flex-1 text-slate-800 text-sm font-semibold p-0`}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#94a3b8"
      />
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Editing form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [std, setStd] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherContact, setTeacherContact] = useState('');

  const fetchProfile = async () => {
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch(API_URLS.profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Could not load profile');
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to retrieve profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const enterEditMode = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setAge(user?.age?.toString() || '');
    setMobile(user?.mobile || '');
    setSchoolName(user?.schoolName || '');
    setStd(user?.std || '');
    setDistrict(user?.district || '');
    setTaluka(user?.taluka || '');
    setVillage(user?.village || '');
    setTeacherName(user?.teacherName || '');
    setTeacherContact(user?.teacherContact || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.');
      return;
    }
    if (!mobile.trim()) {
      Alert.alert('Validation Error', 'Mobile number is required.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) return;

      const updatedFields = {
        name,
        email,
        age: age ? parseInt(age, 10) : undefined,
        mobile,
        schoolName,
        std,
        district,
        taluka,
        village,
        teacherName,
        teacherContact,
      };

      const res = await fetch(API_URLS.profile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await res.json();
      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      
      // Update local storage too
      await SafeStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Could not save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarPress = () => {
    const options = ['Choose from Gallery'];
    if (user?.profilePic) {
      options.push('Delete Profile Photo');
    }
    options.push('Cancel');

    Alert.alert(
      'Profile Photo Options',
      'Change or remove your profile photo',
      [
        {
          text: 'Choose from Gallery',
          onPress: handleSelectImage,
        },
        ...(user?.profilePic
          ? [
              {
                text: 'Delete Profile Photo',
                style: 'destructive' as const,
                onPress: handleDeleteImage,
              },
            ]
          : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  };

  const handleSelectImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need storage permission to change your profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        await uploadProfilePic(selectedImage.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const uploadProfilePic = async (uri: string) => {
    setIsUploading(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      const fileUriParts = uri.split('.');
      const fileExtension = fileUriParts[fileUriParts.length - 1] || 'jpg';
      
      formData.append('profilePic', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: `profilePic-${Date.now()}.${fileExtension}`,
        type: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
      } as any);

      const res = await fetch(API_URLS.profile, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const updatedUser = await res.json();
      setUser((prev: any) => ({ ...prev, profilePic: updatedUser.profilePic }));
      
      // Update local storage
      const storedUser = await SafeStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.profilePic = updatedUser.profilePic;
        await SafeStorage.setItem('user', JSON.stringify(parsed));
      }
      
      Alert.alert('Success', 'Profile picture updated successfully.');
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Could not upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsUploading(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) return;

      const res = await fetch(API_URLS.deleteProfilePic, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete image');
      }

      const updatedUser = await res.json();
      setUser((prev: any) => ({ ...prev, profilePic: updatedUser.profilePic }));
      
      // Update local storage
      const storedUser = await SafeStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.profilePic = updatedUser.profilePic;
        await SafeStorage.setItem('user', JSON.stringify(parsed));
      }
      
      Alert.alert('Success', 'Profile picture removed successfully.');
    } catch (error) {
      console.error('Image delete error:', error);
      Alert.alert('Error', 'Could not delete profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
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

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#f6f7fb]`}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1`}>
      <ScrollView style={tw`flex-1 bg-[#f6f7fb]`} contentContainerStyle={tw`pb-12`}>
        {/* Top Banner Card */}
        <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-12 rounded-b-3xl items-center relative overflow-hidden`}>
          <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-25%', left: '-15%' }]} />
          <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-35%', right: '-15%' }]} />

          {/* Hamburger Menu Button */}
          {!isEditing && (
            <TouchableOpacity 
              onPress={() => setIsSidebarOpen(true)}
              style={tw`absolute left-6 top-14 w-10 h-10 rounded-2xl bg-white/10 border border-white/10 items-center justify-center z-20`}
            >
              <Feather name="menu" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Profile Avatar Frame */}
          <TouchableOpacity
            onPress={handleAvatarPress}
            disabled={isUploading}
            style={tw`w-24 h-24 rounded-3xl bg-purple-500/10 border-2 border-purple-500/30 items-center justify-center mb-4 relative z-10 overflow-hidden`}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#c084fc" />
            ) : user?.profilePic ? (
              <Image
                source={{ uri: `${API_BASE_URL}${user.profilePic}?t=${Date.now()}` }}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />
            ) : (
              <FontAwesome5 name="user" size={32} color="#c084fc" />
            )}
            
            <View style={[tw`absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-br-2xl rounded-tl-xl border-t border-l border-purple-400/30`, { borderBottomRightRadius: 20 }]}>
              <Feather name="camera" size={9} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={tw`text-xl font-black text-white relative z-10`}>{user?.name}</Text>
          <Text style={tw`text-slate-400 text-xs font-semibold mt-1 relative z-10`}>{user?.email}</Text>
          
          {!isEditing && (
            <TouchableOpacity
              onPress={enterEditMode}
              style={tw`mt-4 px-5 py-2.5 rounded-full bg-purple-600 border border-purple-500/30 flex-row items-center gap-2 z-20 shadow-sm`}
            >
              <Feather name="edit-3" size={13} color="#ffffff" />
              <Text style={tw`text-white text-xs font-black`}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={tw`px-6 mt-6`}>
          {isEditing ? (
            <View style={tw`bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-6`}>
              <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
                <Feather name="edit" size={16} color="#7c3aed" />
                <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>Edit Profile Details</Text>
              </View>

              <EditField label="Full Name" value={name} onChangeText={setName} icon="user" />
              <EditField label="Email Address" value={email} onChangeText={setEmail} icon="mail" keyboardType="email-address" />
              <EditField label="Age (Years)" value={age} onChangeText={setAge} icon="calendar" keyboardType="numeric" />
              <EditField label="Mobile Number" value={mobile} onChangeText={setMobile} icon="phone" keyboardType="phone-pad" />
              <EditField label="School Name" value={schoolName} onChangeText={setSchoolName} icon="book-open" />
              <EditField label="Standard (Std.)" value={std} onChangeText={setStd} icon="layers" />
              <EditField label="District" value={district} onChangeText={setDistrict} icon="map" />
              <EditField label="Taluka (Tq.)" value={taluka} onChangeText={setTaluka} icon="compass" />
              <EditField label="Village" value={village} onChangeText={setVillage} icon="home" />
              <EditField label="Teacher Name" value={teacherName} onChangeText={setTeacherName} icon="user" />
              <EditField label="Teacher Contact" value={teacherContact} onChangeText={setTeacherContact} icon="phone" keyboardType="phone-pad" />

              <View style={tw`flex-row gap-3 mt-5`}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  disabled={isSaving}
                  style={tw`flex-1 border border-slate-200 py-4 rounded-3xl items-center justify-center`}
                >
                  <Text style={tw`text-slate-500 font-extrabold text-sm`}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  style={tw`flex-1 bg-purple-600 py-4 rounded-3xl items-center justify-center shadow-sm`}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={tw`text-white font-extrabold text-sm`}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Academic Details */}
              <ProfileCard title="Academic Details" icon="graduation-cap">
                <DetailRow label="School Name" value={user?.schoolName} icon="book-open" />
                <DetailRow label="Standard (Std.)" value={user?.std} icon="layers" />
              </ProfileCard>

              {/* Personal Details */}
              <ProfileCard title="Personal Details" icon="user">
                <DetailRow label="Age" value={user?.age ? `${user.age} Years Old` : 'N/A'} icon="calendar" />
                <DetailRow label="Mobile Number" value={user?.mobile} icon="phone" />
              </ProfileCard>

              {/* Address Details */}
              <ProfileCard title="Address Details" icon="map-marker-alt">
                <DetailRow label="District" value={user?.district} icon="map" />
                <DetailRow label="Taluka (Tq.)" value={user?.taluka} icon="compass" />
                <DetailRow label="Village" value={user?.village} icon="home" />
              </ProfileCard>

              {/* Teacher Information */}
              <ProfileCard title="Teacher Info" icon="user-check">
                <DetailRow label="Teacher Name" value={user?.teacherName} icon="user" />
                <DetailRow label="Teacher Contact" value={user?.teacherContact} icon="phone" />
              </ProfileCard>
            </>
          )}

          {/* About App Button */}
          {!isEditing && (
            <TouchableOpacity
              onPress={() => router.push('/about')}
              style={tw`w-full bg-white border border-slate-100 py-4 px-5 rounded-3xl flex-row items-center justify-between mt-4 shadow-sm`}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <Feather name="info" size={16} style={tw`text-purple-600`} />
                <Text style={tw`text-slate-700 font-extrabold text-sm`}>About App</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleLogout}
              style={tw`w-full bg-rose-50 border border-rose-200 py-4.5 rounded-3xl flex-row items-center justify-center gap-2 mt-4 shadow-sm`}
            >
              <Feather name="log-out" size={16} style={tw`text-rose-600`} />
              <Text style={tw`text-rose-600 font-extrabold text-sm`}>Logout Account</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </View>
  );
}
