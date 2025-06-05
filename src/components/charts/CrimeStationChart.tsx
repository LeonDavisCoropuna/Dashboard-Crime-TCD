import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"
import { filtersToSearchParams } from "@/utils/filterSearchParams"

const seasonLabels = {
  Winter: "Winter",
  Spring: "Spring",
  Summer: "Summer",
  Autumn: "Autumn",
}

export const CrimeStationChart = () => {
  const filters = useFiltersStore()
  const [data, setData] = useState<Record<string, number>>({})

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
    const params = filtersToSearchParams(filters)
    const controller = new AbortController()

    fetch(`/api/crimes/station?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => res.data)
      .then(setData)
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error)
        }
      })

    return () => controller.abort()
  }, [filters])

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return
    if (dimensions.width === 0 || dimensions.height === 0) return

    const width = dimensions.width
    const height = dimensions.height
    const radius = Math.min(width, height) / 2 - 40

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const container = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    const color = d3
      .scaleOrdinal<string>()
      .domain(Object.keys(data))
      .range(["#4E79A7", "#F28E2B", "#E15759", "#76B7B2"]) // colores sobrios para estaciones


    const pie = d3
      .pie<[string, number]>()
      .value(([, value]) => value)
      .sort(null)

    const arc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(0)
      .outerRadius(radius)

    const maxCount = d3.max(Object.values(data)) ?? 1

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

    const pieData = pie(Object.entries(data))

    const arcs = container
      .selectAll("path")
      .data(pieData)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data[0]))
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${seasonLabels[d.data[0] as keyof typeof seasonLabels]}</strong><br/>Crímenes: ${d.data[1]}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0)
      })

    // Animación de entrada
    arcs
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return function (t) {
          return arc(i(t))!
        }
      })

    // Etiquetas
    container
      .selectAll("text")
      .data(pieData)
      .join("text")
      .transition()
      .duration(1000)
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px")
      .style("fill", "#fff")
      .text((d) => d.data[0])
  }, [data, dimensions])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
        }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
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
