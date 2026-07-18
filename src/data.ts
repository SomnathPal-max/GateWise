import { StadiumData } from "./types";

export const generateDefaultData = (): StadiumData => {
  return {
    timestamp: new Date().toISOString(),
    match_clock: "38:00",
    gates: [
      { id: "G1", name: "Gate 1 - North", occupancy_pct: 42, status: "open", walk_time_min: 4, accessible: true },
      { id: "G3", name: "Gate 3 - East",  occupancy_pct: 88, status: "open", walk_time_min: 2, accessible: false },
      { id: "G7", name: "Gate 7 - South", occupancy_pct: 30, status: "open", walk_time_min: 6, accessible: true }
    ],
    zones: [
      { id: "Z-B", name: "Concourse B", type: "food", occupancy_pct: 55, predicted_peak_in_min: 8, crowdForecast: 75 },
      { id: "Z-R2", name: "Restroom 2",  type: "restroom", occupancy_pct: 20, predicted_peak_in_min: null, crowdForecast: 30 }
    ],
    incidents: [
      { zone_id: "G3", type: "closure", message: "Gate 3 temporarily closed - security check", active: true, priority: "Critical" }
    ],
    fan_profile: {
      seat_section: "214",
      accessibility_needed: false,
      language: "en",
      vibration_enabled: false
    }
  };
};
