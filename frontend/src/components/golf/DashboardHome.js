import React, { useState, useEffect } from "react";
import { useAuth, useApi } from "@/App";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown, Trophy, Target, Calendar, Users, Star, Upload, Zap, Bell, BarChart3, Shield } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();
  const api = useApi();
  const [scorecards, setScorecards] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [children, setChildren] = useState([]);

  const role = user?.role;

  useEffect(() => {
    const load = async () => {
      try {
        const calls = [
          api.get("/scorecards").catch(() => ({ data: [] })),
          api.get("/evaluations").catch(() => ({ data: [] })),
        ];

        if (role === "ADMIN" || role === "COACH") {
          calls.push(
            api.get("/users?role=STUDENT").catch(() => ({ data: [] })),
            api.get("/users?role=COACH").catch(() => ({ data: [] })),
            api.get("/tournaments").catch(() => ({ data: [] })),
            api.get("/announcements").catch(() => ({ data: [] })),
            api.get("/events").catch(() => ({ data: [] })),
            api.get("/coach-evaluations/aggregate").catch(() => ({ data: [] })),
          );
        }

        if (role === "PARENT") {
          calls.push(
            api.get("/pending-approvals").catch(() => ({ data: [] })),
            api.get("/announcements").catch(() => ({ data: [] })),
            api.get("/tournaments").catch(() => ({ data: [] })),
          );
        }

        const results = await Promise.all(calls);
        setScorecards(results[0].data);
        setEvaluations(results[1].data);

        if (role === "ADMIN" || role === "COACH") {
          const students = results[2]?.data || [];
          const coaches = results[3]?.data || [];
          const tourns = results[4]?.data || [];
          const anns = results[5]?.data || [];
          const events = results[6]?.data || [];
          const ratings = results[7]?.data || [];

          setTournaments(tourns);
          setAnnouncements(anns);
          setAdminStats({
            students: students.length,
            coaches: coaches.length,
            tournaments: tourns.length,
            liveTournaments: tourns.filter(t => t.status === "LIVE").length,
            scorecards: results[0].data.length,
            events: events.length,
            announcements: anns.length,
            avgCoachRating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.average_rating, 0) / ratings.length).toFixed(1) : "N/A",
          });
        }

        if (role === "PARENT") {
          setChildren(results[2]?.data || []);
          setAnnouncements(results[3]?.data || []);
          setTournaments(results[4]?.data || []);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const chartData = scorecards.slice().reverse().map(s => ({
    date: new Date(s.played_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    differential: s.score_differential,
    gross: s.gross_score,
  }));

  if (loading) return <div className="flex items-center justify-center h-64 text-azure">Loading...</div>;

  return (
    <div data-testid="dashboard-home" className="space-y-6 sm:space-y-8 max-w-5xl">
      {/* Welcome */}
      <div className="animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl font-black text-silver">Welcome, {user?.full_name?.split(" ")[0]}</h2>
        <p className="text-slate text-sm mt-1">
          {role === "STUDENT" ? "Track your progress and improve your game." :
           role === "COACH" ? "Manage your students and evaluations." :
           role === "PARENT" ? "Monitor your child's golf development." :
           "Oversee the Junior Golf Academy."}
        </p>
      </div>

      {/* ===== ADMIN DASHBOARD ===== */}
      {role === "ADMIN" && adminStats && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up stagger-1">
            <StatCard icon={Users} label="Students" value={adminStats.students} color="azure" />
            <StatCard icon={Star} label="Coaches" value={adminStats.coaches} color="gold" />
            <StatCard icon={Trophy} label="Tournaments" value={adminStats.tournaments} color="azure" />
            <StatCard icon={BarChart3} label="Total Scorecards" value={adminStats.scorecards} color="gold" />
          </div>

          {/* Second row of stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up stagger-2">
            <StatCard icon={Zap} label="Live Tournaments" value={adminStats.liveTournaments} color="azure" />
            <StatCard icon={Calendar} label="Events" value={adminStats.events} color="gold" />
            <StatCard icon={Bell} label="Announcements" value={adminStats.announcements} color="azure" />
            <StatCard icon={Star} label="Avg Coach Rating" value={adminStats.avgCoachRating} color="gold" />
          </div>

          {/* Live Tournament Alert */}
          {tournaments.filter(t => t.status === "LIVE").length > 0 && (
            <div className="glass rounded-2xl p-4 sm:p-5 border border-red-500/30 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1 rounded-full animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE NOW
                </span>
              </div>
              {tournaments.filter(t => t.status === "LIVE").map(t => (
                <div key={t.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-silver">{t.title}</p>
                    <p className="text-xs text-slate">{t.location} &middot; {t.date}</p>
                  </div>
                  <span className="text-azure text-xs font-bold">Go to Live Scoring &rarr;</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <div className="glass-light rounded-2xl p-4 sm:p-5 animate-fade-in-up stagger-3">
              <h3 className="text-sm font-bold text-silver mb-3">Recent Broadcasts</h3>
              <div className="space-y-2">
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="bg-navy border border-white/5 rounded-xl p-3 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-silver text-sm truncate">{a.title}</p>
                      <p className="text-[10px] text-slate">{a.author_name} &middot; {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    {a.priority === "HIGH" && <span className="shrink-0 bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded">HIGH</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== STUDENT DASHBOARD ===== */}
      {(role === "STUDENT" || role === "COACH") && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in-up stagger-1">
          <StatCard icon={TrendingDown} label="Handicap Index" value={user?.current_hcp_index?.toFixed(1) || "54.0"} color="azure" />
          <StatCard icon={Trophy} label="Level" value={`${user?.evaluation_level || 0} / 8`} color="gold" />
          <StatCard icon={Target} label="Rounds Played" value={scorecards.length} color="azure" />
          <StatCard icon={Calendar} label="Evaluations" value={evaluations.length} color="gold" />
        </div>
      )}

      {role === "STUDENT" && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 glass-light rounded-2xl p-4 sm:p-6 animate-fade-in-up stagger-2">
            <h3 className="text-sm font-bold text-silver mb-4">Handicap Index Trend (WHS 2024)</h3>
            <ResponsiveContainer width="100%" height={260}>
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
          <div className="glass-light rounded-2xl p-4 sm:p-6 animate-fade-in-up stagger-3">
            <h3 className="text-sm font-bold text-silver mb-4">Recent Rounds</h3>
            <div className="space-y-3">
              {scorecards.slice(0, 5).map(sc => (
                <div key={sc.id} className="bg-navy border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-silver truncate">{sc.course_name}</p>
                      <p className="text-[10px] text-slate">{sc.tee_color} Tees &middot; {new Date(sc.played_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
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

      {/* ===== COACH: Recent Evaluations ===== */}
      {role === "COACH" && (
        <>
          {adminStats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-in-up stagger-2">
              <StatCard icon={Users} label="Your Students" value={adminStats.students} color="azure" />
              <StatCard icon={Calendar} label="Upcoming Events" value={adminStats.events} color="gold" />
              <StatCard icon={Zap} label="Live Tournaments" value={adminStats.liveTournaments} color="azure" />
            </div>
          )}
          {evaluations.length > 0 && (
            <div className="glass-light rounded-2xl p-4 sm:p-6 animate-fade-in-up stagger-3">
              <h3 className="text-sm font-bold text-silver mb-4">Recent Evaluations</h3>
              <div className="space-y-3">
                {evaluations.slice(0, 5).map(ev => (
                  <div key={ev.id} className="bg-navy border border-white/5 rounded-xl p-3 sm:p-4 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-silver text-sm truncate">{ev.student_name}</p>
                      <p className="text-xs text-slate">Level {ev.level} &middot; {new Date(ev.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-azure font-bold text-sm shrink-0">Putting: {ev.putting_score}/10</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== PARENT DASHBOARD ===== */}
      {role === "PARENT" && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in-up stagger-1">
            <div className="glass-light rounded-2xl p-4 sm:p-5">
              <Shield size={20} className="text-azure mb-2" />
              <p className="text-xs text-slate">Your KCC ID</p>
              <p className="text-lg sm:text-xl font-black text-azure font-mono">{user?.kcc_id || "Not set"}</p>
            </div>
            <div className="glass-light rounded-2xl p-4 sm:p-5">
              <Bell size={20} className="text-gold mb-2" />
              <p className="text-xs text-slate">Pending Consents</p>
              <p className="text-lg sm:text-xl font-black text-silver">{children.filter(c => c.status === "PENDING").length}</p>
            </div>
          </div>

          {/* Live Tournaments */}
          {tournaments.filter(t => t.status === "LIVE").length > 0 && (
            <div className="glass rounded-2xl p-4 sm:p-5 border border-red-500/30 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-[10px] font-black tracking-[0.15em] uppercase px-3 py-1 rounded-full animate-pulse">
                  <span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE
                </span>
                <span className="text-sm font-bold text-silver">Tournament in Progress</span>
              </div>
              {tournaments.filter(t => t.status === "LIVE").map(t => (
                <div key={t.id} className="bg-navy border border-white/5 rounded-xl p-3">
                  <p className="font-bold text-silver">{t.title}</p>
                  <p className="text-xs text-slate">{t.location} &middot; {t.date}</p>
                </div>
              ))}
              <p className="text-xs text-azure mt-2">Check the Live Leaderboard for real-time scores.</p>
            </div>
          )}

          {/* Recent Announcements */}
          {announcements.length > 0 && (
            <div className="glass-light rounded-2xl p-4 sm:p-5 animate-fade-in-up stagger-3">
              <h3 className="text-sm font-bold text-silver mb-3">Latest Academy Updates</h3>
              <div className="space-y-2">
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="bg-navy border border-white/5 rounded-xl p-3">
                    <p className="font-bold text-silver text-sm">{a.title}</p>
                    <p className="text-xs text-slate mt-1 line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClass = color === "gold" ? "text-gold" : "text-azure";
  return (
    <div className="glass-light rounded-2xl p-4 sm:p-5">
      <Icon size={20} className={`${colorClass} mb-2`} />
      <p className="text-xl sm:text-2xl font-black text-silver">{value}</p>
      <p className="text-xs text-slate mt-1">{label}</p>
    </div>
  );
}
