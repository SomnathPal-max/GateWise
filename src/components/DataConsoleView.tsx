import { useState, useMemo } from "react";
import { StadiumData } from "../types";
import { Database, Check, AlertCircle, Activity } from "lucide-react";
import PredictionChart, { PredictionDataPoint } from "./PredictionChart";

interface DataConsoleViewProps {
  data: StadiumData;
  onUpdate: (data: StadiumData) => void;
}

export default function DataConsoleView({ data, onUpdate }: DataConsoleViewProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generate mock prediction data for a specific zone
  const predictionDataPoints = useMemo<PredictionDataPoint[]>(() => {
    const currentZone = data.zones[0];
    const currentDensity = currentZone ? currentZone.occupancy_pct : 50;
    const now = new Date();
    
    // Create 6 data points over the next hour
    return Array.from({ length: 6 }).map((_, i) => {
      const time = new Date(now.getTime() + i * 10 * 60000); // 10 min intervals
      
      let predicted = currentDensity;
      if (i > 0) {
        // Curve towards a peak or drop
        predicted = Math.max(0, Math.min(100, currentDensity + (i * 5) * (Math.random() > 0.5 ? 1 : -0.5)));
      }
      
      const historical = Math.max(0, Math.min(100, predicted + (Math.random() * 20 - 10)));
      return { time, predicted, historical };
    });
  }, [data.zones, data.timestamp]); // update when data changes

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onUpdate(parsed);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
      setSuccess(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError("Cannot format: Invalid JSON");
    }
  };

  return (
    <div className="p-6 pb-6 flex flex-col h-full gap-4 dark:bg-slate-950 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Data Console (Jury Review)</h2>
        <div className="text-[10px] font-mono bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded text-indigo-300 uppercase tracking-widest">
          Test Feed
        </div>
      </div>
      
      <p className="text-xs dark:text-slate-400 text-slate-600 uppercase tracking-tight mb-2">
        Simulate live stadium conditions manually or paste a JSON state.
      </p>

      <div className="flex flex-col gap-2 mb-2">
        <h3 className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Activity size={12} />
          Crowd Density Forecast vs Historical ({data.zones[0]?.name || "Zone"})
        </h3>
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-lg p-2">
          <PredictionChart dataPoints={predictionDataPoints} />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-2">
        <h3 className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest mb-1">Gate Capacity Simulators</h3>
        {data.gates.map(gate => (
          <div key={gate.id} className="flex items-center gap-3 dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-3 rounded-lg">
            <label className="text-[10px] font-bold dark:text-slate-300 text-slate-700 w-16 uppercase tracking-widest">{gate.id}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={gate.occupancy_pct}
              onChange={(e) => {
                const newData = { 
                  ...data, 
                  gates: data.gates.map(g => g.id === gate.id ? { ...g, occupancy_pct: parseInt(e.target.value) } : g) 
                };
                onUpdate(newData);
                setJsonText(JSON.stringify(newData, null, 2));
              }}
              className="flex-1 accent-indigo-500 h-1 dark:bg-slate-800 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono dark:text-slate-400 text-slate-600 w-8 text-right">{gate.occupancy_pct}%</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-3 rounded text-xs font-mono flex items-center gap-2 border border-rose-500/20">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded text-xs font-mono flex items-center gap-2 border border-emerald-500/20">
          <Check size={14} />
          Data applied successfully. Map and AI updated.
        </div>
      )}

      <div className="flex-1 min-h-[300px] flex flex-col relative border dark:border-slate-700 border-slate-300 rounded dark:bg-slate-950 bg-slate-50/50 shadow-inner">
        <div className="dark:bg-slate-900 bg-white px-4 py-2 flex items-center justify-between border-b dark:border-slate-800 border-slate-200">
          <span className="text-[10px] font-mono dark:text-slate-400 text-slate-600">stadium_state.json</span>
          <button 
            onClick={handleFormat}
            className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Format
          </button>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="flex-1 w-full bg-transparent dark:text-slate-300 text-slate-700 p-4 font-mono text-[10px] focus:outline-none resize-none leading-relaxed"
          spellCheck="false"
        />
      </div>

      <button
        onClick={handleApply}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest py-3 rounded transition-colors"
      >
        Apply Test Data
      </button>
    </div>
  );
}
