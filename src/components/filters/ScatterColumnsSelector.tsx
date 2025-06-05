import { useScatterStore } from "@/store/useScatterStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"

const tweetColumns = [
  'likeCount',          // antes: likes_count
  'retweetCount',       // antes: retweets_count
  'replyCount',         // antes: replies_count
  'Confidence-skywalker', // para sentiment (suponiendo que esto representa el sentimiento)
  'user_followersCount', // ok
]

export function ScatterColumnsSelector() {
  const { xAxis, yAxis, colorBy, setXAxis, setYAxis, setColorBy } = useScatterStore()

  const renderDropdown = (
    label: string,
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          {label}: {selected}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-60 overflow-auto">
        {tweetColumns.map((col) => (
          <DropdownMenuItem
            key={col}
            onClick={() => onSelect(col)}
            className="cursor-pointer"
          >
            {col}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="flex gap-4 flex-wrap">
      {renderDropdown("Eje X", xAxis, setXAxis)}
      {renderDropdown("Eje Y", yAxis, setYAxis)}
      {renderDropdown("Color", colorBy, setColorBy)}
    </div>
  )
}
