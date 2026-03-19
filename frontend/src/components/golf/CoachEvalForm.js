import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Shield, Lock } from "lucide-react";

export default function CoachEvalForm() {
  const api = useApi();
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/users?role=COACH").then(r => setCoaches(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !selectedCoach) return;
    setLoading(true);
    try {
      await api.post("/coach-evaluations", { coach_id: selectedCoach, rating, feedback });
      setSubmitted(true);
    } catch {}
    setLoading(false);
  };

  if (submitted) {
    return (
      <div data-testid="eval-submitted" className="max-w-lg mx-auto glass rounded-2xl p-8 text-center animate-fade-in-up">
        <Shield size={48} className="text-azure mx-auto mb-4" />
        <h3 className="text-2xl font-black text-silver mb-2">Thank You</h3>
        <p className="text-slate">Your anonymous feedback helps us improve the KCC Academy experience.</p>
      </div>
    );
  }

  return (
    <div data-testid="coach-eval-form" className="max-w-lg mx-auto relative">
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative shield */}
        <div className="absolute -top-6 -right-6 text-white/3">
          <Shield size={180} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <Lock size={20} className="text-azure" />
            <h2 className="text-xl font-black text-silver">Anonymous Coach Evaluation</h2>
          </div>

          <p className="text-slate text-sm mb-6">Your feedback is strictly confidential. Coaches only see aggregated averages.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Select Coach</label>
              <select data-testid="coach-select" value={selectedCoach} onChange={e => setSelectedCoach(e.target.value)} className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure" required>
                <option value="">Choose coach...</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-silver/80 mb-2">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" data-testid={`star-${star}`} onClick={() => setRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? "text-gold" : "text-white/10"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-silver/80 mb-1.5">Constructive Feedback (Optional)</label>
              <textarea data-testid="feedback-input" value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full h-32 bg-navy border border-white/10 rounded-xl p-4 text-silver outline-none focus:border-azure resize-none" placeholder="What is the coach doing well? How can they improve?" />
            </div>

            <button data-testid="submit-eval-btn" type="submit" disabled={rating === 0 || !selectedCoach || loading} className="w-full bg-azure text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Securely"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
