import React, { useState } from "react";
import { useAuth } from "@/App";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Map, MessageSquare, Trophy, Users, Star,
  ClipboardList, Upload, Bell, LogOut, Menu, X, ChevronRight, Shield
} from "lucide-react";

import ScorecardForm from "@/components/golf/ScorecardForm";
import HandicapChart from "@/components/golf/HandicapChart";
import CourseMap from "@/components/golf/CourseMap";
import EvaluationWizard from "@/components/golf/EvaluationWizard";
import CoachRoster from "@/components/golf/CoachRoster";
import AdminDashboard from "@/components/golf/AdminDashboard";
import RealtimeChat from "@/components/golf/RealtimeChat";
import AttendanceTracker from "@/components/golf/AttendanceTracker";
import TournamentRSVP from "@/components/golf/TournamentRSVP";
import CoachEvalForm from "@/components/golf/CoachEvalForm";
import VPCFlows from "@/components/golf/VPCFlows";
import ClassFeed from "@/components/golf/ClassFeed";
import DashboardHome from "@/components/golf/DashboardHome";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  const role = user?.role || "STUDENT";

  const navItems = {
    STUDENT: [
      { id: "home", label: "Dashboard", icon: LayoutDashboard },
      { id: "scorecard", label: "New Scorecard", icon: FileText },
      { id: "map", label: "Course Map", icon: Map },
      { id: "tournaments", label: "Tournaments", icon: Trophy },
      { id: "chat", label: "Team Chat", icon: MessageSquare },
      { id: "eval-coach", label: "Rate Coach", icon: Star },
      { id: "feed", label: "Broadcasts", icon: Bell },
    ],
    COACH: [
      { id: "home", label: "Dashboard", icon: LayoutDashboard },
      { id: "roster", label: "Student Roster", icon: Users },
      { id: "evaluation", label: "Evaluate Student", icon: ClipboardList },
      { id: "attendance", label: "Attendance", icon: ClipboardList },
      { id: "map", label: "Course Map", icon: Map },
      { id: "chat", label: "Team Chat", icon: MessageSquare },
      { id: "feed", label: "Broadcasts", icon: Bell },
    ],
    PARENT: [
      { id: "home", label: "Dashboard", icon: LayoutDashboard },
      { id: "vpc", label: "Consent Requests", icon: Shield },
      { id: "chat", label: "Monitor Chat", icon: MessageSquare },
      { id: "eval-coach", label: "Rate Coach", icon: Star },
      { id: "feed", label: "Broadcasts", icon: Bell },
    ],
    ADMIN: [
      { id: "home", label: "Dashboard", icon: LayoutDashboard },
      { id: "admin", label: "Administration", icon: Upload },
      { id: "roster", label: "All Students", icon: Users },
      { id: "feed", label: "Broadcasts", icon: Bell },
    ],
  };

  const items = navItems[role] || navItems.STUDENT;

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <DashboardHome />;
      case "scorecard": return <ScorecardForm />;
      case "map": return <CourseMap />;
      case "evaluation": return <EvaluationWizard />;
      case "roster": return <CoachRoster />;
      case "admin": return <AdminDashboard />;
      case "chat": return <RealtimeChat />;
      case "attendance": return <AttendanceTracker />;
      case "tournaments": return <TournamentRSVP />;
      case "eval-coach": return <CoachEvalForm />;
      case "vpc": return <VPCFlows />;
      case "feed": return <ClassFeed />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-navy flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <img src="/kcc-logo.png" alt="KCC" className="h-10 w-auto" />
          <div>
            <div className="text-xs font-bold tracking-[0.15em] text-azure uppercase">KCC Junior</div>
            <div className="text-[10px] text-slate tracking-widest">GOLF ACADEMY</div>
          </div>
          <button className="lg:hidden ml-auto text-slate" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/5">
          <p className="text-silver font-bold text-sm truncate">{user?.full_name}</p>
          <p className="text-azure text-[10px] font-bold tracking-[0.2em] uppercase">{role}</p>
          {role === "STUDENT" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-gold text-xs font-bold">HCP: {user?.current_hcp_index?.toFixed(1)}</span>
              <span className="text-slate text-xs">Lvl {user?.evaluation_level || 0}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {items.map(item => (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
                activeTab === item.id
                  ? "bg-azure/15 text-azure border border-azure/20"
                  : "text-slate hover:text-silver hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button data-testid="logout-btn" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="mobile-menu-btn" className="lg:hidden text-slate hover:text-silver" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-silver">{items.find(i => i.id === activeTab)?.label || "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-silver font-medium">{user?.full_name}</p>
              <p className="text-[10px] text-slate">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-azure/20 flex items-center justify-center text-azure font-bold text-sm border border-azure/30">
              {user?.full_name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
