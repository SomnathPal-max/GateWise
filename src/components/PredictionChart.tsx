import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface PredictionDataPoint {
  time: Date;
  predicted: number;
  historical: number;
}

export default function PredictionChart({ dataPoints }: { dataPoints: PredictionDataPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || dataPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .rangeRound([0, width])
      .domain(d3.extent(dataPoints, d => d.time) as [Date, Date]);

    const y = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([0, 100]);

    // Define line generators
    const predictedLine = d3.line<PredictionDataPoint>()
      .x(d => x(d.time))
      .y(d => y(d.predicted))
      .curve(d3.curveMonotoneX);

    const historicalLine = d3.line<PredictionDataPoint>()
      .x(d => x(d.time))
      .y(d => y(d.historical))
      .curve(d3.curveMonotoneX);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%H:%M") as any))
      .attr("class", "text-slate-400 font-mono text-[10px]")
      .selectAll("path, line")
      .attr("stroke", "#475569");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .attr("class", "text-slate-400 font-mono text-[10px]")
      .selectAll("path, line")
      .attr("stroke", "#475569");

    // Historical Line
    g.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("d", historicalLine);

    // Predicted Line
    g.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", "#6366f1")
      .attr("stroke-width", 2)
      .attr("d", predictedLine);

    // Predicted Line Dots
    g.selectAll(".predicted-dot")
      .data(dataPoints)
      .enter()
      .append("circle")
      .attr("class", "predicted-dot")
      .attr("cx", d => x(d.time))
      .attr("cy", d => y(d.predicted))
      .attr("r", 4)
      .attr("fill", "#818cf8")
      .attr("stroke", "#1e1b4b")
      .attr("stroke-width", 2);

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 80}, -15)`);
      
    legend.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 15).attr("y2", 0)
      .attr("stroke", "#6366f1").attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 20).attr("y", 3)
      .text("Predicted")
      .attr("class", "text-[9px] font-bold fill-slate-400 font-mono");

    legend.append("line")
      .attr("x1", 0).attr("y1", 12)
      .attr("x2", 15).attr("y2", 12)
      .attr("stroke", "#94a3b8").attr("stroke-width", 2)
      .attr("stroke-dasharray", "2,2");
    legend.append("text")
      .attr("x", 20).attr("y", 15)
      .text("Historical")
      .attr("class", "text-[9px] font-bold fill-slate-400 font-mono");

  }, [dataPoints]);

  return (
    <div className="w-full h-[200px]">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
