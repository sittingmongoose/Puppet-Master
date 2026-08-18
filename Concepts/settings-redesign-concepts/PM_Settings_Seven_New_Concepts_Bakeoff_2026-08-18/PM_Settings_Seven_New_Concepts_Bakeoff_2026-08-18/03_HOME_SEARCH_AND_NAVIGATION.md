# Settings Home, Universal Search, and Navigation

## Settings Home

Home must be simple and immediately legible. In the first viewport at every required width, show:

1. the current Project identity;
2. the large universal search field;
3. at most one critical full-width notice, only when truly critical;
4. a compact `Needs attention` list with normally two to four unresolved items;
5. the major Settings destinations as the dominant content.

Do not place a wall of calls to action before the directory. Do not use horizontally scrolling recommendation shelves. Do not make every block look equally actionable. Recent work, history, All Settings, and Copy Settings are secondary utilities.

Use the repository's current 12 inventory categories or a clearly documented 10–12 domain reorganization with complete mapping. No setting may disappear because the Home shows fewer domains.

## Universal search contract

The universal search is prominent on Home and remains reachable throughout Settings.

Typing opens a dropdown anchored directly beneath the field. It must search without hydrating every manager and may return:

```text
setting
manager
specific managed object/resource
action
setup/repair workflow
diagnostic/read-only status
unavailable capability
help/documentation result where intentionally supported
```

Each result carries an immutable ID and canonical destination object. Never route by visual array index, grouped-list position, or label text.

A result visibly shows:

- human label;
- result type;
- complete Settings path;
- relevant object/provider when needed;
- availability or reason when useful.

Selecting a result must:

1. load the correct domain/page;
2. open the correct manager when applicable;
3. select the exact provider/account/model/installation/resource;
4. select the correct subpage/section;
5. scroll the exact row into view;
6. place focus on the destination;
7. apply a brief, calm, non-flashing locator highlight;
8. preserve a deterministic Back route to the query and selected result.

Test grouped results, duplicate labels, typo/fuzzy matches, unavailable results, manager objects, and deep rows. The existing Qwen-style index-position bug must not recur.

## Location and exit contract

Every Settings destination, including managers, retains one coherent shell with:

```text
Back to <named Settings location>
Settings / Domain / Page / Object breadcrumb
Universal search
Current Project identity
Close Settings
```

`Back` returns one Settings level. `Close Settings` returns to the surface that opened Settings. A contextual deep link may also expose `Return to Usage`, `Return to Doctor`, or the actual origin.

Escape order:

1. close popup/menu;
2. close detail or advanced drawer;
3. move one Settings level outward;
4. stop at Settings Home rather than unexpectedly closing Settings.

Remove global previous/next-manager navigation. Managers are not slides.

## Narrow navigation

At squeezed widths, use push navigation or a clearly controlled drawer. Never overlay the Activity Bar or side-panel rail over Settings content. Preserve selected item, scroll position, search query, and Back destination when panes collapse.
