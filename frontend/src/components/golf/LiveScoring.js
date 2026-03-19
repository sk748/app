import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Loader2, Check, Zap, Play, StopCircle } from "lucide-react";

const PAR_STROKES = [4, 4, 3, 5, 4, 5, 4, 3, 4, 4, 4, 3, 5, 4, 5, 4, 3, 4];
const HOLE_NAMES = Array.from({ length: 18 }, (_, i) => `${i + 1}`);

export default function LiveScoring() {
  const api = useApi();
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [holeScores, setHoleScores] = useState(Array(18).fill(null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingScores, setExistingScores] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/tournaments").catch(() => ({ data: [] })),
      api.get("/courses").catch(() => ({ data: [] })),
    ]).then(([t, c]) => {
      setTournaments(t.data);
      setCourses(c.data);
      const live = t.data.find(x => x.status === "LIVE");
      if (live) setSelected(live);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/tournaments/${selected.id}/rsvps`).then(r => setRsvps(r.data)).catch(() => {});
    api.get(`/tournaments/${selected.id}/live-scores`).then(r => setExistingScores(r.data)).catch(() => {});
  }, [selected]);

  const selectPlayer = (player) => {
    setSelectedPlayer(player);
    setSaved(false);
    const existing = existingScores.find(s => s.student_id === player.student_id);
    if (existing) {
      setHoleScores(existing.hole_scores || Array(18).fill(null));
    } else {
      setHoleScores(Array(18).fill(null));
    }
  };

  const setHole = (idx, val) => {
    setHoleScores(prev => {
      const next = [...prev];
      next[idx] = val === "" ? null : Math.max(1, Math.min(15, parseInt(val) || null));
      return next;
    });
    setSaved(false);
  };

  const saveScore = async () => {
    if (!selected || !selectedPlayer) return;
    setSaving(true);
    try {
      const res = await api.post(`/tournaments/${selected.id}/live-scores`, {
        student_id: selectedPlayer.student_id,
        hole_scores: holeScores,
        tee_id: selected.tee_id,
      });
      setSaved(true);
      const updated = await api.get(`/tournaments/${selected.id}/live-scores`);
      setExistingScores(updated.data);
    } catch {}
    setSaving(false);
  };

  const toggleTournamentStatus = async (tournamentId, newStatus) => {
    setStatusUpdating(true);
    try {
      await api.put(`/tournaments/${tournamentId}/status`, { status: newStatus });
      setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, status: newStatus } : t));
      if (selected?.id === tournamentId) setSelected(prev => ({ ...prev, status: newStatus }));
    } catch {}
    setStatusUpdating(false);
  };

  const played = holeScores.filter(h => h !== null);
  const total = played.reduce((a, b) => a + b, 0);
  const holesCompleted = played.length;
  const parPlayed = PAR_STROKES.slice(0, 18).filter((_, i) => holeScores[i] !== null).reduce((a, b) => a + b, 0);
  const toPar = total - parPlayed;

  return (
    <div data-testid="live-scoring" className="max-w-4xl">
      {/* Tournament selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tournaments.map(t => (
          <button key={t.id} data-testid={`score-tournament-${t.id}`}
            onClick={() => { setSelected(t); setSelectedPlayer(null); }}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${selected?.id === t.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            {t.status === "LIVE" && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
            <span className="truncate max-w-[150px]">{t.title}</span>
          </button>
        ))}
      </div>

      {!selected && (
        <div className="glass-light rounded-2xl p-8 text-center">
          <p className="text-slate">Select a tournament to begin scoring.</p>
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          {/* Tournament Controls */}
          <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-black text-silver">{selected.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded ${
                  selected.status === "LIVE" ? "bg-red-500/20 text-red-400" :
                  selected.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-azure/15 text-azure"
                }`}>{selected.status}</span>
                <span className="text-xs text-slate">{selected.date} &middot; {selected.location}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {selected.status === "UPCOMING" && (
                <button data-testid="go-live-btn" onClick={() => toggleTournamentStatus(selected.id, "LIVE")} disabled={statusUpdating}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
                  <Play size={14} /> Go Live
                </button>
              )}
              {selected.status === "LIVE" && (
                <button data-testid="end-tournament-btn" onClick={() => toggleTournamentStatus(selected.id, "COMPLETED")} disabled={statusUpdating}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
                  <StopCircle size={14} /> End Tournament
                </button>
              )}
            </div>
          </div>

          {/* Player Selection */}
          <div className="glass-light rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold text-slate mb-3 tracking-widest uppercase">Registered Players ({rsvps.length})</h4>
            <div className="flex flex-wrap gap-2">
              {rsvps.map(r => {
                const hasScores = existingScores.find(s => s.student_id === r.student_id);
                const holesIn = hasScores?.holes_completed || 0;
                return (
                  <button key={r.student_id} data-testid={`score-player-${r.student_id}`}
                    onClick={() => selectPlayer(r)}
                    className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedPlayer?.student_id === r.student_id
                        ? "bg-azure text-white"
                        : hasScores
                          ? "glass text-silver border border-azure/20"
                          : "glass text-slate hover:text-silver"
                    }`}>
                    {r.student_name}
                    {holesIn > 0 && (
                      <span className="ml-1.5 text-[10px] bg-azure/30 px-1.5 py-0.5 rounded text-azure font-bold">{holesIn}H</span>
                    )}
                  </button>
                );
              })}
              {rsvps.length === 0 && <p className="text-slate text-sm">No players registered yet.</p>}
            </div>
          </div>

          {/* Hole-by-Hole Input */}
          {selectedPlayer && (
            <div className="glass rounded-2xl p-4 sm:p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-silver">{selectedPlayer.student_name}</h3>
                  <p className="text-xs text-slate">Entering hole-by-hole scores</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-black text-silver">{total || "-"}</p>
                    <p className="text-[10px] text-slate">Total</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black ${toPar === 0 ? "text-emerald-400" : toPar > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {holesCompleted > 0 ? (toPar > 0 ? `+${toPar}` : toPar === 0 ? "E" : toPar) : "-"}
                    </p>
                    <p className="text-[10px] text-slate">To Par</p>
                  </div>
                </div>
              </div>

              {/* Front 9 */}
              <div className="mb-4">
                <p className="text-[10px] font-bold text-azure mb-2 tracking-widest">FRONT 9 (OUT)</p>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                  {[0,1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="text-center">
                      <div className="text-[10px] text-slate mb-0.5">{i + 1}</div>
                      <div className="text-[9px] text-slate/50 mb-1">P{PAR_STROKES[i]}</div>
                      <input
                        data-testid={`hole-input-${i + 1}`}
                        type="number"
                        min="1"
                        max="15"
                        value={holeScores[i] ?? ""}
                        onChange={e => setHole(i, e.target.value)}
                        className={`w-full text-center bg-navy border rounded-lg py-2 text-sm font-bold outline-none transition-colors ${
                          holeScores[i] !== null
                            ? holeScores[i] < PAR_STROKES[i] ? "border-emerald-500/50 text-emerald-400" :
                              holeScores[i] === PAR_STROKES[i] ? "border-white/20 text-silver" :
                              "border-red-500/30 text-red-400"
                            : "border-white/10 text-slate"
                        }`}
                        placeholder="-"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-right text-xs font-bold text-slate">
                  OUT: {holeScores.slice(0, 9).filter(h => h != null).reduce((a, b) => a + b, 0) || "-"}
                </div>
              </div>

              {/* Back 9 */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-azure mb-2 tracking-widest">BACK 9 (IN)</p>
                <div className="grid grid-cols-9 gap-1 sm:gap-2">
                  {[9,10,11,12,13,14,15,16,17].map(i => (
                    <div key={i} className="text-center">
                      <div className="text-[10px] text-slate mb-0.5">{i + 1}</div>
                      <div className="text-[9px] text-slate/50 mb-1">P{PAR_STROKES[i]}</div>
                      <input
                        data-testid={`hole-input-${i + 1}`}
                        type="number"
                        min="1"
                        max="15"
                        value={holeScores[i] ?? ""}
                        onChange={e => setHole(i, e.target.value)}
                        className={`w-full text-center bg-navy border rounded-lg py-2 text-sm font-bold outline-none transition-colors ${
                          holeScores[i] !== null
                            ? holeScores[i] < PAR_STROKES[i] ? "border-emerald-500/50 text-emerald-400" :
                              holeScores[i] === PAR_STROKES[i] ? "border-white/20 text-silver" :
                              "border-red-500/30 text-red-400"
                            : "border-white/10 text-slate"
                        }`}
                        placeholder="-"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-right text-xs font-bold text-slate">
                  IN: {holeScores.slice(9).filter(h => h != null).reduce((a, b) => a + b, 0) || "-"}
                </div>
              </div>

              {/* Save */}
              <button data-testid="save-live-score-btn" onClick={saveScore} disabled={saving || holesCompleted === 0}
                className="w-full bg-azure text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-azure/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <><Check size={18} /> Saved to Leaderboard</> : <><Zap size={18} /> Update Leaderboard</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
