/**
 * Returns today's date as 'yyyy-MM-dd' in the local time zone of the browser.
 *
 * @remarks toISOString() works in UTC, so in Lima it returns the next day after 19:00. Every default
 * date and "today" comparison of the Benefits context uses this function instead.
 * @author Salym
 */
export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
