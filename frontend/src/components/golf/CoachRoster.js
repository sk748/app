import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Search, TrendingDown, Award } from "lucide-react";

export default function CoachRoster() {
  const api = useApi();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-azure text-center py-12">Loading roster...</div>;

  return (
    <div data-testid="coach-roster" className="max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-silver">Student Roster</h2>
          <p className="text-slate text-sm">{students.length} students enrolled</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input data-testid="roster-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full bg-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-silver text-sm outline-none focus:border-azure transition-colors" />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-slate uppercase tracking-widest">
          <div className="col-span-4">Student</div>
          <div className="col-span-2 text-center">HCP Index</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-center">Consent</div>
          <div className="col-span-2 text-center">Joined</div>
        </div>

        {/* Rows */}
        {filtered.map((s, i) => (
          <div key={s.id} data-testid={`roster-row-${i}`} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors items-center">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-azure/15 flex items-center justify-center text-azure font-bold text-sm border border-azure/20">
                {s.full_name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-silver text-sm">{s.full_name}</p>
                <p className="text-xs text-slate">{s.email}</p>
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
            <div className="col-span-2 text-center text-xs text-slate">
              {new Date(s.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate">No students found.</div>
        )}
      </div>
    </div>
  );
}
