import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Loader2 } from "lucide-react";

export default function AttendanceTracker() {
  const api = useApi();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [roster, setRoster] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/events").catch(() => ({ data: [] })),
      api.get("/users?role=STUDENT").catch(() => ({ data: [] })),
    ]).then(([ev, st]) => {
      setEvents(ev.data);
      setStudents(st.data);
      if (ev.data.length > 0) selectEvent(ev.data[0], st.data);
    });
  }, []);

  const selectEvent = (event, studs) => {
    setSelectedEvent(event);
    setSaved(false);
    const s = studs || students;
    setRoster(s.map(st => ({ student_id: st.id, name: st.full_name, handicap: st.current_hcp_index, status: "ABSENT" })));
  };

  const toggleStatus = (studentId) => {
    setRoster(prev => prev.map(r => r.student_id === studentId ? { ...r, status: r.status === "PRESENT" ? "ABSENT" : "PRESENT" } : r));
  };

  const saveAttendance = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      await api.post("/attendance", { event_id: selectedEvent.id, roster: roster.map(r => ({ student_id: r.student_id, status: r.status })) });
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  const presentCount = roster.filter(r => r.status === "PRESENT").length;

  return (
    <div data-testid="attendance-tracker" className="max-w-xl mx-auto">
      {/* Event selector */}
      {events.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {events.map(ev => (
            <button key={ev.id} onClick={() => selectEvent(ev)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedEvent?.id === ev.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
              {ev.title}
            </button>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-azure to-navy p-6 border-b border-white/5">
          <h2 className="text-2xl font-black text-white mb-1">{selectedEvent?.title || "Attendance"}</h2>
          <p className="text-white/70 text-sm">{selectedEvent?.start_time ? new Date(selectedEvent.start_time).toLocaleString() : ""}</p>
          <div className="mt-3 inline-block bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur">
            Attendance: {presentCount} / {roster.length}
          </div>
        </div>

        {/* Roster */}
        <div className="divide-y divide-white/5">
          {roster.map(student => (
            <div key={student.student_id} className="flex items-center justify-between p-4 hover:bg-white/3 transition-colors">
              <div>
                <p className="font-bold text-silver">{student.name}</p>
                <p className="text-xs text-azure">Hcp: {student.handicap?.toFixed(1)}</p>
              </div>
              <button data-testid={`attendance-toggle-${student.student_id}`} onClick={() => toggleStatus(student.student_id)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${student.status === "PRESENT" ? "bg-emerald-500" : "bg-white/15"}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${student.status === "PRESENT" ? "translate-x-9" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="p-6 bg-white/3 border-t border-white/5">
          <button data-testid="save-attendance-btn" onClick={saveAttendance} disabled={saving}
            className="w-full bg-gold text-navy py-4 rounded-xl font-black text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : saved ? "Saved!" : "Finalize Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
