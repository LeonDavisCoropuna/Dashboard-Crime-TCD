"use client"

import { CrimeMonthChart } from "@/components/charts/CrimeMonthChart";
import { CrimePorcentajeChart } from "@/components/charts/CrimePorcentajeChart";
import { CrimesByHourChart } from "@/components/charts/CrimesByHourChart";
import { CrimeStationChart } from "@/components/charts/CrimeStationChart";
import { Scatterplot } from "@/components/charts/ScatterPlot";
import { CategoriesFilter } from "@/components/filters/CategoriesFilter";
import { ScatterColumnsSelector } from "@/components/filters/ScatterColumnsSelector";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { TimeContextFilter } from "@/components/filters/TimeContextFilter";
import { Button } from "@/components/ui/button";
import { useFiltersStore } from "@/store/useFiltersStore"
import { Boxplot } from "@/components/charts/BoxPlots";
import { BoxplotVariableSelector } from "@/components/filters/BoxplotVariableSelector";
import { useRouter } from 'next/navigation';

export default function Home() {
  const filters = useFiltersStore()
  const router = useRouter()
  const handleVolverInicio = () => {
    router.push('/'); // Ruta a la página principal
  };
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header flex justify-between items-start gap-4 p-4">
        <h1 className="text-3xl font-bold">Dashboard de Análisis Criminal de Tweets</h1>

        <button
          onClick={handleVolverInicio}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Volver a seleccionar dataset
        </button>
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="filter-item">
          <label>Rango de fechas</label>
          <DateRangeFilter />
        </div>
        <div className="filter-item">
          <label>Categoría</label>
          <CategoriesFilter />
        </div>
        <div className="filter-item">
          <label>Tiempo</label>
          <TimeContextFilter />
        </div>
        <div className="filter-item">
          <label>Tiempo</label>
          <Button onClick={() => filters.resetFilters()}>Reset filtros</Button>
        </div>
        <div className="filter-item">
          <label>Scatter X, Y</label>
          <ScatterColumnsSelector />
        </div>
        <div className="filter-item">
          <label>Boxplot de X</label>
          <BoxplotVariableSelector />
        </div>
      </div>

      {/* Visualizaciones principales */}
      <div className="main-visualizations">

        {/* Serie temporal */}
        <div className="timeseries flex flex-col items-center justify-center w-full">
          <h2>Tendencia por Meses y Estaciones</h2>
          <div className="flex gap-x-1 w-full h-full">
            <div className="w-2/3">
              <CrimeMonthChart />
            </div>
            <div className="w-1/3">
              <CrimeStationChart />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="categories w-full text-center">
          <h2>Distribución de crímenes por hora</h2>
          <CrimesByHourChart />
        </div>
      </div>

      {/* Mapa */}
      <div className="map bg-red-800 w-full h-full flex flex-col">
        {/* Primera fila - Scatter Plot (50% de altura) */}
        <div className="flex-1 min-h-0 w-full"> {/* flex-1 + min-h-0 es clave para el crecimiento controlado */}
          <h2 className="text-center py-2 text-lg font-semibold">Gráfico Scatter Plot</h2>
          <div className="h-[calc(100%-40px)]"> {/* Restamos el espacio del título */}
            <Scatterplot />
          </div>
        </div>

        {/* Separador visual opcional */}
        <div className="border-t border-gray-300 my-2"></div>

        {/* Segunda fila - BoxPlot (50% de altura) */}
        <div className="flex-1 min-h-0 w-full">
          <h2 className="text-center py-2 text-lg font-semibold">Gráfico BoxPlot</h2>
          <div className="h-[calc(100%-40px)] justify-center items-center flex">
            <Boxplot />
          </div>
        </div>
      </div>
      {/* Gráficos exploratorios */}
      <div className="exploratory">
        <h2>Porcentaje de datos</h2>
        <CrimePorcentajeChart />
      </div>
    </div >
  );
}
