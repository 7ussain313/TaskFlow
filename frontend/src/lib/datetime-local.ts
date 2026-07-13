// Converts an ISO date string to the value a <input type="datetime-local"> expects
// (local time, no timezone, minute precision): "YYYY-MM-DDTHH:mm".
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
