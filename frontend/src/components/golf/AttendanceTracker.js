import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { Loader2, Plus, X, Calendar } from "lucide-react";

export default function AttendanceTracker() {
  const api = useApi();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [roster, setRoster] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start_time: "", end_time: "" });
  const [creating, setCreating] = useState(false);

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

  const createEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start_time) return;
    setCreating(true);
    try {
      const end = newEvent.end_time || new Date(new Date(newEvent.start_time).getTime() + 2 * 3600000).toISOString();
      const res = await api.post("/events", { title: newEvent.title, start_time: newEvent.start_time, end_time: end });
      const updatedEvents = [res.data, ...events];
      setEvents(updatedEvents);
      selectEvent(res.data);
      setShowCreateEvent(false);
      setNewEvent({ title: "", start_time: "", end_time: "" });
    } catch {}
    setCreating(false);
  };

  const presentCount = roster.filter(r => r.status === "PRESENT").length;

  return (
    <div data-testid="attendance-tracker" className="max-w-xl mx-auto">
      {/* Event selector & create */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {events.map(ev => (
          <button key={ev.id} onClick={() => selectEvent(ev)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${selectedEvent?.id === ev.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            {ev.title}
          </button>
        ))}
        <button data-testid="create-event-btn" onClick={() => setShowCreateEvent(!showCreateEvent)}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${showCreateEvent ? "bg-white/10 text-slate" : "border border-dashed border-azure/40 text-azure hover:bg-azure/10"}`}>
          {showCreateEvent ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Event</>}
        </button>
      </div>

      {/* Create Event Form */}
      {showCreateEvent && (
        <form onSubmit={createEvent} data-testid="create-event-form" className="glass rounded-2xl p-5 mb-4 space-y-3 animate-fade-in-up">
          <input data-testid="event-title-input" type="text" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title (e.g., Saturday Practice)..." className="w-full bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure text-sm" required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate mb-1">Start Time</label>
              <input data-testid="event-start-input" type="datetime-local" value={newEvent.start_time} onChange={e => setNewEvent(p => ({ ...p, start_time: e.target.value }))} className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2.5 text-silver outline-none focus:border-azure text-xs" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate mb-1">End Time (optional)</label>
              <input type="datetime-local" value={newEvent.end_time} onChange={e => setNewEvent(p => ({ ...p, end_time: e.target.value }))} className="w-full bg-navy border border-white/10 rounded-xl px-3 py-2.5 text-silver outline-none focus:border-azure text-xs" />
            </div>
          </div>
          <button data-testid="create-event-submit" type="submit" disabled={creating || !newEvent.title} className="w-full bg-azure text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <Calendar size={14} /> {creating ? "Creating..." : "Create Event"}
          </button>
        </form>
      )}

      {selectedEvent ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-azure/20 to-transparent p-4 sm:p-6 border-b border-white/5">
            <h2 className="text-lg sm:text-2xl font-black text-white mb-1">{selectedEvent.title}</h2>
            <p className="text-white/60 text-xs sm:text-sm">{selectedEvent.start_time ? new Date(selectedEvent.start_time).toLocaleString() : ""}</p>
            <div className="mt-2 sm:mt-3 inline-block bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur">
              Attendance: {presentCount} / {roster.length}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {roster.map(student => (
              <div key={student.student_id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/3 transition-colors">
                <div>
                  <p className="font-bold text-silver text-sm">{student.name}</p>
                  <p className="text-xs text-azure">Hcp: {student.handicap?.toFixed(1)}</p>
                </div>
                <button data-testid={`attendance-toggle-${student.student_id}`} onClick={() => toggleStatus(student.student_id)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 shrink-0 ${student.status === "PRESENT" ? "bg-emerald-500" : "bg-white/15"}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${student.status === "PRESENT" ? "translate-x-9" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6 bg-white/3 border-t border-white/5">
            <button data-testid="save-attendance-btn" onClick={saveAttendance} disabled={saving}
              className="w-full bg-gold text-navy py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : saved ? "Saved!" : "Finalize Attendance"}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-light rounded-2xl p-8 text-center">
          <Calendar size={40} className="text-azure mx-auto mb-3" />
          <p className="text-silver font-bold mb-1">No Events Yet</p>
          <p className="text-slate text-sm">Create your first event to start tracking attendance.</p>
        </div>
      )}
    </div>
  );
}
