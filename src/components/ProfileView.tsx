import { StadiumData } from "../types";
import { User, ShieldCheck } from "lucide-react";

interface ProfileViewProps {
  data: StadiumData;
  onUpdate: (data: StadiumData) => void;
}

export default function ProfileView({ data, onUpdate }: ProfileViewProps) {
  const profile = data.fan_profile;

  const handleChange = (field: keyof typeof profile, value: any) => {
    onUpdate({
      ...data,
      fan_profile: {
        ...profile,
        [field]: value
      }
    });
  };

  return (
    <div className="p-6 pb-6 flex flex-col gap-8 dark:bg-slate-950 bg-slate-50 min-h-full">
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div className="w-16 h-16 rounded-xl dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 flex items-center justify-center text-indigo-400 mb-4">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold dark:text-slate-100 text-slate-900 uppercase tracking-tighter">Fan Profile</h2>
        <p className="text-[10px] dark:text-slate-500 text-slate-400 uppercase tracking-widest text-center mt-1">
          Settings
        </p>
      </div>

      <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between">
          <label className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Seat Section</label>
          <input 
            type="text" 
            value={profile.seat_section}
            onChange={(e) => handleChange("seat_section", e.target.value)}
            className="w-24 text-right dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded dark:text-slate-300 text-slate-700 px-3 py-1.5 text-sm font-mono focus:border-indigo-500 outline-none"
          />
        </div>
        
        <div className="p-4 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between">
          <div>
            <label className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest block">Accessibility</label>
            <span className="text-[10px] dark:text-slate-500 text-slate-400 uppercase">Require step-free routes</span>
          </div>
          <button 
            onClick={() => handleChange("accessibility_needed", !profile.accessibility_needed)}
            className={`w-12 h-6 rounded-full transition-colors relative ${profile.accessibility_needed ? 'bg-indigo-600' : 'dark:bg-slate-700 bg-slate-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${profile.accessibility_needed ? 'translate-x-6.5 left-0' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="p-4 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between">
          <label className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest">Language</label>
          <select
            value={profile.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded dark:text-slate-300 text-slate-700 px-3 py-1.5 text-sm uppercase focus:border-indigo-500 outline-none"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <label className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest block">Notifications</label>
            <span className="text-[10px] dark:text-slate-500 text-slate-400 uppercase">Vibrate for critical alerts</span>
          </div>
          <button 
            onClick={() => handleChange("vibration_enabled", !profile.vibration_enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${profile.vibration_enabled ? 'bg-indigo-600' : 'dark:bg-slate-700 bg-slate-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${profile.vibration_enabled ? 'translate-x-6.5 left-0' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 overflow-hidden p-4">
        <h3 className="text-xs font-bold dark:text-slate-400 text-slate-600 uppercase tracking-widest mb-4">Test Haptic Feedback</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              import("../utils/haptics").then(m => m.triggerHaptic('low-battery'));
            }}
            className="w-full text-left p-3 rounded bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest flex items-center justify-between"
          >
            <span>Simulate Low Battery</span>
            <span className="text-[10px] opacity-60">Long pulses</span>
          </button>
          
          <button
            onClick={() => {
              import("../utils/haptics").then(m => m.triggerHaptic('proximity'));
            }}
            className="w-full text-left p-3 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-widest flex items-center justify-between"
          >
            <span>Simulate Gate Proximity</span>
            <span className="text-[10px] opacity-60">Short pulses</span>
          </button>
        </div>
      </div>

      <div className="dark:bg-slate-800 bg-slate-100/30 border-l-2 border-slate-500 p-4 rounded-r-lg flex gap-3 text-sm dark:text-slate-400 text-slate-600">
        <ShieldCheck size={20} className="shrink-0 mt-0.5 dark:text-slate-500 text-slate-400" />
        <p className="text-xs leading-relaxed">Profile data is stored locally for this session to improve AI reasoning.</p>
      </div>
    </div>
  );
}
