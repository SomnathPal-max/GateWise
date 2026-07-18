import React from "react";
import { useState } from "react";
import { Alert, StadiumData } from "../types";
import { BellRing, Info, AlertTriangle, Loader2 } from "lucide-react";

interface AlertsViewProps {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  data: StadiumData;
}

export default function AlertsView({ alerts, setAlerts, data }: AlertsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNudge = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stadiumData: data,
          profile: data.fan_profile,
          prompt: "",
          isProactive: true
        })
      });

      if (res.ok) {
        const result = await res.json();
        const newAlert: Alert = {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: result.recommendation,
          type: "nudge"
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 pb-6 flex flex-col gap-6 dark:bg-slate-950 bg-slate-50 min-h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest">Proactive Nudges</h2>
        <button
          onClick={handleGenerateNudge}
          disabled={isGenerating}
          className="dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 bg-slate-200 dark:text-slate-200 text-slate-800 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-70 border dark:border-slate-700 border-slate-300"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
          Test Nudge
        </button>
      </div>

      <div className="flex flex-col gap-4 relative">
        {alerts.length === 0 ? (
          <div className="text-center py-12 dark:text-slate-600 text-slate-400 dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 border-dashed">
            <BellRing size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-xs uppercase tracking-widest">No active alerts</p>
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 dark:border-slate-800 border-slate-200 space-y-4">
            {alerts.map(alert => {
              let borderColor = 'border-amber-500';
              let bgColor = 'bg-amber-500/10';
              let textColor = 'text-amber-500';
              let dotColor = 'bg-amber-500';
              
              if (alert.type === 'incident') {
                if (alert.priority === 'Critical') {
                  borderColor = 'border-rose-500';
                  bgColor = 'bg-rose-500/10';
                  textColor = 'text-rose-500';
                  dotColor = 'bg-rose-500';
                } else if (alert.priority === 'Medium') {
                  borderColor = 'border-orange-500';
                  bgColor = 'bg-orange-500/10';
                  textColor = 'text-orange-500';
                  dotColor = 'bg-orange-500';
                } else {
                  borderColor = 'border-yellow-500';
                  bgColor = 'bg-yellow-500/10';
                  textColor = 'text-yellow-500';
                  dotColor = 'bg-yellow-500';
                }
              }

              return (
              <div key={alert.id} className="relative">
                <div className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 dark:border-slate-950 border-white ${dotColor}`} style={{ left: '-23px' }}></div>
                <div 
                  className={`p-4 rounded-xl border flex gap-3 shadow-sm ${bgColor} ${borderColor} dark:text-slate-200 text-slate-800`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${textColor}`}>
                          {alert.type === 'incident' ? 'Incident Alert' : 'Upcoming Bottleneck'}
                        </span>
                        {alert.priority && (
                           <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest ${textColor} ${borderColor} font-bold`}>
                             {alert.priority}
                           </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-60 font-mono dark:text-slate-400 text-slate-600">{alert.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed dark:text-slate-300 text-slate-700">{alert.message}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
