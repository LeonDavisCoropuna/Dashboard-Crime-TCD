import { useEffect, useRef, useState } from "react"
import { useScatterStore } from "@/store/useScatterStore"
import * as d3 from "d3"

interface TweetPoint {
  x: number
  y: number
  color?: string
}

export const Scatterplot = () => {
  const [data, setData] = useState<TweetPoint[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const { xAxis, yAxis } = useScatterStore()

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
    const controller = new AbortController()

    if (!xAxis || !yAxis) return

    fetch(`/api/tweets/scatter?xAxis=${xAxis}&yAxis=${yAxis}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => {
        if (err.name !== "AbortError") console.error(err)
      })

    return () => controller.abort()
  }, [xAxis, yAxis])

  useEffect(() => {
    if (!svgRef.current || data.length === 0 || dimensions.width === 0) return

    const margin = { top: 40, right: 30, bottom: 50, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([margin.left, margin.left + width])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .range([margin.top + height, margin.top])

    const xAxisDraw = d3.axisBottom(xScale).ticks(6)
    const yAxisDraw = d3.axisLeft(yScale).ticks(6)

    svg.append("g")
      .attr("transform", `translate(0,${margin.top + height})`)
      .call(xAxisDraw)

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxisDraw)

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
      tooltip = d3.select<HTMLDivElement, unknown>(tooltipRef.current)
    }

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 4)
      .attr("fill", d => d.color ? colorScale(d.color) : "#1f77b4")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`x: ${d.x.toFixed(2)}<br/>y: ${d.y.toFixed(2)}<br/>color: ${d.color || 'N/A'}`)
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
