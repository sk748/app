import React, { useState, useEffect } from "react";
import { useApi, useAuth } from "@/App";
import { Plus, X, Send } from "lucide-react";

export default function ClassFeed() {
  const api = useApi();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [sending, setSending] = useState(false);

  const canPost = user?.role === "COACH" || user?.role === "ADMIN";

  useEffect(() => {
    api.get("/announcements").then(r => setAnnouncements(r.data)).catch(() => {});
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true);
    try {
      const res = await api.post("/announcements", { title, content, priority });
      setAnnouncements(prev => [res.data, ...prev]);
      setTitle(""); setContent(""); setPriority("NORMAL"); setShowForm(false);
    } catch {}
    setSending(false);
  };

  return (
    <div data-testid="class-feed" className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-silver">Academy Broadcasts</h2>
        {canPost && (
          <button data-testid="new-broadcast-btn" onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${showForm ? "bg-white/10 text-slate" : "bg-azure text-white hover:brightness-110"}`}>
            {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Broadcast</>}
          </button>
        )}
      </div>

      {/* New Announcement Form */}
      {showForm && canPost && (
        <form onSubmit={handlePost} data-testid="broadcast-form" className="glass rounded-2xl p-5 mb-6 space-y-4 animate-fade-in-up">
          <input data-testid="broadcast-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Broadcast title..." className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure text-sm" required />
          <textarea data-testid="broadcast-content" value={content} onChange={e => setContent(e.target.value)} placeholder="Broadcast message..." className="w-full h-24 bg-navy border border-white/10 rounded-xl p-4 text-silver outline-none focus:border-azure resize-none text-sm" />
          <div className="flex items-center justify-between gap-3">
            <select data-testid="broadcast-priority" value={priority} onChange={e => setPriority(e.target.value)} className="bg-navy border border-white/10 rounded-xl px-4 py-2.5 text-silver text-sm outline-none focus:border-azure">
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
            <button data-testid="broadcast-submit" type="submit" disabled={sending || !title.trim()} className="bg-azure text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
              <Send size={14} /> {sending ? "Posting..." : "Post Broadcast"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(item => (
          <div key={item.id} data-testid={`feed-item-${item.id}`} className="glass-light rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            {item.priority === "HIGH" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
            <div className="flex justify-between items-center mb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-azure/15 flex items-center justify-center font-bold text-xs text-azure border border-azure/20 shrink-0">
                  {item.author_name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-silver truncate">{item.author_name}</p>
                  <p className="text-[10px] tracking-widest text-azure uppercase">{item.author_role}</p>
                </div>
              </div>
              <span className="text-xs text-slate shrink-0">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="font-bold text-silver mb-1 text-sm sm:text-base">{item.title}</h3>
            <p className="text-slate text-sm leading-relaxed">{item.content}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-slate text-center py-8">No broadcasts yet.</p>}
      </div>
    </div>
  );
}
