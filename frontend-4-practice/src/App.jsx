import { fetchToday } from "./api.js";
import { useAsyncResource } from "./hooks/useAsyncResource.js";
import BookingHeader from "./components/BookingHeader.jsx";
import StatusPanel from "./components/StatusPanel.jsx";
import BookingScreen from "./screens/BookingScreen.jsx";

export default function App() {
  const today = useAsyncResource(fetchToday, "today");
  if (today.status === "success") return <BookingScreen today={today.data} />;
  return <article className="booking" aria-label="Запись в барбершоп BORODA">
    <BookingHeader onBack={today.retry} />
    <main className="booking__main"><StatusPanel loading={today.status === "loading"} error={today.error} onRetry={today.retry} loadingText="Загрузка календаря…" /></main>
  </article>;
}
