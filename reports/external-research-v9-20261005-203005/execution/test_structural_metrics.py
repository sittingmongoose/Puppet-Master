import json
from pathlib import Path
import tempfile
import unittest
import structural_metrics as m

class StructuralCounterTests(unittest.TestCase):
    def test_terminal_error_and_provider_cache_counting(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);native=root/'native';native.mkdir();ops=root/'operation_receipts';ops.mkdir()
            (native/'receipt.json').write_text(json.dumps({'job_id':'generic','birth_epoch':0,'status':'cap_seconds','cleanup':{'native_quiescent':True}}))
            events=[{'at':'1970-01-01T00:00:01+00:00','direction':'in','message':{'method':'v4/telemetry/event','params':{'kind':'model.request.status','requestId':'r','status':status}}} for status in ['model_request_started','model_request_failed']]
            (native/'protocol.redacted.jsonl').write_text('\n'.join(json.dumps(r) for r in events)+'\n')
            attempts=[{'status':'completed','input_tokens':100,'output_tokens':20,'cache_read_input_tokens':80,'provider_total_tokens':120,'computed_total_tokens':120},
                      {'status':'cancelled','input_tokens':0,'output_tokens':0,'provider_total_tokens':None,'computed_total_tokens':0}]
            (native/'provider-usage.redacted.jsonl').write_text('\n'.join(json.dumps(r) for r in attempts)+'\n')
            records=[{'operation_id':'one','stage':stage,'tool':'read_file','argument_sha256':'fingerprint','is_error':True} for stage in ['operation-started','prepared-result','stdout-flushed']]
            (ops/'events.jsonl').write_text('\n'.join(json.dumps(r) for r in records)+'\n')
            value=m.summarize(root)
            self.assertEqual(value['request_status_counts_post_cleanup'],{'model_request_failed':1})
            self.assertEqual(value['source_tool_operations'],1)
            self.assertEqual(value['source_tool_error_operations'],1)
            self.assertEqual(value['provider_attempt_field_sums']['provider_total_tokens'],120)
            self.assertEqual(value['provider_attempt_field_sums']['cache_read_input_tokens'],80)
            self.assertTrue(value['cancelled_usage_unknown'])
            self.assertIsNone(value['invalid_argument_error_count'])
if __name__=='__main__':unittest.main()
