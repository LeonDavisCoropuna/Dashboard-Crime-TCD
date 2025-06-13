"use client"

import { CategoricalVariableChart } from "@/components/charts/CategoricalVaribleChart";
import { CrimeMonthChart } from "@/components/charts/CrimeMonthChart";
import { CrimePorcentajeChart } from "@/components/charts/CrimePorcentajeChart";
import { CrimesByHourChart } from "@/components/charts/CrimesByHourChart";
import { CrimeStationChart } from "@/components/charts/CrimeStationChart";
import { NumericVariableChart } from "@/components/charts/NumericVariableChart";
import { ArrestFilter } from "@/components/filters/ArrestFilter";
import { CategoricalVaribleFilter } from "@/components/filters/CategoricalVaribleFilter";
import { CategoriesFilter } from "@/components/filters/CategoriesFilter";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { NumericVariableFilter } from "@/components/filters/NumericVariableFilter";
import { TimeContextFilter } from "@/components/filters/TimeContextFilter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCategoricalVariablesStore } from "@/store/useCategoricalVariablesStore";
import { useFiltersStore } from "@/store/useFiltersStore"
import { useNumericVariablesStore } from "@/store/useNumericVariablesStore";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

const CrimesMapChart = dynamic(() => import("@/components/CrimesMapChart"), {
  ssr: false,
});

export default function Home() {
  const filters = useFiltersStore()

  const selectedNumericVariables = useNumericVariablesStore((state) => state.selectedVariables)
  const selectedCategoricalVariables = useCategoricalVariablesStore((state) => state.selectedVariables)

  const router = useRouter()

  const handleVolverInicio = () => {
    router.push('/');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header flex justify-between items-start p-4">
        <h1 className="text-3xl font-bold">Dashboard de Análisis Criminal de Fuente Oficial</h1>
        <button
          onClick={handleVolverInicio}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Volver a seleccionar dataset
        </button>
      </div>

      {/* Filtros con scroll */}
      <ScrollArea className="filters w-full max-w-md h-full max-h-full rounded-lg p-2">
        <div className="filters flex flex-col ">
          <div className="filter-item">
            <label className="font-semibold">Categoría</label>
            <CategoriesFilter />
          </div>
          <div className="filter-item">
            <NumericVariableFilter />
          </div>
          <div className="filter-item">
            <CategoricalVaribleFilter />
          </div>
        </div>

        <div className="filter-item">
          <Button onClick={() => filters.resetFilters()}>Reset filtros</Button>
        </div>
      </ScrollArea>

      {/* Visualizaciones principales */}
      <div className="categories w-full grid grid-cols-4 max-h-full overflow-auto">
        {selectedNumericVariables.map((variable) => (
          <NumericVariableChart key={variable} variable={variable} />
        ))}
        {selectedCategoricalVariables.map((variable) => (
          <CategoricalVariableChart key={variable} variable={variable} />
        ))}
      </div>

      {/* Mapa */}
      <div className="map bg-red-800 w-full h-full flex flex-col items-center justify-center">
        <h2>Distribución Geográfica de Incidentes</h2>
        <CrimesMapChart />
      </div>

      {/* Gráfico porcentual */}
      <div className="exploratory">
        <h2>Porcentaje de datos</h2>
        <DateRangeFilter />
      </div>
    </div>
  );
}
