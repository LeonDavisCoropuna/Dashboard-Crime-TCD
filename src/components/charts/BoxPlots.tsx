// components/Boxplot.tsx
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useScatterStore } from "@/store/useScatterStore";

interface BoxplotData {
  variable: string;
  q1: number;
  median: number;
  q3: number;
  min: number;
  max: number;
  outliers: number[];
}

interface OutlierPoint {
  x: number;
  y: number;
}

export const Boxplot = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { boxplotVariable, setBoxplotVariable } = useScatterStore();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/tweets/boxplot?variable=${boxplotVariable}`);
      const { data } = await response.json();
      drawBoxplot(data);
    };

    fetchData();
  }, [boxplotVariable]);

  const drawBoxplot = (data: BoxplotData) => {
    if (!svgRef.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    // Escalas con tipado explícito
    const x = d3.scaleBand<string>()
      .domain([data.variable])
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3.scaleLinear<number, number>()
      .domain([0, data.max * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Caja del boxplot
    svg.append<SVGRectElement>("rect")
      .attr("x", x(data.variable) || 0) // Aseguramos valor numérico con || 0
      .attr("y", y(data.q3))
      .attr("width", x.bandwidth())
      .attr("height", y(data.q1) - y(data.q3))
      .attr("fill", "steelblue")
      .attr("stroke", "black");

    // Línea de la mediana
    svg.append<SVGLineElement>("line")
      .attr("x1", x(data.variable) || 0)
      .attr("x2", (x(data.variable) || 0) + x.bandwidth())
      .attr("y1", y(data.median))
      .attr("y2", y(data.median))
      .attr("stroke", "orange")
      .attr("stroke-width", 2);

    // Preparar datos de outliers
    const outlierPoints: OutlierPoint[] = data.outliers.map(d => ({
      x: (x(data.variable) || 0) + x.bandwidth() / 2,
      y: y(d)
    }));

    // Dibujar outliers
    svg.selectAll<SVGCircleElement, OutlierPoint>("circle.outlier")
      .data(outlierPoints)
      .enter()
      .append<SVGCircleElement>("circle")
      .attr("class", "outlier")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 3)
      .attr("fill", "red");

    // Ejes con tipado
    svg.append<SVGGElement>("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append<SVGGElement>("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  };

  return (
    <div className="boxplot-container">
      <h3>Boxplot de {boxplotVariable}</h3>
      <svg ref={svgRef} width={500} height={300} />
    </div>
  );
};