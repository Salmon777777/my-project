import { buildCalendarGrid, compareDates, dateKey, formatDate, isDateSelectable, MONTHS } from "../utils/date.js";

export default function Calendar({ year, month, selectedDate, today, onSelectDate, onChangeMonth, calendarRef }) {
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return (
    <section className="calendar" aria-labelledby="calendar-title" id="date-choice" ref={calendarRef} tabIndex={-1}>
      <div className="calendar__heading">
        <h2 className="calendar__title" id="calendar-title">Выберите дату</h2>
        <button className="calendar__today" type="button" onClick={() => onSelectDate(today)}>Сегодня</button>
      </div>
      <div className="calendar__navigation">
        <button className="calendar__arrow" type="button" onClick={() => onChangeMonth(-1)} aria-label="Предыдущий месяц">‹</button>
        <h3 className="calendar__month" id="month-title" aria-live="polite">{MONTHS[month]} {year}</h3>
        <button className="calendar__arrow" type="button" onClick={() => onChangeMonth(1)} aria-label="Следующий месяц">›</button>
      </div>
      <div className="calendar__weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar__days" role="group" aria-labelledby="month-title">
        {buildCalendarGrid(year, month).flat().map(cell => {
          const selected = Boolean(selectedDate && compareDates(cell, selectedDate) === 0);
          const isToday = compareDates(cell, today) === 0;
          const classes = ["calendar__day", selected && "calendar__day--selected", isToday && "calendar__day--today"].filter(Boolean).join(" ");
          return <button key={dateKey(cell)} className={classes} type="button" disabled={cell.otherMonth || !isDateSelectable(cell, today)} aria-label={formatDate(cell)} aria-pressed={selected} aria-current={isToday ? "date" : undefined} onClick={() => onSelectDate(cell)}>{cell.day}</button>;
        })}
      </div>
      <p className="calendar__hint">Прошедшие даты недоступны. Время — московское.</p>
    </section>
  );
}
