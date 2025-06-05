import { useEffect, useRef, useState } from "react";
import { useFiltersStore } from "@/store/useFiltersStore";
import * as d3 from "d3";
import { filtersToSearchParams } from "@/utils/filterSearchParams";
import { usePathname } from "next/navigation"; // solo Next.js 13+ con app router

export const CrimePorcentajeChart = () => {
  const filters = useFiltersStore();
  const [percentage, setPercentage] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathname = usePathname(); // obtener path actual
  const collectionName = pathname?.includes("crimes-chicago") ? "crimes_2020" : "tweets_2020";

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    params.set("collection", collectionName); // añades el param collection

    const controller = new AbortController();

    fetch(`/api/crimes/total_filtered?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => res.data.percentage)
      .then(setPercentage)
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error);
      });

    return () => controller.abort();
  }, [filters]);

  useEffect(() => {
    if (percentage === null || svgRef.current === null) return;

    const size = 150;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear

    // Fondo oscuro
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", size)
      .attr("height", size)
      .attr("fill", "#1c1c1c")
      .attr("stroke", "#444")
      .attr("stroke-width", 2);

    // Agua animada
    const water = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", size)
      .attr("width", size)
      .attr("height", 0)
      .attr("fill", "#00bcd4");

    water
      .transition()
      .duration(1000)
      .attr("y", size - (percentage / 100) * size)
      .attr("height", (percentage / 100) * size);

    // Texto animado
    svg
      .append("text")
      .text(`${(percentage + 0.2).toFixed(1)}%`)
      .attr("x", size / 2)
      .attr("y", size / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "28px")
      .attr("fill", "#ffffff")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);
  }, [percentage]);

  return (
    <div
      style={{
        width: 150,
        height: 150,
        backgroundColor: "#1c1c1c",
        borderRadius: "8px",
        padding: "5px",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <svg ref={svgRef} width={150} height={150} />
    </div>
  );
};
