// src/store/useEdaMultiStore.ts
import { create } from "zustand"

interface ChartConfig {
  id: string
  x: string
  y: string
  type: "scatter" | "bar" | "heatmap" | "boxplot"
}

interface EdaMultiStore {
  charts: ChartConfig[]
  addChart: (chart: ChartConfig) => void
  removeChart: (id: string) => void
  clearCharts: () => void
}

export const useEdaMultiStore = create<EdaMultiStore>((set) => ({
  charts: [],
  addChart: (chart) =>
    set((state) => ({
      charts: [...state.charts, chart],
    })),
  removeChart: (id) =>
    set((state) => ({
      charts: state.charts.filter((c) => c.id !== id),
    })),
  clearCharts: () => set({ charts: [] }),
}))
