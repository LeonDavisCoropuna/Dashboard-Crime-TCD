import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"
import { filtersToSearchParams } from "@/utils/filterSearchParams"
import { usePathname } from "next/navigation"; // solo Next.js 13+ con app router

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const CrimeMonthChart = () => {
  const filters = useFiltersStore(); const [data, setData] = useState<Record<string, number>>({})
  const pathname = usePathname(); // obtener path actual
  const collectionName = pathname?.includes("crimes-chicago") ? "crimes_2020" : "tweets_2020";

  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const params = filtersToSearchParams(filters);
    params.set("collection", collectionName); // añades el param collection

    const controller = new AbortController();

    fetch(`/api/crimes/month?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .then(setData)
      .catch((error) => {
        if (error.name === "AbortError") {
          // Fetch cancelado
        } else {
          console.error(error);
        }
      });

    return () => {
      controller.abort();
    };
  }, [filters, collectionName]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return
    if (dimensions.width === 0 || dimensions.height === 0) return

    const margin = { top: 40, right: 30, bottom: 50, left: 60 }
    const width = dimensions.width
    const height = dimensions.height

    const dataArray = monthOrder.map((m, i) => ({
      month: m,
      count: data[(i + 1).toString()] || 0,
    }))

    // Escalas
    const x = d3
      .scaleBand()
      .domain(monthOrder)
      .range([margin.left, width - margin.right])
      .padding(0.3)

    const maxCount = d3.max(dataArray, (d) => d.count) || 0


    const values = Object.values(data);
    const maxValue = d3.max(values) || 0;

    const y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([height - margin.bottom, margin.top]);

    // Escala de color (verde a rojo)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxCount])
      .range(["#2ca02c", "#d62728"]) // verde a rojo

    // Limpiar SVG
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Definir tooltip (div)
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement | null, any>

    if (!tooltipRef.current) {
      tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0)

      tooltipRef.current = tooltip.node() as HTMLDivElement
    } else {
      // Aquí TypeScript ya sabe que tooltipRef.current no es null
      tooltip = d3.select<HTMLDivElement, unknown>(tooltipRef.current)
    }

    // Ejes
    const xAxis = (g: any) =>
      g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call((g: d3.Selection<SVGGElement, unknown, null, undefined>) => g.selectAll("text")
          .attr("transform", "rotate(0)") // no rotar, más legible
          .style("text-anchor", "middle")
          .style("font-size", "13px")
          .attr("dy", "1em"))

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2s")))
        .call(g => g.selectAll("text").style("font-size", "12px"))

    svg.append("g").call(xAxis)
    svg.append("g").call(yAxis)

    // Barras con animación y tooltip
    const bars = svg.append("g")
      .selectAll("rect")
      .data(dataArray)
      .join("rect")
      .attr("x", d => x(d.month) || 0)
      .attr("width", x.bandwidth())
      .attr("y", y(0))  // inician desde abajo
      .attr("height", 0) // altura cero para animar
      .attr("fill", d => colorScale(d.count))
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.month}</strong><br/>Crímenes: ${d.count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0)
      })

    // Animación: barras crecen desde 0 a su altura final
    bars
      .transition()
      .duration(1000)
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))

  }, [data, dimensions])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
      {/* Tooltip style */}
      <style>{`
        .tooltip {
          position: absolute;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-family: sans-serif;
          z-index: 10;
        }
      `}</style>
    </>
  )
}
