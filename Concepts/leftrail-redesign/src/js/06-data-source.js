/* SOURCE_DATA: the Source Control panel (#panel-source) carried over from Concepts/PMConcept7.html: the Git views
   (views), the Jujutsu presentation (jjViews, from the .pm7-scm-jj-view cards) and the always-visible
   "Publish and review" card (now a section at the end of Changes). Every data-demo-action / data-demo-arg pair is kept
   as written; where canon replaced a whole-file action, the original pair rides in attrs['data-legacy-cmd'] /
   attrs['data-legacy-arg']. Canon additions carry canon: '<PlanUnit id>'. Data only; see DATA.md for the schema.
   Fields beyond DATA.md: hunks / preview (item), status and attrs (section), local (an action the panel handles
   itself), canonNote (view). Buttons that had only data-command-id / data-ui-action-id keep that and have no cmd. */

const SOURCE_DATA = {
  id: 'source',
  target: 'panel-source',
  title: 'Source Control',
  icon: 'source',
  hover: { label: 'Repository and online service', detail: 'tastebook uses local Git with GitHub as its current online service.' },
  context: {
    lines: [
      { text: 'tastebook · Git / GitHub', hover: { label: 'Repository and online service', detail: 'tastebook uses local Git with GitHub as its current online service.' } },
      { text: 'Home computer · this computer · Projects/tastebook' },
    ],
    facts: [
      ['Project', 'tastebook'],
      ['Home Server', 'Home computer', { canon: 'F3-529' }],
      ['Execution Environment', 'this computer', { canon: 'F3-529' }],
      ['Source Location', 'Projects/tastebook', { mono: true, canon: 'F3-529' }],
      ['Local history engine', 'Git'],
      ['Online service', 'GitHub'],
      ['Fetch from', 'origin · GitHub', { canon: 'F3-529' }],
      ['Push to', 'origin/main · GitHub', { canon: 'F3-529' }],
      ['Observed revision', 'abc12ef · checked now', { mono: true, group: 'Technical details', canon: 'F3-529' }],
    ],
    state: { state: 'ok', word: 'current' },
  },
  engines: {
    current: 'git',
    options: [
      {
        id: 'git', label: 'Git',
        hover: { label: 'Preview the Git view', detail: "Shows how this project looks with Git. This preview does not switch the project's history tool." },
        action: {
          label: 'Git', uiActionId: 'ui.source_control.profile.preview', availability: 'concept_local_controller_available',
          attrs: { 'data-pm7-scm-engine': 'git', 'data-pm-hover-label': 'Preview the Git view', 'data-pm-hover-detail': "Shows how this project looks with Git. This preview does not switch the project's history tool." },
        },
      },
      {
        id: 'jj', label: 'Jujutsu',
        hover: { label: 'Preview the Jujutsu view', detail: "Shows Jujutsu's current change and operation history. This preview does not switch the project's history tool." },
        action: {
          label: 'Jujutsu', uiActionId: 'ui.source_control.profile.preview', availability: 'concept_local_controller_available',
          attrs: { 'data-pm7-scm-engine': 'jj', 'data-pm-hover-label': 'Preview the Jujutsu view', 'data-pm-hover-detail': "Shows Jujutsu's current change and operation history. This preview does not switch the project's history tool." },
        },
      },
    ],
  },
  actions: [
    { label: 'Refresh status', icon: 'refresh', cmd: 'cmd.source_control.status.refresh', arg: 'cmd.source_control.status.refresh -> tastebook (observed revision, freshness)', canon: 'SCS-014' },
    { label: 'Fetch', icon: 'fetch', cmd: 'cmd.source_control.remote.fetch', arg: 'cmd.source_control.remote.fetch -> origin (GitHub); no change to the working tree', canon: 'SCS-014' },
    { label: 'Sync', icon: 'refresh', cmd: 'cmd.source_control.remote.sync', arg: 'cmd.source_control.remote.sync -> origin/main (fetch, then publish 2 outgoing commits after preview)', canon: 'SCS-014' },
  ],
  status: { state: 'warn', word: '7 changes · 2 to push' },

  menus: {
    /* #shBranchMenu */
    branch: {
      id: 'branch', label: 'Switch branch', value: 'main',
      groups: [{
        items: [
          { value: 'main', label: 'main', meta: 'current', icon: 'branch', selected: true, cmd: 'demo.toast', arg: 'cmd.source_control.branch.switch -> already on main', attrs: { 'data-value': 'main', 'data-label': 'main' } },
          { value: 'lane-b', label: 'orch/lane-b-api', meta: 'run #47', icon: 'branch', cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> orch/lane-b-api (read-only) — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch', attrs: { 'data-value': 'lane-b', 'data-label': 'orch/lane-b-api' } },
          { value: 'lane-d', label: 'orch/lane-d-infra', meta: 'run #47', icon: 'branch', cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> orch/lane-d-infra (read-only) — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch', attrs: { 'data-value': 'lane-d', 'data-label': 'orch/lane-d-infra' } },
          { value: 'import', label: 'thread/import-fixes', meta: 'thread', icon: 'branch', cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> thread/import-fixes — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch', attrs: { 'data-value': 'import', 'data-label': 'thread/import-fixes' } },
          { value: 'spike', label: 'spike/r2-storage', meta: 'manual', icon: 'branch', cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> spike/r2-storage — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch', attrs: { 'data-value': 'spike', 'data-label': 'spike/r2-storage' } },
        ],
      }],
    },
  },

  /* ================================================================================================ Git views */
  views: [
    /* ------------------------------------------------------------------ Changes */
    {
      id: 'changes', label: 'Changes', icon: 'diff',
      summary: '2 staged · 3 unstaged · 1 untracked · 1 conflict',
      count: 7,
      attention: { state: 'conflict', text: '1 conflict needs you' },
      toolbar: [
        { label: 'main', icon: 'branch', menu: 'branch', attrs: { 'data-pm-hover-label': 'Switch branch', 'data-pm-hover-detail': 'Current branch: main' } },
      ],
      sections: [
        {
          id: 'conflicts', label: 'Conflicts', count: 1, open: true, kind: 'list', canon: 'ACD-361',
          items: [
            {
              id: 'conflict:keymap.ts', kind: 'conflict', name: 'keymap.ts', mono: true, icon: 'ts', path: 'web/src/lib/components/recipe/editor/keymap.ts',
              letter: 'C', status: { state: 'conflict', word: 'conflicted' },
              meta: ['web/src/lib/components/recipe/editor', 'both modified while applying stash@{0}'],
              facts: [
                ['Compare', 'base, ours and theirs (three-way)'],
                ['Resolution', 'never automatic; you choose each side'],
              ],
              actions: [
                { label: 'Open Conflict Assistant', icon: 'merge', primary: true, cmd: 'cmd.source_control.open_conflict', arg: 'cmd.source_control.open_conflict -> web/src/lib/components/recipe/editor/keymap.ts (three-way: base, ours, theirs)', canon: 'ACD-361' },
              ],
              canon: 'ACD-361',
            },
          ],
        },
        {
          id: 'staged', label: 'Staged', count: 2, open: true, kind: 'list',
          actions: [
            { label: 'Unstage all', icon: 'minus', cmd: 'cmd.git.unstage', arg: 'cmd.git.unstage -> paths[] all staged (2 whole files)', canon: 'SCS-024', attrs: { 'aria-label': 'Unstage all staged files', 'data-legacy-cmd': 'cmd.git.unstage_hunks', 'data-legacy-arg': 'cmd.git.unstage_hunks -> all staged (2 files)' } },
          ],
          items: [
            {
              id: 'staged:recipes.rs', kind: 'change', name: 'recipes.rs', mono: true, icon: 'rust', path: 'src/routes/recipes.rs',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['src/routes', 'HEAD vs index'], diff: { add: 18, del: 3 },
              hunks: [
                { header: '@@ -41,6 +41,9 @@ fn scaled_quantity(&self) -> Quantity {', actions: [{ label: 'Unstage hunk', icon: 'minus', cmd: 'cmd.git.unstage_hunks', arg: 'cmd.git.unstage_hunks -> recipes.rs' }] },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> recipes.rs (HEAD vs index)' },
                { label: 'Unstage', icon: 'minus', cmd: 'cmd.git.unstage', arg: 'cmd.git.unstage -> paths[] src/routes/recipes.rs (whole file)', canon: 'SCS-024' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> recipes.rs (confirm — tracked: 1 file)' },
              ],
            },
            {
              id: 'staged:QuantityStepper.svelte', kind: 'change', name: 'QuantityStepper.svelte', mono: true, icon: 'svelte', path: 'web/src/lib/components/recipe/editor/QuantityStepper.svelte',
              letter: 'A', status: { state: 'added', word: 'added' },
              meta: ['web/src/lib/components/recipe/editor', 'new file'], diff: { add: 412, del: 0 },
              hunks: [
                { header: '@@ -0,0 +1,412 @@ <script lang="ts">', actions: [{ label: 'Unstage hunk', icon: 'minus', cmd: 'cmd.git.unstage_hunks', arg: 'cmd.git.unstage_hunks -> QuantityStepper.svelte' }] },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> QuantityStepper.svelte (new file)' },
                { label: 'Unstage', icon: 'minus', cmd: 'cmd.git.unstage', arg: 'cmd.git.unstage -> paths[] web/src/lib/components/recipe/editor/QuantityStepper.svelte (whole file)', canon: 'SCS-024' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> QuantityStepper.svelte (confirm — tracked: 1 file)' },
              ],
            },
          ],
        },
        {
          id: 'unstaged', label: 'Unstaged', count: 3, open: true, kind: 'list',
          actions: [
            { label: 'Stage all', icon: 'plus', cmd: 'cmd.git.stage', arg: 'cmd.git.stage -> paths[] all unstaged (3 whole files)', canon: 'SCS-024', attrs: { 'aria-label': 'Stage all unstaged files', 'data-legacy-cmd': 'cmd.git.stage_hunks', 'data-legacy-arg': 'cmd.git.stage_hunks -> all unstaged (4 files)' } },
          ],
          items: [
            {
              id: 'unstaged:+page.server.ts', kind: 'change', name: '+page.server.ts', mono: true, icon: 'ts', path: 'web/src/routes/(app)/recipes/[id]/edit/+page.server.ts',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['web/src/routes/(app)/recipes/[id]/edit', 'index vs working tree'], diff: { add: 44, del: 12 },
              hunks: [
                { header: '@@ -12,7 +12,11 @@ export const actions = {', actions: [{ label: 'Stage hunk', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> +page.server.ts' }] },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +page.server.ts (index vs working)' },
                { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage', arg: 'cmd.git.stage -> paths[] web/src/routes/(app)/recipes/[id]/edit/+page.server.ts (whole file)', canon: 'SCS-024' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> +page.server.ts (confirm — tracked: 1 file)' },
              ],
            },
            {
              id: 'unstaged:ci-build-test-and-publish.yml', kind: 'change', name: 'ci-build-test-and-publish.yml', mono: true, icon: 'yml', path: '.github/workflows/ci-build-test-and-publish.yml',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['.github/workflows', 'index vs working tree'], diff: { add: 9, del: 2 },
              hunks: [
                { header: '@@ -61,4 +61,11 @@ jobs.test.steps:', actions: [{ label: 'Stage hunk', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> ci-build-test-and-publish.yml' }] },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> ci-build-test-and-publish.yml (index vs working)' },
                { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage', arg: 'cmd.git.stage -> paths[] .github/workflows/ci-build-test-and-publish.yml (whole file)', canon: 'SCS-024' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> ci-build-test-and-publish.yml (confirm — tracked: 1 file)' },
              ],
            },
            {
              id: 'unstaged:projection_freshness.rs', kind: 'change', name: 'projection_freshness.rs', mono: true, icon: 'rust', path: 'crates/puppet-core/src/artifacts/projection_freshness.rs',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['crates/puppet-core/src/artifacts', 'index vs working tree'], diff: { add: 27, del: 4 },
              hunks: [
                { header: '@@ -104,9 +104,28 @@ impl ProjectionFreshness {', actions: [{ label: 'Stage hunk', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> projection_freshness.rs' }] },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> projection_freshness.rs (index vs working)' },
                { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage', arg: 'cmd.git.stage -> paths[] crates/puppet-core/src/artifacts/projection_freshness.rs (whole file)', canon: 'SCS-024' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> projection_freshness.rs (confirm — tracked: 1 file)' },
              ],
            },
          ],
        },
        {
          id: 'untracked', label: 'Untracked', count: 1, open: true, kind: 'list', canon: 'SCS-024',
          items: [
            {
              id: 'untracked:schema-org-recipe', kind: 'change', name: 'schema-org-recipe-structured-data-coverage-2026.md', mono: true, icon: 'md', path: 'docs/schema-org-recipe-structured-data-coverage-2026.md',
              letter: '?', status: { state: 'untracked', word: 'untracked' },
              meta: ['docs', 'new research notes'], diff: { add: 96, del: 0 },
              preview: '# Schema.org Recipe structured-data coverage — 2026',
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> schema-org-recipe docs (untracked, +96 new)' },
                { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage', arg: 'cmd.git.stage -> paths[] docs/schema-org-recipe-structured-data-coverage-2026.md (include_untracked)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'cmd.git.stage_hunks', 'data-legacy-arg': 'cmd.git.stage_hunks -> schema-org-recipe docs' } },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> schema-org-recipe docs (confirm — moves to Trash)' },
              ],
            },
          ],
        },
        {
          id: 'commit', label: 'Commit', kind: 'form', open: true,
          form: [
            {
              id: 'commitMessage', label: 'Commit message', kind: 'text', placeholder: 'Commit message...',
              action: { label: 'Generate with AI', icon: 'spark', cmd: 'cmd.source_control.generate_commit_message', arg: 'cmd.source_control.generate_commit_message -> pm: [ITERATION] ...' },
            },
          ],
          actions: [
            { label: 'Commit', icon: 'check', primary: true, cmd: 'cmd.git.commit', arg: 'cmd.git.commit -> committed 2 files' },
            { label: 'Stash changes', icon: 'stash', cmd: 'cmd.source_control.stash.create', arg: 'cmd.source_control.stash.create -> stash 2 staged + 4 unstaged (include untracked)' },
          ],
          items: [],
        },
        {
          id: 'remote', label: 'Pull, push and fetch', count: '0 incoming · 2 outgoing', open: true, kind: 'list',
          actions: [
            { label: 'Pull', icon: 'pull', cmd: 'cmd.git.pull', arg: 'cmd.git.pull -> already up to date' },
            { label: 'Push', icon: 'push', cmd: 'cmd.git.push', arg: 'cmd.git.push -> 2 commits pushed' },
            { label: 'Fetch', icon: 'fetch', cmd: 'cmd.git.fetch', arg: 'cmd.git.fetch -> origin refreshed' },
          ],
          items: [],
          note: '0 incoming · 2 outgoing · Git mutations do not join editor undo',
        },
        {
          id: 'projection', label: 'Remote projection', count: 'healthy · 0 incoming, 2 outgoing · 12 seconds ago', open: false, kind: 'facts',
          items: [
            { id: 'projection:sync', kind: 'fact', name: 'Sync', meta: ['0 incoming · 2 outgoing'] },
            { id: 'projection:freshness', kind: 'fact', name: 'Freshness', meta: ['current'], status: { state: 'ok', word: 'current' } },
            { id: 'projection:health', kind: 'fact', name: 'Health', meta: ['healthy'], status: { state: 'ok', word: 'healthy' } },
            { id: 'projection:snapshot', kind: 'fact', name: 'Snapshot', meta: ['webhook · 12 seconds ago'] },
          ],
        },
        {
          /* the always-visible .pm7-scm-git-footer card, now the last section of Changes */
          id: 'publish', label: 'Publish and review', open: true, kind: 'facts',
          status: { state: 'pending', word: 'outcome pending' },
          attrs: { 'data-scm-section': 'publication-review' },
          note: 'The destination and every remote effect stay visible before anything is sent.',
          items: [
            { id: 'publish:fetch', kind: 'fact', name: 'Fetch from', meta: ['origin · GitHub'] },
            {
              id: 'publish:push', kind: 'remote', name: 'Push to', meta: ['origin/main · GitHub', 'one target'],
              status: { state: 'pending', word: 'not sent yet' },
              note: 'One push target, listed once. Nothing is pushed a second time to a mirror.',
              children: [
                { id: 'publish:push:origin', kind: 'remote', name: 'origin/main', mono: true, meta: ['GitHub · refs/heads/main'], status: { state: 'pending', word: 'not sent yet' }, canon: 'SCS-015' },
              ],
              canon: 'SCS-015',
            },
            { id: 'publish:head', kind: 'fact', name: 'Expected head', mono: true, meta: ['abc12ef · checked now'] },
            { id: 'publish:protection', kind: 'fact', name: 'Protection', meta: ['Review required · direct push blocked'], status: { state: 'blocked', word: 'protected' } },
            { id: 'publish:review', kind: 'fact', name: 'Review', meta: ['Pull request #128 · 2 comments · checks running'] },
          ],
          actions: [
            { label: 'Preview publish', icon: 'upload', commandId: 'cmd.source_control.remote.publish', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', attrs: { 'data-pm-hover-label': 'Preview publication', 'data-pm-hover-detail': 'Shows every push destination, permission check, and possible partial outcome before publishing.' } },
            { label: 'Open pull request', icon: 'pr', commandId: 'cmd.forge.review.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', attrs: { 'data-pm-hover-label': 'Open pull request', 'data-pm-hover-detail': "Opens the common review view with GitHub's pull-request wording and current checks." } },
            { label: 'Backup history', icon: 'clock', uiActionId: 'ui.source_control.backup_history.open', availability: 'concept_local_controller_available', attrs: { 'data-pm7-open-backup': 'project', 'data-pm-hover-label': 'Browse project backups', 'data-pm-hover-detail': 'Opens read-only backup history for this project; it does not change the current files.' } },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Worktrees */
    {
      id: 'worktrees', label: 'Worktrees', icon: 'folderOpen',
      summary: '7 worktrees · 1 blocked · 1 orphaned',
      count: 7,
      toolbar: [
        { label: 'New worktree', icon: 'plus', cmd: 'demo.toast', arg: 'cmd.git.worktree.create -> new worktree wizard' },
      ],
      filters: {
        id: 'worktreeFilter', label: 'Show worktrees', value: 'all',
        groups: [
          {
            label: 'Owner',
            items: [
              { value: 'all', label: 'All worktrees', selected: true, attrs: { 'data-wtf': 'all' } },
              { value: 'thread', label: 'Threads', attrs: { 'data-wtf': 'thread' } },
              { value: 'orch', label: 'Orchestrator', attrs: { 'data-wtf': 'orch' } },
              { value: 'agents', label: 'Agents', attrs: { 'data-wtf': 'agents' } },
              { value: 'manual', label: 'Manual', attrs: { 'data-wtf': 'manual' } },
            ],
          },
          {
            label: 'Lifecycle',
            items: [
              { value: 'lifecycle:reserved', label: 'Reserved', canon: 'W-075' },
              { value: 'lifecycle:active', label: 'Active', canon: 'W-075' },
              { value: 'lifecycle:blocked_preserved', label: 'Blocked, preserved', canon: 'W-075' },
              { value: 'lifecycle:released', label: 'Released', canon: 'W-075' },
              { value: 'lifecycle:orphaned', label: 'Orphaned', canon: 'W-075' },
            ],
          },
          {
            label: 'Flags',
            items: [
              { value: 'flag:locked', label: 'Locked', canon: 'W-075' },
              { value: 'flag:prunable', label: 'Prunable', canon: 'W-075' },
              { value: 'flag:dirty', label: 'Dirty', canon: 'W-075' },
              { value: 'flag:repairable', label: 'Repairable', canon: 'W-075' },
            ],
          },
        ],
      },
      sections: [
        {
          id: 'live', label: 'Worktrees', count: '6 active · 1 orphaned', open: true, kind: 'list',
          items: [
            {
              id: 'wt:main', kind: 'worktree', name: 'main', mono: true, path: '/home/jared/Projects/tastebook',
              status: { state: 'ok', word: 'active' }, owner: 'Workspace', time: '4 minutes ago',
              meta: ['main worktree', '2 staged, 3 unstaged, 1 untracked'],
              attrs: { 'data-lifecycle': 'active' },
              facts: [
                ['Branch', 'main', { mono: true }],
                ['Ahead / behind', 'ahead 2 · behind 0 vs origin/main'],
                ['Last commit', 'abc12ef · 4 minutes ago', { mono: true }],
                ['Dirty', '2 staged, 3 unstaged, 1 untracked, 1 conflict'],
                ['Disk size', 'calculating…'],
                ['Absolute path', '/home/jared/Projects/tastebook', { mono: true }],
              ],
              actions: [
                { label: 'Open files', icon: 'files', cmd: 'cmd.git.worktree.open_files', arg: 'cmd.git.worktree.open_files -> main (File Manager)', canon: 'W-079' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'cmd.git.worktree.remove', disabled: 'The main worktree can never be removed', canon: 'W-078' },
              ],
              canon: 'W-078',
            },
            {
              id: 'wt:lane-b-api', kind: 'worktree', name: 'orch/lane-b-api', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/lane-b-api',
              status: { state: 'ok', word: 'active' }, owner: 'Orchestrator: lane-b API', time: '2 hours ago',
              meta: ['clean', 'locked by run #47'], diff: { add: 310, del: 42 },
              attrs: { 'data-owner': 'orch', 'data-lifecycle': 'active' },
              facts: [
                ['Path', '.worktrees/lane-b-api', { mono: true }],
                ['Base', 'main · 2 hours ago'],
                ['Ahead / behind', 'ahead 4 · behind 0 vs main', { canon: 'W-079' }],
                ['Last commit', '8f1c2aa · 2 hours ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'clean', { canon: 'W-079' }],
                ['Lock', 'run-owned · run #47', { canon: 'W-077' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/lane-b-api', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> lane-b (read-only)' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +310 -42' },
                { label: 'Merge', icon: 'merge', cmd: 'cmd.git.worktree.merge', arg: 'cmd.git.worktree.merge -> lane-b' },
                { label: 'Open lane', icon: 'agents', cmd: 'page.go', arg: 'orchestrator' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> lane-b-api (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> lane-b-api (dry-run preview first)', canon: 'GI-041' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'demo.reason', arg: 'cmd.git.worktree.remove -> lane-b-api', disabled: 'Run #47 owns this worktree, so it cannot be removed while the run holds it' },
              ],
            },
            {
              id: 'wt:lane-d-infra', kind: 'worktree', name: 'orch/lane-d-infra', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/lane-d-infra',
              status: { state: 'blocked', word: 'blocked, preserved' }, owner: 'Orchestrator: lane-d infra', time: '3 hours ago',
              meta: ['dirty', 'run #47'], diff: { add: 188, del: 23 },
              attrs: { 'data-owner': 'orch', 'data-lifecycle': 'blocked_preserved' },
              blocked: {
                code: 'dirty_worktree',
                reason: 'Kept with uncommitted changes after run #47 paused this lane.',
                allowed: [
                  { label: 'Open', icon: 'folderOpen', cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> lane-d' },
                  { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +188 -23' },
                ],
                canon: 'W-076',
              },
              facts: [
                ['Path', '.worktrees/lane-d-infra', { mono: true }],
                ['Pull request', 'none yet · run #47'],
                ['Ahead / behind', 'ahead 3 · behind 1 vs main', { canon: 'W-079' }],
                ['Last commit', '3d9be21 · 3 hours ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'uncommitted changes', { canon: 'W-079' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/lane-d-infra', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> lane-d' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +188 -23' },
                { label: 'Create pull request', icon: 'pr', cmd: 'cmd.github.pr.create', arg: 'cmd.github.pr.create -> draft PR' },
                { label: 'Open lane', icon: 'agents', cmd: 'page.go', arg: 'orchestrator' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> lane-d-infra (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> lane-d-infra (dry-run preview first)', canon: 'GI-041' },
              ],
              canon: 'W-076',
            },
            {
              id: 'wt:import-fixes', kind: 'worktree', name: 'thread/import-fixes', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/import-fixes',
              status: { state: 'ok', word: 'active' }, owner: 'Thread', time: '5 hours ago',
              meta: ['clean'], diff: { add: 45, del: 11 },
              attrs: { 'data-owner': 'thread', 'data-lifecycle': 'active' },
              facts: [
                ['Path', '.worktrees/import-fixes', { mono: true }],
                ['Ahead / behind', 'ahead 1 · behind 2 vs main', { canon: 'W-079' }],
                ['Last commit', '51adf07 · 5 hours ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'clean', { canon: 'W-079' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/import-fixes', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> thread' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +45 -11' },
                { label: 'Open thread', icon: 'chat', cmd: 'demo.toast', arg: 'cmd.chat.open -> thread' },
                { label: 'Merge', icon: 'merge', cmd: 'cmd.git.worktree.merge', arg: 'cmd.git.worktree.merge -> import-fixes' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> import-fixes (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> import-fixes (dry-run preview first)', canon: 'GI-041' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'cmd.git.worktree.remove', arg: 'cmd.git.worktree.remove -> import-fixes (confirm)' },
              ],
            },
            {
              id: 'wt:r2-spike', kind: 'worktree', name: 'spike/r2-storage', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/r2-spike',
              status: { state: 'ok', word: 'active' }, owner: 'Manual', time: '3 days ago',
              meta: ['clean'], diff: { add: 64, del: 0 },
              attrs: { 'data-owner': 'manual', 'data-lifecycle': 'active' },
              facts: [
                ['Path', '.worktrees/r2-spike', { mono: true }],
                ['Ahead / behind', 'ahead 6 · behind 9 vs main', { canon: 'W-079' }],
                ['Last commit', '9c0ffe1 · 3 days ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'clean', { canon: 'W-079' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/r2-spike', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> spike' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +64 -0' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> r2-spike (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> r2-spike (dry-run preview first)', canon: 'GI-041' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'cmd.git.worktree.remove', arg: 'cmd.git.worktree.remove -> r2-spike (confirm)' },
              ],
            },
            {
              id: 'wt:import-normalize-units-fix', kind: 'worktree', name: 'thread/import-normalize-units-fix', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/import-normalize-units-fix',
              status: { state: 'ok', word: 'active' }, owner: 'lane-b worker · run #47', time: '26 minutes ago',
              meta: ['dirty'], diff: { add: 118, del: 24 },
              attrs: { 'data-owner': 'thread', 'data-lifecycle': 'active' },
              facts: [
                ['Path', '.worktrees/import-normalize-units-fix', { mono: true }],
                ['Base', 'main · 26 minutes ago'],
                ['Ahead / behind', 'ahead 2 · behind 0 vs main', { canon: 'W-079' }],
                ['Last commit', '77aa210 · 26 minutes ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'uncommitted changes', { canon: 'W-079' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/import-normalize-units-fix', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> import-normalize' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +118 -24' },
                { label: 'Open thread', icon: 'chat', cmd: 'demo.toast', arg: 'cmd.chat.open -> thread' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> import-normalize-units-fix (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> import-normalize-units-fix (dry-run preview first)', canon: 'GI-041' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'cmd.git.worktree.remove', arg: 'cmd.git.worktree.remove -> import-normalize (confirm)' },
              ],
            },
            {
              id: 'wt:schema-org-docs', kind: 'worktree', name: 'docs/schema-org-recipe-structured-data-coverage-2026', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/schema-org-recipe-structured-data-coverage-2026',
              status: { state: 'info', word: 'released' }, owner: 'Docs Writer', time: '41 minutes ago',
              meta: ['clean'], diff: { add: 58, del: 0 },
              attrs: { 'data-owner': 'agents', 'data-lifecycle': 'released' },
              facts: [
                ['Path', '.worktrees/schema-org-recipe-structured-data-coverage-2026', { mono: true }],
                ['Base', 'main · 41 minutes ago'],
                ['Ahead / behind', 'ahead 1 · behind 0 vs main', { canon: 'W-079' }],
                ['Last commit', '4e5d6f7 · 41 minutes ago', { mono: true, canon: 'W-079' }],
                ['Dirty', 'clean', { canon: 'W-079' }],
                ['Disk size', 'calculating…', { canon: 'W-079' }],
                ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/schema-org-recipe-structured-data-coverage-2026', { mono: true, canon: 'W-079' }],
              ],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> schema-org docs' },
                { label: 'Compare', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> +58 -0' },
                { label: 'Lock', icon: 'key', cmd: 'cmd.git.worktree.lock', arg: 'cmd.git.worktree.lock -> schema-org docs (reason: pin against cleanup)' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> schema-org docs (dry-run preview first)', canon: 'GI-041' },
                { label: 'Remove', icon: 'trash', danger: true, cmd: 'cmd.git.worktree.remove', arg: 'cmd.git.worktree.remove -> schema-org docs (confirm)' },
              ],
              canon: 'W-075',
            },
          ],
        },
        {
          id: 'orphaned', label: 'Orphaned', count: '1 worktree', open: false, kind: 'list',
          items: [
            {
              id: 'wt:lane-a-search', kind: 'worktree', name: 'orch/lane-a-search', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/lane-a-search',
              status: { state: 'warn', word: 'orphaned' },
              attrs: { 'data-lifecycle': 'orphaned' },
              blocked: {
                code: 'orphaned',
                reason: '.worktrees/lane-a-search — gitdir missing (run #44 cleanup interrupted)',
                allowed: [
                  { label: 'Repair', icon: 'refresh', cmd: 'cmd.git.worktree.recover', arg: 'cmd.git.worktree.recover -> relink .worktrees/lane-a-search' },
                ],
              },
              facts: [
                ['Path', '.worktrees/lane-a-search', { mono: true }],
                ['Branch', 'orch/lane-a-search', { mono: true }],
                ['State', 'registered, directory unlinked'],
              ],
              actions: [
                { label: 'Repair', icon: 'refresh', primary: true, cmd: 'cmd.git.worktree.recover', arg: 'cmd.git.worktree.recover -> relink .worktrees/lane-a-search' },
                { label: 'Request prune', icon: 'boxMinus', cmd: 'cmd.git.worktree.request_prune', arg: 'cmd.git.worktree.request_prune -> lane-a-search (dry-run preview first)', canon: 'W-079' },
                { label: 'Prune', icon: 'trash', danger: true, cmd: 'demo.toast', arg: 'Prune orphaned worktree record lane-a-search (confirm)' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ History */
    {
      id: 'history', label: 'History', icon: 'clock',
      summary: '6 commits · latest 4 minutes ago',
      count: 6,
      toolbar: [
        { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> pick compare commit' },
      ],
      sections: [
        {
          id: 'commits', label: 'History', count: 6, open: true, kind: 'list',
          items: [
            {
              id: 'commit:abc12ef', kind: 'commit', name: 'feat(search): tantivy query endpoint + ranked results', time: '4 minutes ago', meta: ['jared-dev', '2 files'],
              facts: [['Author', 'jared-dev'], ['Commit', 'abc12ef', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:abc12ef:search.rs', kind: 'change', name: 'src/routes/search.rs', mono: true, diff: { add: 182, del: 6 } },
                { id: 'commit:abc12ef:tantivy_query.rs', kind: 'change', name: 'src/services/search/tantivy_query.rs', mono: true, diff: { add: 240, del: 0 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> abc12ef vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA abc12ef' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> abc12ef' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> abc12ef' },
              ],
            },
            {
              id: 'commit:def34ab', kind: 'commit', name: 'feat(ratings): schema + API + stars UI', time: '2 hours ago', meta: ['jared-dev', '3 files'],
              facts: [['Author', 'jared-dev'], ['Commit', 'def34ab', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:def34ab:0007_ratings.sql', kind: 'change', name: 'migrations/0007_ratings.sql', mono: true, diff: { add: 38, del: 0 } },
                { id: 'commit:def34ab:ratings.rs', kind: 'change', name: 'src/routes/ratings.rs', mono: true, diff: { add: 120, del: 4 } },
                { id: 'commit:def34ab:StarsRating.svelte', kind: 'change', name: 'web/src/lib/components/recipe/StarsRating.svelte', mono: true, diff: { add: 86, del: 0 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> def34ab vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA def34ab' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> def34ab' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> def34ab' },
              ],
            },
            {
              id: 'commit:789feed', kind: 'commit', name: 'chore: compose stack + registry cache', time: '1 day ago', meta: ['jared-dev', '2 files'],
              facts: [['Author', 'jared-dev'], ['Commit', '789feed', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:789feed:docker-compose.yml', kind: 'change', name: 'docker-compose.yml', mono: true, diff: { add: 41, del: 8 } },
                { id: 'commit:789feed:docker-publish-multi-arch.yml', kind: 'change', name: '.github/workflows/docker-publish-multi-arch.yml', mono: true, diff: { add: 12, del: 3 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> 789feed vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA 789feed' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> 789feed' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> 789feed' },
              ],
            },
            {
              id: 'commit:b2c3d4e', kind: 'commit', name: 'refactor(import): split mixed-fraction normalization into a unit-aware parser with property-based tests', time: '1 day ago', meta: ['lane-b worker · run #47', '3 files'],
              facts: [['Author', 'lane-b worker · run #47'], ['Commit', 'b2c3d4e', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:b2c3d4e:mixed_fractions.rs', kind: 'change', name: 'src/services/import/normalize_units/mixed_fractions.rs', mono: true, diff: { add: 214, del: 0 } },
                { id: 'commit:b2c3d4e:import.rs', kind: 'change', name: 'src/services/import.rs', mono: true, diff: { add: 9, del: 161 } },
                { id: 'commit:b2c3d4e:proptest.rs', kind: 'change', name: 'tests/import_mixed_fractions_proptest.rs', mono: true, diff: { add: 120, del: 0 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> b2c3d4e vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA b2c3d4e' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> b2c3d4e' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> b2c3d4e' },
              ],
            },
            {
              id: 'commit:e5f6a7b', kind: 'commit', name: 'feat(artifacts): add projection_freshness x projection_health matrix to runtime receipt rows', time: '2 days ago', meta: ['jared-dev', '2 files'],
              facts: [['Author', 'jared-dev'], ['Commit', 'e5f6a7b', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:e5f6a7b:projection_freshness.rs', kind: 'change', name: 'crates/puppet-core/src/artifacts/projection_freshness.rs', mono: true, diff: { add: 67, del: 12 } },
                { id: 'commit:e5f6a7b:receipt_rows.rs', kind: 'change', name: 'crates/puppet-core/src/artifacts/receipt_rows.rs', mono: true, diff: { add: 24, del: 3 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> e5f6a7b vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA e5f6a7b' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> e5f6a7b' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> e5f6a7b' },
              ],
            },
            {
              id: 'commit:c8d9e0f', kind: 'commit', name: 'chore(ci): pin buildx and enable multi-arch manifest-list digests for amd64 and arm64', time: '2 days ago', meta: ['jared-dev', '2 files'],
              facts: [['Author', 'jared-dev'], ['Commit', 'c8d9e0f', { mono: true, group: 'Technical details' }]],
              children: [
                { id: 'commit:c8d9e0f:ci-build-test-and-publish.yml', kind: 'change', name: '.github/workflows/ci-build-test-and-publish.yml', mono: true, diff: { add: 18, del: 5 } },
                { id: 'commit:c8d9e0f:docker-publish-multi-arch.yml', kind: 'change', name: '.github/workflows/docker-publish-multi-arch.yml', mono: true, diff: { add: 7, del: 2 } },
              ],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> c8d9e0f vs parent' },
                { label: 'Copy commit SHA', icon: 'copy', cmd: 'demo.toast', arg: 'Copied SHA c8d9e0f' },
                { label: 'Set compare target', icon: 'diff', cmd: 'cmd.git.diff_set_compare_target', arg: 'cmd.git.diff_set_compare_target -> c8d9e0f' },
                { label: 'Show in history', icon: 'clock', cmd: 'cmd.source_control.history_open_commit', arg: 'cmd.source_control.history_open_commit -> c8d9e0f' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Branches (Git) */
    {
      id: 'branches', label: 'Branches', icon: 'branch',
      summary: '7 branches · 2 stashes',
      count: 7,
      sections: [
        {
          id: 'branches', label: 'Branches', count: 7, open: true, kind: 'list',
          actions: [
            { label: 'New branch', icon: 'plus', cmd: 'cmd.source_control.branch.create', arg: 'cmd.source_control.branch.create -> new branch from main' },
          ],
          items: [
            { id: 'branch:main', kind: 'branch', name: 'main', mono: true, status: { state: 'ok', word: 'current' } },
            {
              id: 'branch:orch/lane-b-api', kind: 'branch', name: 'orch/lane-b-api', mono: true, meta: ['run #47 · read-only'],
              facts: [['Last commit', '8f1c2aa · 2 hours ago', { mono: true }], ['Ahead / behind', 'ahead 4 · behind 0 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> orch/lane-b-api (read-only) — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge orch/lane-b-api into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename orch/lane-b-api' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> orch/lane-b-api (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch orch/lane-b-api (confirm)' } },
              ],
            },
            {
              id: 'branch:orch/lane-d-infra', kind: 'branch', name: 'orch/lane-d-infra', mono: true, meta: ['run #47 · read-only'],
              facts: [['Last commit', '3d9be21 · 3 hours ago', { mono: true }], ['Ahead / behind', 'ahead 3 · behind 1 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> orch/lane-d-infra (read-only) — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge orch/lane-d-infra into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename orch/lane-d-infra' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> orch/lane-d-infra (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch orch/lane-d-infra (confirm)' } },
              ],
            },
            {
              id: 'branch:thread/import-fixes', kind: 'branch', name: 'thread/import-fixes', mono: true,
              facts: [['Last commit', '51adf07 · 5 hours ago', { mono: true }], ['Ahead / behind', 'ahead 1 · behind 2 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> thread/import-fixes — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge thread/import-fixes into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename thread/import-fixes' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> thread/import-fixes (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch thread/import-fixes (confirm)' } },
              ],
            },
            {
              id: 'branch:spike/r2-storage', kind: 'branch', name: 'spike/r2-storage', mono: true,
              facts: [['Last commit', '9c0ffe1 · 3 days ago', { mono: true }], ['Ahead / behind', 'ahead 6 · behind 9 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> spike/r2-storage — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge spike/r2-storage into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename spike/r2-storage' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> spike/r2-storage (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch spike/r2-storage (confirm)' } },
              ],
            },
            {
              id: 'branch:thread/import-normalize-units-fix', kind: 'branch', name: 'thread/import-normalize-units-fix', mono: true, meta: ['ahead 2 · lane-b worker'],
              facts: [['Last commit', '77aa210 · 26 minutes ago', { mono: true }], ['Ahead / behind', 'ahead 2 · behind 0 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> thread/import-normalize-units-fix — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge thread/import-normalize-units-fix into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename thread/import-normalize-units-fix' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> thread/import-normalize-units-fix (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch thread/import-normalize-units-fix (confirm)' } },
              ],
            },
            {
              id: 'branch:docs/schema-org', kind: 'branch', name: 'docs/schema-org-recipe-structured-data-coverage-2026', mono: true, meta: ['research notes'],
              facts: [['Last commit', '4e5d6f7 · 41 minutes ago', { mono: true }], ['Ahead / behind', 'ahead 1 · behind 0 vs main']],
              actions: [
                { label: 'Switch', icon: 'branch', primary: true, cmd: 'cmd.source_control.branch.switch', arg: 'cmd.source_control.branch.switch -> docs/schema-org-recipe-structured-data-coverage-2026 — dirty tree: 2 staged + 4 unstaged, confirm stash-and-switch' },
                { label: 'Merge into current', icon: 'merge', cmd: 'demo.toast', arg: 'Merge docs/schema-org-recipe-structured-data-coverage-2026 into main — opens merge preview' },
                { label: 'Rename', icon: 'edit', cmd: 'demo.toast', arg: 'Rename docs/schema-org-recipe-structured-data-coverage-2026' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.source_control.branch.delete', arg: 'cmd.source_control.branch.delete -> docs/schema-org-recipe-structured-data-coverage-2026 (head preview, protections, dangerous confirm)', canon: 'SCS-024', attrs: { 'data-legacy-cmd': 'demo.toast', 'data-legacy-arg': 'Delete branch docs/schema-org-recipe-structured-data-coverage-2026 (confirm)' } },
              ],
            },
          ],
        },
        {
          id: 'stashes', label: 'Stashes', count: 2, open: true, kind: 'list',
          items: [
            {
              id: 'stash:0', kind: 'stash', name: 'stash@{0}', mono: true, status: { state: 'warn', word: 'stashed' },
              meta: ['WIP QuantityStepper keyboard step tuning on thread/import-normalize-units-fix'],
              children: [
                { id: 'stash:0:QuantityStepper.svelte', kind: 'change', name: 'web/src/lib/components/recipe/editor/QuantityStepper.svelte', mono: true, diff: { add: 24, del: 6 } },
                { id: 'stash:0:keymap.ts', kind: 'change', name: 'web/src/lib/components/recipe/editor/keymap.ts', mono: true, diff: { add: 9, del: 2 } },
              ],
              actions: [
                { label: 'Apply', icon: 'check', primary: true, cmd: 'cmd.source_control.stash.apply', arg: 'cmd.source_control.stash.apply -> stash@{0} applied — stash kept' },
                { label: 'Pop', icon: 'arrowUp', cmd: 'cmd.source_control.stash.pop', arg: 'cmd.source_control.stash.pop -> stash@{0} applied & dropped' },
                { label: 'Drop', icon: 'trash', danger: true, cmd: 'cmd.source_control.stash.drop', arg: 'cmd.source_control.stash.drop -> stash@{0} (confirm)' },
              ],
            },
            {
              id: 'stash:1', kind: 'stash', name: 'stash@{1}', mono: true, status: { state: 'warn', word: 'stashed' },
              meta: ['WIP ci-build-test-and-publish.yml matrix fan-out for amd64 and arm64'],
              children: [
                { id: 'stash:1:ci-build-test-and-publish.yml', kind: 'change', name: '.github/workflows/ci-build-test-and-publish.yml', mono: true, diff: { add: 31, del: 7 } },
              ],
              actions: [
                { label: 'Apply', icon: 'check', primary: true, cmd: 'cmd.source_control.stash.apply', arg: 'cmd.source_control.stash.apply -> stash@{1} applied — stash kept' },
                { label: 'Pop', icon: 'arrowUp', cmd: 'cmd.source_control.stash.pop', arg: 'cmd.source_control.stash.pop -> stash@{1} applied & dropped' },
                { label: 'Drop', icon: 'trash', danger: true, cmd: 'cmd.source_control.stash.drop', arg: 'cmd.source_control.stash.drop -> stash@{1} (confirm)' },
              ],
            },
          ],
        },
        {
          id: 'graph', label: 'Graph', open: true, kind: 'graph',
          actions: [
            { label: 'Open full graph', icon: 'external', cmd: 'page.go', arg: 'orchestrator' },
          ],
          items: [
            {
              id: 'graph:main', kind: 'branch', name: 'main', mono: true, status: { state: 'ok', word: 'current' },
              facts: [['Head', 'abc12ef', { mono: true, group: 'Technical details' }]],
              open: true,
              children: [
                { id: 'graph:orch/lane-b-api', kind: 'branch', name: 'orch/lane-b-api', mono: true, attrs: { 'data-lane': 'orchestrator' } },
                { id: 'graph:orch/lane-d-infra', kind: 'branch', name: 'orch/lane-d-infra', mono: true, attrs: { 'data-lane': 'orchestrator' } },
                { id: 'graph:thread/import-fixes', kind: 'branch', name: 'thread/import-fixes', mono: true, attrs: { 'data-lane': 'thread' } },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Reviews (canon) */
    {
      id: 'reviews', label: 'Reviews', icon: 'pr',
      summary: 'Pull request #128 · draft · checks running',
      count: 1,
      canon: 'SCS-005',
      toolbar: [
        { label: 'Create pull request', icon: 'plus', cmd: 'cmd.forge.review.create', arg: 'cmd.forge.review.create -> draft pull request from the current branch (preview first)', canon: 'FGI-004' },
        { label: 'Open Actions & Pipelines', icon: 'actions', cmd: 'cmd.panel.switch', arg: 'cmd.panel.switch -> Actions & Pipelines (checks for pull request #128)', canon: 'SCS-005' },
      ],
      sections: [
        {
          id: 'requests', label: 'Pull requests', count: 1, open: true, kind: 'list', canon: 'SCS-005',
          items: [
            {
              id: 'review:128', kind: 'review', name: 'Pull request #128', meta: ['orch/lane-b-api into main', '2 comments', 'checks running'],
              status: { state: 'pending', word: 'draft' },
              facts: [
                ['Source', 'orch/lane-b-api', { mono: true }],
                ['Target', 'main', { mono: true }],
                ['State', 'Draft (agent reviews start as drafts)', { canon: 'FGI-004' }],
                ['Merge strategy', 'Squash and merge · provider default', { canon: 'FGI-018' }],
                ['Comments', '2'],
                ['Checks', 'running'],
                ['Reviewed revision', '8f1c2aa', { mono: true, group: 'Technical details', canon: 'FGI-004' }],
              ],
              actions: [
                { label: 'Open pull request', icon: 'pr', primary: true, cmd: 'cmd.forge.review.open', arg: 'cmd.forge.review.open -> pull request #128 (GitHub wording)', canon: 'SCS-005' },
                { label: 'Mark ready', icon: 'check', cmd: 'cmd.forge.review.mark_ready', arg: 'cmd.forge.review.mark_ready -> pull request #128 (separate from creation)', canon: 'FGI-004' },
                { label: 'Merge', icon: 'merge', cmd: 'cmd.forge.review.merge', disabled: 'Waiting for the required checks and one approval', canon: 'FGI-018' },
              ],
              canon: 'FGI-004',
            },
          ],
        },
        {
          id: 'gates', label: 'Checks', count: '5 gates · 2 required', open: true, kind: 'list', canon: 'DL-062',
          note: 'One gate list: every row names where it came from and how it is enforced.',
          items: [
            {
              id: 'gate:build', kind: 'gate', name: 'Build and test', meta: ['GitHub Actions', 'required'],
              status: { state: 'running', word: 'running' },
              facts: [['Source', 'GitHub Actions · ci-build-test-and-publish'], ['Enforcement', 'required']],
              attrs: { 'data-enforcement': 'required' }, canon: 'SCS-023',
            },
            {
              id: 'gate:review', kind: 'gate', name: 'Code review', meta: ['Branch protection', 'required'],
              status: { state: 'pending', word: 'needs 1 approval' },
              facts: [['Source', 'Branch protection on main'], ['Enforcement', 'required']],
              attrs: { 'data-enforcement': 'required' }, canon: 'SCS-023',
            },
            {
              id: 'gate:lint', kind: 'gate', name: 'Lint', meta: ['GitHub Actions', 'advisory'],
              status: { state: 'ok', word: 'passed' },
              facts: [['Source', 'GitHub Actions · ci-build-test-and-publish'], ['Enforcement', 'advisory']],
              attrs: { 'data-enforcement': 'advisory' }, canon: 'SCS-023',
            },
            {
              id: 'gate:coverage', kind: 'gate', name: 'Coverage report', meta: ['Commit status', 'not enforced'],
              status: { state: 'ok', word: 'passed' },
              facts: [['Source', 'Commit status from the coverage service'], ['Enforcement', 'not enforced']],
              attrs: { 'data-enforcement': 'not_enforced' }, canon: 'SCS-023',
            },
            {
              id: 'gate:signed', kind: 'gate', name: 'Signed commits', meta: ['Repository ruleset', 'unknown'],
              status: { state: 'unknown', word: 'not published' },
              note: 'The provider does not publish whether this rule is enforced, so it reads unknown.',
              facts: [['Source', 'Repository ruleset'], ['Enforcement', 'unknown']],
              attrs: { 'data-enforcement': 'unknown' }, canon: 'SCS-023',
            },
          ],
        },
      ],
    },
  ],

  /* ================================================================================================ Jujutsu views */
  jjViews: [
    /* ------------------------------------------------------------------ Changes (Jujutsu) */
    {
      id: 'changes', label: 'Changes', icon: 'diff',
      summary: 'Current change · 6 changed · 1 conflict',
      count: 6,
      attention: { state: 'conflict', text: 'The current change has 1 conflict' },
      notes: ['No staging or stash controls appear in Jujutsu mode.'],
      sections: [
        {
          id: 'current', label: 'Current Change @', open: true, kind: 'facts',
          status: { state: 'conflict', word: 'conflicted' },
          attrs: { 'data-scm-section': 'current-change' },
          items: [
            {
              id: 'jj:current', kind: 'current-change', name: 'Make quantity parsing accept mixed fractions',
              status: { state: 'conflict', word: 'conflicted' },
              meta: ['parent main@origin', '6 changed · 1 conflict'],
              facts: [
                ['Description', 'Make quantity parsing accept mixed fractions'],
                ['Parent', 'main@origin', { mono: true }],
                ['Files', '6 changed · 1 conflict'],
                ['Change ID', 'nkmwqzvw', { mono: true, group: 'Technical details' }],
                ['Commit ID', 'e19a8b3f', { mono: true, group: 'Technical details' }],
                ['Parent change ID', 'qoxlywut', { mono: true, group: 'Technical details' }],
              ],
            },
          ],
          actions: [
            { label: 'Describe', icon: 'edit', commandId: 'cmd.jujutsu.change.describe', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-003' },
            { label: 'New Change', icon: 'plus', commandId: 'cmd.jujutsu.change.new', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Edit', icon: 'edit', commandId: 'cmd.jujutsu.change.edit', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Split', icon: 'scissors', commandId: 'cmd.jujutsu.change.split', availability: 'owner_unavailable_concept_preview', disabledReason: 'interactive_editor_session_required', disabled: 'Needs an interactive editor session', canon: 'JJI-003', attrs: { 'data-legacy-disabled-reason': 'native_handler_unavailable' } },
            { label: 'Squash', icon: 'merge', commandId: 'cmd.jujutsu.change.squash', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Abandon', icon: 'trash', danger: true, commandId: 'cmd.jujutsu.change.abandon', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'F3-529' },
          ],
        },
        {
          id: 'files', label: 'Changes', count: 1, open: true, kind: 'list',
          attrs: { 'data-scm-section': 'jj-files-bookmarks' },
          items: [
            {
              id: 'jj:file:recipes.rs', kind: 'change', name: 'recipes.rs', mono: true, icon: 'rust', path: 'src/routes/recipes.rs',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['working change vs parent'], diff: { add: 18, del: 3 },
            },
          ],
          actions: [
            { label: 'Open diff', icon: 'diff', commandId: 'cmd.jujutsu.diff.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
          ],
        },
        {
          id: 'conflicts', label: 'Conflicts', count: 1, open: true, kind: 'list', canon: 'SCS-015',
          note: 'Conflicts are read-only in Jujutsu mode: you can inspect them here, and nothing writes conflict content back yet.',
          items: [
            {
              id: 'jj:conflict:import.rs', kind: 'conflict', name: 'import.rs', mono: true, icon: 'rust', path: 'src/services/import.rs',
              letter: 'C', status: { state: 'conflict', word: 'conflicted' },
              meta: ['src/services', 'in the current change'],
              actions: [
                { label: 'Inspect in Conflict Assistant', icon: 'eye', primary: true, cmd: 'cmd.source_control.open_conflict', arg: 'cmd.source_control.open_conflict -> src/services/import.rs (Jujutsu: read-only, inspect)', canon: 'SCS-015' },
                { label: 'Open merge editor', icon: 'merge', cmd: 'cmd.source_control.open_merge_editor', disabledReason: 'conflict_surface_read_only_on_jujutsu', disabled: 'Conflicts are read-only in Jujutsu mode', canon: 'SCS-015' },
              ],
              canon: 'SCS-015',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Workspaces (Jujutsu, canon) */
    {
      id: 'workspaces', label: 'Workspaces', icon: 'folderOpen',
      summary: '2 workspaces',
      count: 2,
      canon: 'JJI-006',
      sections: [
        {
          id: 'workspaces', label: 'Workspaces', count: 2, open: true, kind: 'list', canon: 'JJI-006',
          items: [
            {
              id: 'jjws:default', kind: 'worktree', name: 'default', mono: true, path: '/home/jared/Projects/tastebook',
              status: { state: 'ok', word: 'active' }, owner: 'Workspace', time: '4 minutes ago',
              meta: ['current change @'],
              facts: [['Working copy', 'Make quantity parsing accept mixed fractions'], ['Absolute path', '/home/jared/Projects/tastebook', { mono: true }]],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, commandId: 'cmd.jujutsu.workspace.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
                { label: 'Remove', icon: 'trash', danger: true, commandId: 'cmd.jujutsu.workspace.remove', disabled: 'The default workspace cannot be removed', canon: 'JJI-006' },
              ],
              canon: 'JJI-006',
            },
            {
              id: 'jjws:import-fixes', kind: 'worktree', name: 'import-fixes', mono: true, path: '/home/jared/Projects/tastebook/.worktrees/import-fixes',
              status: { state: 'ok', word: 'active' }, owner: 'Thread', time: '5 hours ago',
              meta: ['thread/import-fixes bookmark'],
              facts: [['Working copy', 'Fix import of mixed units'], ['Absolute path', '/home/jared/Projects/tastebook/.worktrees/import-fixes', { mono: true }]],
              actions: [
                { label: 'Open', icon: 'folderOpen', primary: true, commandId: 'cmd.jujutsu.workspace.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
                { label: 'Switch to this workspace', icon: 'branch', commandId: 'cmd.jujutsu.workspace.switch', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
                { label: 'Remove', icon: 'trash', danger: true, commandId: 'cmd.jujutsu.workspace.remove', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
              ],
              canon: 'JJI-006',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ History (Jujutsu, canon) */
    {
      id: 'history', label: 'History', icon: 'clock',
      summary: 'Current change on main@origin',
      count: 2,
      canon: 'JJI-006',
      sections: [
        {
          id: 'changes', label: 'History', count: 2, open: true, kind: 'list', canon: 'JJI-006',
          items: [
            {
              id: 'jjlog:nkmwqzvw', kind: 'commit', name: 'Make quantity parsing accept mixed fractions', time: '14:32', meta: ['current change @', 'conflicted'],
              status: { state: 'conflict', word: 'conflicted' },
              facts: [['Change ID', 'nkmwqzvw', { mono: true, group: 'Technical details' }], ['Commit ID', 'e19a8b3f', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, commandId: 'cmd.jujutsu.diff.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
                { label: 'Show in history', icon: 'clock', commandId: 'cmd.jujutsu.history.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
              ],
              canon: 'JJI-006',
            },
            {
              id: 'jjlog:qoxlywut', kind: 'commit', name: 'feat(search): tantivy query endpoint + ranked results', time: '4 minutes ago', meta: ['main@origin', 'parent'],
              facts: [['Change ID', 'qoxlywut', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Open diff', icon: 'diff', primary: true, commandId: 'cmd.jujutsu.diff.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
                { label: 'Show in history', icon: 'clock', commandId: 'cmd.jujutsu.history.open', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', canon: 'JJI-006' },
              ],
              canon: 'JJI-006',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Bookmarks (Jujutsu) */
    {
      id: 'bookmarks', label: 'Bookmarks', icon: 'pin',
      summary: '3 tracked · 1 local only',
      count: 5,
      sections: [
        {
          id: 'bookmarks', label: 'Bookmarks', count: '3 tracked', open: true, kind: 'list',
          status: { state: 'ok', word: '3 tracked' },
          attrs: { 'data-scm-section': 'jj-files-bookmarks' },
          actions: [
            { label: 'Preview publish', icon: 'upload', commandId: 'cmd.jujutsu.git.push', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
          ],
          items: [
            {
              id: 'bm:main', kind: 'bookmark', name: 'main', mono: true, meta: ['tracked at origin/main · behind 0', 'current'],
              status: { state: 'ok', word: 'synced' }, attrs: { 'data-bookmark-state': 'synced' },
            },
            {
              id: 'bm:feature/mixed-fractions', kind: 'bookmark', name: 'feature/mixed-fractions', mono: true, meta: ['local bookmark · ahead 2', 'local'],
              status: { state: 'info', word: 'absent at origin' }, attrs: { 'data-bookmark-state': 'absent' },
              actions: [
                { label: 'Track bookmark', icon: 'pin', commandId: 'cmd.jujutsu.bookmark.track', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', attrs: { 'data-remote-scope': 'one_remote: origin' } },
              ],
            },
            {
              id: 'bm:thread/import-fixes', kind: 'bookmark', name: 'thread/import-fixes', mono: true, meta: ['origin is 1 change behind'],
              status: { state: 'warn', word: 'unsynced' }, attrs: { 'data-bookmark-state': 'unsynced' },
              actions: [
                { label: 'Push to origin', icon: 'push', commandId: 'cmd.jujutsu.git.push', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', attrs: { 'data-remote-scope': 'one_remote: origin' }, canon: 'SCS-005' },
              ],
              canon: 'SCS-005',
            },
            {
              id: 'bm:release/1.4', kind: 'bookmark', name: 'release/1.4', mono: true, meta: ['origin and upstream both in step'],
              status: { state: 'ok', word: 'combined' }, attrs: { 'data-bookmark-state': 'combined' },
              canon: 'SCS-005',
            },
            {
              id: 'bm:feature/search', kind: 'bookmark', name: 'feature/search', mono: true, meta: ['origin synced · upstream 2 behind'],
              status: { state: 'warn', word: 'tracked per remote' }, attrs: { 'data-bookmark-state': 'tracked per remote' },
              children: [
                { id: 'bm:feature/search@origin', kind: 'remote', name: 'origin', mono: true, status: { state: 'ok', word: 'synced' }, canon: 'SCS-005' },
                { id: 'bm:feature/search@upstream', kind: 'remote', name: 'upstream', mono: true, meta: ['2 behind'], status: { state: 'warn', word: 'unsynced' }, canon: 'SCS-005' },
              ],
              actions: [
                { label: 'Untrack at upstream', icon: 'x', commandId: 'cmd.jujutsu.bookmark.untrack', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable', attrs: { 'data-remote-scope': 'one_remote: upstream' }, canon: 'SCS-005' },
              ],
              canon: 'SCS-005',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Operation Log (Jujutsu) */
    {
      id: 'operations', label: 'Operation Log', icon: 'layers',
      summary: 'Latest: describe change at 14:32',
      count: 3,
      canon: 'JJI-006',
      canonNote: 'JJI-006 and Jujutsu_Integration 4.1 name this view Operation Log; F3-529 and PMConcept7 say Operation History. The owner wording is used here; the conflict is not resolved.',
      notes: ['Jujutsu operations are separate from backup snapshots.'],
      sections: [
        {
          id: 'operations', label: 'Operations', count: 3, open: true, kind: 'list',
          status: { state: 'ok', word: 'current' },
          attrs: { 'data-scm-section': 'jj-operation-history' },
          items: [
            { id: 'op:8f314d', kind: 'operation', name: 'describe change', time: '14:32', facts: [['Operation ID', '8f314d', { mono: true, group: 'Technical details' }]] },
            { id: 'op:9c20ab', kind: 'operation', name: 'import Git refs', time: '14:28', facts: [['Operation ID', '9c20ab', { mono: true, group: 'Technical details' }]] },
            { id: 'op:38b7ca', kind: 'operation', name: 'new change', time: '14:18', facts: [['Operation ID', '38b7ca', { mono: true, group: 'Technical details' }]] },
          ],
          actions: [
            { label: 'Inspect operations', icon: 'eye', commandId: 'cmd.jujutsu.operation.log', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Preview restore', icon: 'clock', commandId: 'cmd.jujutsu.operation.restore', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Browse backups', icon: 'book', uiActionId: 'ui.source_control.backup_history.open', availability: 'concept_local_controller_available', attrs: { 'data-pm7-open-backup': 'project' } },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Reviews (Jujutsu) */
    {
      id: 'reviews', label: 'Reviews', icon: 'pr',
      summary: 'Pull request #42 · draft · could not check',
      count: 1,
      sections: [
        {
          id: 'review', label: 'Pull request and checks', open: true, kind: 'facts',
          status: { state: 'unknown', word: 'could not check' },
          attrs: { 'data-scm-section': 'review-publication' },
          note: 'Forgejo vocabulary and permissions remain provider-native.',
          items: [
            { id: 'jjrev:service', kind: 'fact', name: 'Service', meta: ['Forgejo · code.example.test'] },
            { id: 'jjrev:review', kind: 'fact', name: 'Review', meta: ['Pull request #42 · draft'], status: { state: 'pending', word: 'draft' } },
            { id: 'jjrev:target', kind: 'fact', name: 'Publish target', mono: true, meta: ['origin/feature/mixed-fractions'] },
            { id: 'jjrev:protection', kind: 'fact', name: 'Protection', meta: ['Permission unknown · refresh required'], status: { state: 'unknown', word: 'unknown' } },
          ],
          actions: [
            { label: 'Check again', icon: 'refresh', commandId: 'cmd.forge.review.refresh', availability: 'owner_unavailable_concept_preview', disabledReason: 'native_handler_unavailable' },
            { label: 'Open review', icon: 'pr', commandId: 'cmd.forge.review.open', availability: 'unknown', disabledReason: 'review_capability_not_current', disabled: 'Review access could not be checked. Check again first.' },
          ],
        },
      ],
    },
  ],
};
