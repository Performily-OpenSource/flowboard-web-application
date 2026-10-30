/**
 * Checks whether a text contains the search, ignoring upper case and accents ("lucia" finds
 * "Lucía"). Used by the search boxes of the Benefits views.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @param text Text where the search is looked for.
 * @param search Text typed by the user.
 * @author Salym
 */
export function matchesText(text: string, search: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return normalize(text).includes(normalize(search));
}
