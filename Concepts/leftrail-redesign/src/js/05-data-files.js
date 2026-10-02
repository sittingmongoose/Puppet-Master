/* FILES_DATA: the File Manager panel (#panel-files) and its context menu (#fileContextMenu) carried over from
   Concepts/PMConcept7.html, every row and data-demo-action / data-demo-arg pair kept as written, plus the canon
   additions listed in DATA.md (each marked canon: '<PlanUnit id>'). Data only; see DATA.md for the schema.
   Fields beyond DATA.md: selection, ops, indexChip (panel); filter, notices (view); rollup, capped, active (item);
   local (an action the panel handles itself, the original element had no data-demo-action). */

const FILES_DATA = {
  id: 'files',
  target: 'panel-files',
  title: 'Files',
  icon: 'files',
  context: {
    lines: [
      { text: 'main', mono: true, menu: 'root', hover: { label: 'Worktree root', detail: 'The worktree this tree shows. Choose another worktree to browse it here.' } },
    ],
    state: { state: 'ok', word: 'watching' },
  },
  actions: [
    { label: 'Refresh', icon: 'refresh', cmd: 'cmd.file.refresh', arg: 'cmd.file.refresh -> re-read active worktree tree' },
    { label: 'Pop out', icon: 'external', cmd: 'cmd.panel.undock', arg: 'cmd.panel.undock -> File Manager (dock left/right)' },
  ],
  status: { state: 'modified', word: '7 changed' },
  footer: [
    'Watching 18 folders · .gitignore respected',
    'Virtualized · row 24px · opens land in the editor',
  ],
  indexChip: { shown: false, state: 'running', text: 'Building search index…' },

  /* the "N selected" chip and selection bar (shown while one or more rows are selected) */
  selection: {
    countLabel: 'selected',
    count: 0,
    actions: [
      { label: 'Copy paths', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> newline-delimited absolute paths of selection' },
      { label: 'Cut', icon: 'scissors', cmd: 'cmd.file.cut_nodes', arg: 'cmd.file.cut_nodes -> mark selection for move (visibly armed)' },
      { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> selection as visible chips (file-only)' },
      { label: 'Delete selection', icon: 'trash', cmd: 'cmd.file.delete', arg: 'cmd.file.delete -> recursive delete of selection (confirm)', danger: true },
      { label: 'Clear selection', icon: 'x', local: 'fmSelClear' },
    ],
  },

  /* ops tray: bulk operations in progress, a footer row inside the panel */
  ops: {
    id: 'ops', label: 'Operations', count: 1, canon: 'F-076',
    items: [
      {
        id: 'op-copy-assets', kind: 'operation', name: 'Copying 3 of 50 files',
        meta: ['to web/src/lib/assets', 'about 40 seconds left'],
        status: { state: 'running', word: 'copying' },
        progress: { done: 3, total: 50 },
        facts: [
          ['From', 'design/exports/recipe-cards', { mono: true }],
          ['To', 'web/src/lib/assets', { mono: true }],
          ['Mode', 'copy (hold Shift while dropping to move)'],
          ['Failed', 'none so far'],
        ],
        actions: [
          { label: 'Cancel', icon: 'x', local: 'opsCancel', canon: 'F-076' },
          { label: 'Retry failed', icon: 'refresh', local: 'opsRetryFailed', disabled: 'Nothing has failed in this operation', canon: 'F-076' },
        ],
        canon: 'F-076',
      },
    ],
  },

  menus: {
    /* #fmRootMenu */
    root: {
      id: 'root', label: 'Worktree root', value: 'main',
      groups: [{
        items: [
          { value: 'main', label: 'main', meta: 'workspace', icon: 'branch', selected: true, cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> main (workspace; focus File Manager)', attrs: { 'data-value': 'main', 'data-label': 'main', 'data-root': 'main' } },
          { value: 'lane-b', label: 'orch/lane-b-api', meta: 'run #47', icon: 'branch', cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> orch/lane-b-api (.worktrees/lane-b-api; focus File Manager)', attrs: { 'data-value': 'lane-b', 'data-label': 'orch/lane-b-api', 'data-root': 'orch/lane-b-api' } },
          { value: 'lane-d', label: 'orch/lane-d-infra', meta: 'run #47', icon: 'branch', cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> orch/lane-d-infra (.worktrees/lane-d-infra; focus File Manager)', attrs: { 'data-value': 'lane-d', 'data-label': 'orch/lane-d-infra', 'data-root': 'orch/lane-d-infra' } },
          { value: 'import', label: 'thread/import-fixes', meta: 'thread', icon: 'branch', cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> thread/import-fixes (.worktrees/import-fixes; focus File Manager)', attrs: { 'data-value': 'import', 'data-label': 'thread/import-fixes', 'data-root': 'thread/import-fixes' } },
          { value: 'spike', label: 'spike/r2-storage', meta: 'read-only', icon: 'branch', cmd: 'demo.reason', arg: 'spike/r2-storage is read-only in this demo (manual worktree)', disabled: 'spike/r2-storage is read-only in this demo (manual worktree)', attrs: { 'data-value': 'spike', 'data-label': 'spike/r2-storage', 'data-root': 'spike/r2-storage' } },
        ],
      }],
    },

    /* #fileContextMenu (sits in #sidePanelSlot right after #panel-files) */
    fileContext: {
      id: 'fileContext', label: 'File actions',
      groups: [
        {
          items: [
            { label: 'New file', icon: 'file', cmd: 'cmd.file.new_file', arg: 'cmd.file.new_file -> prompting name (single target)' },
            { label: 'New folder', icon: 'folder', cmd: 'cmd.file.new_folder', arg: 'cmd.file.new_folder -> prompting name (single target)' },
            { label: 'Open in Panel', icon: 'layers', submenu: 'openInPanel', canon: 'F-080' },
          ],
        },
        {
          items: [
            { label: 'Open with…', icon: 'external', submenu: 'openWith' },
            { label: 'Open in system default', icon: 'external', cmd: 'cmd.file.open_in_system_default', disabled: 'Not available yet: the system default app is not one of the Open with choices', attrs: { 'data-demo-reason': 'system_default is not in the MVP open_with enum; separate future handoff' } },
            { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> hand off identity + repo_id + worktree_id to Source Control' },
            { label: 'Open compare', icon: 'diff', cmd: 'cmd.source_control.diff.open', arg: 'cmd.source_control.diff.open -> compare target chosen in Source Control (hand off identity + repo_id + worktree_id)', canon: 'F-057' },
            { label: 'Open in Source Control', icon: 'source', cmd: 'cmd.panel.switch', arg: 'cmd.panel.switch -> Source Control (hand off identity + repo_id + worktree_id)', canon: 'F-057' },
            { label: 'Reveal in terminal', icon: 'terminal', cmd: 'cmd.terminal.show', arg: 'cmd.terminal.show -> reveal exact session at row cwd' },
          ],
        },
        {
          items: [
            { label: 'Cut', icon: 'scissors', key: 'Ctrl+X', cmd: 'cmd.file.cut_nodes', arg: 'cmd.file.cut_nodes -> pending move (visibly armed until paste/clear)' },
            { label: 'Copy', icon: 'copy', key: 'Ctrl+C', cmd: 'cmd.file.copy_nodes', arg: 'cmd.file.copy_nodes -> file-op clipboard intent (armed)' },
            { label: 'Paste', icon: 'clipboard', key: 'Ctrl+V', cmd: 'cmd.file.paste_nodes', arg: 'cmd.file.paste_nodes -> destination = folder/root (copy|move)' },
            { label: 'Copy path', icon: 'copy', submenu: 'copyPath' },
            { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> remote-to-local escape hatch, keeps path identity' },
            { label: 'Restore this file', icon: 'clock', cmd: 'cmd.backup.browse', arg: 'cmd.backup.browse -> backup history for this path (read-only; restore is chosen there)', canon: 'F3-529' },
          ],
        },
        {
          items: [
            { label: 'Find in files', icon: 'search', meta: 'Search panel', cmd: 'cmd.search.find_in_files', arg: 'cmd.search.find_in_files -> scope to selected path (Search panel)' },
            { label: 'Open other worktree version', icon: 'branch', cmd: 'cmd.git.worktree.open', arg: 'cmd.git.worktree.open -> same path, other worktree (target arg; side-by-side compare identity)' },
            { label: 'Compare with worktree…', icon: 'diff', cmd: 'cmd.git.worktree.compare', arg: 'cmd.git.worktree.compare -> compare with worktree… (branch HEAD vs base)' },
          ],
        },
        {
          items: [
            { label: 'Rename', icon: 'edit', key: 'F2', cmd: 'cmd.file.rename', arg: 'cmd.file.rename -> prompting new name (single target; rejects empty / . / .. / reserved)' },
            { label: 'Delete', icon: 'trash', key: 'Delete', meta: 'Moves to trash, with undo', danger: true, cmd: 'cmd.file.delete', arg: 'cmd.file.delete -> recursive delete, escalates on multi-select (confirm)', canon: 'F2-205' },
            { label: 'Delete permanently', icon: 'trash', key: 'Shift+Delete', meta: 'Asks to confirm first', danger: true, cmd: 'cmd.file.delete', arg: 'cmd.file.delete -> permanent delete, skips the trash (fail-closed confirm)', canon: 'F2-205' },
          ],
        },
      ],
    },
    openInPanel: {
      id: 'openInPanel', label: 'Open file in panel', canon: 'F-080',
      groups: [{
        items: [
          { label: 'Panel 1', cmd: 'cmd.file.open', arg: 'cmd.file.open -> target_editor_panel_id editor_panel_1 (active editor group)', attrs: { 'data-target-editor-panel-id': 'editor_panel_1' }, canon: 'F-080' },
          { label: 'Panel 2', cmd: 'cmd.file.open', arg: 'cmd.file.open -> target_editor_panel_id editor_panel_2 (active editor group)', attrs: { 'data-target-editor-panel-id': 'editor_panel_2' }, canon: 'F-080' },
          { label: 'Panel 3', cmd: 'cmd.file.open', arg: 'cmd.file.open -> target_editor_panel_id editor_panel_3 (reopens the panel if closed)', attrs: { 'data-target-editor-panel-id': 'editor_panel_3' }, canon: 'F-080' },
          { label: 'Panel 4', cmd: 'cmd.file.open', arg: 'cmd.file.open -> target_editor_panel_id editor_panel_4 (reopens the panel if closed)', attrs: { 'data-target-editor-panel-id': 'editor_panel_4' }, canon: 'F-080' },
        ],
      }],
    },
    openWith: {
      id: 'openWith', label: 'Open with',
      groups: [{
        items: [
          { label: 'Source editor', icon: 'edit', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> source_editor' },
          { label: 'Image viewer', icon: 'camera', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> image_viewer' },
          { label: 'Workspace preview', icon: 'external', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> workspace_preview (rendered; source stays canonical)' },
          { label: 'Detached preview', icon: 'external', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> detached_preview' },
          { label: 'Diff review', icon: 'diff', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> diff_review' },
        ],
      }],
    },
    copyPath: {
      id: 'copyPath', label: 'Copy path',
      groups: [{
        items: [
          { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> relative (exact value via clipboard helper)' },
          { label: 'Copy full path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> absolute (exact value via clipboard helper)' },
        ],
      }],
    },
  },

  views: [
    /* ------------------------------------------------------------------ Explorer */
    {
      id: 'explorer', label: 'Explorer', icon: 'folderOpen',
      summary: 'main worktree · 6 changed',
      count: 6,
      toolbar: [
        { label: 'New file', icon: 'filePlus', cmd: 'cmd.file.new_file', arg: 'cmd.file.new_file -> prompting name (single target context)' },
        { label: 'New folder', icon: 'folderPlus', cmd: 'cmd.file.new_folder', arg: 'cmd.file.new_folder -> prompting name (single target context)' },
        { label: 'Collapse all', icon: 'boxMinus', local: 'fmCollapseAll', attrs: { 'data-pm-hover-label': 'Collapse all', 'data-pm-hover-detail': 'Collapse or expand all folders' } },
        { label: 'Hide ignored files', icon: 'eye', local: 'fmHideIgnored' },
        { label: 'Filter', icon: 'search', local: 'fmFilterToggle', attrs: { 'data-pm-hover-label': 'Filter', 'data-pm-hover-detail': 'Filter the tree by typing' } },
      ],
      filter: {
        id: 'fmFilter', label: 'Filter files', kind: 'text', placeholder: 'Filter files…',
        action: { label: 'Clear filter', icon: 'x', local: 'fmFilterClear' },
      },
      notices: [
        {
          id: 'reveal-hidden', shown: false, state: 'info', icon: 'eyeOff',
          text: 'build.log is hidden by the Hide ignored files filter, so it cannot be revealed in the tree.',
          action: { label: 'Show ignored files', icon: 'eye', local: 'fmHideIgnored', canon: 'F-079' },
          canon: 'F-079',
        },
      ],
      sections: [
        {
          id: 'tree', label: 'Files', kind: 'tree', open: true,
          items: [
            {
              id: 'src', kind: 'folder', name: 'src', icon: 'folder', path: 'src', meta: ['7 files'],
              attrs: { 'data-path': 'src', 'data-kind': 'folder' },
              rollup: { state: 'modified', word: '3 changed', canon: 'F-074' },
              quick: [
                { label: 'New file', icon: 'plus', cmd: 'cmd.file.new_file', arg: 'cmd.file.new_file -> parent src (single target)' },
                { label: 'Open in terminal', icon: 'terminal', cmd: 'cmd.terminal.show', arg: 'cmd.terminal.show -> cwd src/' },
              ],
              children: [
                {
                  id: 'src/main.rs', kind: 'file', name: 'main.rs', mono: true, icon: 'rust', path: 'src/main.rs',
                  attrs: { 'data-path': 'src/main.rs', 'data-name': 'main.rs', 'data-kind': 'rs' },
                  actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/main.rs (OpenFile path-based, single row)' }],
                  quick: [
                    { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> src/main.rs' },
                    { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> src/main.rs (relative)' },
                  ],
                },
                {
                  id: 'src/routes', kind: 'folder', name: 'routes', icon: 'folder', path: 'src/routes', meta: ['2 files'],
                  attrs: { 'data-path': 'src/routes', 'data-kind': 'folder' },
                  rollup: { state: 'modified', word: '1 changed', canon: 'F-074' },
                  children: [
                    {
                      id: 'src/routes/recipes.rs', kind: 'file', name: 'recipes.rs', mono: true, icon: 'rust', path: 'src/routes/recipes.rs',
                      letter: 'M', status: { state: 'modified', word: 'modified' },
                      attrs: { 'data-path': 'src/routes/recipes.rs', 'data-name': 'recipes.rs', 'data-kind': 'rs', 'data-git': 'M' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/routes/recipes.rs' }],
                      quick: [
                        { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> recipes.rs' },
                        { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> recipes.rs' },
                      ],
                    },
                    {
                      id: 'src/routes/auth.rs', kind: 'file', name: 'auth.rs', mono: true, icon: 'rust', path: 'src/routes/auth.rs',
                      attrs: { 'data-path': 'src/routes/auth.rs', 'data-name': 'auth.rs', 'data-kind': 'rs' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/routes/auth.rs' }],
                      quick: [
                        { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> src/routes/auth.rs' },
                        { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> src/routes/auth.rs (relative)' },
                      ],
                    },
                  ],
                },
                {
                  id: 'src/services', kind: 'folder', name: 'services', icon: 'folder', path: 'src/services', meta: ['4 files'],
                  attrs: { 'data-path': 'src/services', 'data-kind': 'folder' },
                  rollup: { state: 'modified', word: '2 changed', canon: 'F-074' },
                  children: [
                    {
                      id: 'src/services/image.rs', kind: 'file', name: 'image.rs', mono: true, icon: 'rust', path: 'src/services/image.rs',
                      letter: 'M', status: { state: 'modified', word: 'modified' },
                      attrs: { 'data-path': 'src/services/image.rs', 'data-name': 'image.rs', 'data-kind': 'rs', 'data-git': 'M' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/services/image.rs' }],
                      quick: [
                        { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> image.rs' },
                        { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> image.rs' },
                      ],
                    },
                    {
                      id: 'src/services/import.rs', kind: 'file', name: 'import.rs', mono: true, icon: 'rust', path: 'src/services/import.rs',
                      attrs: { 'data-path': 'src/services/import.rs', 'data-name': 'import.rs', 'data-kind': 'rs' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/services/import.rs' }],
                      quick: [
                        { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> src/services/import.rs' },
                        { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> src/services/import.rs (relative)' },
                      ],
                    },
                    {
                      id: 'src/services/import/normalize_units', kind: 'folder', name: 'normalize_units', icon: 'folder', path: 'src/services/import/normalize_units', meta: ['2 files'],
                      attrs: { 'data-path': 'src/services/import/normalize_units', 'data-kind': 'folder' },
                      rollup: { state: 'added', word: '1 changed', canon: 'F-074' },
                      children: [
                        {
                          id: 'src/services/import/normalize_units/mixed_fractions.rs', kind: 'file', name: 'mixed_fractions.rs', mono: true, icon: 'rust', path: 'src/services/import/normalize_units/mixed_fractions.rs',
                          letter: 'A', status: { state: 'added', word: 'added' },
                          attrs: { 'data-path': 'src/services/import/normalize_units/mixed_fractions.rs', 'data-name': 'mixed_fractions.rs', 'data-kind': 'rs', 'data-git': 'A' },
                          actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> mixed_fractions.rs' }],
                          quick: [
                            { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> mixed_fractions.rs' },
                            { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> mixed_fractions.rs' },
                          ],
                        },
                        {
                          id: 'src/services/import/normalize_units/units_table.rs', kind: 'file', name: 'units_table.rs', mono: true, icon: 'rust', path: 'src/services/import/normalize_units/units_table.rs',
                          attrs: { 'data-path': 'src/services/import/normalize_units/units_table.rs', 'data-name': 'units_table.rs', 'data-kind': 'rs' },
                          actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> units_table.rs' }],
                          quick: [
                            { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> units_table.rs (relative)' },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'src/.DS_Store', kind: 'file', name: '.DS_Store', mono: true, icon: 'file', path: 'src/.DS_Store',
                  status: { state: 'ignored', word: 'ignored' },
                  attrs: { 'data-path': 'src/.DS_Store', 'data-name': '.DS_Store', 'data-kind': 'generic', 'data-ignored': '1' },
                  actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> src/.DS_Store (ignored, dimmed)' }],
                },
              ],
            },
            {
              id: 'migrations', kind: 'folder', name: 'migrations', icon: 'folder', path: 'migrations', meta: ['2 files'],
              attrs: { 'data-path': 'migrations', 'data-kind': 'folder' },
              rollup: { state: 'added', word: '1 changed', canon: 'F-074' },
              children: [
                {
                  id: 'migrations/0001_init.sql', kind: 'file', name: '0001_init.sql', mono: true, icon: 'sql', path: 'migrations/0001_init.sql',
                  attrs: { 'data-path': 'migrations/0001_init.sql', 'data-name': '0001_init.sql', 'data-kind': 'sql' },
                  actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> 0001_init.sql' }],
                  quick: [
                    { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> migrations/0001_init.sql (relative)' },
                  ],
                },
                {
                  id: 'migrations/0002_ratings.sql', kind: 'file', name: '0002_ratings.sql', mono: true, icon: 'sql', path: 'migrations/0002_ratings.sql',
                  letter: 'A', status: { state: 'added', word: 'added' },
                  attrs: { 'data-path': 'migrations/0002_ratings.sql', 'data-name': '0002_ratings.sql', 'data-kind': 'sql', 'data-git': 'A' },
                  actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> 0002_ratings.sql' }],
                  quick: [
                    { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> 0002_ratings.sql' },
                  ],
                },
              ],
            },
            {
              id: 'web/src', kind: 'folder', name: 'web/src', icon: 'folder', path: 'web/src', meta: ['4 files'],
              attrs: { 'data-path': 'web/src', 'data-kind': 'folder' },
              rollup: { state: 'added', word: '1 changed', canon: 'F-074' },
              children: [
                {
                  id: 'web/src/routes', kind: 'folder', name: 'routes', icon: 'folder', path: 'web/src/routes', meta: ['2 files'],
                  attrs: { 'data-path': 'web/src/routes', 'data-kind': 'folder' },
                  children: [
                    {
                      id: 'web/src/routes/+page.svelte', kind: 'file', name: '+page.svelte', mono: true, icon: 'svelte', path: 'web/src/routes/+page.svelte',
                      attrs: { 'data-path': 'web/src/routes/+page.svelte', 'data-name': '+page.svelte', 'data-kind': 'svelte' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> +page.svelte' }],
                      quick: [
                        { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> +page.svelte' },
                      ],
                    },
                    {
                      id: 'web/src/routes/recipe/[id]', kind: 'folder', name: 'recipe/[id]', icon: 'folder', path: 'web/src/routes/recipe/[id]', meta: ['1 file'],
                      attrs: { 'data-path': 'web/src/routes/recipe/[id]', 'data-kind': 'folder' },
                      open: true,
                      children: [
                        {
                          id: 'web/src/routes/recipe/[id]/+page.svelte', kind: 'file', name: '+page.svelte', mono: true, icon: 'svelte', path: 'web/src/routes/recipe/[id]/+page.svelte',
                          active: true, meta: ['current file'],
                          attrs: { 'data-path': 'web/src/routes/recipe/[id]/+page.svelte', 'data-name': '+page.svelte', 'data-kind': 'svelte' },
                          actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> recipe/[id]/+page.svelte (current file, you-are-here)' }],
                          quick: [
                            { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> recipe/[id]/+page.svelte (relative)' },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'web/src/lib', kind: 'folder', name: 'lib', icon: 'folder', path: 'web/src/lib', meta: ['2 files'],
                  attrs: { 'data-path': 'web/src/lib', 'data-kind': 'folder' },
                  rollup: { state: 'added', word: '1 changed', canon: 'F-074' },
                  children: [
                    {
                      id: 'web/src/lib/RecipeCard.svelte', kind: 'file', name: 'RecipeCard.svelte', mono: true, icon: 'svelte', path: 'web/src/lib/RecipeCard.svelte',
                      letter: 'A', status: { state: 'added', word: 'added' },
                      attrs: { 'data-path': 'web/src/lib/RecipeCard.svelte', 'data-name': 'RecipeCard.svelte', 'data-kind': 'svelte', 'data-git': 'A' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> RecipeCard.svelte' }],
                      quick: [
                        { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> RecipeCard.svelte' },
                      ],
                    },
                    {
                      id: 'web/src/lib/Editor.svelte', kind: 'file', name: 'Editor.svelte', mono: true, icon: 'svelte', path: 'web/src/lib/Editor.svelte',
                      attrs: { 'data-path': 'web/src/lib/Editor.svelte', 'data-name': 'Editor.svelte', 'data-kind': 'svelte' },
                      actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> Editor.svelte' }],
                      quick: [
                        { label: 'Add to chat', icon: 'chat', cmd: 'cmd.chat.add_file_reference', arg: 'cmd.chat.add_file_reference -> Editor.svelte' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'node_modules', kind: 'folder', name: 'node_modules', icon: 'folder', path: 'node_modules', meta: ['248 packages'],
              status: { state: 'ignored', word: 'ignored' },
              attrs: { 'data-path': 'node_modules', 'data-kind': 'folder', 'data-capped': '1', 'data-ignored': '1' },
              capped: {
                shown: 3, total: 248,
                note: 'Showing 3 of 248. The rest are virtualized; type ahead to jump to a package.',
                action: { label: 'Show 245 more', icon: 'plus', cmd: 'cmd.file.expand_capped', arg: 'cmd.file.expand_capped -> node_modules showing 3 of 248 (type-ahead to narrow)' },
              },
              children: [
                { id: 'node_modules/.bin', kind: 'folder', name: '.bin', mono: true, icon: 'folder', path: 'node_modules/.bin', attrs: { 'data-path': 'node_modules/.bin', 'data-name': '.bin', 'data-kind': 'folder' } },
                { id: 'node_modules/svelte', kind: 'folder', name: 'svelte', mono: true, icon: 'folder', path: 'node_modules/svelte', attrs: { 'data-path': 'node_modules/svelte', 'data-name': 'svelte', 'data-kind': 'folder' } },
                { id: 'node_modules/vite', kind: 'folder', name: 'vite', mono: true, icon: 'folder', path: 'node_modules/vite', attrs: { 'data-path': 'node_modules/vite', 'data-name': 'vite', 'data-kind': 'folder' } },
              ],
            },
            {
              id: '.github/workflows', kind: 'folder', name: '.github/workflows', icon: 'folder', path: '.github/workflows', meta: ['1 file'],
              attrs: { 'data-path': '.github/workflows', 'data-kind': 'folder' },
              rollup: { state: 'modified', word: '1 changed', canon: 'F-074' },
              children: [
                {
                  id: '.github/workflows/ci.yml', kind: 'file', name: 'ci.yml', mono: true, icon: 'actions', path: '.github/workflows/ci.yml',
                  letter: 'M', status: { state: 'modified', word: 'modified' },
                  attrs: { 'data-path': '.github/workflows/ci.yml', 'data-name': 'ci.yml', 'data-kind': 'yml', 'data-git': 'M' },
                  actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> ci.yml' }],
                  quick: [
                    { label: 'Stage', icon: 'plus', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> ci.yml' },
                  ],
                },
              ],
            },
            {
              id: 'Cargo.toml', kind: 'file', name: 'Cargo.toml', mono: true, icon: 'toml', path: 'Cargo.toml',
              attrs: { 'data-path': 'Cargo.toml', 'data-name': 'Cargo.toml', 'data-kind': 'toml' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> Cargo.toml' }],
              quick: [
                { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> Cargo.toml (relative)' },
              ],
            },
            {
              id: 'docker-compose.yml', kind: 'file', name: 'docker-compose.yml', mono: true, icon: 'docker', path: 'docker-compose.yml',
              attrs: { 'data-path': 'docker-compose.yml', 'data-name': 'docker-compose.yml', 'data-kind': 'yml' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> docker-compose.yml' }],
              quick: [
                { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> docker-compose.yml (relative)' },
              ],
            },
            {
              id: 'Dockerfile', kind: 'file', name: 'Dockerfile', mono: true, icon: 'docker', path: 'Dockerfile',
              attrs: { 'data-path': 'Dockerfile', 'data-name': 'Dockerfile', 'data-kind': 'docker' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> Dockerfile' }],
              quick: [
                { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> Dockerfile (relative)' },
              ],
            },
            {
              id: 'unraid-template.xml', kind: 'file', name: 'unraid-template.xml', mono: true, icon: 'xml', path: 'unraid-template.xml',
              attrs: { 'data-path': 'unraid-template.xml', 'data-name': 'unraid-template.xml', 'data-kind': 'xml' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> unraid-template.xml' }],
              quick: [
                { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> unraid-template.xml to ~/Downloads/' },
              ],
            },
            {
              id: 'README.md', kind: 'file', name: 'README.md', mono: true, icon: 'md', path: 'README.md',
              attrs: { 'data-path': 'README.md', 'data-name': 'README.md', 'data-kind': 'md' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> README.md (source-canonical; rendered preview via open_with workspace_preview)' }],
              quick: [
                { label: 'Open preview', icon: 'eye', cmd: 'cmd.file.open_with', arg: 'cmd.file.open_with -> README.md workspace_preview (rendered, source stays canonical)' },
                { label: 'Copy relative path', icon: 'copy', cmd: 'cmd.file.copy_path', arg: 'cmd.file.copy_path -> README.md (relative)' },
              ],
            },
            {
              id: 'binary-asset.bin', kind: 'file', name: 'binary-asset.bin', mono: true, icon: 'file', path: 'binary-asset.bin',
              status: { state: 'info', word: 'read-only' },
              note: 'Binary file: it cannot be edited here; it opens read-only.',
              attrs: { 'data-path': 'binary-asset.bin', 'data-name': 'binary-asset.bin', 'data-kind': 'generic', 'data-readonly': '1' },
              actions: [{ label: 'Open read-only', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> binary-asset.bin (Binary file — cannot edit; view read-only)' }],
              quick: [
                { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> binary-asset.bin' },
              ],
            },
            {
              id: 'build.log', kind: 'file', name: 'build.log', mono: true, icon: 'file', path: 'build.log',
              status: { state: 'ignored', word: 'ignored' },
              attrs: { 'data-path': 'build.log', 'data-name': 'build.log', 'data-kind': 'generic', 'data-ignored': '1' },
              actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> build.log (ignored, dimmed)' }],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Changed */
    {
      id: 'changed', label: 'Changed', icon: 'diff',
      summary: '3 modified · 3 added · 1 untracked',
      count: 7,
      sections: [
        {
          id: 'modified', label: 'Modified', count: 3, open: true, kind: 'list',
          items: [
            {
              id: 'chg:src/routes/recipes.rs', kind: 'changed', name: 'recipes.rs', mono: true, icon: 'rust', path: 'src/routes/recipes.rs',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['src/routes', '3 hunks'], diff: { add: 38, del: 12 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> recipes.rs' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> recipes.rs' },
                { label: 'Restore this file', icon: 'clock', cmd: 'cmd.backup.browse', arg: 'cmd.backup.browse -> src/routes/recipes.rs (backup history; read-only preview first)', canon: 'F3-529' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> recipes.rs (confirm)' },
              ],
            },
            {
              id: 'chg:src/services/image.rs', kind: 'changed', name: 'image.rs', mono: true, icon: 'rust', path: 'src/services/image.rs',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['src/services', '2 hunks'], diff: { add: 21, del: 6 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> image.rs' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> image.rs' },
                { label: 'Restore this file', icon: 'clock', cmd: 'cmd.backup.browse', arg: 'cmd.backup.browse -> src/services/image.rs (backup history; read-only preview first)', canon: 'F3-529' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> image.rs (confirm)' },
              ],
            },
            {
              id: 'chg:.github/workflows/ci.yml', kind: 'changed', name: 'ci.yml', mono: true, icon: 'actions', path: '.github/workflows/ci.yml',
              letter: 'M', status: { state: 'modified', word: 'modified' },
              meta: ['.github/workflows', '1 hunk'], diff: { add: 9, del: 4 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> ci.yml' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> ci.yml' },
                { label: 'Restore this file', icon: 'clock', cmd: 'cmd.backup.browse', arg: 'cmd.backup.browse -> .github/workflows/ci.yml (backup history; read-only preview first)', canon: 'F3-529' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> ci.yml (confirm)' },
              ],
            },
          ],
        },
        {
          id: 'added', label: 'Added', count: 3, open: true, kind: 'list',
          items: [
            {
              id: 'chg:src/services/import/normalize_units/mixed_fractions.rs', kind: 'changed', name: 'mixed_fractions.rs', mono: true, icon: 'rust', path: 'src/services/import/normalize_units/mixed_fractions.rs',
              letter: 'A', status: { state: 'added', word: 'added' },
              meta: ['src/services/import/normalize_units', 'new file'], diff: { add: 214, del: 0 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> mixed_fractions.rs' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> mixed_fractions.rs' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> mixed_fractions.rs (confirm)' },
              ],
            },
            {
              id: 'chg:migrations/0002_ratings.sql', kind: 'changed', name: '0002_ratings.sql', mono: true, icon: 'sql', path: 'migrations/0002_ratings.sql',
              letter: 'A', status: { state: 'added', word: 'added' },
              meta: ['migrations', 'new file'], diff: { add: 36, del: 0 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> 0002_ratings.sql' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> 0002_ratings.sql' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> 0002_ratings.sql (confirm)' },
              ],
            },
            {
              id: 'chg:web/src/lib/RecipeCard.svelte', kind: 'changed', name: 'RecipeCard.svelte', mono: true, icon: 'svelte', path: 'web/src/lib/RecipeCard.svelte',
              letter: 'A', status: { state: 'added', word: 'added' },
              meta: ['web/src/lib', 'new file'], diff: { add: 148, del: 0 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> RecipeCard.svelte' },
                { label: 'Open diff', icon: 'diff', cmd: 'cmd.git.diff_open', arg: 'cmd.git.diff_open -> RecipeCard.svelte' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> RecipeCard.svelte (confirm)' },
              ],
            },
          ],
        },
        {
          id: 'untracked', label: 'Untracked', count: 1, open: true, kind: 'list',
          items: [
            {
              id: 'chg:docs/schema-org-recipe-structured-data-coverage-2026.md', kind: 'changed', name: 'schema-org-recipe-structured-data-coverage-2026.md', mono: true, icon: 'md', path: 'docs/schema-org-recipe-structured-data-coverage-2026.md',
              letter: '?', status: { state: 'untracked', word: 'untracked' },
              meta: ['docs', 'untracked · not in the index'], diff: { add: 64, del: 0 },
              actions: [
                { label: 'Stage', cmd: 'cmd.git.stage_hunks', arg: 'cmd.git.stage_hunks -> schema-org-recipe docs' },
                { label: 'Discard', icon: 'trash', danger: true, cmd: 'cmd.git.discard_hunks', arg: 'cmd.git.discard_hunks -> schema-org-recipe docs (confirm)' },
              ],
            },
          ],
        },
      ],
      notes: [
        'Git row badges are read-only and sourced from Source Control; stronger switch/manage/conflict worktree UI lives there. Default action for the same path across worktrees is side-by-side compare.',
      ],
    },

    /* ------------------------------------------------------------------ Open */
    {
      id: 'open', label: 'Open', icon: 'file',
      summary: '3 open editors · 2 unsaved',
      count: 3,
      sections: [
        {
          id: 'editors', label: 'Open editors', count: 3, open: true, kind: 'list',
          items: [
            {
              id: 'open:web/src/routes/recipe/[id]/+page.svelte', kind: 'open', name: '+page.svelte', mono: true, icon: 'svelte', path: 'web/src/routes/recipe/[id]/+page.svelte',
              active: true, status: { state: 'warn', word: 'unsaved' },
              meta: ['web/src/routes/recipe/[id]', 'unsaved changes · you are here'],
              actions: [
                { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> +page.svelte' },
                { label: 'Close', icon: 'x', cmd: 'cmd.editor.close_tab', arg: 'cmd.editor.close_tab -> +page.svelte (unsaved prompt)' },
                { label: 'Reveal', icon: 'eye', cmd: 'cmd.file.reveal', arg: 'cmd.file.reveal -> recipe/[id]/+page.svelte in the tree' },
              ],
            },
            {
              id: 'open:src/routes/recipes.rs', kind: 'open', name: 'recipes.rs', mono: true, icon: 'rust', path: 'src/routes/recipes.rs',
              status: { state: 'ok', word: 'saved' },
              meta: ['src/routes', 'saved'],
              actions: [
                { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> recipes.rs' },
                { label: 'Close', icon: 'x', cmd: 'cmd.editor.close_tab', arg: 'cmd.editor.close_tab -> recipes.rs' },
                { label: 'Reveal', icon: 'eye', cmd: 'cmd.file.reveal', arg: 'cmd.file.reveal -> recipes.rs in the tree' },
              ],
            },
            {
              id: 'open:src/services/import/normalize_units/mixed_fractions.rs', kind: 'open', name: 'mixed_fractions.rs', mono: true, icon: 'rust', path: 'src/services/import/normalize_units/mixed_fractions.rs',
              status: { state: 'warn', word: 'unsaved' },
              meta: ['src/services/import/normalize_units', 'unsaved changes'],
              actions: [
                { label: 'Save local copy', icon: 'arrowDn', cmd: 'cmd.file.save_local_copy', arg: 'cmd.file.save_local_copy -> mixed_fractions.rs' },
                { label: 'Close', icon: 'x', cmd: 'cmd.editor.close_tab', arg: 'cmd.editor.close_tab -> mixed_fractions.rs (unsaved prompt)' },
                { label: 'Reveal', icon: 'eye', cmd: 'cmd.file.reveal', arg: 'cmd.file.reveal -> mixed_fractions.rs in the tree' },
              ],
            },
          ],
        },
        {
          id: 'recent', label: 'Recent', count: 5, open: false, kind: 'list',
          items: [
            { id: 'recent:src/services/image.rs', kind: 'recent', name: 'src/services/image.rs', mono: true, icon: 'rust', path: 'src/services/image.rs', time: '12 minutes ago', actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> image.rs' }] },
            { id: 'recent:web/src/lib/Editor.svelte', kind: 'recent', name: 'web/src/lib/Editor.svelte', mono: true, icon: 'svelte', path: 'web/src/lib/Editor.svelte', time: '38 minutes ago', actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> Editor.svelte' }] },
            { id: 'recent:migrations/0001_init.sql', kind: 'recent', name: 'migrations/0001_init.sql', mono: true, icon: 'sql', path: 'migrations/0001_init.sql', time: '1 hour ago', actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> 0001_init.sql' }] },
            { id: 'recent:Cargo.toml', kind: 'recent', name: 'Cargo.toml', mono: true, icon: 'toml', path: 'Cargo.toml', time: '2 hours ago', actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> Cargo.toml' }] },
            { id: 'recent:README.md', kind: 'recent', name: 'README.md', mono: true, icon: 'md', path: 'README.md', time: '3 hours ago', actions: [{ label: 'Open', icon: 'file', primary: true, cmd: 'cmd.file.open', arg: 'cmd.file.open -> README.md' }] },
          ],
        },
      ],
      notes: [
        'Open list is filtered by the active execution role and approval scope; reveal reuses an existing tree node instead of opening a duplicate buffer.',
      ],
    },
  ],
};
