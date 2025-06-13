import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"
import { filtersToSearchParams } from "@/utils/filterSearchParams"
import { usePathname } from "next/navigation"
import { useCrimeStore } from "@/store/useCrimeStore"

interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}

export const CrimesTreeChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const filters = useFiltersStore()
  const { selectedCrimes, categories } = useCrimeStore()
  const pathname = usePathname()
  const collectionName = pathname?.includes("crimes-chicago")
    ? "crimes_2020"
    : "tweets_2020"

  const [crimeCounts, setCrimeCounts] = useState<Record<string, number>>({})
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Obtener datos del endpoint
  useEffect(() => {
    const params = filtersToSearchParams(filters)
    params.set("collection", collectionName)

    if (selectedCrimes.length > 0) {
      selectedCrimes.forEach((crime) => {
        params.append("crimes", crime)
      })
    }

    fetch(`/api/crimes/tree?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        // Convertir el array a un objeto {nombre: count} para fácil acceso
        const counts = json.reduce((acc: Record<string, number>, item: any) => {
          acc[item.name] = item.count
          return acc
        }, {})
        setCrimeCounts(counts)
      })
      .catch((err) => console.error("Error fetching tree data:", err))
  }, [filters, selectedCrimes, collectionName])

  // Convertir categorías a estructura de árbol con conteos reales
  const convertToTreeData = (): TreeNode => {
    return {
      name: "Crímenes",
      children: categories.map(category => ({
        name: category.name,
        children: category.subcategories.map(subcategory => ({
          name: subcategory.name,
          children: subcategory.crimes.map(crime => ({
            name: crime,
            value: crimeCounts[crime] || 0 // Usar el conteo real o 0 si no existe
          }))
        }))
      }))
    }
  }

  // Ajustar dimensiones
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect()
      setDimensions({ width, height })
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  // Renderizar el árbol
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const data = convertToTreeData()
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 150, bottom: 30, left: 90 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Estructura jerárquica
    const root = d3.hierarchy(data)

    // Configurar layout del árbol
    const treeLayout = d3.tree<TreeNode>()
      .size([height, width * 0.7]) // Reducir ancho para dejar espacio a las barras
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5))

    // Calcular posiciones
    treeLayout(root)

    // Encontrar el valor máximo para escalar las barras
    const maxValue = d3.max(root.leaves(), d => d.data.value) || 1

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Dibujar conexiones
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      )

    // Crear grupos de nodos
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.y},${d.x})`)

    // Añadir círculos
    node.append("circle")
      .attr("r", 4)
      .attr("fill", d => d.depth === 0 ? "#4e79a7" :
        d.depth === 1 ? "#e15759" :
          d.depth === 2 ? "#76b7b2" :
            "#59a14f")

    // Añadir etiquetas
    node.append("text")
      .attr("dy", ".31em")
      .attr("x", d => d.children ? -8 : 8)
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", d => d.depth === 0 ? "14px" : "12px")
      .style("font-weight", d => d.depth === 0 ? "bold" : "normal")
      .style("fill", "white")
      .text(d => d.data.name)

    // Añadir barras de conteo solo para nodos hoja
    node.filter(d => !d.children)
      .each(function (d) {
        const nodeGroup = d3.select(this)
        const barLength = (d.data.value || 0) / maxValue * 100 // Escalar a máximo 100px

        // Barra de fondo (gris claro)
        nodeGroup.append("rect")
          .attr("x", 15)
          .attr("y", -6)
          .attr("width", 100)
          .attr("height", 12)
          .attr("fill", "#f0f0f0")
          .attr("rx", 6)

        // Barra de valor (color según profundidad)
        nodeGroup.append("rect")
          .attr("x", 15)
          .attr("y", -6)
          .attr("width", barLength)
          .attr("height", 12)
          .attr("fill", d.depth === 3 ? "#59a14f" : "#76b7b2")
          .attr("rx", 6)

        // Texto del valor
        nodeGroup.append("text")
          .attr("x", 15 + barLength + 5)
          .attr("y", 4)
          .style("font-size", "10px")
          .style("fill", "#666")

          .text(d.data.value)
      })

  }, [dimensions, categories, crimeCounts])

  return (
    <div className="flex flex-col w-full h-full">
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold">Jerarquía de Categorías de Crímenes</h2>
        <p className="text-sm text-gray-600">Los números muestran la frecuencia de cada tipo de crimen</p>
      </div>
      <div
        ref={containerRef}
        className="flex-1 w-full h-full min-h-[500px] rounded-lg"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        />
      </div>
    </div>
  )
}