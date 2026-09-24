"""Return-summary coverage only; no native navigation or persistence proof."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class HomeWidgetReturnMetadataTests(unittest.TestCase):
    def setUp(self):
        document = json.loads((ROOT / 'Plans/touch_closure.json').read_text())
        self.profiles = {p['profile_id']: p for p in document['profiles']}

    def test_panel_summary_covers_ordinary_and_tour_consumers(self):
        profile = self.profiles['TCP-PANEL']
        self.assertIn('Home panel undock/redock controls', profile['gui_triggers'])
        route = profile['return_route']
        for phrase in ('Ordinary Home', 'owning panel host', 'dispatch or error',
                       'Guided Tour', 'restorable pre-tour layout/focus'):
            self.assertIn(phrase, route)

    def test_widget_summary_covers_ordinary_and_tour_consumers(self):
        profile = self.profiles['TCP-WIDGET']
        self.assertIn('Usage and Dashboard widget options', profile['gui_triggers'])
        route = profile['return_route']
        for phrase in ('Ordinary Usage or Dashboard', 'owning host', 'dispatch or error',
                       'Guided Tour', 'restorable pre-tour widget layout/focus'):
            self.assertIn(phrase, route)

    def test_motion_and_home_profiles_already_cover_ordinary_return(self):
        self.assertIn('Current Usage or Dashboard card and focus',
                      self.profiles['TCP-WIDGET-MOTION']['return_route'])
        self.assertIn('Home', self.profiles['TCP-HOME-LAYOUT']['return_route'])


if __name__ == '__main__':
    unittest.main()
