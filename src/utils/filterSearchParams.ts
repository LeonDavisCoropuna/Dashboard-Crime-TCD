export function filtersToSearchParams(filters: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      value.forEach((v) => params.append(key, v.toString()));
    } else if (typeof value === "boolean") {
      // Solo añade si quieres enviar booleanos explícitos, o puedes hacer filtro extra si quieres
      params.append(key, value.toString());
    } else {
      params.append(key, value.toString());
    }
  });

  return params;
}