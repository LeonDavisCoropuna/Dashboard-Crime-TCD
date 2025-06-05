import { create } from 'zustand'

type Filters = {
  start: string | null // renombrar startDate -> start
  end: string | null   // renombrar endDate -> end
  categories: string[]
  arrest: boolean | null
  domestic: boolean | null // renombrar domicile -> domestic
  district: number | null
  beat: number | null
  ward: number | null
  communityArea: number | null
  businessHour: boolean | null
  weekend: boolean | null
  holiday: boolean | null
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | null
  hour: number | null
  dayOfWeek: number | null  // corregir a number porque en JSON es número
  month: number | null
  locationDescription: string | null
  fcode: string | null
  radius: number | null
  cluster: number | null

  setFilter: (key: keyof Filters, value: any) => void
  resetFilters: () => void
}

export const useFiltersStore = create<Filters>((set) => ({
  start: null,
  end: null,
  categories: [],
  beat: null,
  businessHour: null,
  cluster: null,
  communityArea: null,
  dayOfWeek: null,
  fcode: null,
  holiday: null,
  hour: null,
  locationDescription: null,
  month: null,
  radius: null,
  season: null,
  ward: null,
  weekend: null,
  arrest: null,
  domestic: null,
  district: null,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () =>
    set({
      start: null,
      end: null,
      categories: [],
      beat: null,
      businessHour: null,
      cluster: null,
      communityArea: null,
      dayOfWeek: null,
      fcode: null,
      holiday: null,
      hour: null,
      locationDescription: null,
      month: null,
      radius: null,
      season: null,
      ward: null,
      weekend: null,
      arrest: null,
      domestic: null,
      district: null,
    }),
}))
