import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StadiumData } from "../types";
import { ChevronUp, ChevronDown, BarChart2 } from "lucide-react";

export default function ChartCard({ data }: { data: StadiumData }) {
  const [isOpen, setIsOpen] = useState(false);

  const chartData = [
    ...data.gates.map(g => ({ name: g.id, density: g.occupancy_pct, type: 'gate' })),
    ...data.zones.map(z => ({ name: z.id, density: z.occupancy_pct, type: 'zone' }))
  ];

  return (
    <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl overflow-hidden mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between dark:bg-slate-900 bg-white hover:dark:bg-slate-800 bg-slate-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-indigo-400" />
          <span className="text-xs font-bold dark:text-slate-300 text-slate-700 uppercase tracking-widest">Density Chart</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="dark:text-slate-500 text-slate-400" /> : <ChevronDown size={16} className="dark:text-slate-500 text-slate-400" />}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t dark:border-slate-800 border-slate-200 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                   let fill = "#10b981"; // emerald
                   if (entry.density >= 50) fill = "#f59e0b"; // amber
                   if (entry.density >= 80) fill = "#f43f5e"; // rose
                   return <Cell key={`cell-${index}`} fill={fill} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
