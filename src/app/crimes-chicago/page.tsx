"use client"

import { CrimeMonthChart } from "@/components/charts/CrimeMonthChart";
import { CrimePorcentajeChart } from "@/components/charts/CrimePorcentajeChart";
import { CrimesByHourChart } from "@/components/charts/CrimesByHourChart";
import { CrimeStationChart } from "@/components/charts/CrimeStationChart";
import { ArrestFilter } from "@/components/filters/ArrestFilter";
import { CategoriesFilter } from "@/components/filters/CategoriesFilter";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { TimeContextFilter } from "@/components/filters/TimeContextFilter";
import { Button } from "@/components/ui/button";
import { useFiltersStore } from "@/store/useFiltersStore"
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';

const CrimesMapChart = dynamic(() => import("@/components/CrimesMapChart"), {
  ssr: false,
});

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
        <h1 className="text-3xl font-bold">Dashboard de Análisis Criminal de Fuente Oficial</h1>

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
          <label>Arrestos</label>
          <ArrestFilter />
        </div>
        <div className="filter-item">
          <label>Tiempo</label>
          <TimeContextFilter />
        </div>
        <div className="filter-item">
          <label>Tiempo</label>
          <Button onClick={() => filters.resetFilters()}>Reset filtros</Button>
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
      <div className="map bg-red-800 w-full h-full flex flex-col items-center justify-center">
        <h2>Distribución Geográfica de Incidentes</h2>
        <CrimesMapChart />
      </div>
      {/* Gráficos exploratorios */}
      <div className="exploratory">
        <h2>Porcentaje de datos</h2>
        <CrimePorcentajeChart />
      </div>
    </div >
  );
}
