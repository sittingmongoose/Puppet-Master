# New materialization with the existing finite helper

Restore this review package using `python3 -B restore_source_layout.py --destination /absolute/new/local/review`. Do not run expired historical stage requests. Review the existing helper README and preserve its baseline obligations, plan-release boundary and no-reset T0 rules.

From the restored `helpers/materialize-er13-v1/sealed/full-v1` directory run `python3 -B repin.py` to bind the copied exact source closure to that new install. Original private/public lineage remains in this publication; repinning is confined to the caller-owned fresh install. Then invoke the existing finite materializer:

```sh
python3 -B materialize.py --destination /absolute/new/local/admitted-arm --authorized-provider-instance ACTUAL_AUTHORIZED_PROVIDER --brief /absolute/new/brief.md --plan /absolute/new/plan.md --run-id UNIQUE_ARM_ID --method B02 --t0-utc ROOT_ADMISSION_T0_UTC --whole-deadline-utc T0_PLUS_60_MINUTES_UTC --stage-budgets-s 1800,720,1080 --whole-budget-s 3600
python3 -B materialize.py --verify /absolute/new/local/admitted-arm
```

Choose the used method via the existing routes/README (R0, A1, A8, A1+A8, B02, B06, B09, B10). Supply genuinely new inputs, unique IDs, future deadlines and an actually authorized live route. `ER13_RUNTIME`, `ER13_WORKTREE` and `AUTHORIZED_PROVIDER_INSTANCE` are privacy placeholders. Root alone authorizes and the designated dispatcher crosses the native boundary. A copy or repin does not confer launch authorization. No fresh invocation/native Goal/science run was performed in this publication task.
