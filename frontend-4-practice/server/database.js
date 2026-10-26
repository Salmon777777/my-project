// Дата и расписание задаются только на сервере.
export const database = {
  today: { year: 2026, month: 9, day: 26 },
  slotsEvenDay: [{ time: "11:00", available: true }, { time: "14:00", available: true }, { time: "17:30", available: false }],
  slotsOddDay: [{ time: "11:00", available: false }, { time: "14:00", available: true }, { time: "17:30", available: false }],
};
