import { useState, useEffect } from "react";
import { Map, MessageSquare, User, Bell, Database, AlertTriangle, Sun, Moon } from "lucide-react";
import { StadiumData, ChatMessage, Alert, Incident } from "./types";
import { generateDefaultData } from "./data";

import MapView from "./components/MapView";
import ChatView from "./components/ChatView";
import ProfileView from "./components/ProfileView";
import AlertsView from "./components/AlertsView";
import DataConsoleView from "./components/DataConsoleView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "chat" | "profile" | "alerts" | "data">("map");
  const [stadiumData, setStadiumData] = useState<StadiumData>(generateDefaultData());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  
  useEffect(() => {
    // Generate initial alerts from incidents
    const initialAlerts = stadiumData.incidents
      .filter(i => i.active)
      .map(i => {
        // Mock proximity logic
        const isNearby = stadiumData.fan_profile.seat_section === "114" && (i.zone_id.includes("R2") || i.zone_id === "G7");
        return {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: isNearby ? `PROXIMITY WARNING: ${i.message} near your section!` : i.message,
          type: "incident" as const,
          priority: isNearby ? "Critical" : i.priority
        };
      });
    setAlerts(initialAlerts);
  }, [stadiumData.incidents, stadiumData.fan_profile.seat_section]);

  const handleDataUpdate = (newData: StadiumData) => {
    setStadiumData(newData);
    // When data updates, also add new incidents to alerts
    const newAlerts = newData.incidents
      .filter(i => i.active)
      .map(i => {
        const isNearby = newData.fan_profile.seat_section === "114" && (i.zone_id.includes("R2") || i.zone_id === "G7");
        return {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: isNearby ? `PROXIMITY WARNING: ${i.message} near your section!` : i.message,
          type: "incident" as const,
          priority: isNearby ? "Critical" : i.priority
        };
      });
    
    if (newAlerts.some(a => a.priority === "Critical") && newData.fan_profile.vibration_enabled) {
       import("./utils/haptics").then(m => m.triggerHaptic('proximity'));
    }
    
    setAlerts(prev => [...prev, ...newAlerts]);
  };

  const navItems = [
    { id: "map", label: "Map", icon: Map },
    { id: "chat", label: "Ask AI", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "data", label: "Dev Data", icon: Database },
  ] as const;

  const handleReportIncident = (incident: Incident) => {
    handleDataUpdate({
      ...stadiumData,
      incidents: [incident, ...stadiumData.incidents]
    });
  };

  return (
    <div className="flex flex-col h-screen dark:bg-slate-950 bg-slate-50 dark:text-slate-100 text-slate-900 font-sans">
      <header className="h-20 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between px-6 dark:bg-slate-900 bg-white/50 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xl italic font-serif text-white">G</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase dark:text-slate-100 text-slate-900">GateWise</h1>
            <p className="text-[10px] tracking-widest dark:text-slate-400 text-slate-600 uppercase">AI Fan Navigator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stadiumData.incidents.some(i => i.active) && (
            <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full text-sm font-medium animate-pulse border border-rose-500/20">
              <AlertTriangle size={16} />
              <span className="uppercase text-[10px] tracking-widest font-bold">Active Incident</span>
            </div>
          )}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full dark:hover:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="text-slate-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto w-full max-w-3xl mx-auto">
          {activeTab === "map" && <MapView data={stadiumData} onAskAi={() => setActiveTab("chat")} onReportIncident={handleReportIncident} />}
          {activeTab === "chat" && <ChatView data={stadiumData} messages={messages} setMessages={setMessages} />}
          {activeTab === "profile" && <ProfileView data={stadiumData} onUpdate={handleDataUpdate} />}
          {activeTab === "alerts" && <AlertsView alerts={alerts} data={stadiumData} setAlerts={setAlerts} />}
          {activeTab === "data" && <DataConsoleView data={stadiumData} onUpdate={handleDataUpdate} />}
        </div>
      </main>

      <nav className="dark:bg-slate-900 bg-white border-t dark:border-slate-800 border-slate-200 pb-6">
        <div className="max-w-3xl mx-auto flex justify-around p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? "text-indigo-400 font-medium" 
                  : "dark:text-slate-500 text-slate-400 hover:dark:bg-slate-800 bg-slate-100 hover:dark:text-slate-300 text-slate-700"
              }`}
            >
              <item.icon size={22} className={`mb-1 ${activeTab === item.id ? "text-indigo-400" : ""}`} />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
