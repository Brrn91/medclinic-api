export function getTodayIsoDate(now: Date = new Date()): string {
  const year: number = now.getFullYear();
  const month: string = String(now.getMonth() + 1).padStart(2, "0");
  const day: string = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
