"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (token) {
        try {
          // Verify token is still valid by fetching user data
          const userData = await authAPI.getMe();
          setUser(userData);
        } catch (err) {
          // Token is invalid or expired
          console.error('Session validation failed:', err);
          authAPI.logout();
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call real login API
      const { access_token } = await authAPI.login(email, password);

      // Fetch user data after successful login
      const userData = await authAPI.getMe();

      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "Credenciales inválidas. Por favor, intente de nuevo.");
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setError(null);
    router.replace("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
