import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-[#f6f7fb]`}>
      {/* Custom Header */}
      <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-12 rounded-b-3xl items-center relative overflow-hidden`}>
        <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-25%', left: '-15%' }]} />
        <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-35%', right: '-15%' }]} />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`absolute left-6 top-14 w-10 h-10 rounded-2xl bg-white/10 items-center justify-center border border-white/10 z-20`}
        >
          <Feather name="arrow-left" size={18} color="#ffffff" />
        </TouchableOpacity>

        {/* Logo/Icon */}
        <View style={tw`w-16 h-16 rounded-3xl bg-purple-500/10 border-2 border-purple-500/30 items-center justify-center mb-4 relative z-10`}>
          <FontAwesome5 name="university" size={26} color="#c084fc" />
        </View>

        <Text style={tw`text-2xl font-black text-white relative z-10`}>NyayNiti Exam Portal</Text>
        <Text style={tw`text-slate-400 text-xs text-center mt-2 px-8 relative z-10`}>
          Version 1.0.0 • Premium Assessment Platform
        </Text>
      </View>

      <ScrollView style={tw`flex-1 px-6 mt-6`} contentContainerStyle={tw`pb-12`}>
        {/* About Info Card */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="globe" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>About the Platform</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed mb-4`}>
            NyayNiti Exam Portal is a state-of-the-art educational application designed to prepare scholars for competitive exams, assessments, and grade evaluations. 
          </Text>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed`}>
            Scholars can take custom standard-specific assessments, access detailed explanations for each question, track score percentages, and download verified certificates of achievement directly.
          </Text>
        </View>

        {/* Developer Attribution Card */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="code" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>Credits</Text>
          </View>
          
          <View style={tw`items-center py-5 bg-purple-50/40 rounded-2xl border border-purple-100/50`}>
            <View style={tw`w-12 h-12 rounded-2xl bg-purple-100 items-center justify-center mb-3`}>
              <Feather name="heart" size={20} color="#7c3aed" />
            </View>
            <Text style={tw`text-[10px] font-black uppercase tracking-wider text-slate-400`}>Developed & Designed By</Text>
            <Text style={tw`text-lg font-black text-purple-700 mt-1`}>Pooja Mandale</Text>
            <Text style={tw`text-slate-500 text-[10px] font-bold mt-1`}>NyayNiti Creative Team</Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="shield" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>Security & Terms</Text>
          </View>
          <Text style={tw`text-slate-500 text-[11px] font-semibold leading-normal`}>
            All transactions and user profile details are safely encrypted and handled directly by the NyayNiti administrative servers. For questions or complaints, please navigate to the Support tab.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
