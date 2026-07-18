export interface Gate {
  id: string;
  name: string;
  occupancy_pct: number;
  status: string;
  walk_time_min: number;
  accessible: boolean;
}

export interface Zone {
  id: string;
  name: string;
  type: string;
  occupancy_pct: number;
  predicted_peak_in_min: number | null;
  crowdForecast?: number;
}

export interface Incident {
  zone_id: string;
  type: string;
  message: string;
  active: boolean;
  priority?: "Low" | "Medium" | "Critical";
}

export interface FanProfile {
  seat_section: string;
  accessibility_needed: boolean;
  language: string;
  vibration_enabled?: boolean;
}

export interface StadiumData {
  timestamp: string;
  match_clock: string;
  gates: Gate[];
  zones: Zone[];
  incidents: Incident[];
  fan_profile: FanProfile;
}

export interface AiResponse {
  recommendation: string;
  reason: string;
  alternative?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text?: string;
  response?: AiResponse;
}

export interface Alert {
  id: string;
  time: string;
  message: string;
  type: "incident" | "nudge";
  priority?: "Low" | "Medium" | "Critical";
}
