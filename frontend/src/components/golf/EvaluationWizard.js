import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Loader2, Check } from "lucide-react";

export default function EvaluationWizard() {
  const api = useApi();
  const [step, setStep] = useState(1);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    student_id: "", level: 1, putting_score: "", etiquette_checked: false, rules_checked: false, notes: "",
    chipping_score: "", driving_accuracy: "", on_course_score: "",
  });

  useEffect(() => {
    api.get("/users?role=STUDENT").then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/evaluations", {
        student_id: form.student_id,
        level: form.level,
        putting_score: form.putting_score ? parseInt(form.putting_score) : null,
        etiquette_checked: form.etiquette_checked,
        rules_checked: form.rules_checked,
        notes: form.notes,
        technical_metrics: {
          chipping_score: form.chipping_score,
          driving_accuracy: form.driving_accuracy,
          on_course_score: form.on_course_score,
        },
      });
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

  if (submitted) {
    return (
      <div data-testid="eval-success" className="max-w-md mx-auto glass rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-emerald-400" /></div>
        <h2 className="text-2xl font-black text-silver mb-2">Evaluation Recorded</h2>
        <p className="text-slate mb-6">Level {form.level} evaluation has been saved.</p>
        <button data-testid="new-eval-btn" onClick={() => { setSubmitted(false); setStep(1); setForm({ student_id: "", level: 1, putting_score: "", etiquette_checked: false, rules_checked: false, notes: "", chipping_score: "", driving_accuracy: "", on_course_score: "" }); }} className="bg-azure text-white px-6 py-3 rounded-xl font-bold">New Evaluation</button>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Select Student</label>
              <select data-testid="eval-student-select" value={form.student_id} onChange={e => update("student_id", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure" required>
                <option value="">Choose student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} (Hcp: {s.current_hcp_index})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Evaluation Level</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(l => (
                  <button key={l} type="button" onClick={() => update("level", l)}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${form.level === l ? "border-azure bg-azure/15 text-azure" : "border-white/10 text-slate hover:border-white/20"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-xs font-bold text-silver/80 mb-1.5">Short Game: Putting (5ft)</label>
            <input data-testid="putting-score-input" type="number" value={form.putting_score} onChange={e => update("putting_score", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure text-center text-2xl font-bold" placeholder="0-10" min="0" max="10" />
            <p className="text-slate text-xs">Target for Level {form.level}: {form.level <= 2 ? "5/10" : form.level <= 4 ? "7/10" : "8/10"}</p>
            <label className="block text-xs font-bold text-silver/80 mt-4 mb-1.5">Chipping Score</label>
            <input type="number" value={form.chipping_score} onChange={e => update("chipping_score", e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure text-center text-2xl font-bold" placeholder="0-10" min="0" max="10" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-xs font-bold text-silver/80 mb-1.5">Etiquette & Rules</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 glass-light rounded-xl cursor-pointer hover:bg-white/5 transition">
                <input type="checkbox" checked={form.etiquette_checked} onChange={e => update("etiquette_checked", e.target.checked)} className="w-5 h-5 rounded accent-azure" />
                <span className="text-silver text-sm">Understands pace of play?</span>
              </label>
              <label className="flex items-center gap-3 p-3 glass-light rounded-xl cursor-pointer hover:bg-white/5 transition">
                <input type="checkbox" checked={form.rules_checked} onChange={e => update("rules_checked", e.target.checked)} className="w-5 h-5 rounded accent-azure" />
                <span className="text-silver text-sm">Knows basic water hazard rules?</span>
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-xs font-bold text-silver/80 mb-1.5">Coach's Remarks</label>
            <textarea data-testid="eval-notes" value={form.notes} onChange={e => update("notes", e.target.value)} className="w-full h-32 bg-navy border border-white/10 rounded-xl p-4 text-silver outline-none focus:border-azure resize-none" placeholder="Student progression notes..." />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div data-testid="evaluation-wizard" className="max-w-md mx-auto">
      <div className="glass rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-silver">Level {form.level} Evaluation</h2>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? "bg-azure" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
          <span className="text-azure text-xs font-mono bg-azure/10 px-3 py-1 rounded-lg">Step {step}/4</span>
        </div>

        <div className="min-h-[200px]">{renderStep()}</div>

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button onClick={prevStep} className="flex-1 py-3 rounded-xl border border-white/15 text-silver font-semibold hover:bg-white/5 transition-all">Back</button>
          )}
          <button data-testid="eval-next-btn"
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={loading || (step === 1 && !form.student_id)}
            className="flex-1 py-3 rounded-xl bg-azure text-white font-bold shadow-lg shadow-azure/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : step === 4 ? "Submit Evaluation" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
