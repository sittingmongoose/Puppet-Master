## 22. Live Testing Tools and Hot Reload

The **Assistant** can **call up live testing tools**: the user (or the Assistant on the user's behalf) can request e.g. "start hot reload dev mode" or "run tests in watch mode." The app starts the right watcher/dev server for the current project and routes live logs, errors, and reload status into the IDE panes (Terminal, Output, Problems). Full specification: **Plans/newfeatures.md** §15.16 (Hot Reload, Live Reload, and Fast Iteration). The Assistant execution path must be able to invoke the canonical actions `StartDevMode` and `RunTestsWatch` so that results surface in the integrated panes.

---

