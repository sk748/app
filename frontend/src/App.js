import React, { createContext, useState, useEffect, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthContext = createContext(null);
export const ApiContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function useApi() {
  return useContext(ApiContext);
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-navy flex items-center justify-center"><div className="text-azure text-lg">Loading...</div></div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("kcc_token"));
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("kcc_token");
        setToken(null);
      }
      setLoading(false);
    };
    init();
    // Seed data on first load
    api.post("/seed").catch(() => {});
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("kcc_token", res.data.token);
    api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem("kcc_token", res.data.token);
    api.defaults.headers.Authorization = `Bearer ${res.data.token}`;
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kcc_token");
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      <ApiContext.Provider value={api}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApiContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
