import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, isMockFirebase } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Synchronize axios authentication header
  const updateAxiosHeader = (tokenVal) => {
    if (tokenVal) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    if (isMockFirebase || !auth) {
      // Local development fallback
      const savedUser = localStorage.getItem('advisor_mock_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken('mock-dev-token-xyz');
        updateAxiosHeader('mock-dev-token-xyz');
      }
      setLoading(false);
    } else {
      // Firebase standard listener
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            setUser(currentUser);
            setToken(idToken);
            updateAxiosHeader(idToken);
          } catch (e) {
            console.error("Failed to retrieve Firebase ID Token:", e);
            setUser(null);
            setToken(null);
            updateAxiosHeader(null);
          }
        } else {
          setUser(null);
          setToken(null);
          updateAxiosHeader(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    if (isMockFirebase || !auth) {
      // Simulate API lag
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = { email, uid: 'mock-admin-uid', displayName: 'Telangana Today Admin' };
      localStorage.setItem('advisor_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setToken('mock-dev-token-xyz');
      updateAxiosHeader('mock-dev-token-xyz');
      setLoading(false);
      return mockUser;
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);
        updateAxiosHeader(idToken);
        setUser(userCredential.user);
        return userCredential.user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMockFirebase || !auth) {
      await new Promise(resolve => setTimeout(resolve, 400));
      localStorage.removeItem('advisor_mock_user');
      setUser(null);
      setToken(null);
      updateAxiosHeader(null);
      setLoading(false);
    } else {
      try {
        await signOut(auth);
        setUser(null);
        setToken(null);
        updateAxiosHeader(null);
      } catch (error) {
        console.error("Error signing out:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    user,
    loading,
    token,
    isMockMode: isMockFirebase || !auth,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
