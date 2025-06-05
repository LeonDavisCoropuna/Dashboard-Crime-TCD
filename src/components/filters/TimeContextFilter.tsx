import { useFiltersStore } from "@/store/useFiltersStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { useState, useRef, useEffect } from "react"

export function TimeContextFilter() {
  const businessHour = useFiltersStore((state) => state.businessHour)
  const weekend = useFiltersStore((state) => state.weekend)
  const holiday = useFiltersStore((state) => state.holiday)
  const setFilter = useFiltersStore((state) => state.setFilter)

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const toggleFilter = (key: "businessHour" | "weekend" | "holiday") => {
    const current = useFiltersStore.getState()[key];
    setFilter(key, current ? null : true);
  }

  const selectedCount = [businessHour, weekend, holiday].filter(Boolean).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-56 justify-between" onClick={() => setOpen(!open)}>
          Filtros Tiempo (Contexto)
          {selectedCount > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">({selectedCount})</span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={menuRef}
        className="w-56"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => toggleFilter("businessHour")}
        >
          <input
            type="checkbox"
            checked={businessHour === true}
            onChange={() => toggleFilter("businessHour")}
            className="pointer-events-none"
          />
          <span className="text-sm">Horario Laboral</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => toggleFilter("weekend")}
        >
          <input
            type="checkbox"
            checked={weekend === true}
            onChange={() => toggleFilter("weekend")}
            className="pointer-events-none"
          />
          <span className="text-sm">Fin de Semana</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
