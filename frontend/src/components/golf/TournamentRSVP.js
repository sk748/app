import React, { useState, useEffect } from "react";
import { useApi, useAuth } from "@/App";
import { Lock, Check } from "lucide-react";

export default function TournamentRSVP() {
  const api = useApi();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState({});

  useEffect(() => {
    api.get("/tournaments").then(r => setTournaments(r.data)).catch(() => {});
  }, []);

  const handleRSVP = async (id) => {
    try {
      await api.post(`/tournaments/${id}/rsvp`);
      setRsvpStatus(prev => ({ ...prev, [id]: true }));
    } catch {}
  };

  const studentHcp = user?.current_hcp_index || 54;
  const studentLevel = user?.evaluation_level || 0;

  return (
    <div data-testid="tournament-rsvp" className="max-w-3xl">
      <h2 className="text-2xl font-black text-silver mb-6 border-b border-white/5 pb-4">Upcoming Tournaments</h2>

      <div className="space-y-6">
        {tournaments.map(t => {
          const isEligible = studentHcp <= t.req_hcp && studentLevel >= t.req_level;
          const isAttending = rsvpStatus[t.id];

          return (
            <div key={t.id} data-testid={`tournament-${t.id}`} className="glass-light rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-azure/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded ${t.type === "Elite" ? "bg-gold/15 text-gold" : "bg-azure/15 text-azure"}`}>
                    {t.type}
                  </span>
                  <p className="text-slate text-sm">{t.date}</p>
                </div>
                <h3 className="text-xl font-bold text-silver">{t.title}</h3>
                <p className="text-xs text-slate mt-1">{t.location}</p>
                {!isEligible && (
                  <p className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1">
                    <Lock size={12} /> Requires: Index &le; {t.req_hcp} & Level {t.req_level}+
                  </p>
                )}
              </div>

              <div className="w-full md:w-auto shrink-0">
                {isAttending ? (
                  <button disabled className="w-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Check size={16} /> Registered
                  </button>
                ) : (
                  <button data-testid={`rsvp-btn-${t.id}`} onClick={() => handleRSVP(t.id)} disabled={!isEligible}
                    className={`w-full px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${isEligible ? "bg-azure text-white hover:brightness-110 active:scale-[0.98]" : "bg-white/5 text-slate cursor-not-allowed"}`}>
                    {isEligible ? "RSVP Now" : "Locked"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {tournaments.length === 0 && <p className="text-slate text-center py-8">No upcoming tournaments.</p>}
      </div>
    </div>
  );
}
