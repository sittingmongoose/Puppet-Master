"""CPU-only tests of the resize benchmark's per-gesture baseline; no browser is started."""
import sys
import unittest

# The benchmark's CLI arguments are parsed on import.
_original_argv = sys.argv
try:
    sys.argv = ['resize_perf.py', 'dummy.html']
    from resize_perf import relative_gap_measure, paired_verdict
finally:
    sys.argv = _original_argv


def sample(idle, drag):
    before = [[i * idle] for i in range(60)]
    down = before[-1][0] + 100
    during = [[down + i * drag] for i in range(50)]
    up = during[-1][0] + 1
    after = [[up + 1000 + i * idle] for i in range(60)]
    return relative_gap_measure(before + during + after, down, up)


class PairedTests(unittest.TestCase):
    def test_loaded_same_drag_is_independent_of_idle_floor(self):
        self.assertTrue(paired_verdict([116.6,116.7],[116.7,116.6])[0])

    def test_real_delay_fails_on_quiet_and_loaded_control(self):
        for control, delayed in [(33,150),(116.7,300)]:
            self.assertFalse(paired_verdict([control]*2,[delayed]*2)[0])

    def test_loaded_control_cannot_hide_absolute_stall(self):
        self.assertFalse(paired_verdict([300]*2,[250]*2)[0])


class RelativeGapTests(unittest.TestCase):
    def test_quiet_and_loaded_floors_do_not_create_a_failure(self):
        for idle in (16, 80):
            with self.subTest(idle=idle):
                floor, budget, drag = sample(idle, idle)
                self.assertEqual((floor, drag), (idle, idle))
                self.assertLessEqual(drag, budget)

    def test_genuine_excess_still_fails(self):
        floor, budget, drag = sample(16, 150)
        self.assertEqual((floor, drag), (16, 150))
        self.assertGreater(drag, budget)

    def test_missing_floor_is_invalid(self):
        with self.assertRaisesRegex(ValueError, 'idle frame gaps'):
            relative_gap_measure([[0], [16], [100], [116]], 50, 150)

    def test_missing_drag_is_invalid(self):
        with self.assertRaisesRegex(ValueError, 'drag frames'):
            relative_gap_measure([[i * 16] for i in range(60)], 1000, 1100)


if __name__ == '__main__':
    unittest.main()
