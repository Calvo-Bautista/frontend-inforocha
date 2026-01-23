"use client";

import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: 1,
    email: "vendedor@rocha.com",
    password: "123456",
    name: "Carlos Vendedor",
    role: "vendedor",
  },
  {
    id: 2,
    email: "logistica@rocha.com",
    password: "123456",
    name: "María Logística",
    role: "logistica",
  },
  {
    id: 3,
    email: "admin@rocha.com",
    password: "123456",
    name: "Admin Rocha",
    role: "admin",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsLoading(false);
      return true;
    } else {
      setError("Credenciales inválidas. Por favor, intente de nuevo.");
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

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
