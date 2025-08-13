// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildQueryParams = <T extends Record<string, any>>(
  params?: T
): string => {
  if (!params) return "";

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (
        key === "filters" &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        // Filters objesindeki parametreleri üst seviyeye çıkar
        Object.entries(value).forEach(([filterKey, filterValue]) => {
          if (
            filterValue !== undefined &&
            filterValue !== null &&
            filterValue !== ""
          ) {
            if (
              typeof filterValue === "string" ||
              typeof filterValue === "number" ||
              typeof filterValue === "boolean"
            ) {
              queryParams.append(filterKey, filterValue.toString());
            }
          }
        });
      } else if (typeof value === "number" || typeof value === "boolean") {
        queryParams.append(key, value.toString());
      } else if (typeof value === "string" && value.trim() !== "") {
        queryParams.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => {
          queryParams.append(key, v.toString());
        });
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
};
