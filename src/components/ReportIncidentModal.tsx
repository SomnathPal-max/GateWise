import React, { useState } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { StadiumData, Incident } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StadiumData;
  onReport: (incident: Incident) => void;
}

export default function ReportIncidentModal({ isOpen, onClose, data, onReport }: ReportIncidentModalProps) {
  const [zoneId, setZoneId] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "Critical">("Low");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId || !message) return;
    onReport({
      zone_id: zoneId,
      type: "user_reported",
      message,
      active: true,
      priority
    });
    setZoneId("");
    setMessage("");
    setPriority("Low");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-slate-950 bg-slate-50/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 w-full max-w-sm relative"
      >
        <button onClick={onClose} className="absolute right-4 top-4 dark:text-slate-500 text-slate-400 hover:dark:text-slate-300 text-slate-700">
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold dark:text-slate-100 text-slate-900 uppercase tracking-tighter mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-rose-500" />
          Report Incident
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest block mb-1">Location</label>
            <select
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
              className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded p-2 text-sm dark:text-slate-300 text-slate-700 focus:border-indigo-500 outline-none"
              required
            >
              <option value="">Select location...</option>
              {data.gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              {data.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          
          <div>
             <label className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest block mb-1">Priority</label>
             <div className="flex gap-2">
               {["Low", "Medium", "Critical"].map(p => (
                 <button
                   key={p}
                   type="button"
                   onClick={() => setPriority(p as any)}
                   className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-colors ${priority === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'dark:bg-slate-950 bg-slate-50 dark:border-slate-700 border-slate-300 dark:text-slate-500 text-slate-400'}`}
                 >
                   {p}
                 </button>
               ))}
             </div>
          </div>

          <div>
            <label className="text-[10px] font-bold dark:text-slate-500 text-slate-400 uppercase tracking-widest block mb-1">Description</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. Spilled drink blocking the aisle"
              className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded p-2 text-sm dark:text-slate-300 text-slate-700 focus:border-indigo-500 outline-none resize-none h-20"
              required
            />
          </div>
          
          <button type="submit" className="w-full bg-rose-500 hover:bg-rose-400 text-white py-3 rounded text-xs font-bold uppercase tracking-widest mt-2 transition-colors">
            Submit Report
          </button>
        </form>
      </motion.div>
    </div>
  );
}
