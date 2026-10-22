import React, { createContext, useContext, useState, useEffect } from 'react';
import { KhachHangProfileDto } from '../types';
import { authApi } from '../api/services';
import { getAuthToken, getRefreshToken, setAuthToken, removeAuthToken } from '../api/httpClient';

interface AuthContextType {
  user: KhachHangProfileDto | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, refreshTokenOrUser: string | KhachHangProfileDto, optionalUser?: KhachHangProfileDto) => void;
  logout: () => Promise<void>;
  updateUser: (user: KhachHangProfileDto) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [refreshToken, setRefreshTokenState] = useState<string | null>(getRefreshToken());
  const [user, setUserState] = useState<KhachHangProfileDto | null>(() => {
    const saved = localStorage.getItem('hdpe_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (
    newToken: string,
    refreshTokenOrUser: string | KhachHangProfileDto,
    optionalUser?: KhachHangProfileDto
  ) => {
    let newRefreshToken = '';
    let newUser: KhachHangProfileDto;

    if (typeof refreshTokenOrUser === 'string') {
      newRefreshToken = refreshTokenOrUser;
      newUser = optionalUser!;
    } else {
      newUser = refreshTokenOrUser;
    }

    setAuthToken(newToken, newRefreshToken);
    localStorage.setItem('hdpe_user', JSON.stringify(newUser));

    setTokenState(newToken);
    if (newRefreshToken) {
      setRefreshTokenState(newRefreshToken);
    }
    setUserState(newUser);
  };

  const logout = async () => {
    try {
      const currentRefresh = getRefreshToken();
      await authApi.logout(currentRefresh || undefined);
    } catch {
      // Bỏ qua lỗi khi logout
    } finally {
      removeAuthToken();
      setTokenState(null);
      setRefreshTokenState(null);
      setUserState(null);
    }
  };

  const updateUser = (updated: KhachHangProfileDto) => {
    localStorage.setItem('hdpe_user', JSON.stringify(updated));
    setUserState(updated);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        updateUser(res.data);
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token && !user) {
      refreshProfile();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.vaiTro === 1,
        login,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
