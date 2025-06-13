import { create } from 'zustand'

export type CrimeSubcategory = {
  name: string
  crimes: string[]
}

export type CrimeCategory = {
  name: string
  subcategories: CrimeSubcategory[]
}

type CrimeStore = {
  categories: CrimeCategory[]
  allCrimes: string[]
  selectedCrimes: string[]
  toggleCrime: (crime: string) => void
  setSelectedCrimes: (crimes: string[]) => void
  resetSelectedCrimes: () => void
}

// Objeto original en formato JS
const crime_categories = {
  THEFT: {
    VEHICLE: {
      AUTOMOBILE: {},
      TRUCK_BUS: {
        BUS: {},
        TRUCK: {},
      },
      BIKE: {
        BIKE: {},
        SCOOTER: {},
      },
    },
    PROPERTY: {
      FROM_BUILDING: {},
      FROM_RESIDENCE: {},
      RETAIL: {},
      LOST_PROPERTY: {},
    },
    FINANCIAL: {
      IDENTITY: {},
      CREDIT_CARD: {},
      BANK_FRAUD: {},
    },
  },
  ASSAULT: {
    DOMESTIC: {
      BATTERY: {},
      AGGRAVATED: {},
    },
    PUBLIC: {
      STRONG_ARM: {},
      AGGRAVATED: {},
    },
    POLICE: {
      OFFICER: {},
      RESISTING: {},
    },
  },
  BURGLARY: {
    RESIDENCE: {},
    COMMERCIAL: {},
    FORCIBLE_ENTRY: {},
  },
  DRUG: {
    POSSESSION: {
      CANNABIS: {},
      COCAINE: {},
      HEROIN: {},
      SYNTHETIC: {},
    },
    MANUFACTURE: {
      CANNABIS: {},
      COCAINE: {},
      HEROIN: {},
    },
  },
  WEAPON: {
    FIREARM: {
      HANDGUN: {},
      OTHER: {},
    },
    KNIFE: {},
    OTHER_WEAPON: {},
  },
  SEX_CRIME: {
    ASSAULT: {
      CHILD: {},
      ADULT: {},
    },
    ABUSE: {
      CHILD: {},
      FAMILY: {},
    },
    EXPLOITATION: {
      PORNOGRAPHY: {},
      SOLICITATION: {},
    },
  },
  FRAUD: {
    FINANCIAL: {},
    IDENTITY: {},
    INSURANCE: {},
  },
  DAMAGE: {
    CRIMINAL_DAMAGE: {},
    ARSON: {},
    VANDALISM: {},
  },
}

// Utilidad para convertir el objeto anidado a `CrimeCategory[]`
function convertToCrimeCategories(obj: any): CrimeCategory[] {
  return Object.entries(obj).map(([categoryName, subcats]) => {
    const subcategories: CrimeSubcategory[] = Object.entries(subcats).map(
      ([subName, crimes]) => {
        // Si el valor tiene más niveles (es un objeto con más subtipos)
        if (
          crimes &&
          typeof crimes === 'object' &&
          Object.keys(crimes).length > 0
        ) {
          return {
            name: subName,
            crimes: Object.keys(crimes),
          }
        } else {
          // Si ya es una hoja
          return {
            name: subName,
            crimes: [],
          }
        }
      }
    )

    return {
      name: categoryName,
      subcategories,
    }
  })
}

export const useCrimeStore = create<CrimeStore>((set, get) => {
  const categories = convertToCrimeCategories(crime_categories)

  const allCrimes = categories.flatMap((cat) =>
    cat.subcategories.flatMap((sub) => sub.crimes)
  )

  return {
    categories,
    allCrimes,
    selectedCrimes: allCrimes,
    toggleCrime: (crime: string) => {
      const selected = get().selectedCrimes
      set({
        selectedCrimes: selected.includes(crime)
          ? selected.filter((c) => c !== crime)
          : [...selected, crime],
      })
    },
    setSelectedCrimes: (crimes: string[]) => set({ selectedCrimes: crimes }),
    resetSelectedCrimes: () => set({ selectedCrimes: [] }),
  }
})
