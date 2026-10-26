import { formatDate } from "../utils/date.js";

export default function BookingFooter({ selectedDate, selectedTime, onContinue }) {
  return (
    <footer className="booking__footer">
      <div className="booking-summary" aria-label="Выбранные дата и время">
        <p className="booking-summary__time" aria-live="polite">{selectedDate ? `${formatDate(selectedDate)} • ${selectedTime || "Выберите время"}` : "Выберите дату и время"}</p>
        <button className="booking-summary__continue" type="button" disabled={!selectedDate || !selectedTime} onClick={onContinue}>Продолжить</button>
      </div>
      <div className="home-indicator" aria-hidden="true"><span className="home-indicator__bar" /></div>
    </footer>
  );
}
