import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"
import { filtersToSearchParams } from "@/utils/filterSearchParams"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button"

interface HistogramBin {
  binStart: number
  binEnd: number
  count: number
}

interface DescribeResponse {
  stats: {
    mean: number
    median: number
    std: number
  }
  histogram: HistogramBin[]
}

interface Props {
  variable: string
}

export const NumericVariableChart = ({ variable }: Props) => {
  const filters = useFiltersStore()
  const pathname = usePathname()
  const collectionName = pathname?.includes("crimes-chicago") ? "crimes_2020" : "tweets_2020"

  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const [data, setData] = useState<DescribeResponse | null>(null)
  const [bins, setBins] = useState(6);
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
    const params = filtersToSearchParams(filters);
    params.set("collection", collectionName); // añades el param collection
    params.set("variable", variable)
    params.set("bins", bins.toString()); // Puedes cambiar este valor si quieres permitir selección dinámica

    const controller = new AbortController();

    fetch(`/api/crimes/describe-numeric?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(res => setData(res))
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
  }, [filters, collectionName, bins]);

  useEffect(() => {
    if (!data || !data.histogram.length || dimensions.width === 0 || dimensions.height === 0) return

    const margin = { top: 15, right: 30, bottom: 40, left: 60 }
    const width = dimensions.width
    const height = dimensions.height

    const bins = data.histogram
    const maxCount = d3.max(bins, d => d.count) ?? 1

    const x = d3
      .scaleLinear()
      .domain([bins[0].binStart, bins[bins.length - 1].binEnd])
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleLinear()
      .domain([0, maxCount])
      .nice()
      .range([height - margin.bottom, margin.top])

    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, maxCount])
      .range(["#9ecae1", "#08306b"]) // azul claro a azul oscuro

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

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

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", d => x(d.binStart))
      .attr("width", d => x(d.binEnd) - x(d.binStart) - 1)
      .attr("y", y(0))
      .attr("height", 0)
      .attr("fill", d => colorScale(d.count))
      .on("mousemove", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `Rango: ${d.binStart.toFixed(2)} - ${d.binEnd.toFixed(2)}<br/>
             Conteo: ${d.count} <br />
             Media ${data?.stats.mean.toFixed(2)}  <br />
             Mediana ${data?.stats.median.toFixed(2)}  <br />
             Std:${data?.stats.std.toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0)
      })

    bars
      .transition()
      .duration(1000)
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))
  }, [data, dimensions])

  return (
    <>
      <div className="flex flex-col gap-y-1 items-start">
        <div className="flex pl-5 pr-10 justify-between items-center w-full">
          <h2>{variable}</h2>
          <div className="flex items-center justify-center gap-x-1">
            <h2>Bins ({bins}): </h2>
            <Button onClick={() => setBins(bins + 1)}>+</Button>
            <Button onClick={() => setBins(bins - 1)}>-</Button>
          </div>

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
    </>
  )
}
