import React, { useState, useEffect, useRef } from "react";
import { useApi, useAuth } from "@/App";
import { Send } from "lucide-react";

export default function RealtimeChat() {
  const api = useApi();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const pollRef = useRef(null);

  const isReadOnly = user?.role === "PARENT";

  useEffect(() => {
    api.get("/channels").then(r => {
      setChannels(r.data);
      if (r.data.length > 0) setActiveChannel(r.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    const fetchMsgs = () => {
      api.get(`/channels/${activeChannel.id}/messages`).then(r => setMessages(r.data)).catch(() => {});
    };
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 4000);
    return () => clearInterval(pollRef.current);
  }, [activeChannel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || isReadOnly || !activeChannel) return;
    setSending(true);
    try {
      const res = await api.post(`/channels/${activeChannel.id}/messages`, { content: newMsg.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMsg("");
    } catch {}
    setSending(false);
  };

  return (
    <div data-testid="realtime-chat" className="max-w-3xl">
      {/* Channel tabs */}
      <div className="flex gap-2 mb-4">
        {channels.map(ch => (
          <button key={ch.id} data-testid={`channel-${ch.id}`}
            onClick={() => setActiveChannel(ch)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeChannel?.id === ch.id ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            {ch.name}
          </button>
        ))}
      </div>

      {/* Chat container */}
      <div className="flex flex-col h-[500px] glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white/3 p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-silver font-bold tracking-widest text-sm uppercase">{activeChannel?.name || "Team Chat"}</h3>
          {isReadOnly && <span className="bg-red-500/15 text-red-400 text-[10px] px-2 py-1 rounded font-bold tracking-widest">READ ONLY</span>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-slate mb-1 px-1 flex items-center gap-1">
                  {msg.sender_name}
                  {msg.sender_role && <span className="text-azure">({msg.sender_role})</span>}
                </span>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${isMe ? "bg-azure text-white rounded-br-sm" : "bg-white/5 text-silver rounded-bl-sm"}`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-slate mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
            );
          })}
          <div ref={endRef} />
          {messages.length === 0 && <p className="text-center text-slate text-sm py-12">No messages yet. Be the first to say hello!</p>}
        </div>

        {/* Input */}
        <div className="p-4 bg-white/3 border-t border-white/5">
          {isReadOnly ? (
            <div className="text-center text-slate text-sm italic py-2">Parents can monitor this channel for safety, but cannot send messages.</div>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input data-testid="chat-input" type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-navy border border-white/10 rounded-xl px-4 py-3 text-silver outline-none focus:border-azure transition-colors text-sm" />
              <button data-testid="chat-send-btn" type="submit" disabled={!newMsg.trim() || sending} className="bg-azure text-white px-5 py-3 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all">
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
