"""Earlier validation of the original documents on the preserved-run reader route."""

from collections import namedtuple

FAMILY = 'goal_run.cancelled'
READER = 'scripts/pm_goal_dg_r_readers.py'
OWNER = 'scripts/pm_goal_dg_r_world.py'
ADAPTER = 'scripts/pm_goal_test_owner_adapters.py'
Retained = namedtuple('Retained', 'family namespace definition issue_line reader_line later')
RETAINED = {
    'intent': Retained('workflow_cancel_intent', 'D06', 'StorageIntent', 1491, 146, 'select/unissued_value'),
    'committed_control': Retained('workflow_cancel_control', 'D06', 'StorageControl', 1533, 146, 'select/unissued_value'),
    'result': Retained('workflow_cancel_result', 'D06', 'StorageResult', 1522, 146, 'select/unissued_value'),
    'prepare_origin': Retained('workflow_cancel_origin', 'D06', 'StorageOrigin', 1506, 146, 'final/native'),
    'publish_origin': Retained('workflow_cancel_origin', 'D06', 'StorageOrigin', 1538, 146, 'select/unissued_value'),
    'original_d01_update': Retained('executor_workflow_workflow_update', 'WO', 'StorageWorkflowUpdate', 757, 149,
                                    'final/native'),
    'original_d01_origin': Retained('executor_workflow_mutation_origin', 'WO', 'StorageWorkflowMutationOrigin', 787, 149,
                                    'final/native'),
}


def sites(spec):
    return [(READER, line) for line in (33, 44, 70, 72, 76, 85, 98, spec.reader_line, 361, 362, 363, 364, 377, 378)] + [
        (OWNER, line) for line in (112, 431, 446, 447, 461, 462, 470, 471, 472, spec.issue_line, 1561, 1701, 1703)
    ] + [(ADAPTER, line) for line in (83, 85, 88, 90, 460, 463, 467, 493, 535)]


PROOFS = {
    'dg5/tuple/preserved/' + field + '/schema': dict(
        kind='entailed-by-exact-retained-owner-document', families=[FAMILY],
        depends_on=['dg5/issue/' + spec.family + '/schema'], sites=sites(spec),
        argument=(
            f'On the original terminal-preservation route the {field} handle comes from the '
            f'{spec.family} owner call, which validates {spec.definition} before retaining it. '
            'The reader acquires the exact issued document, copies it, and checks the same '
            'definition. It then acquires the original again and requires type-exact equality '
            'with the checked tuple. Changing the checked copy cannot survive that comparison. '
            f'The complete-call trial disables only this validation and reaches {spec.later}. '
            'The replay checks the original issuance and restores the exact validation message.'),
    ) for field, spec in RETAINED.items()
}


def check_retained_source(reader, world_module, adapters, require):
    """Confirm the original validated document flows into both reader tuples."""
    import inspect

    from pm_goal_dg_r_readers import Consumer

    require(type(reader) is Consumer, 'original preserved reader method changed')
    read = inspect.getsource(reader.read_preserved)
    passage = (
        'native, goal, effects = self.assemble(self.tuple(presentation))',
        "self.check(request, native, goal, effects, mode='preserved')",
        'again, goal2, effects2 = self.assemble(self.tuple(presentation))',
        "eq('final/native', again, native)",
    )
    require('\n            '.join(passage) in read, 'the preserved reader no longer compares both acquired tuples')
    require('out[k] = self.acquire(pair)' in inspect.getsource(reader.tuple)
            and 'v = lambda pair: copy.deepcopy(pair[1])' in inspect.getsource(reader.assemble),
            'the reader no longer copies each acquired original')
    acquire = inspect.getsource(reader.acquire)
    require('same(stored.wrapper, value)' in acquire and "eq('acquire/storage_commitment', resolved, value)" in acquire,
            'the reader no longer requires the original wrapper and stored value')
    require(reader.acquire.__globals__['same'] is world_module.same
            and world_module.same.__globals__['A'] is adapters
            and 'return A.same(a, b)' in inspect.getsource(world_module.same)
            and 'type(a) is not type(b)' in inspect.getsource(adapters.same)
            and 'a.keys() == b.keys()' in inspect.getsource(adapters.same), 'reader equality changed')
    wrap = inspect.getsource(world_module.PhysOwner.build_wrapper)
    issue = inspect.getsource(world_module.PhysOwner.issue_physical)
    retain = inspect.getsource(world_module.PhysOwner.write_wrapper)
    require("w.roots.validate(realm, root, wrapper, 'issue/' + family)\n        return wrapper" in wrap
            and 'wrapper = self.build_wrapper(' in issue and 'return self.write_wrapper(family, realm, root, key, wrapper,' in issue
            and 'handle = self._issue(root, wrapper, kind=family)' in retain,
            'issuing original no longer validates the retained wrapper first')
