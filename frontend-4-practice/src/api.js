const TIMEOUT_MS = 10000;

export function isValidDate(date) {
  if (!date || ![date.year, date.month, date.day].every(Number.isInteger)) return false;
  const actual = new Date(date.year, date.month, date.day);
  return date.year >= 1000 && date.year <= 9999 && actual.getFullYear() === date.year && actual.getMonth() === date.month && actual.getDate() === date.day;
}

async function request(url, signal) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(cancel, TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      let message = `Ошибка сервера (${response.status}). Попробуйте ещё раз.`;
      try { const body = await response.json(); if (body?.error) message = body.error; } catch { /* Сохраняем HTTP-ошибку. */ }
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error("Сервер не ответил за 10 секунд. Повторите попытку.", { cause: error });
    if (error instanceof TypeError) throw new Error("Не удалось связаться с сервером. Проверьте соединение и повторите попытку.", { cause: error });
    if (error instanceof SyntaxError) throw new Error("Сервер вернул некорректные данные. Повторите попытку.", { cause: error });
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

export async function fetchToday(signal) {
  const data = await request("/api/booking/today", signal);
  if (!isValidDate(data)) throw new Error("Сервер вернул некорректную текущую дату.");
  return data;
}

export async function fetchSlots(date, signal) {
  if (!isValidDate(date)) throw new Error("Выберите корректную дату.");
  const params = new URLSearchParams({ day: date.day, month: date.month, year: date.year });
  const data = await request(`/api/slots?${params}`, signal);
  const sameDate = data?.date && ["year", "month", "day"].every(key => data.date[key] === date[key]);
  const validSlots = Array.isArray(data?.slots) && data.slots.every(slot => typeof slot.time === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(slot.time) && typeof slot.available === "boolean");
  if (!sameDate || !validSlots || new Set(data.slots.map(slot => slot.time)).size !== data.slots.length) throw new Error("Сервер вернул некорректное расписание. Повторите попытку.");
  return data.slots;
}
