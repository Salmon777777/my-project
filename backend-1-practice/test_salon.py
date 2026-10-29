import unittest
from salon import Appoinment, appointments, create_appointment


class AppointmentTests(unittest.TestCase):
    def setUp(self):
        appointments.clear()

    def test_course_example(self):
        first = create_appointment("Иванова А.А.", 1, 1, "10:00")
        second = create_appointment("Петрова А.А.", 1, 1, "11:00")
        self.assertIsInstance(first, Appoinment)
        self.assertEqual([(a.client_name, a.time) for a in appointments],
                         [("Иванова А.А.", "10:00"), ("Петрова А.А.", "11:00")])
        self.assertEqual((first.id, second.id), (1, 2))

    def test_invalid_data_never_saved(self):
        cases = [("", 1, 1, "12:00"), ("  ", 1, 1, "12:00"),
                 (None, 1, 1, "12:00"), ("Клиент", 999, 1, "12:00"),
                 ("Клиент", 1, 999, "12:00"), ("Клиент", True, 1, "12:00")]
        for args in cases:
            with self.subTest(args=args):
                self.assertIsNone(create_appointment(*args))
                self.assertEqual(len(appointments), 0)

    def test_invalid_and_closed_times(self):
        for time in ("00:00", "07:59", "20:01", "24:00", "12:60", "8:00", "", None):
            with self.subTest(time=time):
                self.assertIsNone(create_appointment("Клиент", 1, 1, time))
                self.assertEqual(appointments, [])

    def test_working_boundaries(self):
        self.assertIsNotNone(create_appointment("Клиент", 1, 1, "08:00"))
        self.assertIsNotNone(create_appointment("Клиент", 1, 1, "20:00"))

    def test_master_not_double_booked(self):
        self.assertIsNotNone(create_appointment("Первый", 1, 1, "10:00"))
        self.assertIsNone(create_appointment("Второй", 1, 2, "10:00"))
        self.assertIsNotNone(create_appointment("Третий", 2, 1, "10:00"))


if __name__ == "__main__":
    unittest.main()
