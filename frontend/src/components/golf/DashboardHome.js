import React, { useState, useEffect } from "react";
import { useAuth, useApi } from "@/App";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown, Trophy, Target, Calendar } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const api = useApi();
  const [scorecards, setScorecards] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sc, ev] = await Promise.all([
          api.get("/scorecards").catch(() => ({ data: [] })),
          api.get("/evaluations").catch(() => ({ data: [] })),
        ]);
        setScorecards(sc.data);
        setEvaluations(ev.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const chartData = scorecards.slice().reverse().map((s, i) => ({
    date: new Date(s.played_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    differential: s.score_differential,
    gross: s.gross_score,
  }));

  const role = user?.role;
  const latestEval = evaluations[0];

  if (loading) return <div className="flex items-center justify-center h-64 text-azure">Loading...</div>;

  return (
    <div data-testid="dashboard-home" className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-black text-silver">Welcome, {user?.full_name?.split(" ")[0]}</h2>
        <p className="text-slate text-sm mt-1">
          {role === "STUDENT" ? "Track your progress and improve your game." :
           role === "COACH" ? "Manage your students and evaluations." :
           role === "PARENT" ? "Monitor your child's golf development." :
           "Oversee the Junior Golf Academy."}
        </p>
      </div>

      {/* Stats Row */}
      {(role === "STUDENT" || role === "COACH") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          <StatCard icon={TrendingDown} label="Handicap Index" value={user?.current_hcp_index?.toFixed(1) || "54.0"} color="azure" />
          <StatCard icon={Trophy} label="Level" value={`${user?.evaluation_level || 0} / 8`} color="gold" />
          <StatCard icon={Target} label="Rounds Played" value={scorecards.length} color="azure" />
          <StatCard icon={Calendar} label="Evaluations" value={evaluations.length} color="gold" />
        </div>
      )}

      {/* Chart + Recent */}
      {role === "STUDENT" && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-light rounded-2xl p-6 animate-fade-in-up stagger-2">
            <h3 className="text-sm font-bold text-silver mb-4">Handicap Index Trend (WHS 2024)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0082CD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0082CD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip contentStyle={{ backgroundColor: "#012349", border: "1px solid rgba(0,130,205,0.3)", borderRadius: "12px", color: "#F4F4F6" }} />
                <Area type="monotone" dataKey="differential" stroke="#0082CD" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDiff)" dot={{ r: 4, fill: "#0082CD", strokeWidth: 2, stroke: "#012349" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-light rounded-2xl p-6 animate-fade-in-up stagger-3">
            <h3 className="text-sm font-bold text-silver mb-4">Recent Rounds</h3>
            <div className="space-y-3">
              {scorecards.slice(0, 5).map(sc => (
                <div key={sc.id} className="bg-navy border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-silver">{sc.course_name}</p>
                      <p className="text-[10px] text-slate">{sc.tee_color} Tees &middot; {new Date(sc.played_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-azure">{sc.gross_score}</p>
                      <p className="text-[10px] text-slate">Diff: {sc.score_differential}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coach: Recent Evaluations */}
      {role === "COACH" && evaluations.length > 0 && (
        <div className="glass-light rounded-2xl p-6 animate-fade-in-up stagger-2">
          <h3 className="text-sm font-bold text-silver mb-4">Recent Evaluations</h3>
          <div className="space-y-3">
            {evaluations.slice(0, 5).map(ev => (
              <div key={ev.id} className="bg-navy border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-silver">{ev.student_name}</p>
                  <p className="text-xs text-slate">Level {ev.level} &middot; {new Date(ev.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-azure font-bold">Putting: {ev.putting_score}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parent: Child info */}
      {role === "PARENT" && (
        <div className="glass-light rounded-2xl p-6 animate-fade-in-up stagger-1">
          <h3 className="text-sm font-bold text-silver mb-2">Your KCC ID</h3>
          <p className="text-azure font-mono text-lg">{user?.kcc_id || "Not set"}</p>
          <p className="text-xs text-slate mt-2">Children linked to your account will appear here. Check the Consent Requests tab for pending approvals.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClass = color === "gold" ? "text-gold" : "text-azure";
  return (
    <div className="glass-light rounded-2xl p-5">
      <Icon size={20} className={`${colorClass} mb-2`} />
      <p className="text-2xl font-black text-silver">{value}</p>
      <p className="text-xs text-slate mt-1">{label}</p>
    </div>
  );
}
