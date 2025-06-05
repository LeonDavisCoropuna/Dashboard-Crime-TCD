// src/components/ChartSelector.tsx
import { useState } from "react"
import { useEdaMultiStore } from "@/store/useEDAMultiStore"
import { v4 as uuidv4 } from "uuid"

const variables = ["Category", "District"] // <- del backend

export const EdaFilters = () => {
  const [x, setX] = useState("")
  const [y, setY] = useState("")
  const [type, setType] = useState<"scatter" | "bar" | "heatmap" | "boxplot">("scatter")

  const { addChart } = useEdaMultiStore()

  const handleAdd = () => {
    if (x && y && x !== y) {
      addChart({ id: uuidv4(), x, y, type })
      setX("")
      setY("")
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <select value={x} onChange={(e) => setX(e.target.value)}>
        <option value="">Eje X</option>
        {variables.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <select value={y} onChange={(e) => setY(e.target.value)}>
        <option value="">Eje Y</option>
        {variables.map((v) => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value as any)}>
        <option value="scatter">Scatter</option>
        <option value="bar">Bar</option>
        <option value="heatmap">Heatmap</option>
        <option value="boxplot">Boxplot</option>
      </select>
      <button onClick={handleAdd}>➕ Agregar gráfico</button>
    </div>
  )
}
