import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategoricalVariablesStore } from "@/store/useCategoricalVariablesStore"

export function CategoricalVaribleFilter() {
  const { crimeInfo, binaryIndicators, selectedVariables, temporal, toggleVariable } = useCategoricalVariablesStore()


  const renderCheckboxList = (variables: string[]) =>
    variables.map((v) => (
      <div key={v} className="flex items-center space-x-2 py-1 px-2">
        <Checkbox
          id={v}
          checked={selectedVariables.includes(v)}
          onCheckedChange={() => toggleVariable(v)}
        />
        <label htmlFor={v} className="text-sm capitalize cursor-pointer">
          {v}
        </label>
      </div>
    ))

  return (
    <div className="w-full max-w-md rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold ">Variables Categóricas</h2>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="spatial">
          <AccordionTrigger>Espaciales</AccordionTrigger>
          <AccordionContent>{renderCheckboxList(crimeInfo.variables)}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="temporal">
          <AccordionTrigger>Temporales</AccordionTrigger>
          <AccordionContent>{renderCheckboxList(temporal.variables)}</AccordionContent>
        </AccordionItem>

        <AccordionItem value="statistical">
          <AccordionTrigger>Estadísticas</AccordionTrigger>
          <AccordionContent>{renderCheckboxList(binaryIndicators.variables)}</AccordionContent>
        </AccordionItem>
      </Accordion>

      {selectedVariables.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Seleccionadas: {selectedVariables.length}
        </p>
      )}
    </div>
  )
}
