import { useEffect, useRef, useState } from "react";
import { useFiltersStore } from "@/store/useFiltersStore";
import * as d3 from "d3";
import { filtersToSearchParams } from "@/utils/filterSearchParams";
import { usePathname } from "next/navigation";

export const CrimePorcentajeChart = () => {
  const filters = useFiltersStore();
  const [percentage, setPercentage] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathname = usePathname();
  const collectionName = pathname?.includes("crimes-chicago") ? "crimes_2020" : "tweets_2020";

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    params.set("collection", collectionName);

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

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll("*").remove();

    // Fondo
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#1c1c1c")
      .attr("rx", 5)
      .attr("ry", 5);

    // Barra progresiva
    const progressBar = svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 0)
      .attr("height", height)
      .attr("fill", "#00bcd4")
      .attr("rx", 5)
      .attr("ry", 5);

    progressBar
      .transition()
      .duration(1000)
      .attr("width", (percentage / 100) * width);

    // Texto
    svg
      .append("text")
      .text(`${percentage.toFixed(1)}%`)
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);
  }, [percentage]);

  return (
    <div className="w-full h-12 bg-[#1c1c1c] rounded-md shadow-md p-1">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};
