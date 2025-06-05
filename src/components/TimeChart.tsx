// import React, { useEffect, useRef, useState } from "react"
// import * as d3 from "d3"
// import { useCrimeStore, type CrimeRecord } from "../store/useCrimeStore"
// import { Slider } from "./ui/slider"

// const margin = { top: 20, right: 30, bottom: 30, left: 40 }

// export const TimeChart = () => {
//   const { records } = useCrimeStore()

//   // Slider state: selecciona rango de horas, por defecto todo el día
//   const [hourRange, setHourRange] = useState<[number, number]>([0, 23])

//   const svgRef = useRef<SVGSVGElement | null>(null)

//   // Filtrar datos segun el rango horario
//   const filteredRecords = records.filter(
//     (r) => r.Date >= hourRange[0] && r.hour <= hourRange[1]
//   )

//   // Agrupar la cantidad de crímenes por hora dentro del rango
//   const countsByHour = d3.rollup(
//     filteredRecords,
//     (v) => v.length,
//     (d) => d.hour
//   )

//   // Crear arreglo con valores para cada hora en el rango (si no hay datos, 0)
//   const data = d3.range(hourRange[0], hourRange[1] + 1).map((h) => ({
//     hour: h,
//     count: countsByHour.get(h) ?? 0,
//   }))

//   // Función que dibuja el gráfico con D3
//   useEffect(() => {
//     if (!svgRef.current) return

//     const svg = d3.select(svgRef.current)
//     svg.selectAll("*").remove() // limpiar svg

//     const width = svgRef.current.clientWidth - margin.left - margin.right
//     const height = svgRef.current.clientHeight - margin.top - margin.bottom

//     const g = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`)

//     // Escalas
//     const x = d3
//       .scaleLinear()
//       .domain([hourRange[0], hourRange[1]])
//       .range([0, width])

//     const y = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.count) || 1])
//       .nice()
//       .range([height, 0])

//     // Ejes
//     const xAxis = d3
//       .axisBottom(x)
//       .ticks(hourRange[1] - hourRange[0] + 1)
//       .tickFormat((d) => `${d}:00`)

//     const yAxis = d3.axisLeft(y).ticks(5)

//     g.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(xAxis)
//       .selectAll("text")
//       .attr("font-size", 12)
//       .attr("text-anchor", "middle")

//     g.append("g").call(yAxis)

//     // Crear área bajo la curva para darle forma diferente a barras
//     const area = d3
//       .area<{ hour: number; count: number }>()
//       .x((d) => x(d.hour))
//       .y0(height)
//       .y1((d) => y(d.count))
//       .curve(d3.curveMonotoneX) // curva suave

//     g.append("path")
//       .datum(data)
//       .attr("fill", "#3b82f6") // azul Tailwind
//       .attr("fill-opacity", 0.6)
//       .attr("stroke", "#1e40af") // azul oscuro Tailwind
//       .attr("stroke-width", 2)
//       .attr("d", area)
//   }, [data, hourRange])

//   return (
//     <div className="flex flex-col h-full p-2">
//       <h2 className="text-xl font-semibold mb-2">Crímenes por Hora</h2>
//       <div className="flex w-full gap-2">
//         <h2 className="text-center">00:00 Horas</h2>
//         <Slider
//           value={hourRange}
//           min={0}
//           max={24}
//           step={1}
//           onValueChange={(val) => setHourRange([val[0], val[1]])}
//         />
//         <h2 className="text-center">23:59 Horas</h2>
//       </div>


//       {/* Contenedor SVG para gráfico */}
//       <div className="flex-grow">
//         <svg ref={svgRef} className="w-full h-full"></svg>
//       </div>
//     </div>
//   )
// }
