// store/useScatterStore.ts
import { create } from 'zustand';

interface ScatterState {
  xAxis: string;
  yAxis: string;
  colorBy: string;
  boxplotVariable: string; // Nueva variable para boxplot
  setXAxis: (value: string) => void;
  setYAxis: (value: string) => void;
  setColorBy: (value: string) => void;
  setBoxplotVariable: (value: string) => void; // Nuevo setter
}

export const useScatterStore = create<ScatterState>((set) => ({
  xAxis: 'likeCount',
  yAxis: 'retweetCount',
  colorBy: 'user_followersCount',
  boxplotVariable: 'likeCount', // Valor inicial
  setXAxis: (value) => set({ xAxis: value }),
  setYAxis: (value) => set({ yAxis: value }),
  setColorBy: (value) => set({ colorBy: value }),
  setBoxplotVariable: (value) => set({ boxplotVariable: value }), // Implementación
}));