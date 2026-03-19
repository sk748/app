import React, { useState, useEffect } from "react";
import { useApi } from "@/App";

export default function ClassFeed() {
  const api = useApi();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    api.get("/announcements").then(r => setAnnouncements(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="class-feed" className="max-w-2xl">
      <h2 className="text-xl font-black text-silver mb-6">Academy Broadcasts</h2>

      <div className="space-y-4">
        {announcements.map(item => (
          <div key={item.id} data-testid={`feed-item-${item.id}`} className="glass-light rounded-2xl p-5 relative overflow-hidden">
            {item.priority === "HIGH" && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}

            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-azure/15 flex items-center justify-center font-bold text-xs text-azure border border-azure/20">
                  {item.author_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-silver">{item.author_name}</p>
                  <p className="text-[10px] tracking-widest text-azure uppercase">{item.author_role}</p>
                </div>
              </div>
              <span className="text-xs text-slate">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>

            <h3 className="font-bold text-silver mb-1">{item.title}</h3>
            <p className="text-slate text-sm leading-relaxed">{item.content}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-slate text-center py-8">No broadcasts yet.</p>}
      </div>
    </div>
  );
}
