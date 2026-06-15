import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image, Linking } from 'react-native';
import SafeStorage from '../../utils/storage';
import { useRouter, useFocusEffect } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { API_URLS, API_BASE_URL } from '../../constants/config';
import Sidebar from '../../components/Sidebar';
import socket from '../../utils/socket';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [zoomClasses, setZoomClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats calculation
  const [completedCount, setCompletedCount] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [rankIndex, setRankIndex] = useState('Top 10%');

  const fetchDashboardData = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    try {
      const token = await SafeStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Fetch user profile (with examResults, unlockedExams, paidCertificates)
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
      await SafeStorage.setItem('user', JSON.stringify(userData));

      // Calculate Stats
      const results = userData.examResults || [];
      setCompletedCount(results.length);
      if (results.length > 0) {
        const sum = results.reduce((acc: number, curr: any) => acc + curr.percentage, 0);
        setAvgScore(Math.round(sum / results.length));
      } else {
        setAvgScore(0);
      }

      // Fetch exams list
      const examsRes = await fetch(API_URLS.exams);
      if (!examsRes.ok) throw new Error('Failed to load exams');
      const examsData = await examsRes.json();
      setExams(examsData.data || examsData);

      // Fetch zoom classes list
      const zoomRes = await fetch(API_URLS.zoomClasses);
      if (zoomRes.ok) {
        const zoomData = await zoomRes.json();
        setZoomClasses(zoomData.data || zoomData);
      }

    } catch (error) {
      console.error('Fetch Dashboard Error:', error);
      Alert.alert('Error', (error as any).message || 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  // Fetch data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(true);
    }, [fetchDashboardData])
  );

  // Listen to socket events for real-time synchronization
  useEffect(() => {
    const handleSync = () => {
      fetchDashboardData(false);
    };

    socket.on('exam_added', handleSync);
    socket.on('exam_deleted', handleSync);
    socket.on('exam_updated', handleSync);
    socket.on('class_added', handleSync);
    socket.on('class_deleted', handleSync);

    return () => {
      socket.off('exam_added', handleSync);
      socket.off('exam_deleted', handleSync);
      socket.off('exam_updated', handleSync);
      socket.off('class_added', handleSync);
      socket.off('class_deleted', handleSync);
    };
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(false);
  };

  const handleExamClick = (exam: any, isFree: boolean, isUnlocked: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      // Completed, redirect to results view inside exam-taking screen
      router.push(`/take-exam/${exam._id}?viewResult=true`);
    } else if (isFree || isUnlocked) {
      // Free or already paid for, solve exam directly
      router.push(`/take-exam/${exam._id}`);
    } else {
      // Locked, open exam-taking screen which will trigger checkout payment sheets
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

  return (
    <View style={tw`flex-1`}>
      <ScrollView 
        style={tw`flex-1 bg-[#f6f7fb]`}
        contentContainerStyle={tw`pb-8`}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#7c3aed']} />
        }
      >
        {/* Dynamic Header */}
        <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-12 rounded-b-3xl relative overflow-hidden`}>
          <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-20%', left: '-20%' }]} />
          <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-30%', right: '-20%' }]} />

          <View style={tw`flex-row justify-between items-center mb-6 relative z-10`}>
            <View style={tw`flex-row items-center gap-3`}>
              <TouchableOpacity 
                onPress={() => setIsSidebarOpen(true)}
                style={tw`w-10 h-10 rounded-xl bg-white/10 border border-white/15 items-center justify-center`}
              >
                <Feather name="menu" size={20} color="#ffffff" />
              </TouchableOpacity>
              <View>
                <Text style={tw`text-slate-400 text-[10px] font-black uppercase tracking-wider`}>Welcome back,</Text>
                <Text style={tw`text-xl font-black text-white mt-0.5`}>{user?.name || 'Student'}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              style={tw`w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 items-center justify-center overflow-hidden`}
            >
              {user?.profilePic ? (
                <Image 
                  source={{ uri: `${API_BASE_URL}${user.profilePic}?t=${Date.now()}` }} 
                  style={tw`w-full h-full`} 
                  resizeMode="cover"
                />
              ) : (
                <FontAwesome5 name="user" size={18} color="#c084fc" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={tw`text-white/60 text-xs font-semibold relative z-10 leading-normal`}>
            School: <Text style={tw`text-white font-extrabold`}>{user?.schoolName || 'N/A'}</Text>{'  '}|{'  '}
            Std: <Text style={tw`text-white font-extrabold`}>{user?.std || 'N/A'}</Text>
          </Text>
        </View>

        {/* Stats Cards Section */}
        <View style={tw`px-6 -mt-6 z-20`}>
          <View style={tw`bg-white rounded-3xl p-5 shadow-md border border-slate-100/50 flex-row justify-between`}>
            {/* Stat 1 */}
            <View style={tw`items-center flex-1`}>
              <View style={tw`w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mb-2`}>
                <FontAwesome5 name="award" size={15} color="#7c3aed" />
              </View>
              <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Completed</Text>
              <Text style={tw`text-lg font-black text-slate-800 mt-0.5`}>{completedCount}</Text>
            </View>

            {/* Divider */}
            <View style={tw`w-px h-12 bg-slate-100 self-center`} />

            {/* Stat 2 */}
            <View style={tw`items-center flex-1`}>
              <View style={tw`w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mb-2`}>
                <FontAwesome5 name="percentage" size={14} color="#f43f5e" />
              </View>
              <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Avg. Score</Text>
              <Text style={tw`text-lg font-black text-slate-800 mt-0.5`}>{avgScore}%</Text>
            </View>

            {/* Divider */}
            <View style={tw`w-px h-12 bg-slate-100 self-center`} />

            {/* Stat 3 */}
            <View style={tw`items-center flex-1`}>
              <View style={tw`w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center mb-2`}>
                <FontAwesome5 name="trophy" size={14} color="#10b981" />
              </View>
              <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Rank Index</Text>
              <Text style={tw`text-lg font-black text-slate-800 mt-0.5`}>{rankIndex}</Text>
            </View>
          </View>
        </View>

        {/* Live Zoom Classes Section */}
        {(() => {
          const studentStd = user?.std ? user.std.toString().trim().toLowerCase() : '';
          const filteredClasses = zoomClasses.filter(cls => {
            if (!cls.std || cls.std === 'All') return true;
            if (!studentStd) return true; // Show all if standard is not defined
            
            const cleanStd = (str: string) => str.replace(/std|standard/g, '').replace(/th|st|nd|rd/g, '').trim().toLowerCase();
            return cleanStd(cls.std) === cleanStd(studentStd);
          });

          if (filteredClasses.length === 0) return null;

          return (
            <View style={tw`px-6 mt-8`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-black text-slate-800 tracking-tight`}>
                  Today's Live Classes
                </Text>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <View style={tw`w-2 h-2 rounded-full bg-rose-500`} />
                  <Text style={tw`text-xs font-bold text-rose-500 uppercase tracking-wider`}>Live / Upcoming</Text>
                </View>
              </View>

              {filteredClasses.map((cls) => {
                const start = new Date(cls.startTime);
                const end = new Date(cls.endTime);
                const isLive = new Date() >= start && new Date() <= end;
                
                const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const handleJoin = () => {
                  Linking.openURL(cls.zoomLink).catch(() => {
                    Alert.alert('Error', 'Unable to open Zoom link.');
                  });
                };

                return (
                  <View key={cls._id} style={tw`bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-4`}>
                    <View style={tw`flex-row justify-between items-start mb-3`}>
                      <View style={tw`flex-row gap-2`}>
                        <View style={[tw`border rounded-full px-2.5 py-1`, isLive ? tw`bg-rose-50 border-rose-100` : tw`bg-indigo-50 border-indigo-100`]}>
                          <Text style={[tw`text-[9px] font-black uppercase tracking-wide`, isLive ? tw`text-rose-600` : tw`text-indigo-600`]}>
                            {isLive ? 'LIVE NOW' : 'Upcoming'}
                          </Text>
                        </View>
                        
                        <View style={tw`bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1`}>
                          <Text style={tw`text-[9px] font-black text-slate-600 uppercase tracking-wide`}>
                            {cls.std === 'All' ? 'General' : `${cls.std} Std`}
                          </Text>
                        </View>
                      </View>

                      <View style={tw`flex-row items-center gap-1.5`}>
                        <Feather name="clock" size={12} style={tw`text-indigo-500`} />
                        <Text style={tw`text-xs font-bold text-slate-500`}>
                          {startStr} - {endStr}
                        </Text>
                      </View>
                    </View>

                    <Text style={tw`text-base font-extrabold text-slate-800 tracking-tight leading-snug mb-4`}>
                      {cls.subject}
                    </Text>

                    <TouchableOpacity
                      onPress={handleJoin}
                      style={[
                        tw`w-full py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`,
                        isLive ? { backgroundColor: '#f43f5e' } : { backgroundColor: '#0d0b2a' }
                      ]}
                    >
                      <Feather name="video" size={14} color="#ffffff" />
                      <Text style={tw`text-white font-extrabold text-xs`}>
                        Join Zoom Class
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {/* Available Exams Section */}
        <View style={tw`px-6 mt-8`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`text-lg font-black text-slate-800 tracking-tight`}>
              Available Exams
            </Text>
            <View style={tw`flex-row items-center gap-1.5`}>
              <FontAwesome5 name="shield-alt" size={11} color="#6366f1" />
              <Text style={tw`text-xs font-bold text-indigo-500 uppercase tracking-wider`}>Secure Portal</Text>
            </View>
          </View>

          {(() => {
            const studentStd = user?.std ? user.std.toString().trim().toLowerCase() : '';
            const filteredExams = exams.filter(exam => {
              if (!studentStd) return true; // Show all if user standard is not set
              if (!exam.std) return false;  // Hide legacy exams with no standard if user standard is set
              
              const examStd = exam.std.toString().trim().toLowerCase();
              
              const cleanStd = (str: string) => {
                return str
                  .replace(/std|standard/g, '')
                  .replace(/th|st|nd|rd/g, '')
                  .trim();
              };

              return cleanStd(examStd) === cleanStd(studentStd);
            });

            if (filteredExams.length === 0) {
              return (
                <View style={tw`bg-white rounded-3xl p-8 border border-slate-100 shadow-sm items-center`}>
                  <FontAwesome5 name="calendar-times" size={40} color="#94a3b8" style={tw`mb-3`} />
                  <Text style={tw`text-slate-500 font-semibold text-center text-sm`}>
                    No exams available for your standard ({studentStd || 'N/A'}) right now. Check back later!
                  </Text>
                </View>
              );
            }

            return filteredExams.map((exam, idx) => {
              // Logic to determine statuses:
              // 1. Is Completed?
              const solvedRecord = user?.examResults?.find((res: any) => res.examId === exam._id);
              const isCompleted = !!solvedRecord;
              
              // 2. Is Free? (First exam in list is free if user has 0 completed exams, or general free configuration)
              const isFree = idx === 0 && completedCount === 0;

              // 3. Is Unlocked?
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
                          <Text style={tw`text-[10px] font-black text-purple-600 uppercase tracking-wide`}>1st Exam Free</Text>
                        </View>
                      ) : isUnlocked ? (
                        <View style={tw`bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                          <Feather name="unlock" size={10} color="#6366f1" />
                          <Text style={tw`text-[10px] font-black text-indigo-600 uppercase tracking-wide`}>Unlocked</Text>
                        </View>
                      ) : (
                        <View style={tw`bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 flex-row items-center gap-1`}>
                          <Feather name="lock" size={10} color="#d97706" />
                          <Text style={tw`text-[10px] font-black text-amber-600 uppercase tracking-wide`}>Paid Exam (₹99)</Text>
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
                      <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wider`}>Total Questions</Text>
                      <Text style={tw`text-xs font-extrabold text-slate-700 mt-0.5`}>{exam.questions?.length || 0} Questions</Text>
                    </View>
                    <View>
                      <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wider`}>Max Marks</Text>
                      <Text style={tw`text-xs font-extrabold text-slate-700 mt-0.5`}>{exam.totalMarks} Marks</Text>
                    </View>

                    {/* Dynamic Action Button */}
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
            });
          })()}
        </View>
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
    </View>
  );
}
