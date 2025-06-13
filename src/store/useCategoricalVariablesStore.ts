import { create } from 'zustand'

type CategoricalVariableGroup = {
  name: string
  variables: string[]
}

type CategoricalVariablesStore = {
  crimeInfo: CategoricalVariableGroup
  temporal: CategoricalVariableGroup
  binaryIndicators: CategoricalVariableGroup
  allVariables: string[]

  selectedVariables: string[]
  toggleVariable: (variable: string) => void
  setSelectedVariables: (variables: string[]) => void
  resetSelectedVariables: () => void
  toggleSelectedVariable: (variable: string) => void
}

export const useCategoricalVariablesStore = create<CategoricalVariablesStore>((set, get) => {
  const crimeInfo = {
    name: 'Información del Crimen',
    variables: [
      'Category',
      'Description',
      'Location Description',
    ],
  }

  const temporal = {
    name: 'Contexto Temporal',
    variables: [
      'Hour_Zone',
      'Season',
    ],
  }

  const binaryIndicators = {
    name: 'Indicadores Binarios',
    variables: [
      'Arrest',
      'Domestic',
      'BusinessHour',
      'Weekend',
      'Holiday',
    ],
  }


  const allVariables = [
    ...crimeInfo.variables,
    ...temporal.variables,
    ...binaryIndicators.variables,
  ]

  return {
    crimeInfo,
    temporal,
    binaryIndicators,
    allVariables,

    selectedVariables: ['Arrest', 'Hour_Zone', 'Season', 'Weekend'],

    toggleVariable: (variable: string) => {
      const { selectedVariables } = get()
      const isSelected = selectedVariables.includes(variable)
      set({
        selectedVariables: isSelected
          ? selectedVariables.filter((v) => v !== variable)
          : [...selectedVariables, variable],
      })
    },

    toggleSelectedVariable: (variable: string) =>
      set((state) => ({
        selectedVariables: state.selectedVariables.includes(variable)
          ? state.selectedVariables.filter((v) => v !== variable)
          : [...state.selectedVariables, variable],
      })),

    setSelectedVariables: (variables: string[]) => set({ selectedVariables: variables }),

    resetSelectedVariables: () =>
      set({
        selectedVariables: ['Arrest', 'Hour_Zone', 'Season', 'Weekend'],
      }),
  }
})
