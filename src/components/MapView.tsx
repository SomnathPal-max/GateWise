import React, { useState } from "react";
import { StadiumData, Incident } from "../types";
import { Search, MapPin, AlertCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StadiumHeatmap from "./StadiumHeatmap";
import ChartCard from "./ChartCard";
import ReportIncidentModal from "./ReportIncidentModal";

interface MapViewProps {
  data: StadiumData;
  onAskAi: () => void;
  onReportIncident: (incident: Incident) => void;
}

export default function MapView({ data, onAskAi, onReportIncident }: MapViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [navDistance, setNavDistance] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [suggestedPath, setSuggestedPath] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedDestination && navDistance > 0) {
      const timer = setInterval(() => {
        setNavDistance(prev => {
          const next = prev - 10;
          if (next <= 10 && prev > 10) {
             setToastMessage(`You are approaching ${selectedDestination}.`);
             setTimeout(() => setToastMessage(null), 4000);
          }
          return next > 0 ? next : 0;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedDestination, navDistance]);

  const handleNavigate = (destinationId: string) => {
    setSelectedDestination(destinationId);
    setNavDistance(150); // mock distance 150m
    
    // Calculate fastest path based on crowd density
    const sortedZones = [...data.zones]
      .filter(z => z.id !== destinationId)
      .sort((a, b) => a.occupancy_pct - b.occupancy_pct);
      
    const viaNode = sortedZones.length > 0 ? `${sortedZones[0].name} (Low Crowd) → ` : '';
    setSuggestedPath(`Section ${data.fan_profile.seat_section} → ${viaNode}${destinationId}`);
  };

  const getOccupancyColor = (pct: number) => {
    if (pct < 50) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (pct < 80) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  const getStatusDot = (pct: number) => {
    if (pct < 50) return "bg-emerald-500";
    if (pct < 80) return "bg-amber-500";
    return "bg-rose-500";
  };

  const calculateEstimatedArrival = (baseWalkTime: number, occupancyPct: number) => {
    // Increase walk time dynamically based on crowd density
    const delayFactor = occupancyPct > 50 ? 1 + ((occupancyPct - 50) / 100) : 1;
    const totalWalkTimeMins = Math.round(baseWalkTime * delayFactor);
    
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + totalWalkTimeMins);
    
    return {
      walkTime: totalWalkTimeMins,
      timeString: arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-6 pb-6 flex flex-col gap-6 dark:bg-slate-900 bg-white/30 min-h-full">
      {/* Search / AI Bar */}
      <button 
        onClick={onAskAi}
        className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:dark:bg-slate-800 bg-slate-100/50 transition-colors text-left group"
      >
        <div className="bg-indigo-600/20 p-2 rounded-full text-indigo-400 group-hover:bg-indigo-600/40 transition-colors">
          <Search size={20} />
        </div>
        <div>
          <p className="font-bold dark:text-slate-100 text-slate-900 uppercase tracking-tight">Ask GateWise AI</p>
          <p className="text-sm dark:text-slate-400 text-slate-600 font-serif italic">"What's the best route to Section 214?"</p>
        </div>
      </button>

      {/* Match Clock Context */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif italic dark:text-slate-300 text-slate-700">Stadium Pulse</h2>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => setIsModalOpen(true)}
             className="text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded border border-rose-500/20 transition-colors"
          >
            Report Incident
          </button>
          <div className="text-right">
            <p className="text-[10px] dark:text-slate-500 text-slate-400 uppercase font-bold tracking-widest">Match Clock</p>
            <p className="text-lg font-mono text-indigo-400">{data.match_clock}</p>
          </div>
        </div>
      </div>

      <StadiumHeatmap data={data} />
      <ChartCard data={data} />

      {/* Navigation Toast & Progress */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold tracking-widest flex items-center gap-2"
          >
            <MapPin size={16} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="dark:bg-slate-900 bg-white border border-indigo-500/50 rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <MapPin size={14} /> Navigating to {selectedDestination}
              </span>
              <span className="text-xs font-mono dark:text-slate-400 text-slate-500">{navDistance}m remaining</span>
            </div>
            
            <div className="w-full h-2 dark:bg-slate-800 bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-indigo-500" 
                 animate={{ width: `${Math.max(0, 100 - (navDistance / 150 * 100))}%` }}
               />
            </div>
            
            <div className="flex justify-between items-center text-[10px] dark:text-slate-400 text-slate-600 font-bold uppercase tracking-widest">
              <span>{(() => {
                const dest = data.gates.find(g => g.id === selectedDestination) || data.zones.find(z => z.id === selectedDestination);
                const walkTime = dest ? ('walk_time_min' in dest ? dest.walk_time_min : 5) : 5;
                const occ = dest ? dest.occupancy_pct : 50;
                return Math.ceil((navDistance / 150) * calculateEstimatedArrival(walkTime, occ).walkTime);
              })()} min walk</span>
              <span>ETA: {(() => {
                const dest = data.gates.find(g => g.id === selectedDestination) || data.zones.find(z => z.id === selectedDestination);
                const walkTime = dest ? ('walk_time_min' in dest ? dest.walk_time_min : 5) : 5;
                const occ = dest ? dest.occupancy_pct : 50;
                return calculateEstimatedArrival(walkTime * (navDistance / 150), occ).timeString;
              })()}</span>
            </div>
            
            {suggestedPath && (
              <div className="text-[10px] dark:text-slate-400 text-slate-600 border-t dark:border-slate-800 border-slate-200 pt-2 mt-1">
                <span className="font-bold uppercase tracking-widest text-emerald-500">Fastest Route: </span>
                {suggestedPath}
              </div>
            )}
            
            <button 
              onClick={() => setSelectedDestination(null)}
              className="text-[10px] uppercase font-bold tracking-widest text-rose-500 hover:text-rose-400 text-right mt-1"
            >
              Cancel Navigation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gates */}
      <section>
        <h2 className="text-xs font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={16} />
          Gates
        </h2>
        <div className="grid gap-4">
          <AnimatePresence>
            {data.gates.map(gate => {
              const hasIncident = data.incidents.some(i => i.zone_id === gate.id && i.active);
              const estArrival = calculateEstimatedArrival(gate.walk_time_min, gate.occupancy_pct);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={gate.id} 
                  className={`relative overflow-hidden dark:bg-slate-900 bg-white border ${hasIncident ? 'border-rose-500/50 ring-2 ring-rose-500/20' : 'dark:border-slate-800 border-slate-200'} rounded-2xl p-5 flex flex-col justify-between`}
                >
                  <div 
                    className={`absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-10 ${getStatusDot(gate.occupancy_pct)}`}
                  />
                  <div className="relative flex justify-between items-start mb-2">
                    <span className={`text-3xl font-bold font-mono ${hasIncident ? 'text-rose-500' : 'dark:text-slate-100 text-slate-900'}`}>{gate.id}</span>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${hasIncident ? "bg-rose-500/10 text-rose-500" : (gate.occupancy_pct < 50 ? "bg-emerald-500/10 text-emerald-500" : gate.occupancy_pct < 80 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500")}`}>
                      {hasIncident ? "CLOSED" : "OPEN"}
                    </div>
                  </div>
                  <div>
                    <p className="dark:text-slate-400 text-slate-600 text-xs mb-1 uppercase tracking-tight flex items-center gap-2">
                      {gate.name}
                      {hasIncident && <AlertCircle size={14} className="text-rose-500" />}
                    </p>
                    <div className="w-full h-2 dark:bg-slate-800 bg-slate-100 rounded-full overflow-hidden mb-2">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${gate.occupancy_pct}%` }}
                         transition={{ duration: 0.5, ease: "easeOut" }}
                         className={`h-full ${hasIncident ? 'bg-rose-500' : getStatusDot(gate.occupancy_pct)}`} 
                       />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className={`text-sm font-medium ${hasIncident ? 'text-rose-400' : 'dark:text-slate-300 text-slate-700'}`}>
                          {hasIncident ? "Security Incident - Rerouting" : `${gate.occupancy_pct}% Occupancy • ${estArrival.walkTime} min walk`}
                        </p>
                        {!hasIncident && (
                          <p className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-widest mt-0.5">
                            Est. Arrival: {estArrival.timeString}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {gate.accessible && !hasIncident && (
                          <span className="flex items-center gap-1 text-[10px] text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 h-fit">
                            <CheckCircle2 size={12} /> Accessible
                          </span>
                        )}
                        {!hasIncident && selectedDestination !== gate.id && (
                          <button 
                            onClick={() => handleNavigate(gate.id)}
                            className="text-[10px] uppercase font-bold tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                          >
                            Navigate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Concourses */}
      <section className="mt-4">
        <h2 className="text-xs font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={16} />
          Concourses & Amenities
        </h2>
        <div className="grid gap-4">
          <AnimatePresence>
            {data.zones.map(zone => {
              const hasIncident = data.incidents.some(i => i.zone_id === zone.id && i.active);
              const isFood = zone.type === 'food';
              return (
                 <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={zone.id} 
                  className={`relative overflow-hidden dark:bg-slate-900 bg-white border ${hasIncident ? 'border-rose-500/50' : 'dark:border-slate-800 border-slate-200'} rounded-2xl p-5 flex flex-col justify-between`}
                 >
                  <div 
                    className={`absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-10 ${getStatusDot(zone.occupancy_pct)}`}
                  />
                  <div className="relative flex justify-between items-start mb-2">
                    <span className="text-xl font-bold dark:text-slate-300 text-slate-700 uppercase tracking-tighter">{zone.id}</span>
                    <span className={`text-[10px] font-bold uppercase ${isFood ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {zone.type}
                    </span>
                  </div>
                  <div>
                    <p className="dark:text-slate-400 text-slate-600 text-xs mb-1 uppercase tracking-tight flex items-center gap-2">
                      {zone.name}
                      {hasIncident && <AlertCircle size={14} className="text-rose-500" />}
                    </p>
                    <div className="w-full h-2 dark:bg-slate-800 bg-slate-100 rounded-full overflow-hidden mb-2">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${zone.occupancy_pct}%` }}
                         transition={{ duration: 0.5, ease: "easeOut" }}
                         className={`h-full ${hasIncident ? 'bg-rose-500' : getStatusDot(zone.occupancy_pct)}`} 
                       />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${hasIncident ? 'text-rose-400' : 'dark:text-slate-300 text-slate-700'}`}>
                         {hasIncident ? "CLOSED" : `${zone.occupancy_pct}% Occupancy ${zone.predicted_peak_in_min ? `• Peak in ${zone.predicted_peak_in_min}m` : ''}`}
                      </p>
                      {!hasIncident && selectedDestination !== zone.id && (
                        <button 
                          onClick={() => handleNavigate(zone.id)}
                          className="text-[10px] uppercase font-bold tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          Navigate
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <ReportIncidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={data}
        onReport={onReportIncident}
      />
    </div>
  );
}
