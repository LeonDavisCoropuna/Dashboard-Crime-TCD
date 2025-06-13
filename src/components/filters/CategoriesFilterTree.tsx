import { useCrimeStore } from "@/store/useCrimeStore"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export const CategoriesFilterTree = () => {
  const {
    categories,
    selectedCrimes,
    toggleCrime,
  } = useCrimeStore()

  // Obtener todos los nombres de categoría
  const categoryValues = categories.map((cat) => cat.name)

  return (
    <Accordion type="multiple" defaultValue={categoryValues} className="w-full">
      {categories.map((category) => {
        const subcategoryValues = category.subcategories.map((sub) => sub.name)

        return (
          <AccordionItem key={category.name} value={category.name}>
            <AccordionTrigger>{category.name}</AccordionTrigger>
            <AccordionContent>
              <Accordion
                type="multiple"
                defaultValue={subcategoryValues}
                className="pl-4"
              >
                {category.subcategories.map((subcategory) => (
                  <AccordionItem key={subcategory.name} value={subcategory.name}>
                    <AccordionTrigger>{subcategory.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-2 pl-4">
                        {subcategory.crimes.map((crime) => (
                          <label key={crime} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedCrimes.includes(crime)}
                              onCheckedChange={() => toggleCrime(crime)}
                              id={crime}
                            />
                            <Label htmlFor={crime} className="text-sm">
                              {crime}
                            </Label>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
