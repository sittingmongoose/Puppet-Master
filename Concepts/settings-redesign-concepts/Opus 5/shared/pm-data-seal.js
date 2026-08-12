/* Opus 5 — freeze the finished dataset.
 *
 * pm-data.js publishes window.PMData unfrozen so the domain modules that follow
 * it (installations, taxonomy, agents, desktop, dev, system) can contribute
 * their managers, categories and fixtures. This file loads LAST of the data
 * modules and seals the result, so nothing after it — concept code included —
 * can mutate the fixture by accident. Concepts clone what they need through
 * PMStore.cloneData.
 */
(function () {
  "use strict";
  Object.freeze(window.PMData);
})();
