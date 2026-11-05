"""Workspace-family complete-entry controls for source, retry and projector seams."""
from __future__ import annotations
import copy
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3
import pm_browser_workspace_created as created
import pm_browser_workspace_reset as reset
from pm_ds_home4_isolating import replace_strings


def cases():
    gate, context, bases = d3.bases()
    rows = []
    def add(uid, name, call, kind='refusal'):
        rows.append({'id': 'NEG-' + uid + ':' + name, 'review_id': uid, 'entry': call, 'kind': kind})
    for model, base in bases:
        family = model.EVENT_TYPE
        check = created.creation_preflight_failures if model is created else reset.reset_preflight_failures
        # Request/result observations change together; authenticated source stays.
        fields = [('command_id', 'cmd.browser.workspace.reset' if model is created else 'cmd.browser.workspace.create'),
                  ('browser_session_id', 'session-foreign')]
        for field, value in fields:
            changed = copy.deepcopy(base)
            for side in ('request', 'result'):
                changed[side]['scope'][field] = value
            if model is created and field=='command_id':
                template=bases[1][1]['request']['scope']
                for side in ('request','result'):
                    for extra in ('expected_workspace_revision','controller_authority'):
                        changed[side]['scope'][extra]=copy.deepcopy(template[extra])
                    changed[side]['scope']['browser_workspace_id']=base['event']['payload']['context']['browser_workspace_id']
            uid = ('U054' if field == 'command_id' else 'U055') if model is created else ('U072' if field == 'command_id' else 'U074')
            add(uid, family + ':coherent_scope:' + field, lambda b=changed, f=check: not f(**b))
        if model is created:
            changed = copy.deepcopy(base)
            changed['witness']['node_id'] = 'node-foreign'
            add('U050', 'created:witness_node', lambda b=changed: not created.creation_preflight_failures(**b))
            changed = copy.deepcopy(base)
            changed['request']['scope']['browser_workspace_id'] = 'workspace-foreign'
            add('U052', 'created:request_workspace', lambda b=changed: not created.creation_preflight_failures(**b))
            changed=copy.deepcopy(base)
            changed['result']['scope']['workspace_policy_ref']='policy:foreign'
            add('U051','created:result_policy_observation',lambda b=changed:not created.creation_preflight_failures(**b))
        else:
            for field in model.LINEAGE:
                changed = copy.deepcopy(base)
                value = changed['request']['scope']['lineage'].get(field)
                # Pick a different schema-valid value in the original field domain.
                if type(value) is str:
                    value += '-foreign'
                elif type(value) is int:
                    value += 1
                elif value is None:
                    value = 'identity-foreign'
                else:
                    continue
                for side in ('request', 'result'):
                    changed[side]['scope']['lineage'][field] = value
                add('U073', family + ':lineage:' + field, lambda b=changed: not reset.reset_preflight_failures(**b))
        # Independent projector entry: family readers do not prove these flags.
        for flag in ('source_verified', 'access_allowed', 'deletion_allows_audit', 'withdrawn'):
            for value in ((True, 'false', 1, None, [], {}) if flag == 'withdrawn' else (False, 'false', 1, None, [], {})):
                def projector(e=base['event'], f=flag, v=value):
                    oracle = gate.ReplayOracle()
                    outcome = oracle.consume(copy.deepcopy(e), 'BrowserRuntimeService.workspace', context, **{f: v})
                    return outcome == 'projected_no_effect'
                add('U332', family + ':' + flag + ':' + repr(value), projector)
        # Exact bad subjects are structured input controls, not a forged event.
        for field in model.SUBJECT:
            subject = {k: base['event']['payload']['context'][k] for k in model.SUBJECT}
            del subject[field]
            def subject_fault(m=model, e=base['event'], s=subject):
                flags = dict(source_verified=True, access_allowed=True, deletion_allows_audit=True,
                             checkpoint_read_token_valid=True)
                if m is reset:
                    flags['admitted'] = True
                result = m.workspace_history_fact(copy.deepcopy(e), s, **flags)
                return result != {'outcome': 'read_unavailable', 'fact': None, 'current_runtime_authority': False}
            add('U216' if model is created else 'U264', family + ':missing_subject:' + field, subject_fault, 'structured_fault')

    base = bases[0][1]
    def fresh_identity(value, *, key=True, event_id=True, workspace=True):
        changed = copy.deepcopy(value)
        if workspace:
            original = changed['event']['payload']['context']['browser_workspace_id']
            changed = replace_strings(changed, original, original + '-fresh')
        if key:
            original = changed['event']['idempotency_key']
            changed = replace_strings(changed, original, original + '-fresh')
        if event_id:
            changed['event']['event_id'] += '-fresh'
        return changed
    for uid, key, event_id in [('U203', True, False), ('U204', False, True)]:
        def collision(key=key, event_id=event_id):
            oracle, outcome = d3.append(created, base)
            assert outcome == 'creation_committed_and_published'
            changed = fresh_identity(base, key=key, event_id=event_id)
            changed['event']['payload']['owner_record_ref'] += '-changed'
            changed['witness']['owner_record_ref'] = changed['event']['payload']['owner_record_ref']
            assert not created.creation_preflight_failures(**changed)
            outcome = oracle.create(**changed, append_outcome='committed', admitted=True)
            return outcome in ('creation_committed_and_published', 'original_result_no_effect')
        add(uid, 'created:unmasked_original_comparison', collision)
    def append_enum():
        digest=gate.envelope_oracle().event_producer_semantic_digest
        oracle=created.CreationOracle(digest)
        result=oracle.create(**copy.deepcopy(base),append_outcome='unsupported',admitted=True)
        return result!='invalid_append_outcome' or oracle.append_count!=0 or oracle.published_count!=0
    add('U209','created:unsupported_append_outcome',append_enum,'structured_fault')
    fixtures=ds.load(created.FIXTURE_PATH)
    cp=fixtures['checkpoint_fixture']
    bad=copy.deepcopy(cp);bad['state']='withdrawn';bad['withdrawn_at_utc']='2027-01-01T00:00:00Z'
    add('U057','created:withdrawal_after_observation',lambda:not created.checkpoint_failures(bad))
    lower=copy.deepcopy(cp);lower['updated_at_utc']=lower['updated_at_utc'].replace('T','t')
    add('U058','created:strict_checkpoint_timestamp_spelling',lambda:not created.checkpoint_failures(lower))
    def prior_bad():
        prior=copy.deepcopy(cp);prior['unexpected']=True
        obs=copy.deepcopy(fixtures['observation_fixture']);obs['prior_checkpoint_sha256']=created.digest(prior)
        oracle=created.CheckpointOracle(prior)
        result=oracle.advance(copy.deepcopy(cp),obs)
        return result!='checkpoint_invalid_requires_governed_rebuild' or oracle.commit_count!=0
    add('U211','created:invalid_prior_valid_candidate',prior_bad,'structured_fault')
    def absent():
        oracle=created.CheckpointOracle()
        return oracle.withdraw('2027-01-01T00:00:00Z')!='checkpoint_missing_no_withdrawal' or oracle.checkpoint is not None
    add('U212','created:missing_withdrawal_checkpoint',absent,'structured_fault')
    def malformed_prior():
        prior=copy.deepcopy(cp);prior['updated_at_utc']='not-a-time'
        oracle=created.CheckpointOracle(prior)
        try:result=oracle.withdraw('2027-01-01T00:00:00Z')
        except Exception:return True
        return result!='invalid_withdrawal' or oracle.checkpoint!=prior
    add('U213','created:malformed_withdrawal_checkpoint',malformed_prior,'structured_fault')
    return rows
