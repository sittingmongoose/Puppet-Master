
## What to deliver

1. `checks/task.check.mjs`: a check that enforces the required behaviour. It must pass on a page where the behaviour
   holds and fail on a page where it does not, for every item the behaviour names. The page you have may or may not
   meet the requirement; find out. Never weaken the check to make it pass.
2. Run it. Then end with exactly these three lines as your final message:

```
VERDICT: MEETS            (or)  VERDICT: DOES_NOT_MEET
WHY: <one line: what you observed>
CHECK: checks/task.check.mjs
```

You have 25 minutes. Stop when the check is written, has been run, and you are confident in the verdict.
