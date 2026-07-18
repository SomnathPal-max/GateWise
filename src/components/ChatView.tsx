import React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Mic } from "lucide-react";
import { StadiumData, ChatMessage } from "../types";

interface ChatViewProps {
  data: StadiumData;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ChatView({ data, messages, setMessages }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "ai",
        response: {
          recommendation: `Hi! I'm GateWise. I can help you find the best way around the stadium.`,
          reason: `I use live crowd data and your profile (Section ${data.fan_profile.seat_section}) to guide you.`
        }
      }]);
    }
  }, [messages.length, setMessages, data.fan_profile.seat_section]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stadiumData: data,
          profile: data.fan_profile,
          prompt: userMessage.text,
          isProactive: false
        })
      });

      if (!res.ok) throw new Error("API error");
      const result = await res.json();

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        response: result
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "ai",
        response: {
          recommendation: "Sorry, I couldn't process that right now.",
          reason: "There was a network error reaching the concierge service."
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col dark:bg-slate-900 bg-white border-l dark:border-slate-800 border-slate-200">
      <div className="p-6 border-b dark:border-slate-800 border-slate-200 bg-indigo-600/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Concierge</h2>
        </div>
        <p className="text-lg font-serif italic dark:text-slate-100 text-slate-900">"How can I help you navigate the stadium today, Priya?"</p>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-6 pt-6 flex flex-col gap-6"
      >
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div className="inline-block dark:bg-slate-800 bg-slate-100 p-3 rounded-2xl rounded-tr-none text-sm dark:text-slate-100 text-slate-900">
                {msg.text}
              </div>
            ) : (
              <div className="bg-indigo-600/20 p-4 rounded-2xl rounded-tl-none border border-indigo-500/30 max-w-[90%]">
                <p className="text-sm font-serif italic leading-relaxed text-indigo-100">
                  {msg.response?.recommendation}
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-500/20">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1 tracking-tighter">Why this route?</p>
                  <p className="text-xs dark:text-slate-300 text-slate-700 leading-tight">
                    {msg.response?.reason}
                  </p>
                  {msg.response?.alternative && (
                    <div className="mt-2 text-xs dark:text-slate-400 text-slate-600 leading-tight border-t border-indigo-500/10 pt-2">
                      <span className="text-[10px] font-bold text-indigo-300/70 uppercase">Alternative:</span> {msg.response.alternative}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.role === 'ai' && (
              <div className="flex items-center gap-2 px-2 mt-2">
                 <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                 <span className="text-[10px] dark:text-slate-500 text-slate-400 uppercase">Reasoning based on Live JSON Feed</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-indigo-300 text-sm italic font-serif">
              <Loader2 size={16} className="animate-spin" />
              Analyzing live stadium pulse...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 w-full dark:bg-slate-900 bg-white border-t dark:border-slate-800 border-slate-200 p-4 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            type="button"
            onClick={() => {
              const openGates = data.gates.filter(g => !data.incidents.some(i => i.zone_id === g.id && i.active) && g.status === 'open');
              if (openGates.length > 0) {
                const bestGate = openGates.reduce((min, g) => g.occupancy_pct < min.occupancy_pct ? g : min);
                setInput(`Which gate is the least crowded right now? Can you recommend ${bestGate.name}?`);
              }
            }}
            className="whitespace-nowrap dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border dark:border-slate-700 border-slate-300"
          >
            Find Least Crowded Gate
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center relative max-w-3xl mx-auto w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask GateWise..."
            className="w-full dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 rounded-full py-3 px-5 pr-12 text-sm dark:text-slate-100 text-slate-900 placeholder:dark:text-slate-600 text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="button"
            onClick={toggleListen}
            className={`absolute right-12 top-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-rose-500/20 text-rose-500' : 'dark:text-slate-400 text-slate-600 hover:dark:text-slate-300 text-slate-700'}`}
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
