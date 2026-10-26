export const TODAY = Object.freeze({ year: 2026, month: 9, day: 26 });
export const DEFAULT_DATE = Object.freeze({ year: 2026, month: 9, day: 27 });
export const SLOT_DATA = Object.freeze([
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "17:30", available: false },
]);

export function getSlots(date) {
  if (!date || new Date(date.year, date.month, date.day).getDay() === 0) return [];
  return SLOT_DATA.map(slot => ({
    ...slot,
    available: slot.available && (slot.time !== "11:00" || date.day % 2 === 0),
  }));
}
