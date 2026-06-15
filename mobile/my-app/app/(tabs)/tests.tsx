import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import SafeStorage from '../../utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { API_URLS } from '../../constants/config';
import Sidebar from '../../components/Sidebar';
import socket from '../../utils/socket';

export default function ExamsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStd, setSelectedStd] = useState('All');

  const standards = ['All', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  const fetchExamsData = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Fetch user profile (to verify std & unlocked status)
      const profileRes = await fetch(API_URLS.profile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          await SafeStorage.clear();
          router.replace('/login');
          return;
        }
        throw new Error('Failed to load profile data');
      }

      const userData = await profileRes.json();
      setUser(userData);
      
      // Default to user's class std on first load
      if (userData?.std && selectedStd === 'All') {
        const cleanStd = userData.std.replace(/std|standard/g, '').trim();
        setSelectedStd(cleanStd);
      }

      // Fetch exams list
      const examsRes = await fetch(API_URLS.exams);
      if (!examsRes.ok) throw new Error('Failed to load exams');
      const examsData = await examsRes.json();
      setExams(examsData.data || examsData);

    } catch (error) {
      console.error('Fetch Exams Error:', error);
      Alert.alert('Error', (error as any).message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router, selectedStd]);

  useFocusEffect(
    useCallback(() => {
      fetchExamsData(true);
    }, [fetchExamsData])
  );

  // Listen to socket events for real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      fetchExamsData(false);
    };

    socket.on('exam_added', handleSync);
    socket.on('exam_deleted', handleSync);
    socket.on('exam_updated', handleSync);

    return () => {
      socket.off('exam_added', handleSync);
      socket.off('exam_deleted', handleSync);
      socket.off('exam_updated', handleSync);
    };
  }, [fetchExamsData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchExamsData(false);
  };

  const handleExamClick = (exam: any, isFree: boolean, isUnlocked: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      router.push(`/take-exam/${exam._id}?viewResult=true`);
    } else if (isFree || isUnlocked) {
      router.push(`/take-exam/${exam._id}`);
    } else {
      router.push(`/take-exam/${exam._id}?triggerCheckout=true`);
    }
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#f6f7fb]`}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // Filter exams based on Search query & selected standard class
  const filteredExams = exams.filter((exam, idx) => {
    // 1. Standard filter check
    if (selectedStd !== 'All') {
      if (!exam.std) return false;
      
      const cleanStd = (str: string) => str.replace(/std|standard/g, '').replace(/th|st|nd|rd/g, '').trim().toLowerCase();
      if (cleanStd(exam.std) !== cleanStd(selectedStd)) return false;
    }
    
    // 2. Search query check
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const titleMatches = exam.title?.toLowerCase().includes(query);
      const descMatches = exam.description?.toLowerCase().includes(query);
      return titleMatches || descMatches;
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
              <Text style={tw`text-slate-400 text-[10px] font-black uppercase tracking-wider`}>Secure assessment bank</Text>
              <Text style={tw`text-xl font-black text-white mt-0.5`}>Exam Bank</Text>
            </View>
          </View>
        </View>

        {/* Search Bar Input */}
        <View style={tw`flex-row items-center bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 mt-3 relative z-10`}>
          <Feather name="search" size={16} color="#94a3b8" style={tw`mr-3`} />
          <TextInput
            placeholder="Search exams by subject or topic..."
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

      {/* Main content scroll container */}
      <ScrollView 
        style={tw`flex-1 mt-4 px-6`}
        contentContainerStyle={tw`pb-12`}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#7c3aed']} />
        }
      >
        {/* Horizontal Standard Filter Pills */}
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

        {/* Exams Grid */}
        <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4`}>
          Available Test Sheets:
        </Text>

        {filteredExams.length === 0 ? (
          <View style={tw`bg-white rounded-3xl p-10 border border-slate-100 shadow-sm items-center mt-2`}>
            <Feather name="calendar" size={42} color="#94a3b8" style={tw`mb-3`} />
            <Text style={tw`text-slate-500 font-extrabold text-center text-sm`}>No Exams Found</Text>
            <Text style={tw`text-slate-400 text-xs text-center mt-1 px-4 leading-normal`}>
              There are no exams matching standard "{selectedStd}" or search criteria "{searchQuery}" right now.
            </Text>
          </View>
        ) : (
          filteredExams.map((exam, idx) => {
            const solvedRecord = user?.examResults?.find((res: any) => res.examId === exam._id);
            const isCompleted = !!solvedRecord;
            
            // First exam is free if user has 0 completed exams
            const completedCount = user?.examResults?.length || 0;
            const isFree = idx === 0 && completedCount === 0;
            const isUnlocked = isFree || user?.unlockedExams?.includes(exam._id);

            return (
              <View 
                key={exam._id} 
                style={tw`bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-4 relative overflow-hidden`}
              >
                {/* Visual Status Ribbons */}
                <View style={tw`flex-row justify-between items-start mb-3`}>
                  <View style={tw`flex-row gap-2`}>
                    {isCompleted ? (
                      <View style={tw`bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                        <Feather name="check" size={10} color="#10b981" />
                        <Text style={tw`text-[10px] font-black text-emerald-600 uppercase tracking-wide`}>Solved</Text>
                      </View>
                    ) : isFree ? (
                      <View style={tw`bg-purple-50 border border-purple-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                        <FontAwesome5 name="gift" size={9} color="#7c3aed" />
                        <Text style={tw`text-[10px] font-black text-purple-600 uppercase tracking-wide`}>1st Free</Text>
                      </View>
                    ) : isUnlocked ? (
                      <View style={tw`bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                        <Feather name="unlock" size={10} color="#6366f1" />
                        <Text style={tw`text-[10px] font-black text-indigo-600 uppercase tracking-wide`}>Unlocked</Text>
                      </View>
                    ) : (
                      <View style={tw`bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                        <Feather name="lock" size={10} color="#d97706" />
                        <Text style={tw`text-[10px] font-black text-amber-600 uppercase tracking-wide`}>Premium (₹99)</Text>
                      </View>
                    )}

                    {exam.std && (
                      <View style={tw`bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 flex-row items-center`}>
                        <Text style={tw`text-[9px] font-black text-indigo-650 uppercase tracking-wide`}>{exam.std} Class</Text>
                      </View>
                    )}
                  </View>

                  <View style={tw`flex-row items-center gap-1.5`}>
                    <Feather name="clock" size={12} style={tw`text-slate-400`} />
                    <Text style={tw`text-xs font-bold text-slate-500`}>{exam.duration} mins</Text>
                  </View>
                </View>

                {/* Exam Title & Details */}
                <Text style={tw`text-base font-extrabold text-slate-800 tracking-tight leading-snug`}>
                  {exam.title}
                </Text>
                <Text style={tw`text-slate-500 text-xs font-semibold mt-1 leading-normal`} numberOfLines={2}>
                  {exam.description || 'Practice scholarship questions, mental ability, and speed analytics.'}
                </Text>

                {/* Subtitle Details */}
                <View style={tw`flex-row justify-between items-center mt-5 pt-4 border-t border-slate-100`}>
                  <View>
                    <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wider`}>Questions</Text>
                    <Text style={tw`text-xs font-extrabold text-slate-700 mt-0.5`}>{exam.questions?.length || 0} Qs</Text>
                  </View>
                  <View>
                    <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wider`}>Max Marks</Text>
                    <Text style={tw`text-xs font-extrabold text-slate-700 mt-0.5`}>{exam.totalMarks} Marks</Text>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={() => handleExamClick(exam, isFree, isUnlocked, isCompleted)}
                    style={[
                      tw`px-5 py-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm`,
                      isCompleted 
                        ? { backgroundColor: '#10b981' } 
                        : isUnlocked 
                          ? { backgroundColor: '#7c3aed' }
                          : { backgroundColor: '#d97706' }
                    ]}
                  >
                    <Text style={tw`text-white font-extrabold text-xs`}>
                      {isCompleted ? 'Certificate' : isUnlocked ? 'Solve Exam' : 'Unlock (₹99)'}
                    </Text>
                    <Feather 
                      name={isCompleted ? 'award' : isUnlocked ? 'chevron-right' : 'lock'} 
                      size={12} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Drawer Menu overlay */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </View>
  );
}
