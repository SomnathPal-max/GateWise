export const STADIUM_CENTER = { lat: 37.4032, lng: -121.9698 }; // Example: Levi's Stadium

export const getCoordinatesForNode = (id: string): { lat: number; lng: number } => {
  const mapping: Record<string, { lat: number; lng: number }> = {
    'G1': { lat: 37.4040, lng: -121.9705 },
    'G3': { lat: 37.4032, lng: -121.9685 },
    'G7': { lat: 37.4025, lng: -121.9702 },
    'Z-B': { lat: 37.4036, lng: -121.9692 },
    'Z-R2': { lat: 37.4030, lng: -121.9708 }
  };
  return mapping[id] || STADIUM_CENTER;
};
