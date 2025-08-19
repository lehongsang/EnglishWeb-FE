import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase'; 
import {
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,   
    updateProfile,                
    signOut,                      
    onAuthStateChanged            
} from 'firebase/auth';

import apiEndpoints from '../apis/endPoint';
import axios from 'axios';
import { Spin, message as antMessage, Typography } from 'antd'; // Thêm Typography

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUserFirebase, setCurrentUserFirebase] = useState(null);
  const [currentUserDb, setCurrentUserDb] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const syncAndSetUserDb = useCallback(async (firebaseUser, registrationData = null) => {
    if (!firebaseUser) {
      setCurrentUserDb(null);
      return null;
    }

    try {
      const idToken = await firebaseUser.getIdToken(true);
      const payload = registrationData?.name ? { name: registrationData.name } : {};

      const response = await axios.post(apiEndpoints.syncProfile, payload, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      if (response.data?.success) {
        setCurrentUserDb(response.data.user);
        return response.data.user;
      }
      
      throw new Error(response.data?.message || "Failed to sync user profile");
    } catch (error) {
      console.error("AuthContext sync error:", error);
      if (auth) {
        await signOut(auth);
      }
      setCurrentUserDb(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUserFirebase(user);
      try {
        if (user) {
          await syncAndSetUserDb(user);
        } else {
          setCurrentUserDb(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoadingAuth(false);
      }
    });

    return unsubscribe;
  }, [syncAndSetUserDb]);

  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name }); 
        return await syncAndSetUserDb(userCredential.user, { name: name });
      }
      throw new Error("Không thể tạo tài khoản trên Firebase.");
    } catch (error) {
      console.error("AuthContext signup error:", error);
      throw error; 
    }
  }

  async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged sẽ tự động gọi syncAndSetUserDb
        return userCredential.user; // Trả về firebase user để LoginPage biết thành công
    } catch (error) {
        console.error("AuthContext login error:", error);
        throw error; 
    }
  }

  async function logout() {
    try {
        await signOut(auth);
        console.log("AuthContext: User signed out from Firebase.");
        // onAuthStateChanged sẽ tự động clear currentUserFirebase và currentUserDb
    } catch (error) {
        console.error("AuthContext logout error:", error);
    }
  }

  async function refreshUserDb() {
    if (currentUserFirebase) {
        console.log("AuthContext: Manually refreshing userDb...");
        setLoadingAuth(true);
        const dbUser = await syncAndSetUserDb(currentUserFirebase);
        setLoadingAuth(false);
        return dbUser;
    }
    return null;
  }

  const value = {
    currentUser: currentUserFirebase,
    currentUserDb,
    isAdmin: currentUserDb?.role === 'admin',
    loadingAuth,
    isAuthenticated: !!currentUserFirebase && !!currentUserDb,
    signup,
    login,
    logout,
    refreshUserDb,
  };

  return (
    <AuthContext.Provider value={value}>
      {loadingAuth ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" tip="Đang tải..." />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}