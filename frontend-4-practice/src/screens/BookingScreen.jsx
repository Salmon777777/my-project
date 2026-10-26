import { useCallback, useRef, useState } from "react";
import BookingHeader from "../components/BookingHeader.jsx";
import Calendar from "../components/Calendar.jsx";
import TimeSlots from "../components/TimeSlots.jsx";
import BookingFooter from "../components/BookingFooter.jsx";
import { fetchSlots } from "../api.js";
import { useAsyncResource } from "../hooks/useAsyncResource.js";
import { dateKey, formatDate, isDateSelectable, shiftMonth } from "../utils/date.js";

export default function BookingScreen({ today }) {
  const [currentYear, setCurrentYear] = useState(today.year);
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);
  const [message, setMessage] = useState("");
  const calendarRef = useRef(null);
  const loadSlots = useCallback(signal => fetchSlots(selectedDate, signal), [selectedDate]);
  const slots = useAsyncResource(loadSlots, selectedDate ? dateKey(selectedDate) : "none", Boolean(selectedDate));
  const availableTime = slots.status === "success" && slots.data.some(slot => slot.time === selectedTime && slot.available) ? selectedTime : null;
  function handleDateSelect(date) {
    if (!isDateSelectable(date, today) || (selectedDate && dateKey(date) === dateKey(selectedDate))) return;
    setSelectedDate({ year: date.year, month: date.month, day: date.day });
    setCurrentYear(date.year); setCurrentMonth(date.month); setSelectedTime(null); setMessage("");
  }
  function handleMonthChange(direction) {
    const next = shiftMonth(currentYear, currentMonth, direction);
    setCurrentYear(next.year); setCurrentMonth(next.month); setSelectedDate(null); setSelectedTime(null); setMessage("");
  }
  function handleTimeSelect(time) {
    if (slots.status !== "success" || !slots.data.some(slot => slot.time === time && slot.available)) return;
    setSelectedTime(time); setMessage("");
  }
  function focusCalendar() {
    calendarRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    calendarRef.current?.focus({ preventScroll: true });
  }
  function handleContinue() {
    if (selectedDate && availableTime) setMessage(`Вы выбрали: ${formatDate(selectedDate)}, ${availableTime}. Учебная демонстрация: реальная запись не отправляется.`);
  }
  return <article className="booking" aria-label="Запись в барбершоп BORODA">
    <BookingHeader onBack={focusCalendar} />
    <main className="booking__main">
      <Calendar year={currentYear} month={currentMonth} selectedDate={selectedDate} today={today} onSelectDate={handleDateSelect} onChangeMonth={handleMonthChange} calendarRef={calendarRef} />
      <TimeSlots selectedDate={selectedDate} slots={slots.data || []} selectedTime={availableTime} onSelectTime={handleTimeSelect} onChangeDate={focusCalendar} message={message} requestStatus={slots.status} error={slots.error} onRetry={slots.retry} />
    </main>
    <BookingFooter selectedDate={selectedDate} selectedTime={availableTime} onContinue={handleContinue} />
  </article>;
}
