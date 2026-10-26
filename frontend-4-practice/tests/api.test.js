import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { fetchToday, fetchSlots } from "../src/api.js";
import apiMiddleware from "../server/server.js";

const date = { year: 2026, month: 9, day: 26 };
const slots = [{ time: "14:00", available: true }];

test("today приходит из отдельного эндпоинта", async t => {
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(url, "/api/booking/today");
    return Response.json(date);
  });
  assert.deepEqual(await fetchToday(), date);
});

test("слоты запрашиваются с датой и 0-индексным месяцем", async t => {
  t.mock.method(globalThis, "fetch", async url => {
    assert.equal(url, "/api/slots?day=26&month=9&year=2026");
    return Response.json({ date, slots });
  });
  assert.deepEqual(await fetchSlots(date), slots);
});

test("ошибка HTTP не превращается в данные", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: "Сервис временно недоступен" }, { status: 500 }));
  await assert.rejects(fetchToday(), /Сервис временно недоступен/);
});

test("сетевая ошибка имеет понятный текст", async t => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(fetchToday(), /Не удалось связаться с сервером/);
});

test("проверяется дата today", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ year: 2026, month: 1, day: 31 }));
  await assert.rejects(fetchToday(), /некорректную текущую дату/);
});

test("ответ слотов для другой даты отклоняется", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ date: { ...date, day: 27 }, slots }));
  await assert.rejects(fetchSlots(date), /некорректное расписание/);
});

test("неверный формат времени отклоняется", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ date, slots: [{ time: "25:99", available: true }] }));
  await assert.rejects(fetchSlots(date), /некорректное расписание/);
});

test("пустое расписание — успешный ответ", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ date, slots: [] }));
  assert.deepEqual(await fetchSlots(date), []);
});

test("запрос отменяется внешним AbortController", async t => {
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const controller = new AbortController();
  const pending = fetchToday(controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("реальный middleware отдаёт today и разные слоты двух дней", async t => {
  let middleware;
  apiMiddleware().configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  const server = createServer((req, res) => middleware(req, res, () => { res.statusCode = 404; res.end(); }));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const today = await fetch(`${base}/api/booking/today`);
  assert.equal(today.status, 200);
  assert.deepEqual(await today.json(), date);
  const even = await (await fetch(`${base}/api/slots?day=26&month=9&year=2026`)).json();
  const odd = await (await fetch(`${base}/api/slots?day=27&month=9&year=2026`)).json();
  assert.notDeepEqual(even.slots, odd.slots);
  assert.equal((await fetch(`${base}/api/slots?day=26`)).status, 400);
});
