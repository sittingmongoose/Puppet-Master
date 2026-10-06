import ast,json
checks=[]
def record(i,expected,actual,scope):
    assert actual==expected,(i,expected,actual)
    checks.append({"check_id":i,"expected":expected,"actual":actual,"status":"PASS","scope":scope})
names={n.name for n in ast.walk(ast.parse(data["release_session"])) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))}
testnames={n.name for n in ast.walk(ast.parse(data["release_tests"])) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef))}
record("A-PR311-OPEN",["open",False,"main"],data["nbclient_pr_state"],"Public PR metadata only, no release behavior inference")
record("A-PR311-BASE-TAG",data["nbclient_tag_commit"],data["nbclient_base_commit"],"Dereferenced annotated v0.10.0 tag equals PR base")
record("A-PR311-CHANGED-PATHS",["nbclient/client.py"],data["nbclient_changed_paths"],"Complete changed-files API; no added test in this PR")
record("A-PR1145-OPEN",["open",False,"main"],data["jupyter_pr_state"],"Public PR metadata only")
record("A-PR1145-BASE-TAG",data["jupyter_tag_commit"],data["jupyter_base_commit"],"Dereferenced annotated v8.10.0 tag equals PR base")
record("A-RELEASE-WAKE-HELPER-ABSENT",False,"_wake_async_socket" in names,"AST of exact release source; not a full runtime test")
record("A-RELEASE-REGRESSION-ABSENT",False,"test_send_wakes_pending_poll" in testnames,"AST of exact release test file; path/name scoped absence only")
record("A-PR-REGRESSION-PRESENT",True,any("test_send_wakes_pending_poll" in f.get("patch","") for f in data["jupyter_pr_files"]),"Regression proposal in PR diff; not executed upstream test")
print(json.dumps({"schema":"er9.evaluator-typed-checks.v1","checks":checks,"limitations":["No notebook/kernel/PyZMQ runtime executed","Source applicability checks do not prove issue reproduction"]},sort_keys=True))
