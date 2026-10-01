import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { schoolService, type SchoolRegistrationRequest } from '../services/apis/schoolApi';

interface SchoolContextType {
  loading: boolean;
  completeRegistration: (data: SchoolRegistrationRequest) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const completeRegistration = async (data: SchoolRegistrationRequest) => {
    setLoading(true);
    try {
      const response = await schoolService.completeRegistration(data);
      
      if (response.status === 200) {
        // Registration successful
        return;
      } else {
        throw new Error(response.message || 'School registration failed');
      }
    } catch (error: any) {
      console.error('School registration error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error.message || 
                          'School registration failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value: SchoolContextType = {
    loading,
    completeRegistration,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};