import React, { useState, useEffect } from "react";
import { useApi } from "@/App";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function HandicapChart() {
  const api = useApi();
  const [scorecards, setScorecards] = useState([]);

  useEffect(() => {
    api.get("/scorecards").then(r => setScorecards(r.data)).catch(() => {});
  }, []);

  const data = scorecards.slice().reverse().map(s => ({
    date: new Date(s.played_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    index: s.score_differential,
    gross: s.gross_score,
  }));

  if (data.length === 0) {
    return (
      <div data-testid="handicap-chart-empty" className="glass-light rounded-2xl p-8 text-center">
        <p className="text-slate">No rounds recorded yet. Submit a scorecard to see your trend.</p>
      </div>
    );
  }

  return (
    <div data-testid="handicap-chart" className="glass-light rounded-2xl p-6">
      <h3 className="text-sm font-bold text-silver mb-4">Handicap Index Trend (WHS 2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIdx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0082CD" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0082CD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Tooltip contentStyle={{ backgroundColor: "#012349", border: "1px solid rgba(0,130,205,0.3)", borderRadius: "12px", color: "#F4F4F6" }} />
          <Area type="monotone" dataKey="index" stroke="#0082CD" strokeWidth={3} fillOpacity={1} fill="url(#colorIdx)" dot={{ r: 4, fill: "#0082CD", strokeWidth: 2, stroke: "#012349" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
