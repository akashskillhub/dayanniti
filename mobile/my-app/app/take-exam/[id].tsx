import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import SafeStorage from '../../utils/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from 'twrnc';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { API_URLS } from '../../constants/config';

export default function TakeExamScreen() {
  const { id, viewResult, triggerCheckout } = useLocalSearchParams();
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Locking & Payment State
  const [isLocked, setIsLocked] = useState(false);
  const [hasPaidCertificate, setHasPaidCertificate] = useState(false);

  // Custom Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmText, setModalConfirmText] = useState('Confirm');
  const [modalIsAlertOnly, setModalIsAlertOnly] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => () => {});

  const showCustomAlert = (title: string, message: string, onConfirm?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnConfirm(() => onConfirm || (() => {}));
    setModalConfirmText('OK');
    setModalIsAlertOnly(true);
    setModalVisible(true);
  };

  const showCustomConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirm') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnConfirm(() => onConfirm);
    setModalConfirmText(confirmText);
    setModalIsAlertOnly(false);
    setModalVisible(true);
  };

  const renderCustomModal = () => {
    if (!modalVisible) return null;
    return (
      <View style={[tw`absolute inset-0 bg-slate-900/60 items-center justify-center z-50 px-6`, { elevation: 999 }]}>
        <View style={tw`bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-xl items-center`}>
          <View style={tw`w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mb-4`}>
            <Feather name={modalIsAlertOnly ? "check-circle" : "help-circle"} size={24} color="#7c3aed" />
          </View>
          <Text style={tw`text-lg font-black text-slate-800 text-center`}>{modalTitle}</Text>
          <Text style={tw`text-slate-505 text-xs text-center mt-2 leading-normal`}>{modalMessage}</Text>
          
          <View style={tw`flex-row gap-3 mt-6 w-full`}>
            {!modalIsAlertOnly && (
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={tw`flex-1 border border-slate-200 py-3.5 rounded-xl items-center justify-center`}
              >
                <Text style={tw`text-slate-500 font-bold text-xs`}>Cancel</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                modalOnConfirm();
              }}
              style={[tw`py-3.5 rounded-xl items-center justify-center shadow-sm`, modalIsAlertOnly ? tw`w-full` : tw`flex-1`, { backgroundColor: '#7c3aed' }]}
            >
              <Text style={tw`text-white font-extrabold text-xs`}>{modalConfirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await SafeStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // 1. Fetch Profile to get unlocked details
      const profileRes = await fetch(API_URLS.profile, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) throw new Error('Failed to load profile');
      const profileData = await profileRes.json();
      setUser(profileData);
      await SafeStorage.setItem('user', JSON.stringify(profileData));

      // Check if certificate is already paid
      if (profileData.paidCertificates?.includes(id)) {
        setHasPaidCertificate(true);
      }

      // 2. Fetch Exam details
      const examRes = await fetch(`${API_URLS.exams}/${id}`);
      if (!examRes.ok) throw new Error('Exam not found');
      const examData = await examRes.json();
      const actualExam = examData.data || examData;
      setExam(actualExam);
      setTimeLeft(actualExam.duration * 60);

      // Check if user has already solved this exam
      const existingResult = profileData.examResults?.find((r: any) => r.examId === id);
      if (existingResult) {
        setIsSubmitted(true);
        setScore(existingResult.score);
        setIsLoading(false);
        return;
      }

      // If specified, skip checks and show results (if they solved it)
      if (viewResult === 'true') {
        setIsSubmitted(true);
        setIsLoading(false);
        return;
      }

      // 3. Determine if the exam is locked
      // Fetch all exams to find index of current exam
      const allExamsRes = await fetch(API_URLS.exams);
      const allExams = await allExamsRes.json();
      const allExamsList = allExams.data || allExams;

      // Filter allExamsList by user standard to align indices with the dashboard view
      const studentStd = profileData.std ? profileData.std.toString().trim().toLowerCase() : '';
      const filteredExamsList = allExamsList.filter((e: any) => {
        if (!studentStd) return true;
        if (!e.std) return false;
        
        const examStd = e.std.toString().trim().toLowerCase();
        const cleanStd = (str: string) => {
          return str
            .replace(/std|standard/g, '')
            .replace(/th|st|nd|rd/g, '')
            .trim();
        };

        return cleanStd(examStd) === cleanStd(studentStd);
      });

      const currentIdx = filteredExamsList.findIndex((e: any) => e._id === id);

      const completedCount = profileData.examResults?.length || 0;
      // First exam is free if they have 0 completed exams.
      const isFirstExamFree = currentIdx === 0 && completedCount === 0;
      const isAlreadyUnlocked = profileData.unlockedExams?.includes(id);

      if (!isFirstExamFree && !isAlreadyUnlocked) {
        setIsLocked(true);
        if (triggerCheckout === 'true') {
          handlePaymentDirect('exam');
        }
      }
    } catch (error) {
      console.error('Fetch Exam Detail Error:', error);
      showCustomAlert('Error', (error as any).message || 'Unable to load exam details.', () => router.back());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Timer Effect
  useEffect(() => {
    if (timeLeft === null || isSubmitted || isLocked) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted, isLocked]);

  const handleAutoSubmit = () => {
    if (Platform.OS === 'web') {
      window.alert('Your exam time has expired. Submitting your answers automatically.');
      submitExam();
    } else {
      Alert.alert('Time is Up!', 'Your exam time has expired. Submitting your answers automatically.', [
        { text: 'OK', onPress: () => submitExam() }
      ]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectOption = (qIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  // Submit Exam Answers
  const submitExam = async () => {
    setIsLoading(true);
    let calculatedScore = 0;
    exam.questions.forEach((q: any, index: number) => {
      if ((answers as any)[index] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });

    const totalQuestions = exam.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((calculatedScore / totalQuestions) * 100) : 0;
    const passed = percentage >= 40; // 40% passing criteria

    try {
      const token = await SafeStorage.getItem('token');
      const res = await fetch(API_URLS.results, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          examId: id,
          score: calculatedScore,
          totalMarks: exam.totalMarks,
          percentage,
          passed
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save exam results on server');
      }

      setScore(calculatedScore);
      setIsSubmitted(true);
      showCustomAlert('Exam Submitted', `You scored ${calculatedScore}/${totalQuestions} (${percentage}%).`);
    } catch (error) {
      console.error('Submit Exam Error:', error);
      showCustomAlert('Error', `Completed locally but failed to save online: ${(error as any).message || error}`);
      setScore(calculatedScore);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Payment Gateway Direct Mock
  const handlePaymentDirect = async (type: 'exam' | 'certificate') => {
    setIsLoading(true);
    try {
      // Simulate network request delays
      await new Promise(resolve => setTimeout(resolve, 1500));

      const token = await SafeStorage.getItem('token');
      const isExamPayment = type === 'exam';

      const url = isExamPayment ? API_URLS.unlockExam : API_URLS.payCertificate;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ examId: id })
      });

      if (!res.ok) throw new Error('Transaction failed');

      // Update Local State
      if (isExamPayment) {
        setIsLocked(false);
        showCustomAlert('Payment Successful', 'Exam has been successfully unlocked! Good Luck.', () => fetchData());
      } else {
        setHasPaidCertificate(true);
        showCustomAlert('Payment Successful', 'Certificate unlocked! Preparing your PDF...', () => generateCertificatePDF());
      }
    } catch (error) {
      console.error('Payment Error:', error);
      showCustomAlert('Transaction Failed', 'Payment gateway rejected the request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJsPDF = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).jspdf) {
        resolve((window as any).jspdf.jsPDF);
        return;
      }
      if (typeof document === 'undefined') {
        reject(new Error('Document is undefined'));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).jspdf) {
          resolve((window as any).jspdf.jsPDF);
        } else {
          reject(new Error('jsPDF failed to load from script'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF script'));
      document.body.appendChild(script);
    });
  };

  // Generate PDF Certificate
  const generateCertificatePDF = async () => {
    const totalQuestions = exam.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      if (Platform.OS === 'web') {
        const jsPDFConstructor = await loadJsPDF();
        const doc = new jsPDFConstructor({
          orientation: 'landscape',
          unit: 'pt',
          format: [800, 560]
        });

        // 1. Draw Gold Borders (Double Border matching web client)
        doc.setDrawColor(253, 230, 138); // #fde68a (light gold/amber)
        doc.setLineWidth(6);
        doc.rect(12, 12, 800 - 24, 560 - 24, 'S');

        doc.setLineWidth(2);
        doc.rect(22, 22, 800 - 44, 560 - 44, 'S');

        // 2. Title Section
        doc.setFont('times', 'bold');
        doc.setFontSize(38);
        doc.setTextColor(30, 41, 59); // #1e293b (slate-800)
        doc.text('Certificate', 400, 85, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(217, 119, 6); // #d97706 (amber-600)
        doc.text('of Achievement', 400, 112, { align: 'center' });

        // 3. Presentation Text
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(13);
        doc.setTextColor(100, 116, 139); // #64748b (slate-500)
        doc.text('This is proudly presented to', 400, 175, { align: 'center' });

        // 4. Student Name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(49, 46, 129); // #312e81 (indigo-900)
        doc.text(user?.name || 'Esteemed Scholar', 400, 220, { align: 'center' });

        // Underline matching web client
        doc.setDrawColor(224, 231, 255); // #e0e7ff (indigo-100)
        doc.setLineWidth(2);
        doc.line(220, 232, 580, 232);

        // 5. Details Section
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(71, 85, 105); // #475569 (slate-600)
        const examTitle = exam.title || '';
        const descText = `For successfully completing the exam "${examTitle}" with outstanding performance, obtaining ${score} correct answers out of ${totalQuestions} questions (${percentage}%).`;
        doc.text(descText, 400, 290, { align: 'center', maxWidth: 500 });

        // 6. Footer - Left (Date)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59); // #1e293b
        doc.text(dateStr, 180, 420, { align: 'center' });

        doc.setDrawColor(203, 213, 225); // #cbd5e1
        doc.setLineWidth(1);
        doc.line(120, 430, 240, 430);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text('DATE', 180, 445, { align: 'center' });

        // 7. Footer - Center (Seal)
        // Outer gold circle
        doc.setDrawColor(245, 158, 11); // #f59e0b
        doc.setFillColor(245, 158, 11);
        doc.circle(400, 415, 30, 'FD'); // radius 30

        // Inner circle
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.circle(400, 415, 26, 'S');

        // Checkmark icon
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(3);
        doc.line(390, 415, 397, 422);
        doc.line(397, 422, 412, 407);

        // 8. Footer - Right (Signature)
        doc.setFont('times', 'italic');
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59); // #1e293b
        doc.text('Admin Signature', 620, 418, { align: 'center' });

        doc.setDrawColor(203, 213, 225); // #cbd5e1
        doc.setLineWidth(1);
        doc.line(560, 430, 680, 430);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text('AUTHORIZED SIGNATURE', 620, 445, { align: 'center' });

        // Save PDF
        const filename = `${(exam.title || 'Certificate').replace(/\s+/g, '_')}_Certificate.pdf`;
        doc.save(filename);
      } else {
        // Native platform
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                color: #1e293b;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
              }
              .container {
                width: 90%;
                max-width: 800px;
                padding: 50px;
                border: 15px double #d97706;
                background-color: #ffffff;
                box-sizing: border-box;
                border-radius: 8px;
              }
              h1 {
                font-size: 48px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 5px;
                margin: 0 0 10px 0;
                color: #1e293b;
              }
              h2 {
                font-size: 22px;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: #d97706;
                margin: 0 0 40px 0;
              }
              .italic {
                font-style: italic;
                color: #64748b;
                font-size: 16px;
                margin-bottom: 15px;
              }
              .name {
                font-size: 34px;
                font-weight: bold;
                color: #4f46e5;
                border-bottom: 2px solid #e2e8f0;
                display: inline-block;
                padding-bottom: 8px;
                margin-bottom: 30px;
                min-width: 300px;
              }
              .details {
                font-size: 16px;
                line-height: 1.6;
                color: #475569;
                margin-bottom: 50px;
              }
              .bold {
                font-weight: bold;
                color: #0f172a;
              }
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 30px;
              }
              .signature-box {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .line {
                width: 150px;
                border-top: 1px solid #cbd5e1;
                margin-top: 5px;
                margin-bottom: 5px;
              }
              .title {
                font-size: 11px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .date {
                font-weight: bold;
                font-size: 14px;
              }
              .seal {
                font-size: 40px;
                color: #fbbf24;
                margin: 0 40px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>CERTIFICATE</h1>
              <h2>OF ACHIEVEMENT</h2>
              <p class="italic">This is proudly presented to</p>
              <div class="name">${user?.name || 'Esteemed Scholar'}</div>
              <p class="details">
                For successfully completing the exam <span class="bold">"${exam.title}"</span> with outstanding performance, obtaining <span class="bold">${score} correct answers</span> out of <span class="bold">${totalQuestions} questions</span> (${percentage}%).
              </p>
              <div class="footer">
                <div class="signature-box">
                  <span class="date">${dateStr}</span>
                  <div class="line"></div>
                  <span class="title">Date</span>
                </div>
                <div class="seal">★</div>
                <div class="signature-box">
                  <span style="font-style: italic; font-weight: bold; height: 18px;">Dnyanniti Admin</span>
                  <div class="line"></div>
                  <span class="title">Authorized Signature</span>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await Sharing.shareAsync(uri);
        } else {
          showCustomAlert('PDF Created', `PDF compiled. Location: ${uri}`);
        }
      }
    } catch (error) {
      console.error('Print Error:', error);
      showCustomAlert('PDF Generation Failed', 'Could not generate certificate PDF.');
    }
  };

  if (isLoading || !exam) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#f6f7fb]`}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  /* ─── 0. LOCKED EXAM VIEW ─── */
  if (isLocked) {
    return (
      <View style={tw`flex-1 bg-[#f6f7fb] justify-center items-center p-6`}>
        <View style={tw`bg-white rounded-3xl p-8 border border-slate-100 shadow-md items-center w-full max-w-sm`}>
          <View style={tw`w-16 h-16 rounded-2xl bg-amber-50 items-center justify-center mb-4`}>
            <Feather name="lock" size={28} color="#d97706" />
          </View>
          <Text style={tw`text-xl font-black text-slate-800 text-center`}>Exam is Locked</Text>
          <Text style={tw`text-slate-500 text-xs text-center mt-2 leading-normal`}>
            This is a premium exam. Please unlock it to start solving and generate your certificate.
          </Text>
          
          <TouchableOpacity
            onPress={() => handlePaymentDirect('exam')}
            style={[tw`w-full py-4 rounded-xl flex-row items-center justify-center gap-2 mt-6 shadow-sm`, { backgroundColor: '#7c3aed' }]}
          >
            <Feather name="shield" size={14} color="#ffffff" />
            <Text style={tw`text-white font-extrabold text-xs`}>Unlock Exam (₹99)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={tw`w-full border border-slate-200 py-3.5 rounded-xl items-center justify-center mt-2`}
          >
            <Text style={tw`text-slate-500 font-bold text-xs`}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
        {renderCustomModal()}
      </View>
    );
  }

  /* ─── 2. EXAM SUBMITTED / RESULTS VIEW ─── */
  if (isSubmitted) {
    const totalQuestions = exam.questions?.length || 0;
    const scoreVal = score;
    const percentage = totalQuestions > 0 ? Math.round((scoreVal / totalQuestions) * 100) : 0;
    const passed = percentage >= 40;

    return (
      <View style={tw`flex-1 bg-[#f6f7fb]`}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-12`}>
        {/* Results Banner */}
        <View style={tw`bg-[#0d0b2a] px-6 pt-16 pb-12 rounded-b-3xl items-center relative overflow-hidden`}>
          <View style={[tw`absolute w-64 h-64 rounded-full bg-purple-600 opacity-15`, { top: '-25%', left: '-15%' }]} />
          <View style={[tw`absolute w-64 h-64 rounded-full bg-cyan-500 opacity-10`, { bottom: '-35%', right: '-15%' }]} />

          <View style={[
            tw`w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg`,
            passed ? { backgroundColor: '#10b981' } : { backgroundColor: '#ef4444' }
          ]}>
            <Feather name={passed ? 'check-circle' : 'alert-triangle'} size={32} color="#ffffff" />
          </View>

          <Text style={tw`text-2xl font-black text-white`}>
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </Text>
          <Text style={tw`text-slate-400 text-xs font-semibold mt-1`}>{exam.title}</Text>
        </View>

        {/* Scoreboard Cards */}
        <View style={tw`px-6 -mt-6 z-20`}>
          <View style={tw`bg-white rounded-3xl p-5 shadow-md border border-slate-100/50 flex-row justify-between`}>
            <View style={tw`items-center flex-1`}>
              <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Correct Answers</Text>
              <Text style={tw`text-2xl font-black text-indigo-600 mt-1`}>{scoreVal} / {totalQuestions}</Text>
            </View>
            <View style={tw`w-px h-10 bg-slate-100 self-center`} />
            <View style={tw`items-center flex-1`}>
              <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Percentage Score</Text>
              <Text style={[tw`text-2xl font-black mt-1`, passed ? tw`text-emerald-500` : tw`text-rose-500`]}>
                {percentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Certificate Section */}
        {passed && (
          <View style={tw`mx-6 mt-6 bg-amber-50/50 border border-amber-100 rounded-3xl p-5 items-center`}>
            <FontAwesome5 name="award" size={32} color="#d97706" style={tw`mb-2`} />
            <Text style={tw`font-extrabold text-slate-800 text-sm`}>Achievement Certificate</Text>
            <Text style={tw`text-slate-500 text-xs text-center mt-1 leading-normal`}>
              Validate your skills! Collect the processing fee and download your official certificate.
            </Text>
            
            <TouchableOpacity
              onPress={() => hasPaidCertificate ? generateCertificatePDF() : handlePaymentDirect('certificate')}
              style={[tw`w-full py-3.5 mt-4 rounded-xl flex-row items-center justify-center gap-2 shadow-sm`, { backgroundColor: '#d97706' }]}
            >
              <Feather name="download" size={14} color="#ffffff" />
              <Text style={tw`text-white font-extrabold text-xs`}>
                {hasPaidCertificate ? 'Download Certificate PDF' : 'Get Certificate (₹199)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Answers Review */}
        <View style={tw`px-6 mt-6`}>
          <Text style={tw`text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-4`}>
            Review Questions
          </Text>

          {exam.questions?.map((q: any, idx: number) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;

            return (
              <View key={idx} style={tw`bg-white border border-slate-100 rounded-2xl p-4.5 mb-4 shadow-sm`}>
                <View style={tw`flex-row gap-3 items-start`}>
                  <View style={[
                    tw`w-6 h-6 rounded-full items-center justify-center mt-0.5`,
                    isCorrect ? tw`bg-emerald-50` : tw`bg-rose-50`
                  ]}>
                    <Text style={[tw`text-xs font-black`, isCorrect ? tw`text-emerald-600` : tw`text-rose-600`]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <Text style={tw`text-slate-800 font-extrabold text-sm flex-1 leading-snug`}>{q.questionText}</Text>
                </View>

                {/* Options List */}
                <View style={tw`mt-4 gap-2 pl-9`}>
                  {q.options.map((opt: string, oIdx: number) => {
                    const isUserSelected = userAnswer === opt;
                    const isActualCorrect = q.correctAnswer === opt;
                    
                    let bgCol = tw`bg-slate-50 border border-slate-100`;
                    let textCol = tw`text-slate-600`;

                    if (isActualCorrect) {
                      bgCol = tw`bg-emerald-50 border border-emerald-200`;
                      textCol = tw`text-emerald-800`;
                    } else if (isUserSelected && !isActualCorrect) {
                      bgCol = tw`bg-rose-50 border border-rose-200`;
                      textCol = tw`text-rose-800`;
                    }

                    return (
                      <View key={oIdx} style={[tw`p-3 rounded-xl flex-row justify-between items-center`, bgCol]}>
                        <Text style={[tw`text-xs font-semibold flex-1 pr-3`, textCol]}>{opt}</Text>
                        {isActualCorrect && <Feather name="check-circle" size={14} color="#10b981" />}
                        {isUserSelected && !isActualCorrect && <Feather name="x-circle" size={14} color="#ef4444" />}
                      </View>
                    );
                  })}
                </View>

                {/* Explanation */}
                {q.explanation && (
                  <View style={tw`mt-4 ml-9 p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl`}>
                    <Text style={tw`text-[9px] font-black text-indigo-500 uppercase tracking-wide mb-1`}>Explanation</Text>
                    <Text style={tw`text-[11px] font-semibold text-slate-600 leading-normal`}>{q.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={tw`mx-6 mt-4 py-4 rounded-2xl bg-white border border-slate-200 items-center justify-center flex-row gap-2`}
        >
          <Feather name="arrow-left" size={16} style={tw`text-slate-600`} />
          <Text style={tw`text-slate-600 font-extrabold text-sm`}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
      {renderCustomModal()}
    </View>
    );
  }

  /* ─── 3. EXAM SOLVING STATE ─── */
  return (
    <View style={tw`flex-1 bg-[#f6f7fb]`}>
      {/* Sticky Header with Timer */}
      <View style={tw`bg-white px-5 pt-14 pb-4 border-b border-slate-100 flex-row justify-between items-center shadow-sm`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2 -ml-2`}>
          <Feather name="arrow-left" size={20} style={tw`text-slate-800`} />
        </TouchableOpacity>

        <View style={tw`bg-slate-100 rounded-full px-4 py-2 flex-row items-center gap-2 border border-slate-200`}>
          <Feather name="clock" size={14} style={tw`text-slate-500`} />
          <Text style={tw`text-slate-700 font-black text-sm`}>{timeLeft !== null ? formatTime(timeLeft) : '00:00'}</Text>
        </View>
      </View>

      <ScrollView style={tw`flex-1 p-5`} contentContainerStyle={tw`pb-20`}>
        <Text style={tw`text-[10px] font-black text-purple-600 uppercase tracking-wider mb-1`}>Practice Scholarship</Text>
        <Text style={tw`text-2xl font-black text-slate-800 mb-6 leading-tight`}>{exam.title}</Text>

        {exam.questions?.length === 0 ? (
          <View style={tw`bg-white rounded-3xl p-8 items-center border border-slate-100`}>
            <Text style={tw`text-slate-500 font-bold text-sm`}>This exam has no questions config.</Text>
          </View>
        ) : (
          exam.questions.map((q: any, idx: number) => {
            const isSelected = answers[idx] !== undefined;

            return (
              <View key={idx} style={tw`bg-white rounded-3xl border border-slate-100 p-5 mb-5 shadow-sm`}>
                <View style={tw`flex-row gap-3 items-start mb-4`}>
                  <View style={tw`w-6 h-6 rounded-full bg-slate-100 items-center justify-center mt-0.5`}>
                    <Text style={tw`text-slate-400 text-xs font-black`}>{idx + 1}</Text>
                  </View>
                  <Text style={tw`text-slate-800 font-extrabold text-sm flex-1 leading-snug`}>{q.questionText}</Text>
                </View>

                {/* Option Buttons */}
                <View style={tw`gap-2.5`}>
                  {q.options.map((opt: string, oIdx: number) => {
                    const active = answers[idx] === opt;

                    return (
                      <TouchableOpacity
                        key={oIdx}
                        onPress={() => selectOption(idx, opt)}
                        style={[
                          tw`p-3.5 rounded-xl border flex-row items-center`,
                          active ? tw`border-purple-600 bg-purple-50/20` : tw`border-slate-100 bg-slate-50/50`
                        ]}
                      >
                        <View style={[
                          tw`w-4 h-4 rounded-full border items-center justify-center mr-3`,
                          active ? tw`border-purple-600` : tw`border-slate-300`
                        ]}>
                          {active && <View style={tw`w-2 h-2 rounded-full bg-purple-600`} />}
                        </View>
                        <Text style={[tw`text-xs font-semibold flex-1`, active ? tw`text-purple-900` : tw`text-slate-600`]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Bottom Submit Button */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wide`}>Progress</Text>
          <Text style={tw`text-xs font-extrabold text-slate-700`}>
            {Object.keys(answers).length} / {exam.questions?.length || 0} Solved
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            showCustomConfirm(
              'Submit Exam?',
              'Are you sure you want to finish and submit your answers?',
              () => submitExam(),
              'Yes, Submit'
            );
          }}
          style={[tw`px-6 py-3.5 rounded-xl flex-row items-center gap-2 shadow-md`, { backgroundColor: '#7c3aed' }]}
        >
          <Text style={tw`text-white font-black text-xs`}>Submit Exam</Text>
          <Feather name="check" size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {renderCustomModal()}
    </View>
  );
}
