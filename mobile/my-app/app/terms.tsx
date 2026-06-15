import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

export default function TermsScreen() {
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
          <FontAwesome5 name="file-contract" size={24} color="#c084fc" />
        </View>

        <Text style={tw`text-2xl font-black text-white relative z-10`}>Terms & Conditions</Text>
        <Text style={tw`text-slate-400 text-xs text-center mt-2 px-8 relative z-10`}>
          Last Updated: June 2026 • Legal Guidelines
        </Text>
      </View>

      <ScrollView style={tw`flex-1 px-6 mt-6`} contentContainerStyle={tw`pb-12`}>
        
        {/* Section 1 */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="info" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>1. Acceptance of Terms</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed`}>
            By creating an account, registering, or logging in on the DNYANNITI platform, you agree to comply with and be bound by these legal terms. If you do not agree, you must immediately terminate use of this application.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="user-check" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>2. Student Account Integrity</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed mb-3`}>
            Students are responsible for maintaining the confidentiality of their login credentials (email and password). 
          </Text>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed`}>
            Any assessment solved from an account will be deemed to have been executed by the account owner. Sharing access codes or tokens is strictly prohibited and can result in profile ban.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="award" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>3. Assessment Guidelines</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed mb-3`}>
            Assessments on the DNYANNITI portal simulate real examination patterns. Cheating, copying, or attempting to capture screen items to distribute questions will result in immediate disqualification and voiding of certificate.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="credit-card" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>4. Unlock Payments & Refunds</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed mb-3`}>
            Premium timed tests are unlocked via single payment fees of ₹99. Achievement certificates are unlocked at ₹199.
          </Text>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed`}>
            All fees are strictly non-refundable once the target items have been unlocked and made available to the profile.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={tw`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm`}>
          <View style={tw`flex-row items-center gap-3 mb-4 pb-3 border-b border-slate-100`}>
            <Feather name="shield" size={16} color="#7c3aed" />
            <Text style={tw`font-black text-slate-800 text-base tracking-tight`}>5. Data & Privacy Policy</Text>
          </View>
          <Text style={tw`text-slate-600 text-xs font-semibold leading-relaxed`}>
            We value your privacy. Your demographic parameters (district, school, standard) are used strictly for scholarship analytics. User phone details and profiles are securely handled by DNYANNITI Training and Research servers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
