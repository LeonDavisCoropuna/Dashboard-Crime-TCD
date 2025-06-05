import { useEffect, useRef, useState } from "react"
import { useFiltersStore } from "@/store/useFiltersStore"
import * as d3 from "d3"

interface EdaGraphFetcherProps {
  selectedX: string
  selectedY: string
  chartType: "scatter" | "bar" | "heatmap" | "boxplot"
}

export const EdaGraphFetcher = ({ selectedX, selectedY, chartType }: EdaGraphFetcherProps) => {
  const { startDate, endDate, categories, arrest, district } = useFiltersStore()

  const [data, setData] = useState<{ x: any; y: any }[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Resize observer
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

  // Fetch data
  useEffect(() => {
    if (!selectedX || !selectedY) return

    const params = new URLSearchParams()
    const controller = new AbortController()

    params.append("x", selectedX)
    params.append("y", selectedY)

    if (startDate) params.append("start", startDate)
    if (endDate) params.append("end", endDate)
    if (categories?.length) categories.forEach(cat => params.append("categories", cat))
    if (arrest !== null && arrest !== undefined) params.append("arrest", arrest.toString())
    if (district !== null && district !== undefined) params.append("district", district.toString())

    fetch(`http://localhost:8000/eda/graph-data?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data)
        else console.warn("No se recibió data:", res)
      })
      .catch(err => {
        if (err.name !== "AbortError") console.error("Fetch error:", err)
      })

    return () => controller.abort()
  }, [startDate, endDate, categories, arrest, district, selectedX, selectedY])

  // Render gráfico D3
  useEffect(() => {
    if (!svgRef.current || !data || chartType !== "scatter") return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => +d.x) as [number, number])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => +d.y) as [number, number])
      .range([height, 0])

    // Ejes
    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale))
    g.append("g").call(d3.axisLeft(yScale))

    // Puntos
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(+d.x))
      .attr("cy", d => yScale(+d.y))
      .attr("r", 3)
      .attr("fill", "#3498db")
  }, [data, chartType, dimensions])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  )
}
