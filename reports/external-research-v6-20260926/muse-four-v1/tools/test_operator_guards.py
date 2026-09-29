"""Reuse the existing refusal guards against the four-submission operator.
Every Popen is forbidden; no candidate/probe/Goal dispatch is possible here.
"""
import importlib.util
from pathlib import Path
import sys
import unittest
sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
LAB = HERE.parents[1]
def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
prior = load('four_prior_operator_guards', LAB / 'muse-result-v2/tools/test_operator_guards.py')
operator = load('four_operator_under_test', HERE / 'run_check.py')
prior.operator = operator
OperatorGuards = prior.OperatorGuards
if __name__ == '__main__':
    unittest.main(verbosity=2)
