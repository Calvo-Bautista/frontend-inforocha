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

  // Check for existing session on mount (via HttpOnly cookie or localStorage fallback)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to validate session — if an HttpOnly cookie or localStorage token exists,
        // the backend will authenticate the request automatically
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (err) {
        // No valid session (no cookie, no localStorage token, or token expired)
        // Silently clear any stale localStorage token
        authAPI.logout();
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call real login API — sets HttpOnly cookie + localStorage fallback
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

  const logout = useCallback(async () => {
    await authAPI.logout();
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
