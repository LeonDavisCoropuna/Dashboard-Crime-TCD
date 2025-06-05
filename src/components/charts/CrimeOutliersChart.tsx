import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"

interface OutlierResponse {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
}

export const CrimeOutliersChart = ({ column }: { column: string }) => {
  const { startDate, endDate, categories, arrest, district } = useFiltersStore()
  const [stats, setStats] = useState<OutlierResponse | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // ⏱ Obtener dimensiones del contenedor
  useEffect(() => {
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
    const params = new URLSearchParams();
    const controller = new AbortController();

    // No agregues 'column' si no es usado en ese endpoint
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (categories?.length) categories.forEach((cat: any) => params.append("categories", cat));
    if (arrest !== null && arrest !== undefined) params.append("arrest", arrest.toString());
    if (district !== null && district !== undefined) params.append("district", district.toString());

    fetch(`/api/crimes/outliers?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.clusters) {
          setStats(res);
        } else {
          setStats(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [startDate, endDate, categories, arrest, district]);


  // 🎨 Dibujar boxplot
  useEffect(() => {
    if (!svgRef.current || !stats) return

    const { min, q1, median, q3, max, outliers } = stats

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Escala x
    const x = d3.scaleLinear()
      .domain([min, max])
      .range([0, width])

    // Línea base
    const centerY = height / 2

    // Eje X
    g.append("g")
      .attr("transform", `translate(0,${centerY + 30})`)
      .call(d3.axisBottom(x))

    // Línea del bigote
    g.append("line")
      .attr("x1", x(min))
      .attr("x2", x(max))
      .attr("y1", centerY)
      .attr("y2", centerY)
      .attr("stroke", "#000")

    // Caja (q1 - q3)
    g.append("rect")
      .attr("x", x(q1))
      .attr("y", centerY - 20)
      .attr("width", x(q3) - x(q1))
      .attr("height", 40)
      .attr("fill", "#ccc")
      .attr("stroke", "#000")

    // Línea mediana
    g.append("line")
      .attr("x1", x(median))
      .attr("x2", x(median))
      .attr("y1", centerY - 20)
      .attr("y2", centerY + 20)
      .attr("stroke", "black")
      .attr("stroke-width", 2)

    // Líneas min y max (bigotes)
    g.append("line")
      .attr("x1", x(min))
      .attr("x2", x(min))
      .attr("y1", centerY - 10)
      .attr("y2", centerY + 10)
      .attr("stroke", "#000")

    g.append("line")
      .attr("x1", x(max))
      .attr("x2", x(max))
      .attr("y1", centerY - 10)
      .attr("y2", centerY + 10)
      .attr("stroke", "#000")

    // Outliers como círculos
    g.selectAll("circle")
      .data(outliers)
      .enter()
      .append("circle")
      .attr("cx", d => x(d))
      .attr("cy", centerY)
      .attr("r", 5)
      .attr("fill", "red")
      .append("title")
      .text(d => `Outlier: ${d}`)

  }, [stats, dimensions])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} />
    </div>
  )
}
