import unittest


def check_counts(d):
    try:
        if not isinstance(d, dict):
            return ["not a dict"]
        req = ("pipelines", "pairs", "reviewed_pairs", "failed_screens", "full_pass")
        vals = {}
        errs = []
        for k in req:
            if k not in d:
                errs.append("missing: " + k)
                continue
            v = d[k]
            if isinstance(v, bool) or not isinstance(v, int):
                errs.append("not int: " + k)
                continue
            if v < 0:
                errs.append("negative: " + k)
                continue
            vals[k] = v
        if "pairs" in vals and "pipelines" in vals:
            if 2 * vals["pairs"] > vals["pipelines"]:
                errs.append("2*pairs<=pipelines violated")
        if "reviewed_pairs" in vals and "pairs" in vals:
            if vals["reviewed_pairs"] > vals["pairs"]:
                errs.append("reviewed_pairs<=pairs violated")
        if "failed_screens" in vals and "full_pass" in vals and "pipelines" in vals:
            if vals["failed_screens"] + vals["full_pass"] > vals["pipelines"]:
                errs.append("failed_screens+full_pass<=pipelines violated")
        return errs
    except Exception:
        return ["invalid input"]


class TestCheckCounts(unittest.TestCase):
    def test_valid(self):
        d = {"pipelines": 10, "pairs": 5, "reviewed_pairs": 5, "failed_screens": 3, "full_pass": 7, "extra": 1}
        self.assertEqual(check_counts(d), [])

    def test_bool(self):
        d = {"pipelines": True, "pairs": 5, "reviewed_pairs": 5, "failed_screens": 3, "full_pass": 7}
        self.assertTrue(check_counts(d))

    def test_missing(self):
        d = {"pipelines": 10, "pairs": 5, "reviewed_pairs": 5, "failed_screens": 3}
        self.assertTrue(check_counts(d))

    def test_negative(self):
        d = {"pipelines": 10, "pairs": -1, "reviewed_pairs": 0, "failed_screens": 0, "full_pass": 0}
        self.assertTrue(check_counts(d))

    def test_inconsistent(self):
        d = {"pipelines": 4, "pairs": 5, "reviewed_pairs": 5, "failed_screens": 3, "full_pass": 3}
        self.assertTrue(check_counts(d))


if __name__ == "__main__":
    unittest.main()
