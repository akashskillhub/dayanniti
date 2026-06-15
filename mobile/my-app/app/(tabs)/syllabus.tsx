import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Modal, Image, Platform, Linking } from 'react-native';
import SafeStorage from '../../utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import tw from 'twrnc';
import { Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { API_URLS, API_BASE_URL } from '../../constants/config';
import * as FileSystem from 'expo-file-system';

import Sidebar from '../../components/Sidebar';
import socket from '../../utils/socket';

export default function SyllabusScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // PDF viewer state
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUri, setPdfUri] = useState<string>('');
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStd, setSelectedStd] = useState('All');

  const standards = ['All', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  const fetchSyllabusData = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Fetch user profile to get std default
      const profileRes = await fetch(API_URLS.profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileRes.ok) {
        const userData = await profileRes.json();
        setUser(userData);
        if (userData?.std && selectedStd === 'All') {
          const cleanStd = userData.std.replace(/std|standard/g, '').trim();
          setSelectedStd(cleanStd);
        }
      }

      // Fetch syllabus list
      const res = await fetch(API_URLS.syllabus);
      if (!res.ok) throw new Error('Failed to load syllabus items');
      const data = await res.json();
      setSyllabusList(data);

    } catch (error) {
      console.error('Fetch Syllabus Error:', error);
      Alert.alert('Error', (error as any).message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router, selectedStd]);

  useFocusEffect(
    useCallback(() => {
      fetchSyllabusData(true);
    }, [fetchSyllabusData])
  );

  // Listen to socket events for real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      fetchSyllabusData(false);
    };

    socket.on('syllabus_added', handleSync);
    socket.on('syllabus_deleted', handleSync);

    return () => {
      socket.off('syllabus_added', handleSync);
      socket.off('syllabus_deleted', handleSync);
    };
  }, [fetchSyllabusData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSyllabusData(false);
  };

  const handleViewSyllabus = async (item: any) => {
    try {
      if (!item?.pdfUrl) {
        Alert.alert('File Error', 'No PDF file associated with this syllabus item.');
        return;
      }
      const fullUrl = item.pdfUrl?.startsWith('http') ? item.pdfUrl : `${API_BASE_URL}${item.pdfUrl}`;
      // Use Google Docs viewer on Android for better PDF support
      let viewerUrl = fullUrl;
      if (Platform.OS === 'android') {
        viewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(fullUrl)}`;
      }
      // Open the PDF URL using Linking for all platforms
      Linking.openURL(viewerUrl);
    } catch (error) {
      Alert.alert('View Error', 'Failed to open document.');
      console.error(error);
    }
  };

  // Download PDF with logo for mobile platforms
  const handleDownloadPdf = async (item: any) => {
    try {
      if (!item?.pdfUrl) {
        Alert.alert('File Error', 'No PDF file associated with this syllabus item.');
        return;
      }
      const fullUrl = item.pdfUrl?.startsWith('http') ? item.pdfUrl : `${API_BASE_URL}${item.pdfUrl}`;
      // Load logo asset
      const logoAsset = Asset.fromModule(require('../../assets/images/logo.png'));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri || logoAsset.uri;
      // Create simple HTML with logo and embedded PDF (iframe)
      const html = `
        <html>
          <body style="font-family: sans-serif; margin:0; padding:0;">
            <div style="text-align:center; margin:20px;">
              <img src="${logoUri}" style="width:120px; height:auto;" />
            </div>
            <iframe src="${fullUrl}" style="width:100%; height:90vh; border:none;"></iframe>
          </body>
        </html>`;
      const { uri } = await Print.printToFileAsync({ html });
      // Share the generated PDF so user can save or print
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Download Syllabus PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      Alert.alert('Download Error', 'Failed to generate or share PDF.');
      console.error(error);
    }
  };


  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#f6f7fb]`}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // Filter syllabus based on search and selected class standard
  const filteredSyllabus = syllabusList.filter((item) => {
    // 1. Standard filter check
    if (selectedStd !== 'All') {
      if (!item.std) return false;
      const cleanStd = (str: string) => str.replace(/std|standard/g, '').replace(/th|st|nd|rd/g, '').trim().toLowerCase();
      if (cleanStd(item.std) !== cleanStd(selectedStd)) return false;
    }
    
    // 2. Search query check
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const subjectMatches = item.subject?.toLowerCase().includes(query);
      const pdfMatches = item.pdfName?.toLowerCase().includes(query);
      return subjectMatches || pdfMatches;
    }

    return true;
  });

  return (
    <View style={tw`flex-1 bg-[#f6f7fb]`}>
      {/* Header Banner */}
      <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-8 rounded-b-3xl relative overflow-hidden`}>
        <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-20%', left: '-20%' }]} />
        <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-30%', right: '-20%' }]} />

        <View style={tw`flex-row justify-between items-center mb-4 relative z-10`}>
          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity 
              onPress={() => setIsSidebarOpen(true)}
              style={tw`w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center`}
            >
              <Feather name="menu" size={20} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text style={tw`text-slate-400 text-[10px] font-black uppercase tracking-wider`}>Subject guidelines & syllabus</Text>
              <Text style={tw`text-xl font-black text-white mt-0.5`}>Syllabus Library</Text>
            </View>
          </View>
        </View>

        {/* Search Bar Input */}
        <View style={tw`flex-row items-center bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 mt-3 relative z-10`}>
          <Feather name="search" size={16} color="#94a3b8" style={tw`mr-3`} />
          <TextInput
            placeholder="Search syllabus by subject or file name..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={tw`flex-1 text-sm font-semibold text-white p-0`}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scroll container */}
      <ScrollView 
        style={tw`flex-1 mt-4 px-6`}
        contentContainerStyle={tw`pb-12`}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#7c3aed']} />
        }
      >
        {/* Horizontal Standard Pills */}
        <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3`}>
          Filter by Class Standard:
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={tw`pb-5`}
        >
          {standards.map((stdName) => {
            const isActive = selectedStd.toLowerCase() === stdName.toLowerCase();
            return (
              <TouchableOpacity
                key={stdName}
                onPress={() => setSelectedStd(stdName)}
                style={[
                  tw`px-5 py-2.5 rounded-full border border-slate-200 bg-white mr-2.5 shadow-sm`,
                  isActive && tw`bg-purple-600 border-purple-600`
                ]}
              >
                <Text style={[tw`text-xs font-extrabold text-slate-600`, isActive && tw`text-white font-black`]}>
                  {stdName === 'All' ? 'All Standards' : `${stdName} Std`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Syllabus Cards Grid */}
        <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4`}>
          Published Syllabus Files:
        </Text>

        {filteredSyllabus.length === 0 ? (
          <View style={tw`bg-white rounded-3xl p-10 border border-slate-100 shadow-sm items-center mt-2`}>
            <Feather name="file-text" size={42} color="#94a3b8" style={tw`mb-3`} />
            <Text style={tw`text-slate-500 font-extrabold text-center text-sm`}>No Syllabus Found</Text>
            <Text style={tw`text-slate-400 text-xs text-center mt-1 px-4 leading-normal`}>
              There are no syllabus guidelines uploaded for standard "{selectedStd}" or matching search keyword.
            </Text>
          </View>
        ) : (
          filteredSyllabus.map((item) => (
            <View 
              key={item._id} 
              style={tw`bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-4 flex-col justify-between`}
            >
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-row gap-2`}>
                  <View style={tw`bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1`}>
                    <Text style={tw`text-[10px] font-black text-indigo-700 uppercase tracking-wide`}>
                      {item.std} Class
                    </Text>
                  </View>
                </View>
                <View style={tw`w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600`}>
                  <Feather name="file-text" size={16} />
                </View>
              </View>

              <Text style={tw`text-base font-extrabold text-slate-800 tracking-tight leading-snug truncate`}>
                {item.subject}
              </Text>
              <Text style={tw`text-slate-400 text-xs font-semibold mt-1 truncate mb-5`}>
                {item.pdfName || 'guideline_syllabus.pdf'}
              </Text>

              <View style={tw`flex-row gap-3 pt-3 border-t border-slate-55`}>
                <View style={tw`flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={() => handleViewSyllabus(item)}
                    style={tw`flex-1 py-3.5 bg-purple-600 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`}
                  >
                    <Feather name="eye" size={14} color="#ffffff" />
                    <Text style={tw`text-white font-extrabold text-xs`}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDownloadPdf(item)}
                    style={tw`flex-1 py-3.5 bg-green-600 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`}
                  >
                    <Feather name="download" size={14} color="#ffffff" />
                    <Text style={tw`text-white font-extrabold text-xs`}>Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Drawer Menu overlay */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </View>
  );
}
