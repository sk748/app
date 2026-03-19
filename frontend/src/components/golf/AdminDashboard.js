import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Upload, Star, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const api = useApi();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [coachRatings, setCoachRatings] = useState([]);

  useEffect(() => {
    api.get("/coach-evaluations/aggregate").then(r => setCoachRatings(r.data)).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.file?.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/bulk-import", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadMsg(`Successfully imported ${res.data.imported_count} members.`);
      e.target.reset();
    } catch (err) {
      setUploadMsg(`Error: ${err?.response?.data?.detail || "Upload failed"}`);
    }
    setUploading(false);
  };

  return (
    <div data-testid="admin-dashboard" className="max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-black text-silver mb-1">Academy Administration</h2>
        <p className="text-slate text-sm">Manage coach evaluations and bulk roster imports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coach Ratings */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gold flex items-center gap-2 mb-6">
            <Star size={20} /> Average Coach Ratings
          </h3>
          {coachRatings.length === 0 ? (
            <p className="text-slate text-sm">No evaluations yet.</p>
          ) : (
            <div className="space-y-4">
              {coachRatings.map(c => (
                <div key={c.coach_id} className="bg-navy border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-silver">{c.coach_name}</h4>
                    <p className="text-slate text-xs">{c.total_reviews} anonymous reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-azure">{c.average_rating.toFixed(1)}</div>
                    <div className="text-gold text-xs">
                      {"★".repeat(Math.round(c.average_rating))}{"☆".repeat(5 - Math.round(c.average_rating))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Import */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-azure flex items-center gap-2 mb-2">
            <Upload size={20} /> Bulk Roster Import
          </h3>
          <p className="text-slate text-sm mb-6">Upload .xlsx file to update the KCC Member database for Parental Consent verification.</p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div data-testid="file-drop-zone" className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-azure/40 transition-colors bg-navy/50">
              <input type="file" name="file" accept=".csv,.xlsx,.xls" className="block w-full text-sm text-slate file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-azure file:text-white hover:file:brightness-110 cursor-pointer" required />
              <p className="text-xs text-slate mt-4">Expected Columns: MemberNumber, FullName, Phone, Email</p>
            </div>

            <button data-testid="upload-btn" type="submit" disabled={uploading} className="w-full bg-azure text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
              {uploading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Upload & Sync Database"}
            </button>
          </form>

          {uploadMsg && (
            <div data-testid="upload-result" className={`mt-4 p-4 rounded-xl text-sm font-bold ${uploadMsg.includes("Error") ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {uploadMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
