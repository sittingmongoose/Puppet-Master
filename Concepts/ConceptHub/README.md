# Puppet Master Concept Hub

Double-click `Concepts/StartConceptHub.command`. The launcher opens the Hub in your browser and prints addresses for other devices on the same local network.

The Hub uses only Python's standard library. It serves existing concepts without modifying them, discovers future `concept-hub.json` files, and stores label corrections in `catalog-overrides.json`.

Preview iframes load the complete standalone concept page. A concept may use the `hub=1` query flag to detect the review environment, but it must not hide its surrounding shell or top and bottom bars.

Hub assets are revisioned and served with strict no-cache headers. If an older Hub is still using port `4177`, double-clicking the launcher starts the current version on a free port without stopping the older process. Preview cards load near the viewport and retry interrupted local connections automatically; an exhausted card also provides **Retry preview**.

## Add a model folder

1. Copy `starter/model-folder/` into the correct topic folder.
2. Rename the folder so it includes the model name.
3. Replace `YOUR MODEL` and the example metadata.
4. Add every concept to `concept-hub.json`, and keep it synchronized after every add, rename, or removal. When continuing a legacy folder, include its existing pages as well as the new work. A model folder updates only its own manifest; the Hub discovers it automatically.
5. Add the folder's index/dashboard as `workspace` when it has shared controls.
6. Set `widthControl.role` to `page`, `panel`, `chat`, or `none`. This keeps the comparison canvas fixed while changing the surface being tested.
7. Delete temporary test/verification output, including reports, screenshots, recordings, traces, browser profiles, and coverage. Keep only concept assets and requested deliverables.
8. Run `python3 Concepts/ConceptHub/validate.py Concepts/<topic>/<model-folder>`.

The model folder owns its concepts. It must not edit the Hub or another model's work.

## Direct launch

```sh
python3 Concepts/ConceptHub/server.py
```

The preferred port is `4177`. If another service owns it, the Hub chooses a free port without stopping anything.
