export function parseIntendedUses(value: string) {
  return value.split("|").map((item) => item.trim()).filter(Boolean);
}

export function serializeIntendedUses(values: string[]) {
  return values.join("|");
}

export function primaryIntendedUse(value: string) {
  return parseIntendedUses(value)[0] ?? "HCP meeting";
}

export function displayIntendedUses(value: string) {
  return parseIntendedUses(value).join(" + ");
}
