import * as React from "react"
import { parseISO, format } from "date-fns"

import { Slider } from "@/components/ui/slider"
import { useFiltersStore } from "@/store/useFiltersStore"

const MIN_DATE = "2020-01-01"
const MAX_DATE = "2020-12-31"

const MIN_DATE_OBJ = parseISO(MIN_DATE)
const MAX_DATE_OBJ = parseISO(MAX_DATE)

const MIN_TIMESTAMP = MIN_DATE_OBJ.getTime()
const MAX_TIMESTAMP = MAX_DATE_OBJ.getTime()

function clampDateValue(value: number) {
  return Math.min(Math.max(value, MIN_TIMESTAMP), MAX_TIMESTAMP)
}

export function DateRangeFilter() {
  const [range, setRange] = React.useState<[number, number]>([
    MIN_TIMESTAMP,
    MAX_TIMESTAMP,
  ])

  const { setFilter } = useFiltersStore()

  React.useEffect(() => {
    const [start, end] = range
    setFilter("start", format(new Date(start), "yyyy-MM-dd"))
    setFilter("end", format(new Date(end), "yyyy-MM-dd"))
  }, [range, setFilter])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex justify-between text-sm text-muted-foreground px-1">
        <span>{format(new Date(range[0]), "yyyy-MM-dd")}</span>
        <span>{format(new Date(range[1]), "yyyy-MM-dd")}</span>
      </div>

      <Slider
        min={MIN_TIMESTAMP}
        max={MAX_TIMESTAMP}
        step={24 * 60 * 60 * 1000} // un día en ms
        value={range}
        onValueChange={(val: [number, number]) =>
          setRange([clampDateValue(val[0]), clampDateValue(val[1])])
        }
      />
    </div>
  )
}
