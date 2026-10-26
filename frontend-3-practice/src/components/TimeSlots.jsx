import { formatDate } from "../utils/date.js";

export default function TimeSlots({ selectedDate, slots, selectedTime, onSelectTime, onChangeDate, message }) {
  return (
    <section className="time-choice" aria-labelledby="time-title">
      <h1 className="time-choice__title" id="time-title">Выберите время</h1>
      <p className="time-choice__description">Указано время начала визита</p>
      <p className="time-choice__date" aria-live="polite">{selectedDate ? formatDate(selectedDate) : "Сначала выберите дату"}</p>
      <div className="time-choice__slots" role="group" aria-label="Время начала визита">
        {!selectedDate ? <p className="time-choice__empty">Выберите доступный день в календаре.</p> : slots.length === 0 ? <p className="time-choice__empty">На этот день всё занято. Выберите другую дату.</p> : slots.map(slot => (
          <button key={slot.time} className={["time-slot", !slot.available && "time-slot--busy", slot.time === selectedTime && "time-slot--selected"].filter(Boolean).join(" ")} type="button" disabled={!slot.available} aria-pressed={slot.time === selectedTime} aria-label={`${slot.time}${slot.available ? "" : " — занято"}`} onClick={() => onSelectTime(slot.time)}>
            {slot.time}{!slot.available && <span className="time-slot__label">Занято</span>}
          </button>
        ))}
      </div>
      <button className="time-choice__change-date" type="button" onClick={onChangeDate}>Изменить дату</button>
      <p className="booking-message" role="status" hidden={!message}>{message}</p>
    </section>
  );
}
