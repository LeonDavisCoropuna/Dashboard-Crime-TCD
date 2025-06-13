import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"
import { filtersToSearchParams } from "@/utils/filterSearchParams"
import { usePathname } from "next/navigation"

interface CategoryCount {
  category: string
  count: number
}

interface DescribeCategoricalResponse {
  categories: CategoryCount[] // <-- que tenga `category` y `count`
  total: number
}


interface Props {
  variable: string
}

export const CategoricalVariableChart = ({ variable }: Props) => {
  const filters = useFiltersStore()
  const pathname = usePathname()
  const collectionName = pathname?.includes("crimes-chicago") ? "crimes_2020" : "tweets_2020"

  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const [data, setData] = useState<DescribeCategoricalResponse | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const handleResize = () => {
      setDimensions({
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
      })
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const params = filtersToSearchParams(filters)
    params.set("collection", collectionName)
    params.set("variable", variable)

    const controller = new AbortController()

    fetch(`/api/crimes/describe-categorical?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(res => {
        const categories = res.frequencies.map((d: any) => ({
          category: d.value,
          count: d.count,
        }))
        const total = categories.reduce((acc: any, d: any) => acc + d.count, 0)
        setData({ categories, total })
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error)
      })

    return () => controller.abort()
  }, [filters, collectionName])

  useEffect(() => {
    if (!data || !data.categories.length || dimensions.width === 0 || dimensions.height === 0) return

    const margin = { top: 15, right: 30, bottom: 60, left: 60 }
    const width = dimensions.width
    const height = dimensions.height

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const categories = data.categories.map(d => d.category)
    const maxCount = d3.max(data.categories, d => d.count) ?? 1

    const x = d3
      .scaleBand()
      .domain(categories)
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top])

    const colorScale = d3.scaleOrdinal<string>()
      .domain(categories)
      .range(d3.schemeCategory10)

    // Tooltip
    let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement | null, any>
    if (!tooltipRef.current) {
      tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0)

      tooltipRef.current = tooltip.node() as HTMLDivElement
    } else {
      tooltip = d3.select(tooltipRef.current)
    }

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    svg
      .append("g")
      .selectAll("rect")
      .data(data.categories)
      .join("rect")
      .attr("x", d => x(d.category)!)
      .attr("y", y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", d => colorScale(d.category))
      .on("mousemove", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `Categoría: ${d.category}<br/>
             Conteo: ${d.count}<br/>
             Porcentaje: ${((d.count / data.total) * 100).toFixed(1)}%`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0)
      })
      .transition()
      .duration(1000)
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))
  }, [data, dimensions])

  return (
    <div className="flex flex-col gap-y-1 items-start">
      <div className="pl-5 pr-10 w-full">
        <h2>{variable}</h2>
      </div>
      <div
        ref={containerRef}
        style={{
          width: "250px",
          height: "250px",
          position: "relative",
        }}
      >
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}
