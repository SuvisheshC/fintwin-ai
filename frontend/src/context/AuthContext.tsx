import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types";
import { loginUser, registerUser } from "../services/resources";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("fintwin_user");
    const token = localStorage.getItem("fintwin_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("fintwin_token", data.access_token);
    localStorage.setItem("fintwin_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (full_name: string, email: string, password: string) => {
    const data = await registerUser({ full_name, email, password });
    localStorage.setItem("fintwin_token", data.access_token);
    localStorage.setItem("fintwin_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("fintwin_token");
    localStorage.removeItem("fintwin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
