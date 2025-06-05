// src/components/MainCharts.tsx
import { useEdaMultiStore } from "@/store/useEDAMultiStore"
import { EdaGraphFetcher } from "./EdaGraphFetcher"
import { CrimesPorcentajeChart } from "./charts/CrimesPorcentajeChart"
import { CrimeOutliersChart } from "./charts/CrimeOutliersChart"

export const MainCharts = () => {
  const { charts, removeChart } = useEdaMultiStore()

  return (
    <div className="grid grid-cols-2 gap-6 max-h-full h-full w-full">
      <CrimesPorcentajeChart />
      <CrimeOutliersChart column="Date" />

      {charts.map(({ id, x, y, type }) => (
        <div key={id} className="border p-2 bg-white shadow-md rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">{`${type.toUpperCase()} → (${x}, ${y})`}</h3>
            <button onClick={() => removeChart(id)} className="text-red-500 hover:text-red-700">
              ❌
            </button>
          </div>
          <EdaGraphFetcher selectedX={x} selectedY={y} chartType={type} />
        </div>
      ))}
    </div>
  )
}
