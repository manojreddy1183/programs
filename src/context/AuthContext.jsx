import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('transit_current_user');
    return saved ? JSON.parse(saved) : initialUsers[0]; // Default to Administrator
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem('transit_auth_status');
    return authStatus !== 'false';
  });

  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('transit_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  useEffect(() => {
    localStorage.setItem('transit_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('transit_auth_status', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('transit_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const login = (email, password) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    }
    // Default fallback allow login as admin
    const defaultUser = {
      id: `USR-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: 'Administrator',
      department: 'Administration',
      status: 'Active',
      lastLogin: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    };
    setCurrentUser(defaultUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // One-click switcher for reviewer/demonstration to test role-based view quickly!
  const switchRole = (roleName) => {
    const targetUser = allUsers.find(u => u.role === roleName) || {
      ...currentUser,
      role: roleName
    };
    setCurrentUser(targetUser);
    setIsAuthenticated(true);
  };

  const hasPermission = (permission) => {
    if (!isAuthenticated) return false;
    const role = currentUser?.role;

    switch (permission) {
      case 'create':
      case 'edit':
      case 'delete':
        return role === 'Administrator' || role === 'Transport Manager';
      
      case 'admin_only':
      case 'manage_users':
      case 'system_settings':
        return role === 'Administrator';

      case 'manage_fleet':
      case 'assign_routes':
      case 'manage_schedules':
        return role === 'Administrator' || role === 'Transport Manager';

      case 'view':
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        hasPermission,
        allUsers,
        setAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
