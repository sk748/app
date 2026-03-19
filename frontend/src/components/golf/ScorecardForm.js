import React, { useState, useEffect } from "react";
import { useApi, useAuth } from "@/App";
import { Check, Loader2 } from "lucide-react";

export default function ScorecardForm() {
  const api = useApi();
  const { refreshUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTee, setSelectedTee] = useState("");
  const [grossScore, setGrossScore] = useState("");
  const [holesPlayed, setHolesPlayed] = useState("18");
  const [pcc, setPcc] = useState("0");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/courses").then(r => setCourses(r.data)).catch(() => {});
  }, []);

  const currentCourse = courses.find(c => c.id === selectedCourse);
  const tees = currentCourse?.tees || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTee || !grossScore) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/scores/sync", {
        tee_id: selectedTee,
        gross_score: parseInt(grossScore),
        holes_played: parseInt(holesPlayed),
        pcc: parseFloat(pcc),
      });
      setResult(res.data);
      refreshUser();
    } catch (err) {
      setResult({ success: false, error: err?.response?.data?.detail || "Failed" });
    }
    setLoading(false);
  };

  if (result?.success) {
    return (
      <div data-testid="scorecard-success" className="max-w-lg mx-auto animate-fade-in-up">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-silver mb-2">Round Synced</h2>
          <p className="text-slate mb-6">Your scorecard has been verified by the WHS 2024 engine.</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-navy rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate">Gross Score</p>
              <p className="text-2xl font-black text-silver">{result.scorecard?.gross_score}</p>
            </div>
            <div className="bg-navy rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate">Score Differential</p>
              <p className="text-2xl font-black text-azure">{result.differential}</p>
            </div>
            <div className="col-span-2 bg-azure/10 border border-azure/20 rounded-xl p-4">
              <p className="text-xs text-azure">New Handicap Index</p>
              <p className="text-3xl font-black text-azure">{result.new_handicap_index}</p>
            </div>
          </div>
          <button data-testid="enter-another-btn" onClick={() => { setResult(null); setGrossScore(""); }} className="bg-azure text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all">
            Enter Another Round
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="scorecard-form" className="max-w-lg mx-auto">
      <div className="glass rounded-2xl p-8">
        <h2 className="text-xl font-black text-silver mb-1">Submit Scorecard</h2>
        <p className="text-slate text-sm mb-6">Your score will be verified server-side using the WHS 2024 math engine.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-silver/80 mb-1.5">Course</label>
            <select data-testid="course-select" value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedTee(""); }} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors" required>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {tees.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Tee</label>
              <div className="grid grid-cols-3 gap-2">
                {tees.map(t => (
                  <button key={t.id} type="button" data-testid={`tee-${t.color.toLowerCase()}`}
                    onClick={() => setSelectedTee(t.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedTee === t.id ? "border-azure bg-azure/15 text-azure" : "border-white/10 text-slate hover:border-white/20"}`}>
                    <p className="font-bold text-sm">{t.color}</p>
                    <p className="text-[10px] mt-1">CR: {t.course_rating} / SR: {t.slope_rating}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Gross Score</label>
              <input data-testid="gross-score-input" type="number" value={grossScore} onChange={e => setGrossScore(e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors text-center text-2xl font-bold" placeholder="88" min="36" max="180" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Holes Played</label>
              <select data-testid="holes-select" value={holesPlayed} onChange={e => setHolesPlayed(e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors text-center text-2xl font-bold">
                <option value="18">18</option>
                <option value="9">9</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-silver/80 mb-1.5">PCC Adjustment</label>
            <select data-testid="pcc-select" value={pcc} onChange={e => setPcc(e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors">
              <option value="-1">-1 (Easier conditions)</option>
              <option value="0">0 (Normal)</option>
              <option value="1">+1</option>
              <option value="2">+2</option>
              <option value="3">+3 (Harder conditions)</option>
            </select>
          </div>

          {result?.error && <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">{result.error}</div>}

          <button data-testid="submit-scorecard-btn" type="submit" disabled={loading || !selectedTee || !grossScore} className="w-full bg-azure text-white py-4 rounded-xl font-bold shadow-lg shadow-azure/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Submit & Verify Score"}
          </button>
        </form>
      </div>
    </div>
  );
}
