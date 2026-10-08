import React, { createContext, useContext, useState, type ReactNode } from 'react';
import {
  authApi,
  schoolApi,
  type CommonResponse,
  type LoginRequest,
  type AdminLoginRequest,
  type RegisterRequest,
} from '../services/apis/api';
import { packageScopeService } from '../services/systemSettinds/packageScopeService'

interface UserData {
  role: string;
  registrationCompleted: boolean;
  subscribed: boolean;
  staffCode?: string;
  email?: string;
  code?: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  adminLogin: (credentials: AdminLoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  sendOtp: (phoneOrEmail: string) => Promise<CommonResponse>;
  verifyOtp: (phoneOrEmail: string, otp: string) => Promise<CommonResponse>;
  sendForgotPasswordOtp: (phoneOrEmail: string, code?: string) => Promise<CommonResponse>;
  resetPassword: (
    phoneOrEmail: string, otp: string,
    newPassword: string, confirmNewPassword: string,
    code?: string
  ) => Promise<CommonResponse>;
  subscribe: (data: any) => Promise<CommonResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response.status !== 200 || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { data } = response;
      const schoolGroupCode = localStorage.getItem('schoolGroupCode') ?? ''
      if (!schoolGroupCode) {
        localStorage.removeItem('packageScopes')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        throw new Error('School group code is missing')
      }
      try {
        const packageScopes = await packageScopeService.getForSchoolGroup(schoolGroupCode)
        localStorage.setItem('packageScopes', JSON.stringify(packageScopes))
      } catch (error) {
        localStorage.removeItem('packageScopes')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        throw error
      }
      const staffCode = data.staffCode || localStorage.getItem('staffCode') || '';
      if (staffCode) localStorage.setItem('staffCode', staffCode);
      localStorage.setItem('crudPermissions', JSON.stringify(data.role?.crudPermissions ?? []));

      saveUser({
        role: localStorage.getItem('role') || '',
        registrationCompleted: localStorage.getItem('registrationCompleted') === 'true',
        subscribed: localStorage.getItem('subscribed') === 'true',
        staffCode: staffCode || undefined,
        code: localStorage.getItem('schoolCode') || undefined,
      });



    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  //  admin login 
  const adminLogin = async (credentials: AdminLoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.adminLogin(credentials);
      if (response.status !== 200 || !response.data) {
        throw new Error(response.message || 'Admin login failed');
      }

      const { data } = response;
      const role = typeof data.role === 'object' ? (data.role as any).name ?? '' : data.role ?? '';
      const schoolGroupCode = localStorage.getItem('schoolGroupCode') || localStorage.getItem('code') || ''
      if (schoolGroupCode) {
        try {
          const packageScopes = await packageScopeService.getForSchoolGroup(schoolGroupCode)
          localStorage.setItem('packageScopes', JSON.stringify(packageScopes))
        } catch (error) {
          localStorage.removeItem('packageScopes')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          throw error
        }
      } else {
        localStorage.removeItem('packageScopes')
      }

      saveUser({
        role,
        registrationCompleted: true,
        subscribed: data.subscribed === true,
       code: data.code || undefined,
        email: credentials.phoneOrEmail.includes('@') ? credentials.phoneOrEmail : undefined,
      });

      localStorage.removeItem('staffCode');
      localStorage.removeItem('crudPermissions');
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  //  register 
  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.status !== 201) throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP ────────────────────────────────────────────────────
  const sendOtp = async (phoneOrEmail: string): Promise<CommonResponse> => {
    setLoading(true);
    try {
      return await authApi.sendOtp({ phoneOrEmail });
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phoneOrEmail: string, otp: string): Promise<CommonResponse> => {
    setLoading(true);
    try {
      return await authApi.verifyOtp({ phoneOrEmail, otp });
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get schoolCode from localStorage
  const getSchoolCode = () => localStorage.getItem('schoolCode');

  //  forgot / reset password 
  const sendForgotPasswordOtp = async (
    phoneOrEmail: string
  ): Promise<CommonResponse> => {
    setLoading(true);
    try {
      return await authApi.forgotPasswordSendOtp({ phoneOrEmail, code: getSchoolCode() ?? null });
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    phoneOrEmail: string, otp: string,
    newPassword: string, confirmNewPassword: string
  ): Promise<CommonResponse> => {
    setLoading(true);
    try {
      return await authApi.forgotPassword({
        phoneOrEmail, otp, newPassword, confirmNewPassword, code: getSchoolCode() ?? null,
      });
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || error.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  //  subscribe 
  const subscribe = async (data: any): Promise<CommonResponse> => {
    setLoading(true);
    try {
      const response = await schoolApi.subscribe(data);
      if (response.status === 200) {
        const updated = { ...user!, subscribed: true };
        saveUser(updated);
        localStorage.setItem('subscribed', 'true');
      }
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  //  logout 
  const logout = () => {
    authApi.logout();

  localStorage.clear();        // 🔥 must
  sessionStorage.clear();      // optional but fine

  setUser(null); 
    
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, loading,
      login, adminLogin, register, logout,
      sendOtp, verifyOtp,
      sendForgotPasswordOtp, resetPassword,
      subscribe,
    }}>
      {children}
    </AuthContext.Provider>
  );
};