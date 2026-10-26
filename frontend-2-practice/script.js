"use strict";

// 1. ДАННЫЕ. Фиксированное «сегодня» разрешено заданием.
const TODAY = Object.freeze({ year: 2026, month: 9, day: 26 });
const SLOT_DATA = Object.freeze([
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "17:30", available: false },
]);
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

// 2. СОСТОЯНИЕ. Дата, показанный месяц и выбранное время независимы.
const state = {
  currentYear: TODAY.year,
  currentMonth: TODAY.month,
  selectedDate: { year: 2026, month: 9, day: 27 },
  selectedTime: null,
  slots: [],
};
let elements;

// 3. ЧИСТЫЕ ФУНКЦИИ. Не обращаются к DOM.
function asDate(date) {
  return new Date(date.year, date.month, date.day);
}

function compareDates(a, b) {
  return Math.sign(asDate(a).getTime() - asDate(b).getTime());
}

function isDateSelectable(date, today = TODAY) {
  return compareDates(date, today) >= 0;
}

function dateKey(date) {
  return `${date.year}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function formatDate(date) {
  const formatted = dateFormatter.format(asDate(date));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function shiftMonth(year, month, direction) {
  const date = new Date(year, month + direction, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

function buildCalendarGrid(year, month) {
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

function getSlots(date) {
  // По воскресеньям все окна заняты. В остальные дни расписание различается.
  if (asDate(date).getDay() === 0) return [];
  return SLOT_DATA.map(slot => ({
    ...slot,
    available: slot.available && (slot.time !== "11:00" || date.day % 2 === 0),
  }));
}

// 4. ОТРИСОВКА И ОБРАБОТЧИКИ.
function hideMessage() {
  elements.message.hidden = true;
  elements.message.textContent = "";
}

function renderCalendar() {
  elements.month.textContent = `${MONTHS[state.currentMonth]} ${state.currentYear}`;
  elements.days.innerHTML = buildCalendarGrid(state.currentYear, state.currentMonth).flat().map(cell => {
    const disabled = cell.otherMonth || !isDateSelectable(cell);
    const selected = state.selectedDate !== null && compareDates(cell, state.selectedDate) === 0;
    const today = compareDates(cell, TODAY) === 0;
    const classes = ["calendar__day", selected ? "calendar__day--selected" : "", today ? "calendar__day--today" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-day="${cell.day}" aria-label="${formatDate(cell)}" aria-pressed="${selected}" ${today ? 'aria-current="date"' : ""} ${disabled ? "disabled" : ""}>${cell.day}</button>`;
  }).join("");
  // После замены innerHTML обработчики назначаются новым кнопкам.
  elements.days.querySelectorAll("button:enabled").forEach(button => {
    button.addEventListener("click", onDayClick);
  });
}

function renderTimeSlots() {
  if (!state.selectedDate) {
    elements.date.textContent = "Сначала выберите дату";
    elements.slots.innerHTML = '<p class="time-choice__empty">Выберите доступный день в календаре.</p>';
    return;
  }
  elements.date.textContent = formatDate(state.selectedDate);
  if (state.slots.length === 0) {
    elements.slots.innerHTML = '<p class="time-choice__empty">На этот день всё занято. Выберите другую дату.</p>';
    return;
  }
  elements.slots.innerHTML = state.slots.map(slot => {
    const selected = slot.time === state.selectedTime;
    const classes = ["time-slot", !slot.available ? "time-slot--busy" : "", selected ? "time-slot--selected" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-time="${slot.time}" aria-pressed="${selected}" aria-label="${slot.time}${slot.available ? "" : " — занято"}" ${slot.available ? "" : "disabled"}>${slot.time}${slot.available ? "" : '<span class="time-slot__label">Занято</span>'}</button>`;
  }).join("");
  elements.slots.querySelectorAll("button:enabled").forEach(button => {
    button.addEventListener("click", onTimeSlotClick);
  });
}

function updateBottomBar() {
  elements.summary.textContent = state.selectedDate
    ? `${formatDate(state.selectedDate)} • ${state.selectedTime || "Выберите время"}`
    : "Выберите дату и время";
  elements.continue.disabled = !state.selectedDate || !state.selectedTime;
}

function render() {
  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

function selectDate(date) {
  if (!isDateSelectable(date)) return;
  state.selectedDate = { ...date };
  state.currentYear = date.year;
  state.currentMonth = date.month;
  state.selectedTime = null;
  state.slots = getSlots(date);
  hideMessage();
  render();
}

function onDayClick(event) {
  const day = Number(event.currentTarget.dataset.day);
  selectDate({ year: state.currentYear, month: state.currentMonth, day });
  // Сохраняем клавиатурный фокус после перерисовки.
  elements.days.querySelector(`[data-day="${day}"]:enabled`).focus({ preventScroll: true });
}

function onTimeSlotClick(event) {
  const time = event.currentTarget.dataset.time;
  if (!state.slots.some(slot => slot.time === time && slot.available)) return;
  state.selectedTime = time;
  hideMessage();
  renderTimeSlots();
  updateBottomBar();
  elements.slots.querySelector(`[data-time="${time}"]`).focus({ preventScroll: true });
}

function setupMonthNavigation() {
  document.querySelectorAll(".calendar__arrow").forEach(button => {
    button.addEventListener("click", event => {
      const next = shiftMonth(state.currentYear, state.currentMonth, Number(event.currentTarget.dataset.direction));
      state.currentYear = next.year;
      state.currentMonth = next.month;
      state.selectedDate = null;
      state.selectedTime = null;
      state.slots = [];
      hideMessage();
      render();
    });
  });
}

function focusCalendar() {
  elements.calendar.scrollIntoView({ behavior: "auto", block: "start" });
  const day = elements.days.querySelector('[aria-pressed="true"]:enabled') || elements.days.querySelector("button:enabled");
  (day || document.querySelector('.calendar__arrow[data-direction="1"]')).focus({ preventScroll: true });
}

// 5. ИНИЦИАЛИЗАЦИЯ.
function init() {
  elements = {
    calendar: document.querySelector(".calendar"),
    month: document.querySelector(".calendar__month"),
    days: document.querySelector(".calendar__days"),
    date: document.querySelector(".time-choice__date"),
    slots: document.querySelector(".time-choice__slots"),
    summary: document.querySelector(".booking-summary__time"),
    continue: document.querySelector(".booking-summary__continue"),
    message: document.querySelector(".booking-message"),
  };
  state.slots = getSlots(state.selectedDate);
  setupMonthNavigation();
  document.querySelector(".calendar__today").addEventListener("click", () => selectDate(TODAY));
  document.querySelector(".time-choice__change-date").addEventListener("click", focusCalendar);
  document.querySelector(".navigation__back").addEventListener("click", focusCalendar);
  elements.continue.addEventListener("click", () => {
    if (elements.continue.disabled) return;
    elements.message.textContent = `Вы выбрали: ${formatDate(state.selectedDate)}, ${state.selectedTime}. Учебная демонстрация: реальная запись не отправляется.`;
    elements.message.hidden = false;
    elements.message.scrollIntoView({ behavior: "auto", block: "center" });
  });
  render();
}

document.addEventListener("DOMContentLoaded", init);

