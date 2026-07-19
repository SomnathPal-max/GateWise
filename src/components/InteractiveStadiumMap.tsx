import React, { useEffect, useRef, useState } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";
import { StadiumData } from "../types";
import { STADIUM_CENTER, getCoordinatesForNode } from "../utils/geo";
import { MapPin, AlertTriangle } from "lucide-react";

interface Props {
  data: StadiumData;
  onGateSelect?: (gateId: string) => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const isValidKey = API_KEY && API_KEY.length > 5 && !API_KEY.includes("YOUR_");

// Custom hook to handle clustering
const useMarkerClustering = (map: google.maps.Map | null, markers: google.maps.marker.AdvancedMarkerElement[]) => {
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ 
        map,
        algorithm: new SuperClusterAlgorithm({ radius: 60 })
      });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(markers);
  }, [markers]);
};

const ClusteredMarkers = ({ data, onGateSelect }: { data: StadiumData, onGateSelect?: (gateId: string) => void }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<Record<string, google.maps.marker.AdvancedMarkerElement>>({});

  useMarkerClustering(map, Object.values(markers));

  const setMarkerRef = (id: string) => (marker: google.maps.marker.AdvancedMarkerElement | null) => {
    if (marker && markers[id]) return;
    if (!marker && !markers[id]) return;
    setMarkers(prev => {
      if (marker) return { ...prev, [id]: marker };
      const newMarkers = { ...prev };
      delete newMarkers[id];
      return newMarkers;
    });
  };

  const getStatusColor = (pct: number) => {
    if (pct < 50) return "#10b981"; // emerald-500
    if (pct < 80) return "#f59e0b"; // amber-500
    return "#f43f5e"; // rose-500
  };

  return (
    <>
      {data.gates.map(gate => {
        const hasIncident = data.incidents.some(i => i.zone_id === gate.id && i.active);
        const position = getCoordinatesForNode(gate.id);
        const color = hasIncident ? "#f43f5e" : getStatusColor(gate.occupancy_pct);
        
        return (
          <AdvancedMarker 
            key={gate.id}
            position={position}
            ref={setMarkerRef(gate.id)}
            onClick={() => onGateSelect?.(gate.id)}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: color }}>
               {hasIncident ? <AlertTriangle size={16} /> : <MapPin size={16} />}
            </div>
          </AdvancedMarker>
        );
      })}
      {data.zones.map(zone => {
        const hasIncident = data.incidents.some(i => i.zone_id === zone.id && i.active);
        const position = getCoordinatesForNode(zone.id);
        const color = hasIncident ? "#f43f5e" : getStatusColor(zone.occupancy_pct);
        
        return (
          <AdvancedMarker 
            key={zone.id}
            position={position}
            ref={setMarkerRef(zone.id)}
          >
            <div className="w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center text-white" style={{ backgroundColor: color }}>
               <span className="text-[10px] font-bold">{zone.id.replace('Z-', '')}</span>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};

export default function InteractiveStadiumMap({ data, onGateSelect }: Props) {
  const [mapError, setMapError] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Google Maps API calls this global function on auth failure
    window.gm_authFailure = () => {
      setMapError(true);
    };
  }, []);

  if (!isValidKey || mapError) {
    return (
      <div className="w-full h-[200px] rounded-2xl border-2 border-dashed dark:border-slate-800 border-slate-300 flex flex-col items-center justify-center p-6 text-center">
        <MapPin size={32} className="dark:text-slate-600 text-slate-400 mb-3 opacity-50" />
        <h3 className="text-sm font-bold dark:text-slate-400 text-slate-600 mb-1">Interactive Map Unavailable</h3>
        <p className="text-xs dark:text-slate-500 text-slate-500">
          {mapError ? "Invalid Google Maps API Key provided." : "Provide VITE_GOOGLE_MAPS_API_KEY in secrets to enable dynamic navigation."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden shadow-sm border dark:border-slate-800 border-slate-200 relative">
      {!isMapLoaded && (
        <div className="absolute inset-0 z-10 dark:bg-slate-900 bg-slate-100 flex flex-col items-center justify-center p-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} className="text-indigo-400" />
            </div>
            <div className="w-32 h-3 dark:bg-slate-800 bg-slate-200 rounded-full mb-3"></div>
            <div className="w-24 h-2 dark:bg-slate-800 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      )}
      <APIProvider 
        apiKey={API_KEY} 
        onLoad={() => console.log("Maps API Loaded")}
        onError={() => setMapError(true)}
      >
        <Map
          defaultZoom={17}
          defaultCenter={STADIUM_CENTER}
          mapId="STADIUM_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
          onIdle={() => setIsMapLoaded(true)}
        >
          <ClusteredMarkers data={data} onGateSelect={onGateSelect} />
        </Map>
      </APIProvider>
    </div>
  );
}
