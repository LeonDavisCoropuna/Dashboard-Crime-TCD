import { useFiltersStore } from "@/store/useFiltersStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { useState, useRef, useEffect } from "react"

export function ArrestFilter() {
  const arrest = useFiltersStore((state) => state.arrest)
  const domestic = useFiltersStore((state) => state.domestic)
  const setFilter = useFiltersStore((state) => state.setFilter)

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Detectar clic fuera para cerrar menú
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

  // Toggle simple boolean filter
  const toggleFilter = (key: "arrest" | "domestic") => {
    const state = useFiltersStore.getState();
    const currentValue = state[key];

    if (key === "arrest") {
      if (currentValue === true) {
        // Si estaba true, ahora se desactiva => null
        setFilter("arrest", null);
      } else {
        // Si estaba false o null, se activa y desactiva domestic
        setFilter("arrest", true);
      }
    } else if (key === "domestic") {
      if (currentValue === true) {
        setFilter("domestic", null);
      } else {
        setFilter("domestic", true);
      }
    }
  }


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between" onClick={() => setOpen(!open)}>
          Filtros Arrest & Domicilio
          {(arrest || domestic) && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({[arrest && "Arrest", domestic && "Domicilio"].filter(Boolean).length})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={menuRef}
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => toggleFilter("arrest")}
        >
          <input
            type="checkbox"
            checked={arrest === true}
            onChange={() => toggleFilter("arrest")}
            className="pointer-events-none"
          />
          <span className="text-sm">Arrest</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => toggleFilter("domestic")}
        >
          <input
            type="checkbox"
            checked={domestic === true}
            onChange={() => toggleFilter("domestic")}
            className="pointer-events-none"
          />
          <span className="text-sm">Domicilio</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
