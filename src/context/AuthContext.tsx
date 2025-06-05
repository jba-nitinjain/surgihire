import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  mobile: string | null;
  apiKey: string | null;
  login: (mobile: string, apiKey: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [mobile, setMobile] = useState<string | null>(
    localStorage.getItem('mobile')
  );
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem('apiKey')
  );

  const login = (mob: string, key: string) => {
    setMobile(mob);
    setApiKey(key);
    localStorage.setItem('mobile', mob);
    localStorage.setItem('apiKey', key);
  };

  const logout = () => {
    setMobile(null);
    setApiKey(null);
    localStorage.removeItem('mobile');
    localStorage.removeItem('apiKey');
  };

  const value: AuthContextType = {
    isLoggedIn: !!apiKey,
    mobile,
    apiKey,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
