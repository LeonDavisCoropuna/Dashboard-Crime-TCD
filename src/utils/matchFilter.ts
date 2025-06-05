function formatDateString(date: Date, endOfDay = false): string {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const time = endOfDay ? "23:59:59" : "00:00:00";
  return `${yyyy}-${mm}-${dd} ${time}`;
}

export function buildMatchFilter(params: URLSearchParams) {
  const matchFilter: any = {};

  const start = params.get("start");
  const end = params.get("end");
  const categories = params.getAll("categories");
  const arrestParam = params.get("arrest");
  const domesticParam = params.get("domestic"); // renombrar
  const districtParam = params.get("district");
  const beatParam = params.get("beat");
  const wardParam = params.get("ward");
  const communityAreaParam = params.get("communityArea");
  const businessHourParam = params.get("businessHour");
  const weekendParam = params.get("weekend");
  const holidayParam = params.get("holiday");
  const season = params.get("season");
  const hourParam = params.get("hour");
  const dayOfWeekParam = params.get("dayOfWeek");
  const monthParam = params.get("month");
  const locationDescription = params.get("locationDescription");

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      matchFilter.Date = {
        $gte: formatDateString(startDate, false),
        $lte: formatDateString(endDate, true),
      };
    }
  }

  if (categories.length > 0) {
    matchFilter.Category = { $in: categories.map(c => c.toUpperCase()) };
  }

  if (arrestParam !== null) {
    matchFilter.Arrest = arrestParam === "true";
  }

  if (domesticParam !== null) {
    matchFilter.Domestic = domesticParam === "true";
  }

  if (districtParam !== null && !isNaN(Number(districtParam))) {
    matchFilter.District = Number(districtParam);
  }

  if (beatParam !== null && !isNaN(Number(beatParam))) {
    matchFilter.Beat = Number(beatParam);
  }

  if (wardParam !== null && !isNaN(Number(wardParam))) {
    matchFilter.Ward = Number(wardParam);
  }

  if (communityAreaParam !== null && !isNaN(Number(communityAreaParam))) {
    // ¡Usar el nombre exacto con espacio para que MongoDB lo entienda!
    matchFilter["Community Area"] = Number(communityAreaParam);
  }

  if (businessHourParam !== null) {
    // Aquí convertimos string 'true' o '1' a número 1, sino 0
    matchFilter.BusinessHour = businessHourParam === "true" || businessHourParam === "1" ? 1 : 0;
  }

  if (weekendParam !== null) {
    matchFilter.Weekend = weekendParam === "true" || weekendParam === "1" ? 1 : 0;
  }

  if (holidayParam !== null) {
    matchFilter.Holiday = holidayParam === "true" || holidayParam === "1" ? 1 : 0;
  }

  if (season !== null) {
    matchFilter.Season = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase(); // "Winter" style
  }

  if (hourParam !== null && !isNaN(Number(hourParam))) {
    matchFilter.Hour = Number(hourParam);
  }

  if (dayOfWeekParam !== null && !isNaN(Number(dayOfWeekParam))) {
    // En tu JSON dayOfWeek es número, en filtro también
    matchFilter.dayOfWeek = Number(dayOfWeekParam);
  }

  if (monthParam !== null && !isNaN(Number(monthParam))) {
    matchFilter.Month = Number(monthParam);
  }

  if (locationDescription !== null) {
    matchFilter["Location Description"] = locationDescription; // Nombre con espacio
  }

  return matchFilter;
}
