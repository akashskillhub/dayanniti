import { Platform } from 'react-native';

// Priority:
// 1. EXPO_PUBLIC_API_URL from .env file (for physical devices on same Wi-Fi)
// 2. Platform default localhost IP (for emulators/simulators)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: `http://10.0.2.2:5050`,
  ios: `http://localhost:5050`,
  default: `http://localhost:5050`,
});

export const API_URLS = {
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/users/register`,
  profile: `${API_BASE_URL}/api/users/profile`,
  exams: `${API_BASE_URL}/api/exams`,
  unlockExam: `${API_BASE_URL}/api/users/unlock-exam`,
  payCertificate: `${API_BASE_URL}/api/users/pay-certificate`,
  results: `${API_BASE_URL}/api/users/results`,
  contact: `${API_BASE_URL}/api/contact`,
  deleteProfilePic: `${API_BASE_URL}/api/users/profile/image`,
  zoomClasses: `${API_BASE_URL}/api/zoom-classes`,
  syllabus: `${API_BASE_URL}/api/syllabus`,
};
