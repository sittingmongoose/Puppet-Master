/* Toolchain — language servers, formatters, and the tools the assistant can use.
   O55: each list owns its rows (the server and formatter catalogs are the lists; Add is the list's add button;
   Restart and Restart all are in a server's menu; which folder a server is attached to is shown in its details).
   Below the servers: a short Language help group, the Code health gate (its options appear once it is on) and the
   timing limits under More options. Docker and registry settings moved to Containers & Execution, where the rest
   of the Docker settings live.
   Adding is guided (PM51.wizard), the way onboarding asks: pick the language (languages this project uses first,
   each with the server or formatter most people use), pick the tool, say where the program comes from (the one
   already on this computer, install it for me, or point to one with a Check button), which files it handles (and,
   for a formatter, whether it tidies on save or only when asked), start options (arguments, environment values,
   project markers), then a recap and Add. Each entry's details show its status, program and files; Edit changes
   every one of those, Remove is in its menu. The inventory's add rows run these helpers, and its catalog rows open
   the lists instead of a bare list of names. */
(function () {
  const ID = 'toolchain';
  const KEY = 'tools-integrations';
  const TABS = [{ id: 'servers', label: 'Language Servers' }, { id: 'formatters', label: 'Formatters' }, { id: 'agent-tools', label: 'Agent Tools' }];
  const tc = () => state.toolchain;
  const DEFAULTS = clone({ lsps: state.toolchain.lsps, formatters: state.toolchain.formatters, agentTools: state.toolchain.agentTools });
  const SOURCE_LABELS = {
    'Auto-detected toolchain': 'Found with your installed toolchain', 'Workspace package': 'Installed in this project',
    'Managed tool': 'Installed by Puppet Master', 'Rust toolchain': 'Part of your Rust toolchain',
    'Project environment': 'Part of this project\'s environment', 'Added by you': 'A program you pointed to',
    'Found on this computer': 'Found on this computer'
  };
  const PERMISSION_LABELS = { 'FileSafe': 'Protected files only' };
  const PERMISSION_CHOICES = ['Ask for sensitive actions', 'Ask for writes', 'Protected files only', 'Always ask', 'Never ask'];
  const sourceLabel = s => SOURCE_LABELS[s] || s || 'Unknown';
  const permissionLabel = p => PERMISSION_LABELS[p] || p || 'Always ask';
  const isOn = x => x.enabled !== false;
  const byId = (kind, id) => (tc()[kind] || []).find(x => x.id === id);
  const selected = (kind, list) => list.find(x => x.id === PM51.sel(ID + '-' + kind)) || list[0];
  const slug = name => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tool';
  const uniqueId = (kind, base) => { let id = base, n = 2; while (byId(kind, id)) id = base + '-' + n++; return id; };
  const pillFor = x => !isOn(x) ? PM51.pill('Off') : x.status === 'ready' ? PM51.pill('Ready') : x.status === 'attention' ? PM51.pill('Needs attention') : x.status === 'setup' ? PM51.pill('Not checked yet') : PM51.statusPill(x.status);
  const toneFor = x => !isOn(x) ? 'off' : x.status === 'ready' ? 'ready' : x.status === 'attention' ? 'attention' : 'neutral';
  const statusText = (x, runningWord) => !isOn(x) ? 'Off · not used in this project' : x.status === 'ready' ? runningWord : x.status === 'attention' ? 'Needs a restart' : 'Not checked yet';
  const actionRow = (...buttons) => `<div class="pm51-toolchain-actions">${buttons.join('')}</div>`;
  const S = { lspCatalog: 'code.editing.lsp-server-catalog', lspCustom: 'code.editing.lsp-custom-servers', lspRestart: 'code.editing.lsp-restart', lspAttach: 'code.editing.lsp-host-attachment', fmtCatalog: 'code.editing.formatter-catalog', fmtCustom: 'code.editing.formatter-custom' };
  const homes = (ids, html) => ids.reduceRight((acc, id) => PM51.home(id, acc), html);
  const managedIn = tool => tool.owner === 'GitHub plugin' ? { label: 'Managed in Plugins', workspace: 'plugins' } : tool.owner === 'Filesystem MCP' ? { label: 'Managed in MCP Servers', workspace: 'mcp' } : null;

  /* ---------- what Puppet Master knows: languages, their servers and formatters ------------------------------------
     t: [id, name, what it is, program, start arguments, install command ('' = comes with something else), where it
     was found on this computer ('' = not found), version it reports, settings file]. Example data for the concept. */
  const T = ([id, name, what, cmd, args, install, found, v, config]) => ({ id, name, what, cmd, args: args || '', install: install || '', found: found || '', v: v || '', config: config || '' });
  const LANGS = [
    { id: 'rust', name: 'Rust', here: true, icon: 'code', files: ['*.rs'], markers: ['Cargo.toml', 'rust-project.json'], aliases: ['Rust'],
      lsps: [['rust-analyzer', 'rust-analyzer', 'The official Rust language server.', 'rust-analyzer', '', 'rustup component add rust-analyzer', '~/.cargo/bin/rust-analyzer', '1.83.0']],
      formatters: [['rustfmt', 'rustfmt', 'The standard Rust formatter.', 'rustfmt', '--edition 2024', 'rustup component add rustfmt', '~/.cargo/bin/rustfmt', '1.8.0', 'rustfmt.toml']] },
    { id: 'ts', name: 'TypeScript and JavaScript', here: true, icon: 'brackets', files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs'], markers: ['package.json', 'tsconfig.json'], aliases: ['TypeScript / JavaScript', 'TypeScript', 'JavaScript'],
      lsps: [['typescript', 'TypeScript Language Server', 'The usual choice for TypeScript and JavaScript.', 'typescript-language-server', '--stdio', 'npm install -g typescript-language-server typescript', 'node_modules/.bin/typescript-language-server', '4.3.3'],
        ['vtsls', 'vtsls', 'Runs the same engine VS Code uses.', 'vtsls', '--stdio', 'npm install -g @vtsls/language-server', '', '0.2.6'],
        ['biome-lsp', 'Biome', 'Fast error checks and quick fixes.', 'biome', 'lsp-proxy', 'npm install --save-dev @biomejs/biome', '', '1.9.4']],
      formatters: [['prettier', 'Prettier', 'The most common formatter for web code.', 'prettier', '--stdin-filepath ${file}', 'npm install --save-dev prettier', 'node_modules/.bin/prettier', '3.3.3', '.prettierrc'],
        ['biome-format', 'Biome', 'A fast formatter that follows Prettier\'s style.', 'biome', 'format --stdin-file-path=${file}', 'npm install --save-dev @biomejs/biome', '', '1.9.4', 'biome.json'],
        ['dprint', 'dprint', 'A fast formatter with plugins for many languages.', 'dprint', 'fmt --stdin ${file}', 'npm install -g dprint', '', '0.47.2', 'dprint.json']] },
    { id: 'python', name: 'Python', here: true, icon: 'code', files: ['*.py', '*.pyi'], markers: ['pyproject.toml', 'requirements.txt'], aliases: ['Python'],
      lsps: [['pyright', 'Pyright', 'Fast type checking from Microsoft.', 'pyright-langserver', '--stdio', 'npm install -g pyright', '~/.puppet-master/tools/pyright-langserver', '1.1.389'],
        ['basedpyright', 'basedpyright', 'Pyright with a few extra checks.', 'basedpyright-langserver', '--stdio', 'pip install basedpyright', '', '1.22.0'],
        ['pylsp', 'Python LSP Server', 'A community server you can add plugins to.', 'pylsp', '', 'pip install python-lsp-server', '', '1.12.0'],
        ['jedi', 'Jedi Language Server', 'Light and simple, with good autocomplete.', 'jedi-language-server', '', 'pip install jedi-language-server', '', '0.42.0']],
      formatters: [['ruff-format', 'Ruff Format', 'Very fast, and formats the way Black does.', 'ruff', 'format -', 'pip install ruff', '.venv/bin/ruff', '0.8.1', 'pyproject.toml'],
        ['black', 'Black', 'The best-known Python formatter.', 'black', '-q -', 'pip install black', '', '24.10.0', 'pyproject.toml'],
        ['autopep8', 'autopep8', 'Makes code follow the PEP 8 style guide.', 'autopep8', '-', 'pip install autopep8', '', '2.3.1']] },
    { id: 'svelte', name: 'Svelte', here: true, icon: 'globe', files: ['*.svelte'], markers: ['svelte.config.js', 'package.json'], aliases: ['Svelte'],
      lsps: [['svelte', 'Svelte Language Server', 'Understands .svelte files, their scripts and their styles.', 'svelteserver', '--stdio', 'npm install -g svelte-language-server', '', '0.17.7']],
      formatters: [['prettier-svelte', 'Prettier with the Svelte plugin', 'Prettier, taught to read .svelte files.', 'prettier', '--plugin prettier-plugin-svelte --stdin-filepath ${file}', 'npm install --save-dev prettier prettier-plugin-svelte', 'node_modules/.bin/prettier', '3.3.3', '.prettierrc']] },
    { id: 'go', name: 'Go', icon: 'code', files: ['*.go'], markers: ['go.mod', 'go.work'], aliases: ['Go'],
      lsps: [['gopls', 'gopls', 'The official Go language server.', 'gopls', '', 'go install golang.org/x/tools/gopls@latest', '', '0.17.0']],
      formatters: [['gofmt', 'gofmt', 'The standard Go formatter. It comes with Go.', 'gofmt', '', '', '', '1.23'],
        ['goimports', 'goimports', 'gofmt that also tidies the import list.', 'goimports', '', 'go install golang.org/x/tools/cmd/goimports@latest', '', '0.27.0']] },
    { id: 'c', name: 'C and C++', icon: 'code', files: ['*.c', '*.h', '*.cpp', '*.hpp', '*.cc'], markers: ['compile_commands.json', 'CMakeLists.txt'], aliases: ['C', 'C++', 'C/C++'],
      lsps: [['clangd', 'clangd', 'From the LLVM project. The usual choice.', 'clangd', '--background-index', 'apt install clangd', '/usr/bin/clangd', '18.1.3'],
        ['ccls', 'ccls', 'Light and quick on very large projects.', 'ccls', '', 'apt install ccls', '', '0.20240202']],
      formatters: [['clang-format', 'clang-format', 'The LLVM formatter. It reads a .clang-format file.', 'clang-format', '--assume-filename=${file}', 'apt install clang-format', '/usr/bin/clang-format', '18.1.3', '.clang-format']] },
    { id: 'java', name: 'Java', icon: 'code', files: ['*.java'], markers: ['pom.xml', 'build.gradle'], aliases: ['Java'],
      lsps: [['jdtls', 'Eclipse JDT Language Server', 'The standard Java language server.', 'jdtls', '', 'brew install jdtls', '', '1.40.0']],
      formatters: [['google-java-format', 'google-java-format', 'Formats Java the way Google does.', 'google-java-format', '-', 'brew install google-java-format', '', '1.24.0']] },
    { id: 'csharp', name: 'C#', icon: 'code', files: ['*.cs'], markers: ['*.sln', '*.csproj'], aliases: ['C#'],
      lsps: [['csharp-ls', 'csharp-ls', 'A light C# server, installed with dotnet.', 'csharp-ls', '', 'dotnet tool install --global csharp-ls', '', '0.15.0']],
      formatters: [['csharpier', 'CSharpier', 'An opinionated C# formatter, like Prettier.', 'dotnet-csharpier', '--write-stdout', 'dotnet tool install --global csharpier', '', '0.29.2'],
        ['dotnet-format', 'dotnet format', 'Comes with .NET and follows .editorconfig.', 'dotnet', 'format --include ${file}', '', '', '8.0', '.editorconfig']] },
    { id: 'ruby', name: 'Ruby', icon: 'code', files: ['*.rb', '*.rake'], markers: ['Gemfile'], aliases: ['Ruby'],
      lsps: [['ruby-lsp', 'Ruby LSP', 'From Shopify. The current usual choice.', 'ruby-lsp', '', 'gem install ruby-lsp', '', '0.22.1'],
        ['solargraph', 'Solargraph', 'A long-standing Ruby server.', 'solargraph', 'stdio', 'gem install solargraph', '', '0.50.0']],
      formatters: [['rubocop', 'RuboCop', 'Checks and tidies Ruby code.', 'rubocop', '-a --stdin ${file} --stderr', 'gem install rubocop', '', '1.69.0', '.rubocop.yml']] },
    { id: 'php', name: 'PHP', icon: 'code', files: ['*.php'], markers: ['composer.json'], aliases: ['PHP'],
      lsps: [['intelephense', 'Intelephense', 'Fast, with a paid tier for extra features.', 'intelephense', '--stdio', 'npm install -g intelephense', '', '1.12.6'],
        ['phpactor', 'Phpactor', 'Free, with tools for renaming and moving code.', 'phpactor', 'language-server', 'composer global require phpactor/phpactor', '', '2024.11']],
      formatters: [['php-cs-fixer', 'PHP CS Fixer', 'Fixes code to follow PHP style standards.', 'php-cs-fixer', 'fix ${file}', 'composer global require friendsofphp/php-cs-fixer', '', '3.65.0', '.php-cs-fixer.php']] },
    { id: 'web', name: 'HTML and CSS', icon: 'browser', files: ['*.html', '*.css', '*.scss'], markers: ['package.json'], aliases: ['HTML', 'CSS'],
      lsps: [['html-ls', 'HTML Language Server', 'The one VS Code uses for HTML.', 'vscode-html-language-server', '--stdio', 'npm install -g vscode-langservers-extracted', '', '4.10.0'],
        ['css-ls', 'CSS Language Server', 'The one VS Code uses for CSS and SCSS.', 'vscode-css-language-server', '--stdio', 'npm install -g vscode-langservers-extracted', '', '4.10.0']],
      formatters: [['prettier', 'Prettier', 'The most common formatter for web code.', 'prettier', '--stdin-filepath ${file}', 'npm install --save-dev prettier', 'node_modules/.bin/prettier', '3.3.3', '.prettierrc']] },
    { id: 'data', name: 'JSON, YAML and TOML', icon: 'brackets', files: ['*.json', '*.yaml', '*.yml', '*.toml'], markers: [], aliases: ['JSON', 'YAML', 'TOML', 'Markdown'],
      lsps: [['json-ls', 'JSON Language Server', 'Checks JSON files against their schema.', 'vscode-json-language-server', '--stdio', 'npm install -g vscode-langservers-extracted', '', '4.10.0'],
        ['yaml-ls', 'YAML Language Server', 'From Red Hat. Checks YAML files.', 'yaml-language-server', '--stdio', 'npm install -g yaml-language-server', '', '1.15.0'],
        ['taplo', 'Taplo', 'For TOML files like Cargo.toml.', 'taplo', 'lsp stdio', 'cargo install taplo-cli --locked', '', '0.9.3']],
      formatters: [['prettier', 'Prettier', 'Tidies JSON and YAML as well as web code.', 'prettier', '--stdin-filepath ${file}', 'npm install --save-dev prettier', 'node_modules/.bin/prettier', '3.3.3', '.prettierrc'],
        ['taplo-fmt', 'Taplo', 'Tidies TOML files.', 'taplo', 'fmt -', 'cargo install taplo-cli --locked', '', '0.9.3', 'taplo.toml']] },
    { id: 'shell', name: 'Shell scripts', icon: 'terminal', files: ['*.sh', '*.bash'], markers: [], aliases: ['Shell', 'Bash'],
      lsps: [['bash-ls', 'Bash Language Server', 'Understands shell scripts, and uses ShellCheck if it is there.', 'bash-language-server', 'start', 'npm install -g bash-language-server', '', '5.4.3']],
      formatters: [['shfmt', 'shfmt', 'Tidies shell scripts.', 'shfmt', '-', 'go install mvdan.cc/sh/v3/cmd/shfmt@latest', '', '3.10.0']] },
    { id: 'lua', name: 'Lua', icon: 'code', files: ['*.lua'], markers: ['.luarc.json'], aliases: ['Lua'],
      lsps: [['lua-ls', 'Lua Language Server', 'The usual Lua server.', 'lua-language-server', '', 'brew install lua-language-server', '', '3.13.2']],
      formatters: [['stylua', 'StyLua', 'An opinionated Lua formatter.', 'stylua', '-', 'cargo install stylua', '', '2.0.1', 'stylua.toml']] }
  ].map(l => Object.assign(l, { lsps: l.lsps.map(T), formatters: l.formatters.map(T) }));
  const OTHER = 'other';
  const langById = id => LANGS.find(l => l.id === id);
  const langFor = name => LANGS.find(l => l.name === name || (l.aliases || []).includes(name));
  const KIND = {
    lsps: { noun: 'language server', Noun: 'Language server', tab: 'servers', icon: 'code', program: 'command', many: 'servers' },
    formatters: { noun: 'formatter', Noun: 'Formatter', tab: 'formatters', icon: 'wand', program: 'executable', many: 'formatters' }
  };
  const programOf = (kind, x) => (kind === 'lsps' ? x.command : x.executable) || '';
  const languagesOf = (kind, x) => kind === 'lsps' ? [x.language].filter(Boolean) : (x.languages || []);
  /* Entries from before the helper name no files; they read the files of their languages. */
  const filesOf = (kind, x) => (x.files && x.files.length) ? x.files : [...new Set(languagesOf(kind, x).flatMap(n => { const l = langFor(n); return l ? (n === 'JavaScript' ? ['*.js', '*.jsx', '*.mjs'] : n === 'TypeScript' ? ['*.ts', '*.tsx'] : n === 'JSON' ? ['*.json'] : n === 'CSS' ? ['*.css', '*.scss'] : n === 'Markdown' ? ['*.md'] : l.files) : []; }))];
  const envOf = x => Array.isArray(x.env) ? x.env : [];
  const onList = (kind, t) => (tc()[kind] || []).find(x => x.id === t.id || String(x.name).toLowerCase() === String(t.name).toLowerCase());
  const managedPath = cmd => `~/.puppet-master/tools/${cmd}`;
  const ENV_RE = /^[A-Za-z_][A-Za-z0-9_]*=/;
  const lines = text => String(text || '').split('\n').map(x => x.trim()).filter(Boolean);
  const splitWords = text => String(text || '').split(/\s+/).filter(Boolean);
  const splitList = text => String(text || '').split(/[,\s]+/).filter(Boolean);

  PM51.style(`
#panel-settings .pm51-toolchain-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#panel-settings .pm51-toolchain-log { margin: 0; padding: 10px 12px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.55; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
#panel-settings .pm51-toolchain-sample { min-width: 0; }
#panel-settings .pm51-toolchain-sample pre { margin: 4px 0 0; padding: 9px 11px; border: 1px solid var(--k3-line); border-radius: 8px; background: var(--k3-bg-2); font-family: var(--mono-font, ui-monospace, monospace); font-size: 11px; line-height: 1.5; color: var(--k3-text-2); white-space: pre-wrap; overflow-wrap: anywhere; }
#panel-settings .pm51-toolchain-order { display: flex; flex-direction: column; }
#panel-settings .pm51-toolchain-order-row { display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 6px 0; border-top: 1px solid var(--k3-line); }
#panel-settings .pm51-toolchain-order-row:first-child { border-top: 0; }
#panel-settings .pm51-toolchain-order-n { width: 22px; height: 22px; display: grid; place-items: center; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; color: var(--k3-text-2); flex: 0 0 auto; }
#panel-settings .pm51-toolchain-order-name { flex: 1 1 auto; min-width: 0; font-size: 12.5px; font-weight: 640; color: var(--k3-text-1); }
`);

  /* ---------- Language servers ------------------------------------------- */
  function renderServers() {
    const list = tc().lsps;
    if (!list.length) return homes([S.lspCatalog, S.lspCustom], PM51.section({ title: 'Language servers', help: 'Helpers that understand each language you write in.', body: PM51.empty('No language servers yet', 'Add one, or let Puppet Master find the tools already in this project.', { label: 'Add language server', action: 'pm51-toolchain-add-lsp', icon: 'plus' }) }));
    const s = selected('lsps', list);
    const launch = [s.command].concat(s.args || []).filter(Boolean).join(' ');
    const env = envOf(s);
    const body = PM51.rows([
      { label: 'Status', value: statusText(s, 'Running'), action: { label: 'Check server', icon: 'test', action: 'pm51-toolchain-check-lsp', data: { id: s.id } } },
      { label: 'Program', help: sourceLabel(s.source), value: s.command || 'Not set' },
      { label: 'Files it handles', value: filesOf('lsps', s).join(', ') || 'Not set' },
      { label: 'Used in this project', help: 'Turn off to stop using it here without removing it.', control: PM51.toggle(isOn(s), { action: 'pm51-toolchain-lsp-on', data: { id: s.id }, label: 'Used in this project' }) },
      { label: 'Attached to', help: 'The folder this server treats as the project.', value: isOn(s) && s.status === 'ready' ? (PM51.value(S.lspAttach) && PM51.value(S.lspAttach) !== 'Auto' ? PM51.value(S.lspAttach) : 'Project folder') : 'Not while it is stopped' }
    ]) + PM51.advanced([
      PM51.kv([
        ['Language', s.language || 'Not set'],
        ['Starts with', launch || 'Not set'],
        ['Environment values', env.length ? env.map(e => e.split('=')[0]).join(', ') : 'None'],
        ['Project markers', (s.rootMarkers || []).length ? s.rootMarkers.join(', ') : 'None'],
        ['Startup options', s.initOptions || 'Defaults'],
        ['Applies to', s.scope === 'User' ? 'All your projects' : 'This project'],
        ['Last check', s.lastTest || 'Not checked yet']
      ]),
      actionRow(
        PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'lsps', id: s.id } }),
        PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'lsps', id: s.id } })
      )
    ].join(''));
    return homes([S.lspCatalog, S.lspCustom, S.lspRestart, S.lspAttach], PM51.listDetail({
      id: ID, rosterId: 'toolchain-servers', rosterTitle: 'Language servers', count: list.length,
      add: { action: 'pm51-toolchain-add-lsp', label: 'Add language server' },
      filter: { placeholder: 'Filter language servers' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: x.language, tone: toneFor(x), selected: x.id === s.id, data: { kind: 'lsps' } })),
      selectAction: 'pm51-toolchain-pick',
      detail: {
        title: s.name, subtitle: `${s.language} · ${sourceLabel(s.source)}`, pill: pillFor(s),
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-toolchain-edit-lsp', data: { id: s.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: 'Restart', icon: 'refresh', onClick: () => PM51.toast(`Restarting ${s.name}`, 'Example only: language servers run in the real app.', 'info') },
          { label: 'Restart all language servers', icon: 'refresh', onClick: () => PM51.toast('Restarting every language server', 'The usual fix when highlights or errors get stuck. Example only.', 'info') },
          { label: isOn(s) ? 'Turn off' : 'Turn on', icon: isOn(s) ? 'pause' : 'play', onClick: () => { s.enabled = !isOn(s); saveState(); PM51.refresh(ID, { swap: false }); } },
          { label: 'View logs', icon: 'terminal', onClick: () => openLogs('lsps', s.id) },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, onClick: () => removeItem('lsps', s.id, 'language server') }
        ], s.name),
        body
      }
    }));
  }

  /* ---------- Formatters --------------------------------------------------- */
  const SAMPLES = {
    prettier: ['const user={name:"Ada",tags:["a","b"]}', 'const user = { name: "Ada", tags: ["a", "b"] };'],
    rustfmt: ['fn main(){println!("hi");}', 'fn main() {\n    println!("hi");\n}'],
    'ruff-format': ['def add(a,b):return a+b', 'def add(a, b):\n    return a + b'],
    black: ['def add(a,b):return a+b', 'def add(a, b):\n    return a + b'],
    gofmt: ['func main(){fmt.Println("hi")}', 'func main() {\n\tfmt.Println("hi")\n}']
  };
  function renderFormatters() {
    const list = tc().formatters;
    if (!list.length) return homes([S.fmtCatalog, S.fmtCustom], PM51.section({ title: 'Formatters', help: 'Tools that tidy your code so it always looks the same.', body: PM51.empty('No formatters yet', 'Add one, or let Puppet Master find the tools already in this project.', { label: 'Add formatter', action: 'pm51-toolchain-add-fmt', icon: 'plus' }) }));
    const f = selected('formatters', list);
    const sample = SAMPLES[f.id] || SAMPLES[f.tool] || ['a=1', 'a = 1'];
    const env = envOf(f);
    const body = PM51.rows([
      { label: 'Status', value: statusText(f, 'Ready to format'), action: { label: 'Check formatter', icon: 'test', action: 'pm51-toolchain-check-fmt', data: { id: f.id } } },
      { label: 'Program', help: sourceLabel(f.source), value: f.executable || 'Not set' },
      { label: 'Files it tidies', value: filesOf('formatters', f).join(', ') || 'Not set' },
      { label: 'Format on save', help: 'Off means it only tidies when you ask.', control: PM51.toggle(!!f.onSave, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'onSave' }, label: 'Format on save' }) },
      { label: 'Format on paste', help: 'Tidies text as soon as you paste it in.', control: PM51.toggle(!!f.onPaste, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'onPaste' }, label: 'Format on paste' }) },
      { label: 'Only changed lines', help: 'Leaves untouched code exactly as it was.', control: PM51.toggle(!!f.changedLines, { action: 'pm51-toolchain-fmt-flag', data: { id: f.id, flag: 'changedLines' }, label: 'Only changed lines' }) }
    ]) + PM51.advanced([
      PM51.kv([
        ['Languages', (f.languages || []).join(', ') || 'Not set'],
        ['Runs as', [f.executable].concat(f.args || []).filter(Boolean).join(' ') || 'Not set'],
        ['Environment values', env.length ? env.map(e => e.split('=')[0]).join(', ') : 'None'],
        ['Settings file', f.config || 'None'],
        ['Ignore file', f.ignore || 'None']
      ]),
      PM51.grid(2,
        `<div class="pm51-toolchain-sample"><div class="pm51-ps-title">Sample before</div><pre>${h(sample[0])}</pre></div>`,
        `<div class="pm51-toolchain-sample"><div class="pm51-ps-title">Sample after</div><pre>${h(sample[1])}</pre></div>`),
      actionRow(
        PM51.btn({ label: 'View logs', small: true, icon: 'terminal', action: 'pm51-toolchain-logs', data: { kind: 'formatters', id: f.id } }),
        PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'formatters', id: f.id } })
      )
    ].join(''));
    return homes([S.fmtCatalog, S.fmtCustom], PM51.listDetail({
      id: ID, rosterId: 'toolchain-formatters', rosterTitle: 'Formatters', count: list.length,
      add: { action: 'pm51-toolchain-add-fmt', label: 'Add formatter' },
      filter: { placeholder: 'Filter formatters' },
      items: list.map(x => ({ id: x.id, title: x.name, meta: (x.languages || []).slice(0, 3).join(', ') + ((x.languages || []).length > 3 ? ` +${x.languages.length - 3}` : ''), tone: toneFor(x), selected: x.id === f.id, data: { kind: 'formatters' } })),
      selectAction: 'pm51-toolchain-pick',
      detail: {
        title: f.name, subtitle: `${(f.languages || []).length} ${(f.languages || []).length === 1 ? 'language' : 'languages'} · ${sourceLabel(f.source)}`, pill: pillFor(f),
        primary: { label: 'Edit', icon: 'edit', action: 'pm51-toolchain-edit-fmt', data: { id: f.id } },
        menu: anchor => PM51.menu(anchor, [
          { label: isOn(f) ? 'Turn off' : 'Turn on', icon: isOn(f) ? 'pause' : 'play', onClick: () => { f.enabled = !isOn(f); saveState(); PM51.refresh(ID, { swap: false }); } },
          { label: 'View logs', icon: 'terminal', onClick: () => openLogs('formatters', f.id) },
          { separator: true },
          { label: 'Remove', icon: 'trash', danger: true, onClick: () => removeItem('formatters', f.id, 'formatter') }
        ], f.name),
        body
      }
    }));
  }

  /* ---------- Agent tools -------------------------------------------------- */
  function renderAgentTools() {
    const list = tc().agentTools.slice().sort((x, y) => (x.priority || 99) - (y.priority || 99));
    const rows = list.map(t => {
      const m = managedIn(t);
      return {
        label: t.name, pill: m ? PM51.chip(m.label) : '',
        help: `${permissionLabel(t.permission)} · ${m ? `Comes from the ${t.owner}.` : 'Built into Puppet Master.'}`,
        control: (m ? PM51.btn({ label: 'Open', small: true, ghost: true, icon: 'arrowRight', action: 'pm51-go', data: { domain: 'code', workspace: m.workspace } }) : '') + PM51.toggle(isOn(t), { action: 'pm51-toolchain-tool-on', data: { id: t.id }, label: t.name })
      };
    });
    const order = `<div class="pm51-toolchain-order">${list.map((t, i) => `<div class="pm51-toolchain-order-row"><span class="pm51-toolchain-order-n">${i + 1}</span><span class="pm51-toolchain-order-name">${h(t.name)}</span>${PM51.btn({ label: 'Move up', small: true, ghost: true, icon: 'up', action: 'pm51-toolchain-tool-up', data: { id: t.id }, disabled: i === 0, reason: 'Already first.' })}</div>`).join('')}</div>`;
    return PM51.section({
      title: 'Tools the assistant can use', help: 'Turn a tool off to keep the assistant from using it in this project.',
      body: PM51.rows(rows) + PM51.advanced([
        PM51.section({ title: 'Which tool goes first', help: 'When two tools can do the same job, the assistant tries the higher one first.', body: order }),
        PM51.section({ title: 'What each tool may do', help: 'Ask means the assistant stops and checks with you.', body: PM51.rows(list.map(t => ({ label: t.name, control: PM51.select(permissionLabel(t.permission), PERMISSION_CHOICES, { action: 'pm51-toolchain-tool-permission', data: { id: t.id }, label: `${t.name} permission` }) }))) }),
        PM51.section({ title: 'Technical details', body: PM51.kv(list.map(t => [t.name, `Provided by ${t.owner} · ${PM51.plain(t.status)}`])) + '<div style="margin-top:10px">' + PM51.btn({ label: 'Run diagnostics', small: true, icon: 'test', action: 'pm51-toolchain-diagnostics', data: { kind: 'agentTools' } }) + '</div>' })
      ].join(''))
    });
  }

  function render() {
    const tab = PM51.tab(ID, 'servers');
    const body = tab === 'formatters' ? renderFormatters() : tab === 'agent-tools' ? renderAgentTools() : renderServers();
    return PM51.page({ id: ID, key: KEY, tabs: TABS, active: tab, body, quiet: [
      { label: 'Find tools in this project', action: 'pm51-toolchain-discover' },
      { label: 'Reset toolchain defaults', action: 'pm51-toolchain-reset' },
      { label: 'How the toolchain works', action: 'pm51-toolchain-help' }
    ] });
  }
  PM51.manager('toolchain', { render });

  /* ---------- the add helper: one set of steps for servers and formatters ------------------------------------ */
  const live = wrap => (wrap && wrap.querySelector('.o55g-layer:not(.o55g-out)')) || wrap;
  const val = (wrap, sel) => { const el = live(wrap).querySelector(sel); return el ? String(el.value || '').trim() : null; };
  const toolsFor = (kind, d) => { const l = langById(d.lang); return l ? l[kind] : []; };
  const toolOf = (kind, d) => toolsFor(kind, d).find(t => t.id === d.tool) || null;
  const langName = d => d.lang === OTHER ? d.langName : (langById(d.lang) || {}).name || '';
  const FROM = { found: 'The one on this computer', install: 'Installed for you', path: 'A program you point to' };
  const programFor = (kind, d) => { const t = toolOf(kind, d); return d.from === 'path' ? d.path : d.from === 'install' && t ? managedPath(t.cmd) : t ? t.found : d.path; };
  /* The program box with Browse and Check. Used in the helper and in Edit; the Check result is example data. */
  function pathBlock({ kind, tool, value, placeholder, hidden, help }) {
    return `<div class="pm51-field tt-path" data-kind="${a(kind)}" data-tool="${a(tool || '')}"${hidden ? ' hidden' : ''}>`
      + `<span class="pm51-field-label">Where the program is</span>`
      + `<span class="tt-path-row"><input class="text-control o55-setup-mono tt-path-input" value="${a(value || '')}" placeholder="${a(placeholder || '/usr/local/bin/…')}" autocomplete="off" spellcheck="false" aria-label="Where the program is"/>`
      + PM51.btn({ label: 'Browse…', small: true, icon: 'folder', action: 'pm51-toolchain-path-browse' })
      + PM51.btn({ label: 'Check', small: true, icon: 'test', action: 'pm51-toolchain-path-check' }) + `</span>`
      + `<span class="pm51-field-help">${h(help || 'Its full path, like /usr/local/bin/tool, or just its name if it is on your PATH (the folders your computer searches for programs).')}</span>`
      + `<p class="tt-path-result" role="status" hidden></p></div>`;
  }
  const chips = (files, on, action) => `<div class="tt-chips" role="group" aria-label="Files">${files.map(f => PM51.chipToggle(f, on.includes(f), { action, data: { file: f } })).join('')}</div>`;
  function toolWizard(kind, preset) {
    const K = KIND[kind];
    const draft = Object.assign({ kind, lang: null, langName: '', tool: null, name: '', from: null, path: '', checked: '', files: [], extra: '', scope: 'Project', onSave: true, onPaste: false, changedLines: false, args: '', env: '', markers: '', init: '', config: '', ignore: '' }, preset || {});
    const steps = [
      { label: 'Language', icon: 'code', title: 'Which language is it for?', lead: 'Languages this project uses come first. Each one shows the ' + K.noun + ' most people use.',
        recap: d => langName(d) || 'Another language',
        render: d => PM51.tiles(LANGS.map(l => { const t = l[kind][0], have = l[kind].map(x => onList(kind, x)).filter(Boolean)[0]; return { title: l.name, text: have ? `On your list: ${have.name}` : `Suggested: ${t.name}`, meta: l.here ? 'Used in this project' : '', icon: l.icon, selected: d.lang === l.id, data: { lang: l.id } }; })
          .concat([{ title: 'Another language', text: 'Any language not listed here. You name the ' + K.noun + ' yourself.', icon: 'plus', selected: d.lang === OTHER, data: { lang: OTHER } }]), { action: 'pm51-toolchain-w-lang' }),
        check: d => d.lang ? '' : 'Pick a language to go on.' },
      { label: kind === 'lsps' ? 'Server' : 'Formatter', icon: K.icon,
        title: d => d.lang === OTHER ? `Which ${K.noun} is it?` : `Which ${K.noun} for ${langName(d)}?`,
        lead: d => d.lang === OTHER ? 'Name the language and the ' + K.noun + '. Its own instructions tell you what it is called.' : 'The first one is what most people use. Pick "A different one" if you already know which you want.',
        recap: d => d.name,
        render: d => {
          const custom = d.lang === OTHER || d.tool === 'custom';
          const tiles = d.lang === OTHER ? '' : PM51.tiles(toolsFor(kind, d).map((t, i) => { const have = onList(kind, t); return { title: t.name, text: t.what, meta: i === 0 ? 'Suggested' : '', icon: K.icon, selected: d.tool === t.id, done: !!have, doneMeta: 'Already on your list', doneReason: `${t.name} is already on your list. Edit it there.`, data: { tool: t.id } }; })
            .concat([{ title: 'A different one', text: `Any other ${K.noun}. You give its name, then where it is.`, icon: 'plus', selected: d.tool === 'custom', data: { tool: 'custom' } }]), { action: 'pm51-toolchain-w-tool' });
          return tiles + `<div class="o55-setup-fields tt-reveal" data-tt-reveal="custom"${custom ? '' : ' hidden'}>`
            + (d.lang === OTHER ? PM51.field('Language', `<input class="text-control tt-w-langname" value="${a(d.langName)}" placeholder="For example: Elixir" autocomplete="off"/>`) : '')
            + PM51.field(`Name of the ${K.noun}`, `<input class="text-control tt-w-name" value="${a(d.tool === 'custom' || d.lang === OTHER ? d.name : '')}" placeholder="${a(kind === 'lsps' ? 'For example: elixir-ls' : 'For example: mix format')}" autocomplete="off"/>`, 'How it shows in your list.')
            + `</div>`;
        },
        collect: (wrap, d) => { const n = val(wrap, '.tt-w-name'), l = val(wrap, '.tt-w-langname'); if (n != null && (d.tool === 'custom' || d.lang === OTHER)) d.name = n; if (l != null) d.langName = l; if (d.lang === OTHER) { d.tool = 'custom'; if (!d.from || d.from !== 'path') d.from = 'path'; } },
        check: d => {
          if (d.lang === OTHER && !d.langName) return 'Name the language.';
          if (!d.tool) return `Pick a ${K.noun}, or "A different one".`;
          if (!d.name) return `Give the ${K.noun} a name.`;
          if (d.tool === 'custom' && tc()[kind].some(x => x.name.toLowerCase() === d.name.toLowerCase())) return `There is already a ${K.noun} called ${d.name} on your list.`;
          return '';
        } },
      { label: 'Program', icon: 'download', title: d => toolOf(kind, d) ? `Where should Puppet Master get ${d.name}?` : `Where is ${d.name}?`,
        lead: d => toolOf(kind, d) ? 'Pick whichever is easiest. You can change it later.' : 'Puppet Master only installs tools it knows, so point to the program and check that it answers.',
        recap: d => FROM[d.from] || '',
        render: d => {
          const t = toolOf(kind, d);
          if (!t) return pathBlock({ kind, tool: '', value: d.path, placeholder: '/usr/local/bin/…' });
          const items = [
            { title: 'Use the one on this computer', text: t.found ? `Found at ${t.found}.` : 'Looks for it in the usual places.', meta: t.found ? 'Suggested' : '', icon: 'search', selected: d.from === 'found', done: !t.found, doneMeta: 'Not found on this computer', doneReason: `${t.name} is not on this computer yet. Install it, or point to it.`, data: { from: 'found' } },
            { title: 'Install it for me', text: t.install ? `Puppet Master runs: ${t.install}` : '', meta: t.install && !t.found ? 'Suggested' : t.install ? 'Takes about a minute' : '', icon: 'download', selected: d.from === 'install', done: !t.install, doneMeta: 'Comes with its language', doneReason: `${t.name} comes with ${langName(d)}. Install ${langName(d)} first, then use the one on this computer.`, data: { from: 'install' } },
            { title: 'Point to one I already have', text: 'Tell Puppet Master where the program is, then check it answers.', icon: 'folder', selected: d.from === 'path', data: { from: 'path' } }
          ];
          return PM51.tiles(items, { action: 'pm51-toolchain-w-from' })
            + pathBlock({ kind, tool: t.id, value: d.path, placeholder: t.found || `/usr/local/bin/${t.cmd}`, hidden: d.from !== 'path' });
        },
        onShow: (wrap, d) => { if (d.checked) showResult(live(wrap).querySelector('.tt-path'), d.checked, 'ready', false); },
        collect: (wrap, d) => { const p = val(wrap, '.tt-path-input'); if (p != null) { if (p !== d.path) d.checked = ''; d.path = p; } },
        check: d => !d.from ? 'Pick where it comes from.' : d.from === 'path' && !d.path ? 'Type where the program is, or use Browse.' : '' },
      { label: 'Files', icon: 'file', title: kind === 'lsps' ? 'Which files should it handle?' : 'Which files, and when?',
        lead: 'A star stands for any name: *.rs means every file ending in .rs.',
        recap: d => d.files.concat(splitList(d.extra)).slice(0, 3).join(', ') + (d.files.concat(splitList(d.extra)).length > 3 ? '…' : ''),
        render: d => {
          const l = langById(d.lang), known = l ? l.files : [];
          return (known.length ? PM51.panelSection(`${langName(d)} files`, chips(known, d.files, 'pm51-toolchain-w-file'), 'Untick a kind to leave it out.', { icon: 'file' }) : '')
            + `<div class="o55-setup-fields">`
            + PM51.field(known.length ? 'Other files too (optional)' : 'Files it handles', `<input class="text-control o55-setup-mono tt-w-extra" value="${a(d.extra)}" placeholder="${a(known.length ? 'For example: *.ron, build.rs' : 'For example: *.ex, *.exs')}" autocomplete="off" spellcheck="false"/>`, 'Separate several with commas.')
            + (kind === 'formatters' ? PM51.field('When it tidies', PM51.segmented(d.onSave ? 'save' : 'ask', [['save', 'Every time I save'], ['ask', 'Only when I ask']], { action: 'pm51-toolchain-w-when', label: 'When it tidies' }), d.onSave ? 'Each file is tidied as you save it.' : 'Use Format document, or ask the assistant to tidy a file.') : '')
            + PM51.field('Use it in', PM51.dropdown(d.scope, [{ value: 'Project', label: 'This project only' }, { value: 'User', label: 'All my projects' }], { cls: 'tt-w-scope', label: 'Use it in' }))
            + `</div>`;
        },
        collect: (wrap, d) => { const x = val(wrap, '.tt-w-extra'), sc = val(wrap, '.tt-w-scope'); if (x != null) d.extra = x; if (sc) d.scope = sc; },
        check: d => d.files.length || splitList(d.extra).length ? '' : 'Pick at least one kind of file, or type one.' },
      { label: 'Options', icon: 'sliders', title: kind === 'lsps' ? 'Anything special when it starts?' : 'Anything special when it runs?',
        lead: 'Most people leave this as it is. Change it only if the ' + K.noun + '\'s own instructions say so.',
        render: d => `<div class="o55-setup-fields">`
          + PM51.field(kind === 'lsps' ? 'Start arguments' : 'Arguments', `<input class="text-control o55-setup-mono tt-w-args" value="${a(d.args)}" placeholder="None" autocomplete="off" spellcheck="false"/>`, kind === 'lsps' ? 'Words added after the program name when it starts. Filled in for the ones Puppet Master knows.' : '${file} stands for the file being tidied.')
          + PM51.field('Environment values', `<textarea class="form-textarea o55-setup-mono tt-w-env" rows="3" spellcheck="false" placeholder="LOG_LEVEL=info">${h(d.env)}</textarea>`, 'One NAME=value per line, handed to the program when it starts. Keep passwords out: these are saved as plain text.')
          + (kind === 'lsps'
            ? PM51.field('Project markers', `<input class="text-control o55-setup-mono tt-w-markers" value="${a(d.markers)}" placeholder="For example: mix.exs" autocomplete="off" spellcheck="false"/>`, 'Files that show where a project starts, so the server knows which folder to read.')
              + PM51.field('Startup options (optional)', `<textarea class="form-textarea o55-setup-mono tt-w-init" rows="3" spellcheck="false" placeholder='{ "checkOnSave": true }'>${h(d.init)}</textarea>`, 'Settings some servers accept when they start, written as JSON. Leave empty for their defaults.')
            : PM51.field('Settings file', `<input class="text-control o55-setup-mono tt-w-config" value="${a(d.config)}" placeholder="None" autocomplete="off" spellcheck="false"/>`, 'The file in your project that holds its style choices, if it has one.')
              + PM51.field('Ignore file (optional)', `<input class="text-control o55-setup-mono tt-w-ignore" value="${a(d.ignore)}" placeholder="None" autocomplete="off" spellcheck="false"/>`, 'Lists files it should leave alone.')
              + `<div class="tt-w-flags">${PM51.rows([
                { label: 'Also tidy when I paste', control: PM51.toggle(d.onPaste, { action: 'pm51-toolchain-w-flag', data: { flag: 'onPaste' }, label: 'Also tidy when I paste' }) },
                { label: 'Only the lines I changed', help: 'Leaves untouched code exactly as it was.', control: PM51.toggle(d.changedLines, { action: 'pm51-toolchain-w-flag', data: { flag: 'changedLines' }, label: 'Only the lines I changed' }) }
              ])}</div>`)
          + `</div>`,
        collect: (wrap, d) => { ['args', 'env', 'markers', 'init', 'config', 'ignore'].forEach(k => { const v = val(wrap, '.tt-w-' + k); if (v != null) d[k] = v; }); },
        check: d => {
          const bad = lines(d.env).find(x => !ENV_RE.test(x)); if (bad) return `"${bad}" needs to read NAME=value.`;
          if (d.init) { try { JSON.parse(d.init); } catch (e) { return 'Startup options are not valid JSON. Check the brackets and quotes, or leave the box empty.'; } }
          return '';
        } },
      { label: 'Review', icon: 'check', title: d => `Add ${d.name}?`, lead: 'Here is everything in one place. You can change any of it later from the list.',
        render: d => {
          const files = d.files.concat(splitList(d.extra));
          return PM51.kv([
            ['Language', langName(d)], [K.Noun, d.name], ['Program', programFor(kind, d) || 'Not set'], ['Comes from', FROM[d.from] || 'Not set'],
            ['Files', files.join(', ')], kind === 'formatters' ? ['Tidies', d.onSave ? 'Every time you save' : 'Only when you ask'] : null,
            ['Used in', d.scope === 'User' ? 'All your projects' : 'This project'],
            [kind === 'lsps' ? 'Start arguments' : 'Arguments', d.args || 'None'], ['Environment values', lines(d.env).length ? lines(d.env).map(x => x.split('=')[0]).join(', ') : 'None'],
            kind === 'lsps' ? ['Project markers', d.markers || 'None'] : ['Settings file', d.config || 'None']
          ]) + PM51.note(d.from === 'install' ? 'Puppet Master installs it, then checks it answers. Example only: nothing is installed in this preview.' : d.checked ? 'It answered the check. You can check it again from the list at any time.' : 'Puppet Master checks it answers the first time it is needed. Example only in this preview.', 'info');
        } }
    ];
    PM51.wizard({
      title: `Add a ${K.noun}`, eyebrow: K.Noun, icon: K.icon, finishLabel: `Add ${K.noun}`, draft, steps, start: preset && preset.lang ? 1 : 0,
      subtitle: kind === 'lsps' ? 'A language server helps the assistant understand code: it spots mistakes, finds where things are defined and renames safely.' : 'A formatter tidies code so it always looks the same: spacing, line breaks and quotes.',
      onFinish: d => {
        const t = toolOf(kind, d), files = [...new Set(d.files.concat(splitList(d.extra)))];
        const program = programFor(kind, d) || (t ? t.cmd : '');
        const source = d.from === 'install' ? 'Managed tool' : d.from === 'found' ? 'Found on this computer' : 'Added by you';
        const ready = d.from !== 'path' || !!d.checked;
        const base = { id: uniqueId(kind, t ? t.id : slug(d.name)), name: d.name, tool: t ? t.id : '', source, files, env: lines(d.env), scope: d.scope, status: ready ? 'ready' : 'setup', enabled: true };
        const rec = kind === 'lsps'
          ? Object.assign(base, { language: langName(d), command: program, args: splitWords(d.args), rootMarkers: splitList(d.markers), initOptions: d.init || '', lastTest: ready ? 'Passed' : 'Not checked yet' })
          : Object.assign(base, { languages: [langName(d)], executable: program, args: splitWords(d.args), config: d.config || 'None', ignore: d.ignore || 'None', onSave: !!d.onSave, onPaste: !!d.onPaste, changedLines: !!d.changedLines });
        tc()[kind].push(rec);
        PM51.setSel(ID + '-' + kind, rec.id); PM51.setTab(ID, K.tab); saveState(); PM51.refresh(ID, { swap: false });
        PM51.toast(`${d.name} added`, `${kind === 'lsps' ? `It starts the next time you open a ${langName(d)} file.` : `It tidies ${files.slice(0, 2).join(', ')}${files.length > 2 ? '…' : ''} ${d.onSave ? 'when you save' : 'when you ask'}.`} Example only: nothing was ${d.from === 'install' ? 'installed' : 'started'} in this preview.`, 'info');
      }
    });
  }
  /* helper choices: a card picks; the ones that need more (a different tool, a path) open their fields in place */
  PM51.on('toolchain-w-lang', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, id = ds(el, 'lang'), l = langById(id);
    if (d.lang !== id) Object.assign(d, { lang: id, tool: id === OTHER ? 'custom' : null, name: '', from: id === OTHER ? 'path' : null, path: '', checked: '', files: l ? l.files.slice() : [], markers: l ? l.markers.join(', ') : '' });
    w.next();
  });
  PM51.on('toolchain-w-tool', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft, id = ds(el, 'tool');
    const reveal = el.closest('.o55g-main') && el.closest('.o55g-main').querySelector('[data-tt-reveal="custom"]');
    if (id === 'custom') {
      if (d.tool !== 'custom') Object.assign(d, { tool: 'custom', name: '', from: 'path', path: '', checked: '', args: '', config: '' });
      if (reveal) { reveal.hidden = false; const i = reveal.querySelector('.tt-w-name'); if (i) i.focus({ preventScroll: true }); reveal.scrollIntoView({ block: 'nearest', behavior: motionReduced() ? 'auto' : 'smooth' }); }
      return;
    }
    const t = toolOf(d.kind, Object.assign({}, d, { tool: id })); if (!t) return;
    if (d.tool !== id) Object.assign(d, { tool: id, name: t.name, from: null, path: '', checked: '', args: t.args, config: t.config });
    if (reveal) reveal.hidden = true;
    w.next();
  });
  PM51.on('toolchain-w-from', el => {
    const w = PM51.wizardOf(el); if (!w) return; const d = w.draft; d.from = ds(el, 'from');
    const block = el.closest('.o55g-main') && el.closest('.o55g-main').querySelector('.tt-path');
    if (d.from === 'path') { if (block) { block.hidden = false; const i = block.querySelector('.tt-path-input'); if (i) i.focus({ preventScroll: true }); block.scrollIntoView({ block: 'nearest', behavior: motionReduced() ? 'auto' : 'smooth' }); } return; }
    if (block) block.hidden = true;
    w.next();
  });
  PM51.on('toolchain-w-file', el => {
    const w = PM51.wizardOf(el); if (!w) return; const f = ds(el, 'file'), list = w.draft.files, i = list.indexOf(f);
    if (i >= 0) list.splice(i, 1); else list.push(f);
    el.classList.toggle('is-on', i < 0); el.setAttribute('aria-pressed', String(i < 0));
  });
  PM51.on('toolchain-w-when', el => {
    const w = PM51.wizardOf(el); if (!w) return; w.draft.onSave = el.dataset.value === 'save';
    el.parentElement.querySelectorAll('button').forEach(b => { const on = b === el; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    const help = el.closest('.pm51-field') && el.closest('.pm51-field').querySelector('.pm51-field-help');
    if (help) help.textContent = w.draft.onSave ? 'Each file is tidied as you save it.' : 'Use Format document, or ask the assistant to tidy a file.';
  });
  PM51.on('toolchain-w-flag', el => {
    const w = PM51.wizardOf(el); const flag = ds(el, 'flag'); if (!w || !['onPaste', 'changedLines'].includes(flag)) return;
    w.draft[flag] = !w.draft[flag]; el.classList.toggle('on', w.draft[flag]); el.setAttribute('aria-checked', String(w.draft[flag]));
  });
  /* Browse and Check, in the helper and in Edit */
  function showResult(block, text, tone, scroll = true) {
    const out = block && block.querySelector('.tt-path-result'); if (!out) return;
    out.hidden = false; out.dataset.tone = tone || 'ready';
    out.innerHTML = PM51.status(tone === 'attention' ? 'Not yet' : 'Answered', tone || 'ready') + `<span>${h(text)}</span>`;
    if (scroll) out.scrollIntoView({ block: 'nearest', behavior: motionReduced() ? 'auto' : 'smooth' });
  }
  const toolById = id => { for (const l of LANGS) for (const t of l.lsps.concat(l.formatters)) if (t.id === id) return t; return null; };
  PM51.on('toolchain-path-browse', el => {
    const block = el.closest('.tt-path'); if (!block) return; const input = block.querySelector('.tt-path-input'); const t = toolById(block.dataset.tool);
    input.value = t ? (t.found && !/^node_modules|^\.venv/.test(t.found) ? t.found.replace(/^~/, '/home/you') : `/usr/local/bin/${t.cmd}`) : '/usr/local/bin/' + (slug((PM51.wizardOf(el) || { draft: {} }).draft.name || 'tool'));
    input.dispatchEvent(new Event('input', { bubbles: true })); input.focus();
    const w = PM51.wizardOf(el); if (w) { w.draft.path = input.value; w.draft.checked = ''; }
    const out = block.querySelector('.tt-path-result'); if (out) out.hidden = true;
    PM51.toast('Picked a program', 'Example only: in the app this opens a file picker.', 'info');
  });
  PM51.on('toolchain-path-check', el => {
    const block = el.closest('.tt-path'); if (!block) return; const input = block.querySelector('.tt-path-input'), p = String(input.value || '').trim();
    const w = PM51.wizardOf(el);
    if (!p) { showResult(block, 'Type where the program is first, or use Browse.', 'attention'); input.focus(); return; }
    if (/\s/.test(p) && !/^(["'/~]|[A-Za-z]:\\)/.test(p)) { showResult(block, 'That looks like more than one word. Put the program here and anything after it under Options.', 'attention'); return; }
    const t = toolById(block.dataset.tool), name = p.split(/[\\/]/).pop();
    const text = `${p} answered as ${t ? `${t.name} ${t.v}` : name}. Example check: nothing on this computer was run.`;
    showResult(block, text, 'ready');
    if (w) { w.draft.path = p; w.draft.checked = text; }
  });
  PM51.on('toolchain-open-list', el => {
    const id = el && el.dataset ? el.dataset.setting : '';
    closeOverlay(false);
    if (id === S.fmtCatalog) PM51.setTab(ID, 'formatters'); else PM51.setTab(ID, 'servers');
    window.setTimeout(() => PM51.revealSetting(id || S.lspCatalog), 60);
  });

  /* ---------- shared behaviours ------------------------------------------ */
  function removeItem(kind, id, noun) {
    const item = byId(kind, id); if (!item) return;
    PM51.confirm(`Remove ${item.name}?`, `The ${noun} is taken off your list. Nothing is uninstalled from your computer.`, 'Remove', () => {
      tc()[kind] = tc()[kind].filter(x => x.id !== id);
      PM51.setSel(ID + '-' + kind, '');
      saveState(); PM51.refresh(ID, { swap: false });
      PM51.toast(`${item.name} removed`, 'It is no longer on your list.');
    }, true);
  }
  function openLogs(kind, id) {
    const item = byId(kind, id); if (!item) return;
    const lines = kind === 'lsps'
      ? [`10:42:01  Started ${item.command || item.name}`, `10:42:03  Found project markers: ${(item.rootMarkers || []).join(', ') || 'none'}`, item.status === 'attention' ? '10:47:19  Lost contact with the server. A restart is needed.' : '10:42:09  Ready. Indexed 1,204 files.']
      : [`10:40:12  ${item.executable || item.name} ready`, `10:40:12  Settings file: ${item.config || 'none'}`, '10:44:57  Formatted 3 files on save'];
    PM51.panel({
      title: `${item.name} logs`, subtitle: 'Example data only. Real logs appear here in the app.',
      body: PM51.panelSection('Recent lines', `<pre class="pm51-toolchain-log">${h(lines.join('\n'))}</pre>`) + PM51.note('Logs never include secrets. Anything sensitive is hidden before it is shown.', 'info')
    });
  }
  function readField(wrap, name) { const el = wrap.querySelector(`[data-field="${name}"]`); return el ? String(el.value || '').trim() : ''; }
  const area = (field, value, placeholder, rows = 3) => `<textarea class="form-textarea o55-setup-mono" data-field="${a(field)}" rows="${rows}" spellcheck="false" placeholder="${a(placeholder || '')}">${h(value || '')}</textarea>`;
  /* Edit: every detail the helper asked for, in one panel. A changed program is checked again before it counts as ready. */
  function editPanel(kind, x) {
    const K = KIND[kind], program = programOf(kind, x);
    const fmt = kind === 'formatters';
    PM51.panel({
      title: `Edit ${x.name}`, subtitle: fmt ? 'Changes apply the next time a file is tidied.' : 'Changes apply the next time the server starts.', icon: K.icon,
      body: PM51.panelSection('Name and language', PM51.field('Name', PM51.input(x.name, { data: { field: 'name' } })) + PM51.field(fmt ? 'Languages' : 'Language', PM51.input(languagesOf(kind, x).join(', '), { data: { field: 'language' } }), fmt ? 'Separate several with commas.' : ''))
        + PM51.panelSection('Program', pathBlock({ kind, tool: x.tool || x.id, value: program, placeholder: '/usr/local/bin/…' }) + `<p class="pm51-field-help">Where it came from: ${h(sourceLabel(x.source))}. A new program counts once it answers Check.</p>`, '', { icon: 'download' })
        + PM51.panelSection(fmt ? 'Files it tidies' : 'Files it handles', PM51.field('Files', PM51.input(filesOf(kind, x).join(', '), { data: { field: 'files' }, cls: 'o55-setup-mono' }), 'A star stands for any name. Separate several with commas.')
          + (fmt ? PM51.field('When it tidies', PM51.select(x.onSave ? 'save' : 'ask', [['save', 'Every time I save'], ['ask', 'Only when I ask']], { data: { field: 'when' }, label: 'When it tidies' })) : '')
          + PM51.field('Use it in', PM51.select(x.scope === 'User' ? 'User' : 'Project', [['Project', 'This project only'], ['User', 'All my projects']], { data: { field: 'scope' }, label: 'Use it in' })), '', { icon: 'file' })
        + PM51.panelSection(fmt ? 'How it runs' : 'How it starts', PM51.field(fmt ? 'Arguments' : 'Start arguments', PM51.input((x.args || []).join(' '), { data: { field: 'args' }, cls: 'o55-setup-mono', placeholder: 'None' }))
          + PM51.field('Environment values', area('env', envOf(x).join('\n'), 'NAME=value'), 'One NAME=value per line. Keep passwords out: these are saved as plain text.')
          + (fmt
            ? PM51.field('Settings file', PM51.input(x.config === 'None' ? '' : x.config, { data: { field: 'config' }, placeholder: 'None', cls: 'o55-setup-mono' })) + PM51.field('Ignore file', PM51.input(x.ignore === 'None' ? '' : x.ignore, { data: { field: 'ignore' }, placeholder: 'None', cls: 'o55-setup-mono' }))
            : PM51.field('Project markers', PM51.input((x.rootMarkers || []).join(', '), { data: { field: 'markers' }, cls: 'o55-setup-mono' }), 'Files that show where a project starts.') + PM51.field('Startup options', area('init', x.initOptions || '', '{ }'), 'JSON. Leave empty for the defaults.')), '', { icon: 'sliders' }),
      primaryLabel: 'Save',
      onPrimary: wrap => {
        const env = lines(readField(wrap, 'env')), bad = env.find(e => !ENV_RE.test(e));
        if (bad) { PM51.toast('One more thing', `"${bad}" needs to read NAME=value.`, 'info'); return false; }
        const init = readField(wrap, 'init'); if (init) { try { JSON.parse(init); } catch (e) { PM51.toast('One more thing', 'Startup options are not valid JSON.', 'info'); return false; } }
        const files = splitList(readField(wrap, 'files')); if (!files.length) { PM51.toast('One more thing', 'Name at least one kind of file.', 'info'); return false; }
        const name = readField(wrap, 'name'); if (name) x.name = name;
        const langs = readField(wrap, 'language').split(',').map(s => s.trim()).filter(Boolean);
        if (fmt) x.languages = langs.length ? langs : x.languages; else x.language = langs.join(', ') || x.language;
        const p = String((wrap.querySelector('.tt-path-input') || {}).value || '').trim();
        if (p !== program) { if (kind === 'lsps') x.command = p; else x.executable = p; x.source = 'Added by you'; const res = wrap.querySelector('.tt-path-result'); x.status = res && !res.hidden && res.dataset.tone === 'ready' ? 'ready' : 'setup'; if (kind === 'lsps') x.lastTest = x.status === 'ready' ? 'Passed' : 'Not checked yet'; }
        x.files = files; x.scope = readField(wrap, 'scope') || x.scope; x.args = splitWords(readField(wrap, 'args')); x.env = env;
        if (fmt) { x.onSave = readField(wrap, 'when') !== 'ask'; x.config = readField(wrap, 'config') || 'None'; x.ignore = readField(wrap, 'ignore') || 'None'; }
        else { x.rootMarkers = splitList(readField(wrap, 'markers')); x.initOptions = init; }
        saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Saved', `${x.name} was updated.`);
      }
    });
  }

  PM51.on('toolchain-pick', el => { PM51.setSel(ID + '-' + ds(el, 'kind'), ds(el, 'id')); state.resourceRosterOpen = false; PM51.swapDetail(ID, ds(el, 'id')); });

  /* language servers */
  PM51.on('toolchain-lsp-on', el => { const s = byId('lsps', ds(el, 'id')); if (!s) return; s.enabled = !isOn(s); saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-check-lsp', el => {
    const s = byId('lsps', ds(el, 'id')); if (!s) return;
    const restart = s.status === 'attention';
    PM51.check({
      title: `Check ${s.name}`,
      outcome: restart ? 'Needs a restart · example data' : undefined, tone: restart ? 'attention' : undefined,
      steps: [
        { title: 'Program found', desc: s.command || 'No program set' },
        { title: 'Server answers', desc: restart ? 'No reply. Restart it from the menu.' : 'Replied to a hello message', status: restart ? 'No reply' : 'Checked', tone: restart ? 'attention' : 'ready' },
        { title: 'Understands this project', desc: `Looks for ${(s.rootMarkers || []).join(', ') || 'project files'} and reads ${filesOf('lsps', s).join(', ') || 'its files'}`, status: 'Example', tone: 'info' }
      ]
    });
    if (!restart && s.status === 'setup') { s.status = 'ready'; s.lastTest = 'Passed'; saveState(); PM51.refresh(ID, { swap: false }); }
  });
  PM51.on('toolchain-add-lsp', () => toolWizard('lsps'));
  PM51.on('toolchain-edit-lsp', el => { const s = byId('lsps', ds(el, 'id')); if (s) editPanel('lsps', s); });

  /* formatters */
  PM51.on('toolchain-fmt-flag', el => { const f = byId('formatters', ds(el, 'id')); const flag = ds(el, 'flag'); if (!f || !['onSave', 'onPaste', 'changedLines'].includes(flag)) return; f[flag] = !f[flag]; saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-check-fmt', el => {
    const f = byId('formatters', ds(el, 'id')); if (!f) return;
    PM51.check({ title: `Check ${f.name}`, steps: [
      { title: 'Program found', desc: f.executable || 'No program set' },
      { title: 'Settings file read', desc: f.config && f.config !== 'None' ? f.config : 'Using built-in defaults' },
      { title: 'Formats a sample', desc: 'A small snippet is formatted and compared', status: 'Example', tone: 'info' }
    ] });
    if (f.status === 'setup') { f.status = 'ready'; saveState(); PM51.refresh(ID, { swap: false }); }
  });
  PM51.on('toolchain-add-fmt', () => toolWizard('formatters'));
  PM51.on('toolchain-edit-fmt', el => { const f = byId('formatters', ds(el, 'id')); if (f) editPanel('formatters', f); });

  /* agent tools */
  PM51.on('toolchain-tool-on', el => { const t = byId('agentTools', ds(el, 'id')); if (!t) return; t.enabled = !isOn(t); saveState(); PM51.refresh(ID, { swap: false }); });
  PM51.on('toolchain-tool-up', el => {
    const list = tc().agentTools.slice().sort((x, y) => (x.priority || 99) - (y.priority || 99));
    const i = list.findIndex(t => t.id === ds(el, 'id')); if (i <= 0) return;
    [list[i - 1], list[i]] = [list[i], list[i - 1]];
    list.forEach((t, n) => { t.priority = n + 1; });
    saveState(); PM51.refresh(ID, { swap: false });
  });
  PM51.onChange('toolchain-tool-permission', el => { const t = byId('agentTools', ds(el, 'id')); if (!t) return; t.permission = el.value; saveState(); });

  /* shared */
  PM51.on('toolchain-logs', el => openLogs(ds(el, 'kind'), ds(el, 'id')));
  PM51.on('toolchain-diagnostics', el => {
    const kind = ds(el, 'kind');
    const title = kind === 'formatters' ? 'Formatter diagnostics' : kind === 'agentTools' ? 'Agent tool diagnostics' : 'Language server diagnostics';
    PM51.check({ title, steps: [
      { title: 'Settings readable', desc: 'Every entry on your list has a name and a way to start' },
      { title: 'Programs on this computer', desc: 'Each program is looked up on your computer', status: 'Example', tone: 'info' },
      { title: 'Project matches', desc: 'Tools are matched to the languages in this project', status: 'Example', tone: 'info' }
    ] });
  });
  /* Find tools: what this project uses, what is covered, and a one-click start for what is missing. */
  PM51.on('toolchain-discover', () => {
    const here = LANGS.filter(l => l.here);
    const missing = kind => here.filter(l => !tc()[kind].some(x => languagesOf(kind, x).some(n => langFor(n) === l)));
    const ml = missing('lsps'), mf = missing('formatters');
    const first = ml[0] ? ['lsps', ml[0]] : mf[0] ? ['formatters', mf[0]] : null;
    PM51.panel({
      title: 'Find tools in this project', subtitle: 'Example data only. In the app this looks at your project files.', icon: 'search',
      body: PM51.panelSection('What this project uses', PM51.steps([
        { title: 'Project files read', desc: 'Cargo.toml, package.json, svelte.config.js, pyproject.toml', status: 'Checked', tone: 'ready' },
        { title: 'Languages found', desc: here.map(l => l.name).join(', '), status: 'Checked', tone: 'ready' },
        { title: 'Language servers', desc: ml.length ? `Nothing yet for ${ml.map(l => l.name).join(', ')}` : 'Every language has one', status: ml.length ? 'Missing' : 'Covered', tone: ml.length ? 'attention' : 'ready' },
        { title: 'Formatters', desc: mf.length ? `Nothing yet for ${mf.map(l => l.name).join(', ')}` : 'Every language has one', status: mf.length ? 'Missing' : 'Covered', tone: mf.length ? 'attention' : 'ready' }
      ])) + (first ? '' : PM51.note('Nothing new to add. Everything this project uses already has a tool.', 'info')),
      primaryLabel: first ? `Add a ${KIND[first[0]].noun} for ${first[1].name}` : '',
      onPrimary: first ? () => { window.setTimeout(() => toolWizard(first[0], { lang: first[1].id, files: first[1].files.slice(), markers: first[1].markers.join(', ') }), 30); } : null
    });
  });
  PM51.on('toolchain-reset', () => PM51.confirm('Reset toolchain defaults?', 'Your language servers, formatters, and agent tools go back to how Puppet Master found them.', 'Reset', () => {
    tc().lsps = clone(DEFAULTS.lsps); tc().formatters = clone(DEFAULTS.formatters); tc().agentTools = clone(DEFAULTS.agentTools);
    ['lsps', 'formatters'].forEach(k => PM51.setSel(ID + '-' + k, ''));
    saveState(); PM51.refresh(ID, { swap: false }); PM51.toast('Toolchain reset', 'Defaults are back.');
  }));
  PM51.on('toolchain-help', () => PM51.panel({
    title: 'How the toolchain works',
    body: PM51.panelSection('In short', '<p class="pm51-ps-text">Puppet Master looks at the files in your project and picks helpers for each language. You can add your own, turn any of them off, or check that one is working.</p>')
      + PM51.panelSection('The three kinds', PM51.kv([['Language servers', 'Understand your code so the assistant can jump to definitions, spot errors, and rename safely.'], ['Formatters', 'Tidy code so it always looks the same, on save or when you ask.'], ['Agent tools', 'Things the assistant can use on its own, like the built-in browser.']]))
      + PM51.panelSection('Adding one', '<p class="pm51-ps-text">Add walks you through it: the language, the tool most people use for it, where the program comes from (already on this computer, installed for you, or one you point to), which files it handles, and any start options.</p>')
      + PM51.panelSection('Good to know', '<p class="pm51-ps-text">Removing a tool here only takes it off the list. Nothing is uninstalled from your computer.</p>')
  }));
})();
