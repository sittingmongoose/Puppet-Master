# The kit

Checks are JavaScript files run by `browser-check` in a real GPU Chrome. One run takes about 30 seconds.

```sh
browser-check run checks/task.check.mjs        # from this directory; prints PASS or FAIL lines and a run folder
```

```js
// checks/task.check.mjs
export const tests = {
	async 'what this proves'(t) {
		await t.app.open();                                   // ALWAYS start like this
		await t.page.locator('css selector').click();          // t.page is a Playwright Page
		await t.check('name of the fact', condition, 'detail shown when it fails');
	}
};
```

## Rules

- **Open the page only with `await t.app.open()`.** It loads the page under test fresh, waits until it is ready and
  confirms it is the right build. Never hard-code a path to the page and never use `t.goto` for it: your check will be
  run again on other builds of the same page.
- **Real input only.** `locator.click()`, `locator.hover()`, `locator.focus()`, `t.page.keyboard.press('Enter')`,
  `t.page.mouse`. Not `element.click()` inside `evaluate`, and not `dispatchEvent`.
- **Wait for conditions, not for time.** `await t.settle()` waits out finite animations; `t.until(name, pageFn)` and
  `t.page.waitForFunction(fn)` wait for a state. No fixed sleeps as readiness.
- **Do not read `page.html` or `page.json`.** The page is 33 MB; judge it by what it does in the browser.
- Work only in this directory. Start no subagents. One browser run at a time.

## Tools you have

- Playwright's page API: `t.page.locator(css)`, `getByRole(role, {name})`, `getByText`, `getByLabel`, `evaluate`,
  `waitForFunction`, `keyboard`, `mouse`, and a locator's `count()`, `getAttribute()`, `boundingBox()`, `innerText()`.
- `t.ax({role, name})`: a filtered query of the browser's accessibility tree; returns the matching nodes.
- `t.visible(target, name)`, `t.hidden(...)`: real visibility by hit test; a failure names what covers the target.
- `t.text(target, 'str' | /re/)`, `t.count(selector, n)`, `t.css(target, {prop: value})`, `t.equal(name, a, b)`,
  `t.check(name, bool, detail)`, `t.until(name, pageFn)`, `t.focused(target)`, `t.press(key)`.
- `t.shot(name, why)`, `t.crop(name, target, why)`: an image in the run folder, for what only an eye can judge.
- `browser-check guide` prints the tool's full guide.
- To look at the page while you work, write a scratch check under `scratch/` that saves what you want to a file
  (`fs.writeFileSync`) and read that file, or take a `t.shot`. A check's own output prints only PASS and FAIL lines.

## Control ids and the listing

The Activity bar items and the file rows on this page carry a stable id in the attribute `data-ui-element-id`.
A repeated control carries its item's key after `#`: `files.row.copy_path#<the row's path>`.

```sh
browser-check run tools/list.check.mjs                                  # writes listing.txt: every control with an id
browser-check run tools/list.check.mjs --set scope=".activity-bar"      # only inside one region (a CSS selector)
browser-check run tools/list.check.mjs --set scope="#fmTree"            # the file tree
```

`listing.txt` has one line per control: `role [id] "name" state`, a few hundred bytes for one region. State words:
`expanded=true|false`, `selected`, `disabled`, `focused`, `transparent`, `covered-or-out-of-view`.

In a check:

```js
const search = await t.app.byId('activity.search');    // a Playwright Locator; throws if no control or several have the id
await search.click();
const text = await t.app.list('.activity-bar');        // the same listing, as a string
```
