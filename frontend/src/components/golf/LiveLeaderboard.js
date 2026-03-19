import React, { useState, useEffect, useRef } from "react";
import { useApi, useAuth } from "@/App";
import { Trophy, ChevronDown, ChevronUp, Zap, Clock, Users, Flag } from "lucide-react";

const PAR_STROKES = [4, 4, 3, 5, 4, 5, 4, 3, 4, 4, 4, 3, 5, 4, 5, 4, 3, 4];

function formatToPar(val) {
  if (val === 0) return "E";
  return val > 0 ? `+${val}` : `${val}`;
}

function toParColor(val) {
  if (val === null || val === undefined) return "text-slate";
  if (val <= 0) return "text-emerald-400";
  if (val <= 3) return "text-gold";
  return "text-red-400";
}

function holeScoreClass(score, par) {
  if (score === null || score === undefined) return "";
  const diff = score - par;
  if (diff <= -2) return "bg-amber-500 text-navy font-black";  // Eagle+
  if (diff === -1) return "bg-emerald-500/30 text-emerald-300 font-bold";  // Birdie
  if (diff === 0) return "text-silver";  // Par
  if (diff === 1) return "text-gold";  // Bogey
  return "text-red-400";  // Double+
}

export default function LiveLeaderboard() {
  const api = useApi();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    api.get("/tournaments").then(r => {
      const ts = r.data;
      setTournaments(ts);
      const live = ts.find(t => t.status === "LIVE");
      setSelected(live || ts[0] || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const fetchBoard = () => {
      api.get(`/tournaments/${selected.id}/leaderboard`)
        .then(r => setLeaderboard(r.data))
        .catch(() => {});
    };
    fetchBoard();
    pollRef.current = setInterval(fetchBoard, 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  if (loading) return <div className="text-azure text-center py-12">Loading tournaments...</div>;

  const scores = leaderboard?.scores || [];
  const tournament = leaderboard?.tournament || selected;
  const isLive = tournament?.status === "LIVE";

  return (
    <div data-testid="live-leaderboard" className="max-w-4xl">
      {/* Tournament selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tournaments.map(t => (
          <button key={t.id} data-testid={`lb-tournament-${t.id}`}
            onClick={() => { setSelected(t); setExpandedPlayer(null); }}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${selected?.id === t.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            {t.status === "LIVE" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            {t.status === "LIVE" ? <Zap size={14} /> : <Trophy size={14} />}
            <span className="truncate max-w-[150px]">{t.title}</span>
          </button>
        ))}
      </div>

      {/* Tournament Header */}
      {tournament && (
        <div className={`rounded-2xl p-5 sm:p-6 mb-6 border ${isLive ? "glass border-red-500/30" : "glass-light border-white/5"}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {isLive && (
                  <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full" /> LIVE
                  </span>
                )}
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded ${tournament.type === "Elite" ? "bg-gold/15 text-gold" : "bg-azure/15 text-azure"}`}>
                  {tournament.type}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-silver">{tournament.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate">
                <span className="flex items-center gap-1"><Clock size={12} /> {tournament.date}</span>
                <span className="flex items-center gap-1"><Flag size={12} /> {tournament.location}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="glass rounded-xl px-4 py-2 text-center">
                <p className="text-lg sm:text-xl font-black text-azure">{leaderboard?.players_started || 0}</p>
                <p className="text-[10px] text-slate">Playing</p>
              </div>
              <div className="glass rounded-xl px-4 py-2 text-center">
                <p className="text-lg sm:text-xl font-black text-gold">{leaderboard?.rsvp_count || 0}</p>
                <p className="text-[10px] text-slate">Registered</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {scores.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-white/5 text-[10px] font-bold text-slate uppercase tracking-widest">
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-1 text-center">Thru</div>
            <div className="col-span-2 text-center">Total</div>
            <div className="col-span-2 text-center">To Par</div>
            <div className="col-span-2 text-center">Diff</div>
          </div>

          {/* Rows */}
          {scores.map((s, i) => (
            <div key={s.student_id}>
              {/* Main Row */}
              <div
                data-testid={`lb-row-${i}`}
                onClick={() => setExpandedPlayer(expandedPlayer === s.student_id ? null : s.student_id)}
                className={`grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 items-center cursor-pointer transition-colors ${
                  i === 0 ? "bg-gold/5" : "hover:bg-white/3"
                }`}
              >
                <div className="col-span-2 sm:col-span-1 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-sm ${
                    i === 0 ? "bg-gold text-navy" : i === 1 ? "bg-slate/50 text-white" : i === 2 ? "bg-amber-700/50 text-amber-200" : "text-slate"
                  }`}>
                    {s.position}
                  </span>
                </div>
                <div className="col-span-5 sm:col-span-4 flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-azure/15 flex items-center justify-center text-azure font-bold text-xs border border-azure/20 shrink-0">
                    {s.student_name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-silver text-sm truncate">{s.student_name}</p>
                    <p className="text-[10px] text-slate">Hcp: {s.handicap_index?.toFixed(1)}</p>
                  </div>
                </div>
                <div className="col-span-1 text-center hidden sm:block">
                  <span className="text-azure font-bold text-sm">{s.holes_completed}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-silver font-black text-lg">{s.total_score}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className={`font-black text-lg ${toParColor(s.to_par)}`}>
                    {formatToPar(s.to_par)}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-2 text-center flex items-center justify-center gap-1">
                  <span className="text-azure font-mono text-xs hidden sm:inline">
                    {s.score_differential !== null ? s.score_differential.toFixed(1) : "---"}
                  </span>
                  {expandedPlayer === s.student_id
                    ? <ChevronUp size={14} className="text-azure" />
                    : <ChevronDown size={14} className="text-slate" />
                  }
                </div>
              </div>

              {/* Expanded Hole-by-Hole */}
              {expandedPlayer === s.student_id && (
                <div className="px-4 sm:px-6 py-4 bg-white/2 border-b border-white/5 animate-fade-in">
                  <p className="text-[10px] font-bold text-slate mb-2 tracking-widest uppercase">Hole-by-Hole Scorecard</p>
                  {/* Front 9 */}
                  <div className="mb-2">
                    <p className="text-[10px] text-azure mb-1 font-bold">OUT (1-9)</p>
                    <div className="grid grid-cols-10 gap-1">
                      {[1,2,3,4,5,6,7,8,9].map(h => (
                        <div key={h} className="text-center">
                          <div className="text-[9px] text-slate">{h}</div>
                          <div className="text-[9px] text-slate/50">P{PAR_STROKES[h-1]}</div>
                          <div className={`text-sm rounded ${holeScoreClass(s.hole_scores?.[h-1], PAR_STROKES[h-1])}`}>
                            {s.hole_scores?.[h-1] ?? "-"}
                          </div>
                        </div>
                      ))}
                      <div className="text-center border-l border-white/10">
                        <div className="text-[9px] text-slate">OUT</div>
                        <div className="text-[9px] text-slate/50">{PAR_STROKES.slice(0,9).reduce((a,b)=>a+b,0)}</div>
                        <div className="text-sm font-bold text-silver">
                          {s.hole_scores?.slice(0,9).filter(h=>h!=null).reduce((a,b)=>a+b,0) || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Back 9 */}
                  <div>
                    <p className="text-[10px] text-azure mb-1 font-bold">IN (10-18)</p>
                    <div className="grid grid-cols-10 gap-1">
                      {[10,11,12,13,14,15,16,17,18].map(h => (
                        <div key={h} className="text-center">
                          <div className="text-[9px] text-slate">{h}</div>
                          <div className="text-[9px] text-slate/50">P{PAR_STROKES[h-1]}</div>
                          <div className={`text-sm rounded ${holeScoreClass(s.hole_scores?.[h-1], PAR_STROKES[h-1])}`}>
                            {s.hole_scores?.[h-1] ?? "-"}
                          </div>
                        </div>
                      ))}
                      <div className="text-center border-l border-white/10">
                        <div className="text-[9px] text-slate">IN</div>
                        <div className="text-[9px] text-slate/50">{PAR_STROKES.slice(9).reduce((a,b)=>a+b,0)}</div>
                        <div className="text-sm font-bold text-silver">
                          {s.hole_scores?.slice(9).filter(h=>h!=null).reduce((a,b)=>a+b,0) || "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {s.score_differential !== null && (
                    <div className="mt-3 inline-block bg-azure/10 border border-azure/20 px-3 py-1.5 rounded-lg">
                      <span className="text-xs text-azure font-bold">WHS Differential: {s.score_differential.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-light rounded-2xl p-8 text-center">
          <Trophy size={40} className="text-azure mx-auto mb-3 opacity-40" />
          <p className="text-silver font-bold mb-1">No Scores Yet</p>
          <p className="text-slate text-sm">
            {isLive ? "Coaches are entering scores. Refresh to see updates." : "Scores will appear once the tournament goes live."}
          </p>
        </div>
      )}
    </div>
  );
}
