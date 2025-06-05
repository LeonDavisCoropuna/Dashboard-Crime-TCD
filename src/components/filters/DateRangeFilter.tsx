import * as React from "react"
import { parse, parseISO } from "date-fns"

import { Input } from "@/components/ui/input"
import { useFiltersStore } from "@/store/useFiltersStore"

const MIN_DATE = "2020-01-01"
const MAX_DATE = "2020-12-31"

const MIN_DATE_OBJ = parseISO(MIN_DATE)
const MAX_DATE_OBJ = parseISO(MAX_DATE)

function parseInputDate(input: string): Date | undefined {
  const parsed = parse(input, "yyyy-MM-dd", new Date())
  return isNaN(parsed.getTime()) ? undefined : parsed
}

export function DateRangeFilter() {
  const [startDate, setStartDate] = React.useState<Date>(MIN_DATE_OBJ)
  const [endDate, setEndDate] = React.useState<Date>(MAX_DATE_OBJ)

  const [startInput, setStartInput] = React.useState(MIN_DATE)
  const [endInput, setEndInput] = React.useState(MAX_DATE)

  const { setFilter, resetFilters } = useFiltersStore()

  React.useEffect(() => {
    setFilter("start", startDate.toISOString().split("T")[0])
    setFilter("end", endDate.toISOString().split("T")[0])
  }, [startDate, endDate, setFilter])

  const handleStartInputChange = (value: string) => {
    setStartInput(value)
    const date = parseInputDate(value)
    if (date) setStartDate(date)
  }

  const handleEndInputChange = (value: string) => {
    setEndInput(value)
    const date = parseInputDate(value)
    if (date) setEndDate(date)
  }

  return (
    <div className="flex flex-col gap-y-2">
      {/* Fecha Inicial */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Inicio</label>
        <Input
          type="date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={startInput}
          onChange={(e) => handleStartInputChange(e.target.value)}
        />
      </div>

      {/* Fecha Final */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Final</label>
        <Input
          type="date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={endInput}
          onChange={(e) => handleEndInputChange(e.target.value)}
        />
      </div>
    </div>
  )
}
