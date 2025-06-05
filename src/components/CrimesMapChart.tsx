import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import * as d3 from "d3"
import { useFiltersStore } from "@/store/useFiltersStore"

type ClusterPoint = {
  Latitude: number
  Longitude: number
  cluster: number
  count_crimes: number
}

export const CrimesMapChart = () => {
  const { start, end, categories, arrest, district, ward, setFilter } = useFiltersStore()
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [clusters, setClusters] = useState<ClusterPoint[]>([])

  useEffect(() => {
    d3.json<GeoJSON.FeatureCollection>("/chicago2.geojson").then((data) => {
      if (data) setGeoData(data)
    })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (start) params.append("start", start)
    if (end) params.append("end", end)
    if (categories?.length) categories.forEach((cat) => params.append("categories", cat))
    if (arrest !== null && arrest !== undefined) params.append("arrest", arrest.toString())
    if (district !== null && district !== undefined) params.append("district", district.toString())
    if (ward !== null && ward !== undefined) params.append("ward", ward.toString())

    fetch(`/api/crimes/points?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.clusters) {
          setClusters(res.clusters as ClusterPoint[])
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error(error)
      })

    return () => controller.abort()
  }, [start, end, categories, arrest, district, ward])

  const maxCrimes = d3.max(clusters, (d) => d.count_crimes) || 1
  const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, maxCrimes])
  const radiusScale = d3.scaleSqrt().domain([0, maxCrimes]).range([4, 40])

  const chicagoBounds: L.LatLngBoundsExpression = [
    [41.6445, -87.9401],
    [42.0230, -87.5237],
  ]

  const styleFeature = (feature: GeoJSON.Feature) => {
    const wardNumber = feature.properties?.ward || null
    const isSelected = wardNumber === ward
    return {
      color: isSelected ? "#ff7800" : "#555",
      weight: isSelected ? 3 : 1,
      fillColor: isSelected ? "#ffa64d" : "#cce5df",
      fillOpacity: isSelected ? 0.9 : 0.6,
    }
  }

  return (
    <MapContainer
      center={[41.8781, -87.6298]}
      zoom={11}
      minZoom={11}
      style={{ width: "98%", height: "98%" }}
      scrollWheelZoom={true}
      maxBounds={chicagoBounds}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {geoData && (
        <GeoJSON
          data={geoData}
          style={styleFeature}
          key={ward ?? "no-ward"} // <== Este cambio es crucial
          onEachFeature={(feature, layer) => {
            const wardNumber = feature.properties?.ward || "Desconocido"
            layer.bindTooltip(`Ward ${wardNumber}`, {
              permanent: false,
              direction: "top",
              className: "ward-tooltip",
            })

            layer.on({
              mouseover: (e) => {
                const target = e.target
                target.setStyle({
                  weight: 3,
                  color: "#000",
                  fillOpacity: 0.8,
                })
              },
              mouseout: (e) => {
                const target = e.target
                const currentWard = feature.properties?.ward
                const isSelected = currentWard === ward
                target.setStyle({
                  weight: isSelected ? 3 : 1,
                  color: isSelected ? "#ff7800" : "#555",
                  fillOpacity: isSelected ? 0.9 : 0.6,
                })
              },
              click: () => {
                const wardClicked = feature.properties?.ward
                if (wardClicked !== undefined && wardClicked !== null) {
                  if (ward === wardClicked) {
                    setFilter("ward", null)  // Deselecciona si es el mismo ward
                  } else {
                    setFilter("ward", wardClicked)  // Cambia a otro ward
                  }
                }
              }
            })
          }}
        />
      )}

      {clusters.map((point, i) => (
        <CircleMarker
          key={i}
          center={[point.Latitude, point.Longitude]}
          radius={radiusScale(point.count_crimes)}
          pathOptions={{
            color: "#333",
            weight: 1,
            fillColor: colorScale(point.count_crimes),
            fillOpacity: 0.8,
          }}
        />
      ))}
    </MapContainer>
  )
}

export default CrimesMapChart
