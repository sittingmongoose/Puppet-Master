import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('goal_status_export',Path(__file__).with_name('export.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

class DirectStatusTests(unittest.TestCase):
    def test_router_complete_without_native_goal_stays_unknown(self):
        with tempfile.TemporaryDirectory() as d:
            receipt=Path(d)/'receipt.json';receipt.write_text('{"status":"completed","native_responses":10}')
            row=m.project({'job_id':'fixture','status':'COMPLETED'},receipt)
            self.assertEqual(row['native_goal_status'],'UNKNOWN')
    def test_saved_paused_goal_does_not_become_router_complete(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);receipt=root/'receipt.json';receipt.write_text('{"status":"completed","goal_target_id":"g","session_id":"s"}')
            (root/'final-session.redacted.json').write_text(json.dumps({'session':{'target':{'targetId':'g','sessionId':'s','status':'paused','updatedAt':1000,'objective':'Do not export this string'}}}))
            row=m.project({'job_id':'fixture','status':'COMPLETED'},receipt)
            self.assertEqual(row['native_goal_status'],'paused')
            self.assertEqual(row['source_evidence']['status_selector'],'/session/target/status')
            self.assertNotIn('Do not export',json.dumps(row))
    def test_conflicting_direct_goal_statuses_are_unknown(self):
        snapshot={'projection':{'target':{'targetId':'g','status':'active'}},'session':{'target':{'targetId':'g','status':'complete'}}}
        observed,error=m.goal_objects(snapshot,'g')
        self.assertIsNone(observed);self.assertEqual(error,'CONFLICTING_NATIVE_GOAL_OBJECTS')
if __name__=='__main__':unittest.main()
