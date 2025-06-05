import { useFiltersStore } from "@/store/useFiltersStore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"

const categoriesList = [
  'THEFT', 'BATTERY', 'CRIMINAL DAMAGE', 'WEAPONS VIOLATION',
  'MOTOR VEHICLE THEFT', 'BURGLARY', 'ROBBERY', 'NARCOTICS',
  'CRIMINAL TRESPASS', 'PUBLIC PEACE VIOLATION',
  'LIQUOR LAW VIOLATION', 'ASSAULT', 'OTHER OFFENSE',
  'DECEPTIVE PRACTICE', 'STALKING', 'SEX OFFENSE',
  'OFFENSE INVOLVING CHILDREN', 'CRIMINAL SEXUAL ASSAULT', 'ARSON',
  'HOMICIDE', 'INTERFERENCE WITH PUBLIC OFFICER', 'INTIMIDATION',
  'CONCEALED CARRY LICENSE VIOLATION', 'PROSTITUTION', 'KIDNAPPING',
  'OBSCENITY', 'PUBLIC INDECENCY', 'GAMBLING', 'RITUALISM',
  'HUMAN TRAFFICKING', 'OTHER NARCOTIC VIOLATION', 'NON-CRIMINAL',
  'CRIM SEXUAL ASSAULT'
]

export function CategoriesFilter() {
  const categories = useFiltersStore(state => state.categories)
  const setFilter = useFiltersStore(state => state.setFilter)

  const toggleCategory = (category: string) => {
    let newCategories: string[]
    if (categories.includes(category)) {
      newCategories = categories.filter(c => c !== category)
    } else {
      newCategories = [...categories, category]
    }
    setFilter("categories", newCategories)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          Categorías {categories.length > 0 ? `(${categories.length})` : ""}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 max-h-60 overflow-auto">
        {categoriesList.map(category => (
          <DropdownMenuItem
            key={category}
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => toggleCategory(category)}
          >
            <input
              type="checkbox"
              checked={categories.includes(category)}
              onChange={() => toggleCategory(category)}
              className="pointer-events-none"
            />
            <span className="text-sm">{category}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
