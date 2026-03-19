import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/App";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [isRegister, setIsRegister] = useState(params.get("mode") === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const [form, setForm] = useState({
    email: "", password: "", full_name: "", role: "STUDENT", dob: "", kcc_id: "", guardian_kcc_id: "",
  });

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong");
    }
    setLoading(false);
  };

  const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const isMinor = form.dob ? ((new Date() - new Date(form.dob)) / (365.25 * 86400000)) < 13 : false;

  return (
    <div data-testid="auth-page" className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-azure/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-azure/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Back */}
        <button data-testid="back-to-home-btn" onClick={() => navigate("/")} className="flex items-center gap-2 text-slate hover:text-azure transition-colors mb-8 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/kcc-logo.png" alt="KCC" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-silver">{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-slate text-sm mt-1">{isRegister ? "Join the Junior Golf Academy" : "Sign in to your account"}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          {error && <div data-testid="auth-error" className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl font-medium">{error}</div>}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">Full Name</label>
                <input data-testid="full-name-input" type="text" value={form.full_name} onChange={e => update("full_name", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors" placeholder="Enter your full name" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">Role</label>
                <select data-testid="role-select" value={form.role} onChange={e => update("role", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors">
                  <option value="STUDENT">Student (Junior Golfer)</option>
                  <option value="COACH">Coach</option>
                  <option value="PARENT">Parent / Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">Date of Birth</label>
                <input data-testid="dob-input" type="date" value={form.dob} onChange={e => update("dob", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors" />
              </div>
              {form.role === "PARENT" && (
                <div>
                  <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">KCC Membership ID</label>
                  <input data-testid="kcc-id-input" type="text" value={form.kcc_id} onChange={e => update("kcc_id", e.target.value.toUpperCase())} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver font-mono tracking-widest outline-none focus:border-azure transition-colors" placeholder="e.g., KCC-1042" />
                </div>
              )}
              {isMinor && form.role === "STUDENT" && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
                  <p className="text-gold text-xs font-bold mb-2">COPPA: Parental Consent Required</p>
                  <label className="block text-xs text-silver/80 mb-1.5">Guardian's KCC Member ID</label>
                  <input data-testid="guardian-kcc-input" type="text" value={form.guardian_kcc_id} onChange={e => update("guardian_kcc_id", e.target.value.toUpperCase())} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver font-mono tracking-widest outline-none focus:border-azure transition-colors" placeholder="e.g., KCC-1042" />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">Email</label>
            <input data-testid="email-input" type="email" value={form.email} onChange={e => update("email", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-silver/80 mb-1.5 tracking-wide">Password</label>
            <div className="relative">
              <input data-testid="password-input" type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors pr-12" placeholder="Min 6 characters" required minLength={3} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-azure transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button data-testid="auth-submit-btn" type="submit" disabled={loading} className="w-full bg-azure text-white py-3.5 rounded-xl font-bold shadow-lg shadow-azure/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
          </button>

          <p className="text-center text-slate text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" data-testid="toggle-auth-mode" onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-azure font-bold hover:underline">
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
