import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';

const ENCRYPTION_KEY = 'your-secure-key'; // In production, use environment variable
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface AuthData {
  token: string;
  role: 'patient' | 'provider';
  lastActivity: number;
}

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const setAuthData = (token: string, role: 'patient' | 'provider'): void => {
  const authData: AuthData = {
    token,
    role,
    lastActivity: Date.now(),
  };
  localStorage.setItem('authData', encryptData(authData));
};

export const getAuthData = (): AuthData | null => {
  const encryptedData = localStorage.getItem('authData');
  if (!encryptedData) return null;

  try {
    const authData = decryptData(encryptedData);
    if (Date.now() - authData.lastActivity > SESSION_DURATION) {
      localStorage.removeItem('authData');
      return null;
    }
    // Update last activity
    setAuthData(authData.token, authData.role);
    return authData;
  } catch {
    localStorage.removeItem('authData');
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('authData');
};

export const isAuthenticated = (): boolean => {
  const authData = getAuthData();
  return !!authData;
};

export const getUserRole = (): 'patient' | 'provider' | null => {
  const authData = getAuthData();
  return authData?.role || null;
};