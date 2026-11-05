"""CPU-only tests of the resize benchmark's per-gesture baseline; no browser is started."""
import sys
import unittest

# The benchmark's CLI arguments are parsed on import.
_original_argv = sys.argv
try:
    sys.argv = ['resize_perf.py', 'dummy.html']
    from resize_perf import relative_gap_measure
finally:
    sys.argv = _original_argv


def sample(idle, drag):
    before = [[i * idle] for i in range(60)]
    down = before[-1][0] + 100
    during = [[down + i * drag] for i in range(50)]
    up = during[-1][0] + 1
    after = [[up + 1000 + i * idle] for i in range(60)]
    return relative_gap_measure(before + during + after, down, up)


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
