import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dojoUser');
    const savedUserType = localStorage.getItem('dojoUserType');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('dojoUser', JSON.stringify(userData));
    localStorage.setItem('dojoUserType', type);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('dojoUser');
    localStorage.removeItem('dojoUserType');
  };

  const updateUser = (updatedFields) => {
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem('dojoUser', JSON.stringify(newUser));
  };

  const value = {
    user,
    userType,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};