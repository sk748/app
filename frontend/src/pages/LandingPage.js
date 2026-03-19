import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { Flag, ChevronRight, Trophy, Users, BarChart3, MapPin } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    axios.get(`${API}/announcements`).then(r => setAnnouncements(r.data)).catch(() => {
      setAnnouncements([
        { id: "1", title: "Summer Junior Camp Registration Open", content: "Register for 2026 Summer Camp.", priority: "HIGH", author_name: "Admin", author_role: "ADMIN", created_at: new Date().toISOString() },
        { id: "2", title: "New WHS 2024 Guidelines Applied", content: "Platform now supports Expected Score scaling.", priority: "NORMAL", author_name: "System", author_role: "ADMIN", created_at: new Date().toISOString() },
      ]);
    });
  }, []);

  const features = [
    { icon: Trophy, title: "WHS 2024 Handicaps", desc: "Real-time handicap tracking with certified math engine" },
    { icon: BarChart3, title: "Performance Analytics", desc: "Score progression, differentials, and trend visualization" },
    { icon: Users, title: "Coach Evaluations", desc: "Structured Level 1-8 development tracking" },
    { icon: MapPin, title: "Course Maps", desc: "Interactive MapLibre-powered course visualization" },
  ];

  return (
    <div data-testid="landing-page" className="min-h-screen bg-navy text-silver selection:bg-azure/30 overflow-hidden">
      {/* Nav */}
      <nav className="px-6 py-5 flex justify-between items-center max-w-7xl mx-auto" data-testid="landing-nav">
        <div className="flex items-center gap-4">
          <img src="/kcc-logo.png" alt="KCC" className="h-12 w-auto object-contain" />
          <div className="h-8 w-px bg-white/20" />
          <span className="text-sm font-bold tracking-[0.2em] text-azure uppercase">Junior Golf</span>
        </div>
        <div className="flex items-center gap-3">
          <button data-testid="sign-in-btn" onClick={() => navigate("/auth")} className="text-silver hover:text-azure font-semibold transition-colors px-4 py-2">Sign In</button>
          <button data-testid="register-btn" onClick={() => navigate("/auth?mode=register")} className="bg-azure text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-azure/30 hover:brightness-110 active:scale-95 transition-all">Register</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero */}
          <div className="space-y-8 animate-slide-left">
            <div className="inline-flex items-center gap-2 bg-azure/10 border border-azure/20 text-azure text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
              <Flag size={14} />
              Karen Country Club Academy
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              The Future of<br />
              <span className="text-azure">Kenyan Golf</span><br />
              Starts Here.
            </h1>
            <p className="text-slate text-lg max-w-lg leading-relaxed">
              A comprehensive development platform for Karen Country Club's junior athletes. Track WHS handicaps, receive coach evaluations, and compete in elite tournaments.
            </p>
            <div className="flex flex-wrap gap-4">
              <button data-testid="join-academy-btn" onClick={() => navigate("/auth?mode=register")} className="bg-azure text-white px-8 py-4 rounded-xl font-black text-lg shadow-2xl shadow-azure/40 hover:scale-105 active:scale-95 transition-all">
                Join the Academy
              </button>
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="glass text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                Learn More <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="glass rounded-3xl p-8 shadow-2xl animate-slide-right" data-testid="announcements-feed">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                Academy Noticeboard
              </h2>
            </div>
            <div className="space-y-4">
              {announcements.slice(0, 4).map((item, i) => (
                <div key={item.id} className={`group bg-navy border border-white/5 p-5 rounded-2xl hover:border-azure/40 transition-all cursor-pointer animate-fade-in-up stagger-${i + 1}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold tracking-widest uppercase text-azure">{item.author_role}</span>
                    <span className="text-xs text-slate">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-silver group-hover:text-azure transition-colors">{item.title}</h3>
                  {item.priority === "HIGH" && <div className="mt-2 inline-block bg-red-500/20 text-red-400 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">PRIORITY</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 mb-24">
          <h2 className="text-3xl font-black text-center mb-16">Platform <span className="text-azure">Capabilities</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`glass-light rounded-2xl p-6 hover:border-azure/30 transition-all hover:-translate-y-1 animate-fade-in-up stagger-${i + 1}`}>
                <f.icon className="text-azure mb-4" size={32} />
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mb-24 glass rounded-2xl p-8 max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4 text-gold">Demo Credentials</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { role: "Student", email: "student@kcc.co.ke", pass: "student123" },
              { role: "Coach", email: "coach@kcc.co.ke", pass: "coach123" },
              { role: "Parent", email: "parent@kcc.co.ke", pass: "parent123" },
              { role: "Admin", email: "admin@kcc.co.ke", pass: "admin123" },
            ].map(c => (
              <div key={c.role} className="bg-navy/80 border border-white/5 rounded-xl p-3">
                <div className="text-azure font-bold text-xs tracking-widest mb-1">{c.role.toUpperCase()}</div>
                <div className="font-mono text-xs text-silver/80">{c.email}</div>
                <div className="font-mono text-xs text-slate">{c.pass}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-slate text-sm">
        &copy; {new Date().getFullYear()} Karen Country Club Junior Golf Academy
      </footer>
    </div>
  );
}
