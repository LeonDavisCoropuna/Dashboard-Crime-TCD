// src/store/useEdaStore.ts
import { create } from 'zustand'

interface EdaStore {
  selectedX: string | null
  selectedY: string | null
  chartType: 'bar' | 'scatter' | 'heatmap' | 'boxplot' | null
  outlierDetection: boolean
  setSelectedX: (x: string | null) => void
  setSelectedY: (y: string | null) => void
  setChartType: (type: 'bar' | 'scatter' | 'heatmap' | 'boxplot' | null) => void
  setOutlierDetection: (val: boolean) => void
}

export const useEdaStore = create<EdaStore>((set) => ({
  selectedX: null,
  selectedY: null,
  chartType: null,
  outlierDetection: false,
  setSelectedX: (x) => set({ selectedX: x }),
  setSelectedY: (y) => set({ selectedY: y }),
  setChartType: (type) => set({ chartType: type }),
  setOutlierDetection: (val) => set({ outlierDetection: val }),
}))
