export const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export function asDate(date) {
  return new Date(date.year, date.month, date.day);
}

export function compareDates(a, b) {
  return Math.sign(asDate(a).getTime() - asDate(b).getTime());
}

export function isDateSelectable(date, today) {
  return compareDates(date, today) >= 0;
}

export function dateKey(date) {
  return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function formatDate(date) {
  const formatted = dateFormatter.format(asDate(date));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function shiftMonth(year, month, direction) {
  const date = new Date(year, month + direction, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function buildCalendarGrid(year, month) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const count = Math.ceil((offset + daysInMonth) / 7) * 7;
  const weeks = [];
  for (let index = 0; index < count; index += 7) {
    const week = [];
    for (let column = 0; column < 7; column += 1) {
      const date = new Date(year, month, index + column - offset + 1);
      week.push({ year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), otherMonth: date.getMonth() !== month });
    }
    weeks.push(week);
  }
  return weeks;
}
