import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Upload, Star, Loader2, Users, Bell, Trophy, BarChart3, Plus, X, Send } from "lucide-react";

export default function AdminDashboard() {
  const api = useApi();
  const [tab, setTab] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [coachRatings, setCoachRatings] = useState([]);
  const [stats, setStats] = useState({ students: 0, coaches: 0, tournaments: 0, scorecards: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("NORMAL");
  const [annSending, setAnnSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/coach-evaluations/aggregate").catch(() => ({ data: [] })),
      api.get("/users?role=STUDENT").catch(() => ({ data: [] })),
      api.get("/users?role=COACH").catch(() => ({ data: [] })),
      api.get("/tournaments").catch(() => ({ data: [] })),
      api.get("/scorecards").catch(() => ({ data: [] })),
      api.get("/users").catch(() => ({ data: [] })),
      api.get("/announcements").catch(() => ({ data: [] })),
    ]).then(([cr, st, co, to, sc, au, an]) => {
      setCoachRatings(cr.data);
      setStats({ students: st.data.length, coaches: co.data.length, tournaments: to.data.length, scorecards: sc.data.length });
      setAllUsers(au.data);
      setAnnouncements(an.data);
    });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.file?.files[0];
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/bulk-import", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadMsg(`Imported ${res.data.imported_count} members. ${res.data.error_count > 0 ? `${res.data.error_count} errors.` : ""}`);
      e.target.reset();
    } catch (err) {
      setUploadMsg(`Error: ${err?.response?.data?.detail || "Upload failed"}`);
    }
    setUploading(false);
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    setAnnSending(true);
    try {
      const res = await api.post("/announcements", { title: annTitle, content: annContent, priority: annPriority });
      setAnnouncements(prev => [res.data, ...prev]);
      setAnnTitle(""); setAnnContent(""); setAnnPriority("NORMAL"); setShowAnnForm(false);
    } catch {}
    setAnnSending(false);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "ratings", label: "Coach Ratings", icon: Star },
    { id: "import", label: "Bulk Import", icon: Upload },
    { id: "broadcast", label: "Broadcasts", icon: Bell },
  ];

  return (
    <div data-testid="admin-dashboard" className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-silver mb-1">Academy Administration</h2>
        <p className="text-slate text-sm">Manage users, evaluations, imports, and broadcasts.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === t.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <OverviewCard icon={Users} label="Students" value={stats.students} color="azure" />
            <OverviewCard icon={Star} label="Coaches" value={stats.coaches} color="gold" />
            <OverviewCard icon={Trophy} label="Tournaments" value={stats.tournaments} color="azure" />
            <OverviewCard icon={BarChart3} label="Scorecards" value={stats.scorecards} color="gold" />
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-silver">{allUsers.length} Registered Users</h3>
          </div>
          <div className="divide-y divide-white/5">
            {allUsers.map(u => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-azure/15 flex items-center justify-center text-azure font-bold text-sm border border-azure/20 shrink-0">{u.full_name?.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="font-bold text-silver text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-slate truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-lg ${
                    u.role === "ADMIN" ? "bg-red-500/15 text-red-400" :
                    u.role === "COACH" ? "bg-gold/15 text-gold" :
                    u.role === "PARENT" ? "bg-emerald-500/15 text-emerald-400" :
                    "bg-azure/15 text-azure"
                  }`}>{u.role}</span>
                  {u.role === "STUDENT" && <span className="text-xs text-azure font-mono">{u.current_hcp_index?.toFixed(1)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Ratings */}
      {tab === "ratings" && (
        <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gold flex items-center gap-2 mb-6">
            <Star size={20} /> Average Coach Ratings
          </h3>
          {coachRatings.length === 0 ? (
            <p className="text-slate text-sm">No anonymous evaluations submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {coachRatings.map(c => (
                <div key={c.coach_id} className="bg-navy border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-silver">{c.coach_name}</h4>
                    <p className="text-slate text-xs">{c.total_reviews} anonymous reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-azure">{c.average_rating.toFixed(1)}</div>
                    <div className="text-gold text-xs">
                      {"★".repeat(Math.round(c.average_rating))}{"☆".repeat(5 - Math.round(c.average_rating))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Import */}
      {tab === "import" && (
        <div className="glass rounded-2xl p-5 sm:p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-azure flex items-center gap-2 mb-2">
            <Upload size={20} /> Bulk Roster Import
          </h3>
          <p className="text-slate text-sm mb-6">Upload .xlsx file to update the KCC Member database for Parental Consent verification.</p>
          <form onSubmit={handleUpload} className="space-y-4">
            <div data-testid="file-drop-zone" className="border-2 border-dashed border-white/15 rounded-2xl p-6 sm:p-8 text-center hover:border-azure/40 transition-colors bg-navy/50">
              <input type="file" name="file" accept=".csv,.xlsx,.xls" className="block w-full text-sm text-slate file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-azure file:text-white hover:file:brightness-110 cursor-pointer" required />
              <p className="text-xs text-slate mt-4">Expected Columns: MemberNumber, FullName, Phone, Email</p>
            </div>
            <button data-testid="upload-btn" type="submit" disabled={uploading} className="w-full bg-azure text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
              {uploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Upload & Sync Database"}
            </button>
          </form>
          {uploadMsg && (
            <div data-testid="upload-result" className={`mt-4 p-4 rounded-xl text-sm font-bold ${uploadMsg.includes("Error") ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {uploadMsg}
            </div>
          )}
        </div>
      )}

      {/* Broadcasts */}
      {tab === "broadcast" && (
        <div className="animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-silver">Academy Broadcasts</h3>
            <button data-testid="admin-new-broadcast-btn" onClick={() => setShowAnnForm(!showAnnForm)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${showAnnForm ? "bg-white/10 text-slate" : "bg-azure text-white hover:brightness-110"}`}>
              {showAnnForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New</>}
            </button>
          </div>
          {showAnnForm && (
            <form onSubmit={handleAnnouncement} className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up">
              <input data-testid="admin-ann-title" type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Broadcast title..." className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure text-sm" required />
              <textarea data-testid="admin-ann-content" value={annContent} onChange={e => setAnnContent(e.target.value)} placeholder="Message content..." className="w-full h-20 bg-navy border border-white/10 rounded-xl p-4 text-silver outline-none focus:border-azure resize-none text-sm" />
              <div className="flex items-center justify-between gap-3">
                <select value={annPriority} onChange={e => setAnnPriority(e.target.value)} className="bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-silver text-sm outline-none focus:border-azure">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <button type="submit" disabled={annSending} className="bg-azure text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
                  <Send size={14} /> Post
                </button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="glass-light rounded-2xl p-4 relative overflow-hidden">
                {a.priority === "HIGH" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-bold text-silver text-sm">{a.title}</h4>
                  <span className="text-xs text-slate shrink-0">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate text-sm">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, color }) {
  const c = color === "gold" ? "text-gold" : "text-azure";
  return (
    <div className="glass-light rounded-2xl p-4 sm:p-5">
      <Icon size={20} className={`${c} mb-2`} />
      <p className="text-2xl sm:text-3xl font-black text-silver">{value}</p>
      <p className="text-xs text-slate mt-1">{label}</p>
    </div>
  );
}
