import React, { useState, useEffect } from "react";
import { useApi, useAuth } from "@/App";
import { Search, TrendingDown, Award, ChevronDown, ChevronUp, FileText, X } from "lucide-react";

export default function CoachRoster() {
  const api = useApi();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [studentCards, setStudentCards] = useState({});

  useEffect(() => {
    api.get("/users?role=STUDENT").then(r => {
      setStudents(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = async (studentId) => {
    if (expanded === studentId) { setExpanded(null); return; }
    setExpanded(studentId);
    if (!studentCards[studentId]) {
      try {
        const res = await api.get(`/scorecards?student_id=${studentId}`);
        setStudentCards(prev => ({ ...prev, [studentId]: res.data }));
      } catch {}
    }
  };

  if (loading) return <div className="text-azure text-center py-12">Loading roster...</div>;

  return (
    <div data-testid="coach-roster" className="max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-silver">Student Roster</h2>
          <p className="text-slate text-sm">{students.length} students enrolled</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input data-testid="roster-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full bg-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-silver text-sm outline-none focus:border-azure transition-colors" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-slate uppercase tracking-widest">
          <div className="col-span-4">Student</div>
          <div className="col-span-2 text-center">HCP Index</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-center">Consent</div>
          <div className="col-span-2 text-center">Joined</div>
        </div>
        {filtered.map((s, i) => (
          <div key={s.id}>
            <div data-testid={`roster-row-${i}`} onClick={() => toggleExpand(s.id)} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors items-center cursor-pointer">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-azure/15 flex items-center justify-center text-azure font-bold text-sm border border-azure/20 shrink-0">
                  {s.full_name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-silver text-sm truncate">{s.full_name}</p>
                  <p className="text-xs text-slate truncate">{s.email}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="inline-flex items-center gap-1 text-azure font-bold">
                  <TrendingDown size={14} /> {s.current_hcp_index?.toFixed(1)}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="inline-flex items-center gap-1 text-gold font-bold">
                  <Award size={14} /> {s.evaluation_level || 0}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${s.is_consent_verified ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {s.is_consent_verified ? "Verified" : "Pending"}
                </span>
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-2">
                <span className="text-xs text-slate">{new Date(s.created_at).toLocaleDateString()}</span>
                {expanded === s.id ? <ChevronUp size={14} className="text-azure" /> : <ChevronDown size={14} className="text-slate" />}
              </div>
            </div>
            {/* Expanded Detail */}
            {expanded === s.id && (
              <div className="px-6 py-4 bg-white/2 border-b border-white/5 animate-fade-in">
                <h4 className="text-xs font-bold text-azure mb-3 flex items-center gap-1"><FileText size={12} /> Recent Scorecards</h4>
                {(studentCards[s.id] || []).length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {(studentCards[s.id] || []).slice(0, 4).map(sc => (
                      <div key={sc.id} className="bg-navy border border-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate">{sc.course_name}</p>
                        <p className="text-lg font-black text-silver">{sc.gross_score}</p>
                        <p className="text-[10px] text-azure">Diff: {sc.score_differential}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate text-xs">No scorecards recorded.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-slate">No students found.</div>}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filtered.map((s, i) => (
          <div key={s.id} className="glass-light rounded-2xl overflow-hidden">
            <div data-testid={`roster-card-${i}`} onClick={() => toggleExpand(s.id)} className="p-4 cursor-pointer active:bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-azure/15 flex items-center justify-center text-azure font-bold text-base border border-azure/20 shrink-0">
                  {s.full_name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-silver text-sm">{s.full_name}</p>
                  <p className="text-xs text-slate truncate">{s.email}</p>
                </div>
                {expanded === s.id ? <ChevronUp size={18} className="text-azure shrink-0" /> : <ChevronDown size={18} className="text-slate shrink-0" />}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-navy/50 rounded-xl py-2.5 px-1">
                  <p className="text-azure font-bold text-base">{s.current_hcp_index?.toFixed(1)}</p>
                  <p className="text-[10px] text-slate mt-0.5">HCP Index</p>
                </div>
                <div className="text-center bg-navy/50 rounded-xl py-2.5 px-1">
                  <p className="text-gold font-bold text-base">{s.evaluation_level || 0}</p>
                  <p className="text-[10px] text-slate mt-0.5">Level</p>
                </div>
                <div className="text-center bg-navy/50 rounded-xl py-2.5 px-1">
                  <span className={`text-xs font-bold ${s.is_consent_verified ? "text-emerald-400" : "text-red-400"}`}>
                    {s.is_consent_verified ? "Verified" : "Pending"}
                  </span>
                  <p className="text-[10px] text-slate mt-0.5">Consent</p>
                </div>
              </div>
            </div>
            {expanded === s.id && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="border-t border-white/5 pt-3">
                  <h4 className="text-xs font-bold text-azure mb-2 flex items-center gap-1"><FileText size={12} /> Recent Scorecards</h4>
                  {(studentCards[s.id] || []).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {(studentCards[s.id] || []).slice(0, 4).map(sc => (
                        <div key={sc.id} className="bg-navy border border-white/5 rounded-xl p-2.5 text-center">
                          <p className="text-[10px] text-slate truncate">{sc.course_name}</p>
                          <p className="text-base font-black text-silver">{sc.gross_score}</p>
                          <p className="text-[10px] text-azure">Diff: {sc.score_differential}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate text-xs">No scorecards recorded.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-slate">No students found.</div>}
      </div>
    </div>
  );
}
