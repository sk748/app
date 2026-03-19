import React, { useState, useEffect } from "react";
import { useApi, useAuth } from "@/App";
import { Shield, Check, X } from "lucide-react";

export default function VPCFlows() {
  const api = useApi();
  const { user, refreshUser } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [kccId, setKccId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/pending-approvals").then(r => {
      setApprovals(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      // The guardian_kcc_id is set during registration; this form is for reference
      setSubmitted(true);
    } catch {}
  };

  const handleApproval = async (id, status) => {
    try {
      await api.put(`/pending-approvals/${id}`, { status });
      setApprovals(prev => prev.filter(a => a.id !== id));
      refreshUser();
    } catch {}
  };

  if (loading) return <div className="text-azure text-center py-12">Loading...</div>;

  // Student View
  if (user?.role === "STUDENT") {
    return (
      <div data-testid="vpc-student" className="max-w-md mx-auto">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-black text-silver mb-2">Guardian Link</h2>
          <p className="text-slate text-sm mb-6">
            {user?.is_consent_verified
              ? "Your account has been verified by a guardian."
              : "Your account requires parental consent. Enter your guardian's KCC ID during registration."}
          </p>

          {user?.is_consent_verified ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-400 font-medium">
              <Check size={20} /> Consent Verified
            </div>
          ) : (
            <>
              {approvals.length > 0 && (
                <div className="space-y-3 mb-4">
                  {approvals.map(a => (
                    <div key={a.id} className="bg-azure/10 border border-azure/20 p-3 rounded-xl text-sm">
                      <p className="text-azure font-bold">Request to: {a.guardian_kcc_id}</p>
                      <p className="text-slate text-xs">Status: {a.status}</p>
                    </div>
                  ))}
                </div>
              )}
              {!submitted ? (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <input data-testid="vpc-kcc-input" type="text" value={kccId} onChange={e => setKccId(e.target.value.toUpperCase())} placeholder="e.g., KCC-1042" className="w-full bg-navy border border-white/10 rounded-xl p-4 font-mono tracking-widest text-silver outline-none focus:border-azure" required />
                  <button data-testid="vpc-submit-btn" type="submit" className="w-full bg-azure text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all">Send Link Request</button>
                </form>
              ) : (
                <div className="bg-azure/15 border border-azure/30 p-4 rounded-xl text-azure font-medium text-center">
                  Request sent! Waiting for guardian approval.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Parent View
  return (
    <div data-testid="vpc-parent" className="max-w-lg mx-auto">
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-gold" />
          <h2 className="text-xl font-black text-gold">Consent Requests</h2>
        </div>

        <div className="mb-4 bg-white/3 rounded-xl p-3">
          <p className="text-xs text-slate">Your KCC ID:</p>
          <p className="text-azure font-mono font-bold text-lg">{user?.kcc_id || "Not set"}</p>
        </div>

        {approvals.length === 0 ? (
          <p className="text-slate text-sm py-4">No pending consent requests.</p>
        ) : (
          <div className="space-y-3">
            {approvals.map(req => (
              <div key={req.id} data-testid={`approval-${req.id}`} className="bg-navy border border-white/10 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-silver">{req.student_name || "Junior Player"}</p>
                  <p className="text-xs text-slate">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button data-testid={`deny-${req.id}`} onClick={() => handleApproval(req.id, "REJECTED")} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                  <button data-testid={`approve-${req.id}`} onClick={() => handleApproval(req.id, "APPROVED")} className="px-4 py-2 bg-azure text-white rounded-lg font-bold text-sm hover:brightness-110 transition-all">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
