import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { StadiumData } from "../types";

export default function StadiumHeatmap({ data }: { data: StadiumData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 150;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .attr("class", "w-full h-auto opacity-80");

    // Mock stadium layout paths
    const sectors = [
      { id: "G1", d: "M 10 75 Q 150 -50 290 75 L 250 75 Q 150 0 50 75 Z", type: "gate" },
      { id: "G3", d: "M 290 75 Q 350 150 290 140 L 250 110 Q 280 120 250 75 Z", type: "gate" },
      { id: "G7", d: "M 10 75 Q -50 150 10 140 L 50 110 Q 20 120 50 75 Z", type: "gate" },
      { id: "Z-B", d: "M 50 75 Q 150 20 250 75 L 220 90 Q 150 50 80 90 Z", type: "zone" },
      { id: "Z-R2", d: "M 80 90 Q 150 70 220 90 L 190 130 Q 150 110 110 130 Z", type: "zone" }
    ];

    const getColor = (id: string) => {
      const gate = data.gates.find(g => g.id === id);
      const zone = data.zones.find(z => z.id === id);
      const pct = gate?.occupancy_pct || zone?.occupancy_pct || 0;
      
      const hasIncident = data.incidents.some(i => i.zone_id === id && i.active);
      if (hasIncident) return "#f43f5e"; // rose-500
      
      if (pct < 50) return "#10b981"; // emerald-500
      if (pct < 80) return "#f59e0b"; // amber-500
      return "#f43f5e"; // rose-500
    };

    const getForecastColor = (id: string) => {
      const zone = data.zones.find(z => z.id === id);
      if (zone?.crowdForecast) {
         if (zone.crowdForecast < 50) return "#10b981";
         if (zone.crowdForecast < 80) return "#f59e0b";
         return "#f43f5e";
      }
      return null;
    };

    // Draw base sectors
    svg.selectAll("path.sector")
      .data(sectors)
      .enter()
      .append("path")
      .attr("class", "sector")
      .attr("d", d => d.d)
      .attr("fill", d => getColor(d.id))
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 2)
      .style("transition", "fill 0.5s ease");
      
    // Draw forecast overlays
    svg.selectAll("path.forecast")
      .data(sectors.filter(s => getForecastColor(s.id)))
      .enter()
      .append("path")
      .attr("class", "forecast")
      .attr("d", d => d.d)
      .attr("fill", d => getForecastColor(d.id)!)
      .attr("opacity", 0)
      .style("animation", "pulseForecast 3s infinite alternate");

    // Add CSS for the pulse animation if not exists
    if (!document.getElementById("heatmap-styles")) {
      const style = document.createElement('style');
      style.id = "heatmap-styles";
      style.textContent = `
        @keyframes pulseForecast {
          0% { opacity: 0; }
          100% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(style);
    }
  }, [data]);

  return (
    <div className="w-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
       <div className="absolute top-2 left-3 flex gap-2">
         <span className="text-[9px] font-bold uppercase tracking-widest dark:text-slate-500 text-slate-400">Live Density</span>
         <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 opacity-60">Forecast Overlay (30m)</span>
       </div>
       <svg ref={svgRef}></svg>
    </div>
  );
}
