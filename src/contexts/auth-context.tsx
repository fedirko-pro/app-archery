import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import type { User, RegisterData, AuthResponse, AuthContextType, ChangePasswordData } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pendingApplicationProcessedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getProfile();
          setUser(userData);
        }
      } catch {
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handlePostAuthRedirect = () => {
    const pendingApplication = sessionStorage.getItem('pendingApplication');
    console.log('Auth context - pending application:', pendingApplication);
    
    if (pendingApplication) {
      const { redirectTo } = JSON.parse(pendingApplication);
      console.log('Auth context - redirecting to:', redirectTo);
      sessionStorage.removeItem('pendingApplication');
      navigate(redirectTo);
    } else {
      console.log('Auth context - no pending application, redirecting to profile');
      navigate('/profile');
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.login(email, password);
      const userData = await apiService.getProfile();
      
      setUser(userData);
      handlePostAuthRedirect();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.register(userData);
      
      // Після успішної реєстрації автоматично логінимо користувача
      const loginResponse = await apiService.login(userData.email, userData.password);
      const userProfile = await apiService.getProfile();
      
      setUser(userProfile);
      handlePostAuthRedirect();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
    setError(null);
    pendingApplicationProcessedRef.current = false;
    navigate('/signin');
  };

  const updateUser = (userData: User): void => {
    setUser(userData);
  };

  const handleGoogleAuth = (userData: User): void => {
    console.log('Auth context - handleGoogleAuth called with userData:', userData);
    setUser(userData);
    console.log('Auth context - user set, checking pending application');
    
    // Запобігаємо повторній обробці
    if (pendingApplicationProcessedRef.current) {
      console.log('Auth context - pending application already processed, skipping');
      return;
    }
    
    // Перевіряємо pending application одразу після автентифікації
    const pendingApplication = sessionStorage.getItem('pendingApplication');
    console.log('Auth context - checking pending application after Google auth:', pendingApplication);
    
    if (pendingApplication) {
      try {
        const { redirectTo } = JSON.parse(pendingApplication);
        console.log('Auth context - found pending application, redirecting to:', redirectTo);
        sessionStorage.removeItem('pendingApplication');
        pendingApplicationProcessedRef.current = true;
        console.log('Auth context - calling navigate to:', redirectTo);
        navigate(redirectTo);
      } catch (error) {
        console.error('Auth context - error parsing pending application:', error);
        sessionStorage.removeItem('pendingApplication');
        pendingApplicationProcessedRef.current = true;
        console.log('Auth context - error occurred, going to profile');
        navigate('/profile');
      }
    } else {
      console.log('Auth context - no pending application, going to profile');
      pendingApplicationProcessedRef.current = true;
      navigate('/profile');
    }
  };

  const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      await apiService.changePassword(passwordData);
      
      navigate('/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (password: string, confirmPassword: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      await apiService.setPassword(password, confirmPassword);
      
      // Refresh user data to update the password status
      const userData = await apiService.getProfile();
      setUser(userData);
      
      navigate('/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set password';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    changePassword,
    setPassword,
    logout,
    updateUser,
    handleGoogleAuth,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 