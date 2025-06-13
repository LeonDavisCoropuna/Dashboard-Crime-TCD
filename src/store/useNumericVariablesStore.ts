import { create } from 'zustand'

type NumericVariableGroup = {
  name: string
  variables: string[]
}

type NumericVariablesStore = {
  spatial: NumericVariableGroup
  temporal: NumericVariableGroup
  statistical: NumericVariableGroup
  general: NumericVariableGroup
  allVariables: string[]

  selectedVariables: string[]
  toggleVariable: (variable: string) => void
  setSelectedVariables: (variables: string[]) => void
  resetSelectedVariables: () => void
  toggleSelectedVariable: (variable: string) => void
}

export const useNumericVariablesStore = create<NumericVariablesStore>((set, get) => {
  const spatial = {
    name: 'Espaciales',
    variables: [
      'X', 'Y', 'Latitude', 'Longitude',
      'X_scaled', 'Y_scaled',
      'Rot30_X', 'Rot30_Y',
      'Rot45_X', 'Rot45_Y',
      'Rot60_X', 'Rot60_Y',
    ],
  }

  const temporal = {
    name: 'Temporales',
    variables: [
      'Year', 'Month', 'dayOfWeek', 'dayOfMonth',
      'dayOfYear', 'weekOfMonth', 'weekOfYear',
      'Hour', 'Minute',
    ],
  }

  const statistical = {
    name: 'Estadísticas / Derivadas',
    variables: ['Radius', 'Angle', 'count_crimes'],
  }

  const general = {
    name: 'Generales',
    variables: ['ID'],
  }

  const allVariables = [
    ...spatial.variables,
    ...temporal.variables,
    ...statistical.variables,
    ...general.variables,
  ]

  return {
    spatial,
    temporal,
    statistical,
    general,
    allVariables,

    selectedVariables: ['Hour', 'Month', 'X', 'Y'],

    toggleVariable: (variable: string) => {
      const { selectedVariables } = get()
      const isSelected = selectedVariables.includes(variable)
      set({
        selectedVariables: isSelected
          ? selectedVariables.filter((v) => v !== variable)
          : [...selectedVariables, variable],
      })
    },
    toggleSelectedVariable: (variable: any) =>
      set((state) => ({
        selectedVariables: state.selectedVariables.includes(variable)
          ? state.selectedVariables.filter((v) => v !== variable)
          : [...state.selectedVariables, variable],
      })),
    setSelectedVariables: (variables: string[]) => set({ selectedVariables: variables }),

    resetSelectedVariables: () => set({ selectedVariables: ['Hour', 'Month', 'X', 'Y'] }),
  }
})
