import { useRef, useState } from "react";
import BookingHeader from "./components/BookingHeader.jsx";
import Calendar from "./components/Calendar.jsx";
import TimeSlots from "./components/TimeSlots.jsx";
import BookingFooter from "./components/BookingFooter.jsx";
import { DEFAULT_DATE, getSlots, TODAY } from "./data/booking.js";
import { formatDate, isDateSelectable, shiftMonth } from "./utils/date.js";

export default function App() {
  const [currentYear, setCurrentYear] = useState(DEFAULT_DATE.year);
  const [currentMonth, setCurrentMonth] = useState(DEFAULT_DATE.month);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState(() => getSlots(DEFAULT_DATE));
  const [message, setMessage] = useState("");
  const calendarRef = useRef(null);

  function handleDateSelect(date) {
    if (!isDateSelectable(date, TODAY)) return;
    setSelectedDate({ year: date.year, month: date.month, day: date.day });
    setCurrentYear(date.year);
    setCurrentMonth(date.month);
    setSelectedTime(null);
    setSlots(getSlots(date));
    setMessage("");
  }

  function handleMonthChange(direction) {
    const next = shiftMonth(currentYear, currentMonth, direction);
    setCurrentYear(next.year);
    setCurrentMonth(next.month);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setMessage("");
  }

  function handleTimeSelect(time) {
    if (!slots.some(slot => slot.time === time && slot.available)) return;
    setSelectedTime(time);
    setMessage("");
  }

  function focusCalendar() {
    calendarRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    calendarRef.current?.focus({ preventScroll: true });
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;
    setMessage(`Вы выбрали: ${formatDate(selectedDate)}, ${selectedTime}. Учебная демонстрация: реальная запись не отправляется.`);
  }

  return (
    <article className="booking" aria-label="Запись в барбершоп BORODA">
      <BookingHeader onBack={focusCalendar} />
      <main className="booking__main">
        <Calendar year={currentYear} month={currentMonth} selectedDate={selectedDate} today={TODAY} onSelectDate={handleDateSelect} onChangeMonth={handleMonthChange} calendarRef={calendarRef} />
        <TimeSlots selectedDate={selectedDate} slots={slots} selectedTime={selectedTime} onSelectTime={handleTimeSelect} onChangeDate={focusCalendar} message={message} />
      </main>
      <BookingFooter selectedDate={selectedDate} selectedTime={selectedTime} onContinue={handleContinue} />
    </article>
  );
}
