/* DOCKER_DATA: the Docker Manager panel (#panel-docker) carried over from Concepts/PMConcept7.html, every row and
   data-demo-action / data-demo-arg pair kept as written, plus the canon additions listed in DATA.md (Execution Host /
   Environment / Source Location context, readiness words, Networks, Volumes, Contexts, conditional Kubernetes,
   Docker/Hosts link), each marked canon: '<PlanUnit id>'. Data only; see DATA.md for the schema.
   Fields beyond DATA.md: metrics, ports (item); status (section); canon on context lines. Every container action in
   the original already used the canonical cmd.docker.container.* ids, so no data-legacy-cmd was needed. */

const DOCKER_DATA = {
  id: 'docker',
  target: 'panel-docker',
  title: 'Docker Manager',
  icon: 'docker',
  hover: { label: 'Docker context', detail: 'context: default — unix:///var/run/docker.sock' },
  context: {
    lines: [
      {
        text: 'Home Server · Docker Engine · default context', menu: 'context', canon: 'CRAU-100',
        hover: { label: 'Where Docker runs', detail: 'Execution Host: Home Server (this computer). Execution Environment: Docker Engine through the default context. Source Location: Projects/tastebook.' },
      },
      { text: 'Ready · 6 running, 2 exited, 1 restarting', canon: 'CRAU-103' },
    ],
    facts: [
      ['Execution Host', 'Home Server (this computer)', { canon: 'CRAU-100' }],
      ['Execution Environment', 'Docker Engine · default context', { canon: 'CRAU-100' }],
      ['Source Location', 'Projects/tastebook', { mono: true, canon: 'CRAU-100' }],
      ['Readiness', 'ready', { state: 'ok', canon: 'CRAU-103' }],
      ['Readiness proof', 'engine handshake checked 12 seconds ago', { canon: 'CRAU-103' }],
      ['Docker context', 'default', { mono: true }],
      ['Endpoint', 'unix:///var/run/docker.sock', { mono: true, group: 'Technical details' }],
    ],
    state: { state: 'ok', word: 'ready' },
  },
  actions: [
    { label: 'Open Docker/Hosts page', icon: 'external', cmd: 'cmd.docker.hosts.open', arg: 'cmd.docker.hosts.open -> Docker/Hosts page (Overview, Instances, Host Lab)', canon: 'F3-410' },
  ],
  status: { state: 'failed', word: '1 crash loop · 6 running' },

  menus: {
    /* #shCtxMenu */
    context: {
      id: 'context', label: 'Docker context', value: 'default',
      groups: [
        {
          items: [
            { value: 'default', label: 'default', meta: '9 containers · local', icon: 'docker', selected: true, cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> default (9 containers)', attrs: { 'data-value': 'default', 'data-label': 'default' } },
            { value: 'unraid', label: 'unraid-tower', meta: 'SSH · 7 containers', icon: 'docker', cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> unraid-tower (ssh://tower:2376)', attrs: { 'data-value': 'unraid', 'data-label': 'unraid-tower' } },
            { value: 'colima', label: 'colima', meta: 'offline', icon: 'docker', cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> colima (daemon unreachable)', attrs: { 'data-value': 'colima', 'data-label': 'colima' } },
          ],
        },
        {
          label: 'colima is offline',
          items: [
            { label: 'Virtual machine not running: start Colima and retry', icon: 'play', cmd: 'demo.toast', arg: 'colima: starting vm, then retrying context connect' },
          ],
        },
      ],
    },
  },

  views: [
    /* ------------------------------------------------------------------ Containers */
    {
      id: 'containers', label: 'Containers', icon: 'layers',
      summary: '6 running · 2 exited · 1 restarting',
      count: 9,
      attention: { state: 'failed', text: 'import-worker is in a crash loop' },
      toolbar: [
        { label: 'Context: default', icon: 'docker', menu: 'context', attrs: { 'data-pm-hover-label': 'Docker context and source', 'data-pm-hover-detail': 'default — unix:///var/run/docker.sock' } },
      ],
      sections: [
        {
          id: 'containers', label: 'Containers', count: '6 running · 2 exited · 1 restarting', open: true, kind: 'list',
          items: [
            {
              id: 'ctr:tastebook-api-batch', kind: 'container', name: 'tastebook-api-batch',
              status: { state: 'ok', word: 'running' },
              meta: ['port 8080', 'up 3 hours', 'healthy'],
              metrics: [{ label: 'CPU', value: 12, text: '12%' }, { label: 'Memory', value: 34, text: '34%' }],
              ports: [{ label: '8080 → 8080', cmd: 'demo.toast', arg: 'Opening http://localhost:8080 in browser' }],
              facts: [
                ['Image', 'jared/tastebook-api:1.4.2-rc.1', { mono: true }],
                ['Image digest', 'sha256:9f2c4b8a1e77', { mono: true, group: 'Technical details' }],
                ['Container ID', '3f9c2a71d0b4', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> api' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> tastebook-api-batch' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> tastebook-api-batch' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> tastebook-api-batch (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id 3f9c2a71d0b4' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied jared/tastebook-api:1.4.2-rc.1@sha256:9f2c4b8a1e77' },
              ],
            },
            {
              id: 'ctr:tastebook-import-worker-batch', kind: 'container', name: 'tastebook-import-worker-batch',
              status: { state: 'ok', word: 'running' },
              meta: ['up 3 hours', 'idle', 'draining queue'],
              metrics: [{ label: 'CPU', value: 6, text: '6%' }, { label: 'Memory', value: 49, text: '49%' }],
              facts: [
                ['Image', 'jared/tastebook-import-worker:1.4.2-rc.1', { mono: true }],
                ['Image digest', 'sha256:3a7d0c', { mono: true, group: 'Technical details' }],
                ['Container ID', '71be09d2c4aa', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> worker' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> tastebook-import-worker-batch' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> tastebook-import-worker-batch' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> tastebook-import-worker-batch (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id 71be09d2c4aa' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied jared/tastebook-import-worker:1.4.2-rc.1@sha256:3a7d0c' },
              ],
            },
            {
              id: 'ctr:postgres-16-alpine-primary', kind: 'container', name: 'postgres-16-alpine-primary',
              status: { state: 'ok', word: 'running' },
              meta: ['port 5432', 'up 2 days', 'primary'],
              metrics: [{ label: 'CPU', value: 8, text: '8%' }, { label: 'Memory', value: 41, text: '41%' }],
              ports: [{ label: '5432 → 5432', cmd: 'demo.toast', arg: 'Copied localhost:5432 (postgres connection)' }],
              facts: [
                ['Image', 'postgres:16.3-alpine3.19', { mono: true }],
                ['Image digest', 'sha256:c1f09e2b', { mono: true, group: 'Technical details' }],
                ['Container ID', 'c9d47e01ab52', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> postgres' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> postgres-16-alpine-primary (dependent services will pause)' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> postgres-16-alpine-primary' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> postgres-16-alpine-primary (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id c9d47e01ab52' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied postgres:16.3-alpine3.19@sha256:c1f09e2b' },
              ],
            },
            {
              id: 'ctr:redis', kind: 'container', name: 'redis',
              status: { state: 'stopped', word: 'exited' },
              meta: ['exited 41 minutes ago'],
              facts: [
                ['Image', 'redis:7.2-alpine3.19', { mono: true }],
                ['Image digest', 'sha256:d0a51f3e', { mono: true, group: 'Technical details' }],
                ['Container ID', 'e2f81c6b9d03', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Start', icon: 'play', primary: true, cmd: 'cmd.docker.container.start', arg: 'cmd.docker.container.start -> redis' },
                { label: 'Logs', icon: 'terminal', cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> redis (last 50 lines)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id e2f81c6b9d03' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied redis:7.2-alpine3.19@sha256:d0a51f3e' },
              ],
            },
            {
              id: 'ctr:import-worker', kind: 'container', name: 'import-worker',
              status: { state: 'failed', word: 'crash loop' },
              meta: ['restarting, attempt 3 of 5', 'crash loop'],
              metrics: [{ label: 'CPU', value: 74, text: '74%', state: 'warn' }, { label: 'Memory', value: 47, text: '47%' }],
              note: "crash loop — thread 'import::normalize_units::tests::mixed_fraction_does_not_explode' panicked at src/services/import.rs:58:9",
              facts: [
                ['Image', 'jared/tastebook-import-worker:1.4.2-rc.1', { mono: true }],
                ['Image digest', 'sha256:3a7d0c', { mono: true, group: 'Technical details' }],
                ['Container ID', 'b4a6d8f217c9', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> import-worker (crash loop, tail 200)' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> import-worker (breaks the restart loop)' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> import-worker' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id b4a6d8f217c9' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied jared/tastebook-import-worker:1.4.2-rc.1@sha256:3a7d0c' },
              ],
            },
            {
              id: 'ctr:ghcr-io-jared-tastebook-web-mirror', kind: 'container', name: 'ghcr-io-jared-tastebook-web-mirror',
              status: { state: 'ok', word: 'running' },
              meta: ['port 8081', 'up 22 hours'],
              metrics: [{ label: 'CPU', value: 9, text: '9%' }, { label: 'Memory', value: 22, text: '22%' }],
              ports: [{ label: '8081 → 80', cmd: 'demo.toast', arg: 'Opening http://localhost:8081 in browser' }],
              facts: [
                ['Image', 'ghcr.io/jared/tastebook-web:edge-2026.07.24', { mono: true }],
                ['Image digest', 'sha256:77be41', { mono: true, group: 'Technical details' }],
                ['Container ID', '5d0c3b9e84f1', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> web mirror' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> web mirror' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> web mirror' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> web mirror (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id 5d0c3b9e84f1' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied ghcr.io/jared/tastebook-web:edge-2026.07.24@sha256:77be41' },
              ],
            },
            {
              id: 'ctr:tastebook-import-worker-1', kind: 'container', name: 'tastebook-import-worker-1',
              status: { state: 'ok', word: 'running' },
              meta: ['up 41 minutes', 'draining queue'],
              metrics: [{ label: 'CPU', value: 63, text: '63%' }, { label: 'Memory', value: 58, text: '58%' }],
              facts: [
                ['Image', 'jared/tastebook-import-worker:1.4.2-rc.1', { mono: true }],
                ['Image digest', 'sha256:3a7d0c', { mono: true, group: 'Technical details' }],
                ['Container ID', 'a8e5f02d67b3', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> import-worker-1' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> import-worker-1 (queue persists)' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> import-worker-1' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> import-worker-1 (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id a8e5f02d67b3' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied jared/tastebook-import-worker:1.4.2-rc.1@sha256:3a7d0c' },
              ],
            },
            {
              id: 'ctr:registry-cache-pull-through', kind: 'container', name: 'registry-cache-pull-through',
              status: { state: 'ok', word: 'running' },
              meta: ['port 5001', 'up 2 days'],
              metrics: [{ label: 'CPU', value: 2, text: '2%' }, { label: 'Memory', value: 9, text: '9%' }],
              ports: [{ label: '5001 → 5000', cmd: 'demo.toast', arg: 'Opening http://localhost:5001/v2/_catalog in browser' }],
              facts: [
                ['Image', 'registry:2.8', { mono: true }],
                ['Image digest', 'sha256:f2e8a91d', { mono: true, group: 'Technical details' }],
                ['Container ID', 'f7c1e9a34d68', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> registry cache' },
                { label: 'Stop', icon: 'stop', cmd: 'cmd.docker.container.stop', arg: 'cmd.docker.container.stop -> registry cache' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> registry cache' },
                { label: 'Open shell', icon: 'terminal', cmd: 'cmd.docker.container.attach_shell', arg: 'cmd.docker.container.attach_shell -> registry cache (opens bottom terminal)' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id f7c1e9a34d68' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied registry:2.8@sha256:f2e8a91d' },
              ],
            },
            {
              id: 'ctr:postgres-16-alpine-replica', kind: 'container', name: 'postgres-16-alpine-replica',
              status: { state: 'stopped', word: 'exited 137' },
              meta: ['exited with code 137', '3 hours ago'],
              facts: [
                ['Image', 'postgres:16.3-alpine3.19', { mono: true }],
                ['Image digest', 'sha256:c1f09e2b', { mono: true, group: 'Technical details' }],
                ['Container ID', '08d2b5c7f9e4', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Start', icon: 'play', primary: true, cmd: 'cmd.docker.container.start', arg: 'cmd.docker.container.start -> postgres replica' },
                { label: 'Logs', icon: 'terminal', cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> postgres replica' },
                { label: 'Copy container ID', icon: 'copy', cmd: 'demo.toast', arg: 'Copied container id 08d2b5c7f9e4' },
                { label: 'Copy image reference', icon: 'clipboard', cmd: 'demo.toast', arg: 'Copied postgres:16.3-alpine3.19@sha256:c1f09e2b' },
              ],
            },
          ],
        },
        {
          id: 'fleet', label: 'Fleet summary', count: '9 containers', open: false, kind: 'list',
          items: [
            { id: 'fleet:cpu', kind: 'summary', name: 'Average CPU', meta: ['25%'], metrics: [{ label: 'CPU average', value: 25, text: '25%' }] },
            { id: 'fleet:memory', kind: 'summary', name: 'Average memory', meta: ['37%'], metrics: [{ label: 'Memory average', value: 37, text: '37%' }] },
          ],
          actions: [
            { label: 'Show images', icon: 'camera', cmd: 'demo.toast', arg: 'Showing images' },
            { label: 'Show compose', icon: 'compose', cmd: 'demo.toast', arg: 'Showing compose' },
            { label: 'Clean up', icon: 'trash', cmd: 'cmd.docker.cleanup.scan', arg: 'cmd.docker.cleanup.scan -> dry-run frees 1.2 GB' },
          ],
        },
        {
          id: 'events', label: 'Recent events', count: 3, open: false, kind: 'list',
          items: [
            { id: 'event:import-worker', kind: 'event', name: 'import-worker restarting', meta: ['attempt 3 of 5 · out of memory'], status: { state: 'running', word: 'restarting' } },
            { id: 'event:replica', kind: 'event', name: 'postgres-16-alpine-replica exited', meta: ['killed for out of memory (137) · 3 hours ago'], status: { state: 'warn', word: 'exited' } },
            { id: 'event:web-mirror', kind: 'event', name: 'ghcr-io-jared-tastebook-web-mirror healthy', meta: ['port 8081 · up 22 hours'], status: { state: 'ok', word: 'healthy' } },
          ],
        },
      ],
      notes: ['Logs stream into the Docker terminal group below.'],
    },

    /* ------------------------------------------------------------------ Images */
    {
      id: 'images', label: 'Images', icon: 'camera',
      summary: '8 images · 2.33 GB · refreshed 30 seconds ago',
      count: 8,
      toolbar: [
        { label: 'Show dangling layers only', icon: 'filter', cmd: 'demo.toast', arg: 'Filter: dangling only — 1 layer, 74 MB' },
      ],
      sections: [
        {
          id: 'images', label: 'Images', count: '8 images · 2.33 GB', open: true, kind: 'list',
          note: '8 images · 2.33 GB · refreshed 30 seconds ago',
          actions: [
            { label: 'Pull', icon: 'pull', cmd: 'demo.toast', arg: 'Pull latest: postgres:16-alpine (already up to date)' },
            { label: 'Clean up', icon: 'trash', cmd: 'cmd.docker.cleanup.scan', arg: 'cmd.docker.cleanup.scan -> dry-run frees 1.2 GB' },
          ],
          items: [
            {
              id: 'img:jared/tastebook:v1.1', kind: 'image', name: 'jared/tastebook:v1.1', mono: true,
              status: { state: 'ok', word: 'in use' }, meta: ['412 MB', 'used by web (compose)'],
              facts: [['Created', '3 days ago'], ['Used by', 'web (compose)'], ['Digest', 'sha256:8c1d22f0a9b3', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> jared/tastebook:v1.1' },
                { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> jared/tastebook:v1.1' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> jared/tastebook:v1.1' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> jared/tastebook:v1.1 (confirm)' },
              ],
            },
            {
              id: 'img:tastebook-worker:v1.1', kind: 'image', name: 'tastebook-worker:v1.1', mono: true,
              status: { state: 'ok', word: 'in use' }, meta: ['388 MB', 'used by worker (compose)'],
              facts: [['Created', '3 days ago'], ['Used by', 'worker (compose)'], ['Digest', 'sha256:5b90e4a2c7d1', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> tastebook-worker:v1.1' },
                { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> tastebook-worker:v1.1' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> tastebook-worker:v1.1' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> tastebook-worker:v1.1 (confirm)' },
              ],
            },
            {
              id: 'img:postgres:16-alpine', kind: 'image', name: 'postgres:16-alpine', mono: true,
              status: { state: 'info', word: 'unused' }, meta: ['243 MB', 'no containers'],
              facts: [['Created', '5 weeks ago'], ['Used by', 'no containers — superseded by 16.3-alpine3.19'], ['Digest', 'sha256:41ab7c3d90e2', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> postgres:16-alpine' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> postgres:16-alpine' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> postgres:16-alpine (confirm)' },
              ],
            },
            {
              id: 'img:redis:7-alpine', kind: 'image', name: 'redis:7-alpine', mono: true,
              status: { state: 'info', word: 'unused' }, meta: ['41 MB', 'no containers'],
              facts: [['Created', '5 weeks ago'], ['Used by', 'no containers — superseded by 7.2-alpine3.19'], ['Digest', 'sha256:77c0b1ea5f39', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> redis:7-alpine' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> redis:7-alpine' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> redis:7-alpine (confirm)' },
              ],
            },
            {
              id: 'img:jared/tastebook-api:1.4.2-rc.1', kind: 'image', name: 'jared/tastebook-api:1.4.2-rc.1', mono: true,
              status: { state: 'ok', word: 'in use' }, meta: ['298 MB', 'used by tastebook-api-batch'],
              facts: [['Created', '2 days ago'], ['Used by', 'tastebook-api-batch'], ['Digest', 'sha256:9f2c4b8a1e77', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> jared/tastebook-api:1.4.2-rc.1' },
                { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> jared/tastebook-api:1.4.2-rc.1' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> jared/tastebook-api:1.4.2-rc.1' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> jared/tastebook-api:1.4.2-rc.1 (confirm: in use)' },
              ],
            },
            {
              id: 'img:jared/tastebook-import-worker:1.4.2-rc.1', kind: 'image', name: 'jared/tastebook-import-worker:1.4.2-rc.1', mono: true,
              status: { state: 'ok', word: 'in use by 3 containers' }, meta: ['312 MB', 'used by 3 containers'],
              facts: [['Created', '2 days ago'], ['Used by', 'import-worker · import-worker-1 · tastebook-import-worker-batch'], ['Digest', 'sha256:3a7d0c8b62f4', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> jared/tastebook-import-worker:1.4.2-rc.1' },
                { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> jared/tastebook-import-worker:1.4.2-rc.1' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> jared/tastebook-import-worker:1.4.2-rc.1' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> jared/tastebook-import-worker:1.4.2-rc.1 (confirm: in use by 3 containers)' },
              ],
            },
            {
              id: 'img:postgres:16.3-alpine3.19', kind: 'image', name: 'postgres:16.3-alpine3.19', mono: true,
              status: { state: 'ok', word: 'in use by 2 containers' }, meta: ['247 MB', 'used by 2 containers'],
              facts: [['Created', '2 weeks ago'], ['Used by', 'postgres-16-alpine-primary · postgres-16-alpine-replica'], ['Digest', 'sha256:c1f09e2b4d86', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> postgres:16.3-alpine3.19' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> postgres:16.3-alpine3.19' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> postgres:16.3-alpine3.19 (confirm: in use by 2 containers)' },
              ],
            },
            {
              id: 'img:ghcr.io/jared/tastebook-web:edge-2026.07.24', kind: 'image', name: 'ghcr.io/jared/tastebook-web:edge-2026.07.24', mono: true,
              status: { state: 'ok', word: 'in use' }, meta: ['386 MB', 'used by ghcr-io-jared-tastebook-web-mirror'],
              facts: [['Created', '3 days ago'], ['Used by', 'ghcr-io-jared-tastebook-web-mirror'], ['Digest', 'sha256:77be41d5a2c8', { mono: true, group: 'Technical details' }]],
              actions: [
                { label: 'Tag', icon: 'pin', cmd: 'cmd.docker.image.tag', arg: 'cmd.docker.image.tag -> ghcr.io/jared/tastebook-web:edge-2026.07.24' },
                { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> ghcr.io/jared/tastebook-web:edge-2026.07.24' },
                { label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.image.inspect', arg: 'cmd.docker.image.inspect -> ghcr.io/jared/tastebook-web:edge-2026.07.24' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.image.delete', arg: 'cmd.docker.image.delete -> ghcr.io/jared/tastebook-web:edge-2026.07.24 (confirm: in use)' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Compose */
    {
      id: 'compose', label: 'Compose', icon: 'compose',
      summary: 'tastebook · 5 of 7 up · 1 stale scenario',
      count: 7,
      sections: [
        {
          id: 'project', label: 'Compose project', count: 'tastebook', open: true, kind: 'facts',
          status: { state: 'ok', word: 'configuration valid' },
          items: [
            { id: 'compose:project', kind: 'fact', name: 'Project', meta: ['tastebook'] },
            {
              id: 'compose:file', kind: 'fact', name: 'Compose file', mono: true, meta: ['deploy/tastebook.compose.yml'],
              actions: [{ label: 'Open compose file in editor', icon: 'external', cmd: 'cmd.docker.compose.open_file', arg: 'cmd.docker.compose.open_file -> deploy/tastebook.compose.yml' }],
            },
            { id: 'compose:env', kind: 'fact', name: 'Env file', mono: true, meta: ['.env'] },
            { id: 'compose:profiles', kind: 'fact', name: 'Profiles', mono: true, meta: ['dev', 'full'] },
            { id: 'compose:state', kind: 'fact', name: 'State', meta: ['5 of 7 up · configuration valid · checked 12 seconds ago'], status: { state: 'ok', word: '5 of 7 up' } },
          ],
        },
        {
          id: 'services', label: 'Services', count: '5 of 7 up', open: true, kind: 'list',
          actions: [
            { label: 'Up', icon: 'play', primary: true, cmd: 'cmd.docker.compose.up', arg: 'cmd.docker.compose.up -> project tastebook (7 services)' },
            { label: 'Down', icon: 'stop', cmd: 'cmd.docker.compose.down', arg: 'cmd.docker.compose.down -> project tastebook (confirm: remove-orphans option)' },
            { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.compose.restart', arg: 'cmd.docker.compose.restart -> project tastebook' },
          ],
          items: [
            {
              id: 'svc:db', kind: 'service', name: 'db', meta: ['postgres:16'],
              status: { state: 'ok', word: 'running' },
              ports: [{ label: '5432 → 5432', cmd: 'demo.toast', arg: 'Copied localhost:5432 (postgres connection)' }],
              facts: [
                ['Image', 'postgres:16.3-alpine3.19', { mono: true }],
                ['State', 'running · healthy · up 2 days'],
                ['Depends on', 'nothing'],
                ['Image digest', 'sha256:c1f09e2b', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service db' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service db' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: db' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: db' },
              ],
            },
            {
              id: 'svc:cache', kind: 'service', name: 'cache', meta: ['redis:7'],
              status: { state: 'ok', word: 'running' },
              ports: [{ label: '6379 → 6379', cmd: 'demo.toast', arg: 'Copied localhost:6379 (redis)' }],
              facts: [
                ['Image', 'redis:7.2-alpine3.19', { mono: true }],
                ['State', 'running · up 3 hours'],
                ['Depends on', 'nothing'],
                ['Image digest', 'sha256:d0a51f3e', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service cache' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service cache' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: cache' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: cache' },
              ],
            },
            {
              id: 'svc:web', kind: 'service', name: 'web', meta: ['tastebook:v1.1', 'stale: will recreate on Up'],
              status: { state: 'stale', word: 'stale' },
              ports: [{ label: '5173 → 5173', cmd: 'demo.toast', arg: 'Opening http://localhost:5173 in browser' }],
              facts: [
                ['Image', 'jared/tastebook:v1.1', { mono: true }],
                ['State', 'running · up 9 hours'],
                ['Drift', 'configuration hash changed; will recreate on Up', { state: 'stale' }],
                ['Depends on', 'db, cache', { mono: true }],
                ['Image digest', 'sha256:8c1d22f0', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service web' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service web' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: web (recreates stale container)' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: web' },
              ],
            },
            {
              id: 'svc:worker', kind: 'service', name: 'worker', meta: ['worker:v1.1'],
              status: { state: 'ok', word: 'running' },
              facts: [
                ['Image', 'tastebook-worker:v1.1', { mono: true }],
                ['State', 'running · up 41 minutes'],
                ['Depends on', 'db, cache', { mono: true }],
                ['Image digest', 'sha256:5b90e4a2', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service worker' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service worker' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: worker' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: worker' },
              ],
            },
            {
              id: 'svc:import-worker', kind: 'service', name: 'import-worker', meta: ['tastebook-import-worker:1.4.2-rc.1'],
              status: { state: 'failed', word: 'restarting' },
              facts: [
                ['Image', 'jared/tastebook-import-worker:1.4.2-rc.1', { mono: true }],
                ['State', 'restarting, attempt 3 of 5 · last exit 137', { state: 'failed' }],
                ['Depends on', 'db', { mono: true }],
                ['Image digest', 'sha256:3a7d0c', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service import-worker (tail 200)' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service import-worker' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: import-worker' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: import-worker (breaks the restart loop)' },
              ],
            },
            {
              id: 'svc:migrations', kind: 'service', name: 'migrations', meta: ['sqlx migrate · done'],
              status: { state: 'ok', word: 'done' },
              facts: [
                ['Image', 'jared/tastebook-migrate:1.4.2-rc.1', { mono: true }],
                ['State', 'exited 0 · one-shot · 12 seconds ago'],
                ['Depends on', 'db', { mono: true }],
                ['Image digest', 'sha256:6e2d91bc', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service migrations' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: migrations (re-runs one-shot)' },
              ],
            },
            {
              id: 'svc:registry-cache', kind: 'service', name: 'registry-cache', meta: ['registry:2 · pull-through'],
              status: { state: 'ok', word: 'running' },
              ports: [{ label: '5001 → 5000', cmd: 'demo.toast', arg: 'Opening http://localhost:5001/v2/_catalog in browser' }],
              facts: [
                ['Image', 'registry:2.8', { mono: true }],
                ['State', 'running · up 2 days'],
                ['Depends on', 'nothing'],
                ['Image digest', 'sha256:f2e8a91d', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Logs', icon: 'terminal', primary: true, cmd: 'cmd.docker.container.view_logs', arg: 'cmd.docker.container.view_logs -> compose service registry-cache' },
                { label: 'Restart', icon: 'refresh', cmd: 'cmd.docker.container.restart', arg: 'cmd.docker.container.restart -> compose service registry-cache' },
                { label: 'Up this service', icon: 'play', cmd: 'cmd.docker.compose.up_subset', arg: 'cmd.docker.compose.up_subset -> services: registry-cache' },
                { label: 'Down this service', icon: 'stop', cmd: 'cmd.docker.compose.down_subset', arg: 'cmd.docker.compose.down_subset -> services: registry-cache' },
              ],
            },
          ],
        },
        {
          id: 'scenarios', label: 'Scenarios', count: 3, open: true, kind: 'list',
          items: [
            {
              id: 'scenario:dev', kind: 'scenario', name: 'dev — web + db', meta: ['ports 5173, 5432'],
              status: { state: 'ok', word: 'ready' },
              ports: [
                { label: '5173 → 5173', cmd: 'demo.toast', arg: 'Opening http://localhost:5173 in browser' },
                { label: '5432 → 5432', cmd: 'demo.toast', arg: 'Copied localhost:5432 (postgres connection)' },
              ],
              facts: [['Services', 'web, db', { mono: true }], ['Profiles', 'dev', { mono: true }], ['Env file', '.env', { mono: true }], ['Last run', 'yesterday · ok']],
              actions: [
                { label: 'Run', icon: 'play', primary: true, cmd: 'cmd.docker.compose.scenario.run', arg: 'cmd.docker.compose.scenario.run -> dev' },
                { label: 'Edit', icon: 'edit', cmd: 'cmd.docker.compose.scenario.edit', arg: 'cmd.docker.compose.scenario.edit -> dev' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.compose.scenario.delete', arg: 'cmd.docker.compose.scenario.delete -> dev (confirm)' },
              ],
            },
            {
              id: 'scenario:import-load-x3', kind: 'scenario', name: 'import-load x3', meta: ['compose changed'],
              status: { state: 'stale', word: 'stale' },
              blocked: {
                code: 'compose_invalid',
                reason: 'compose_invalid — profile "load" lost service import-worker in the last compose edit',
                allowed: [
                  { label: 'Repair', icon: 'edit', primary: true, cmd: 'cmd.docker.compose.scenario.edit', arg: 'cmd.docker.compose.scenario.edit -> import-load x3 (repair compose_invalid binding)' },
                ],
              },
              facts: [['Services', 'import-worker x3, db, cache', { mono: true }], ['Profiles', 'load', { mono: true }], ['Env file', '.env.load', { mono: true }], ['Last run', '3 days ago · ok']],
              actions: [
                { label: 'Repair', icon: 'edit', primary: true, cmd: 'cmd.docker.compose.scenario.edit', arg: 'cmd.docker.compose.scenario.edit -> import-load x3 (repair compose_invalid binding)' },
                { label: 'Run', icon: 'play', cmd: 'cmd.docker.compose.scenario.run', arg: 'cmd.docker.compose.scenario.run -> import-load x3', disabled: 'compose_invalid — repair the scenario first' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.compose.scenario.delete', arg: 'cmd.docker.compose.scenario.delete -> import-load x3 (confirm)' },
              ],
            },
            {
              id: 'scenario:multi-arch', kind: 'scenario', name: 'multi-arch publish dry-run — amd64 + arm64', meta: ['buildx bake · manifest-list digests'],
              status: { state: 'ok', word: 'ready' },
              facts: [['Services', 'web, worker', { mono: true }], ['Platforms', 'linux/amd64, linux/arm64', { mono: true }], ['Profiles', 'full', { mono: true }], ['Env file', '.env', { mono: true }], ['Last run', '2 days ago · digests ok']],
              actions: [
                { label: 'Run', icon: 'play', primary: true, cmd: 'cmd.docker.compose.scenario.run', arg: 'cmd.docker.compose.scenario.run -> multi-arch dry-run' },
                { label: 'Edit', icon: 'edit', cmd: 'cmd.docker.compose.scenario.edit', arg: 'cmd.docker.compose.scenario.edit -> multi-arch dry-run' },
                { label: 'Delete', icon: 'trash', danger: true, cmd: 'cmd.docker.compose.scenario.delete', arg: 'cmd.docker.compose.scenario.delete -> multi-arch dry-run (confirm)' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Registries */
    {
      id: 'registries', label: 'Registries', icon: 'globe',
      summary: '3 connected · 2 not configured',
      count: 5,
      sections: [
        {
          id: 'registries', label: 'Registries', count: 5, open: true, kind: 'list',
          actions: [
            { label: 'Browse jared/tastebook', icon: 'globe', cmd: 'demo.toast', arg: 'Browsing Docker Hub: jared/tastebook' },
          ],
          items: [
            {
              id: 'reg:docker-hub', kind: 'registry', name: 'Docker Hub', meta: ['jared'],
              status: { state: 'ok', word: 'authenticated' },
              facts: [['Endpoint', 'registry-1.docker.io', { mono: true }], ['Auth', 'jared · personal access token expires January 2027'], ['Capabilities', 'push and pull'], ['Last push', 'jared/tastebook:v1.1 · 3 days ago', { mono: true }]],
              actions: [
                { label: 'Browse', icon: 'globe', cmd: 'demo.toast', arg: 'Browsing Docker Hub: jared/*' },
                { label: 'Reconnect', icon: 'refresh', cmd: 'demo.toast', arg: 'Reconnecting Docker Hub (token refresh)' },
                { label: 'Disconnect', icon: 'x', danger: true, cmd: 'demo.toast', arg: 'Disconnect Docker Hub (confirm)' },
              ],
            },
            {
              id: 'reg:localhost-5000', kind: 'registry', name: 'localhost:5000', mono: true, meta: ['cache mirror'],
              status: { state: 'ok', word: 'reachable' },
              facts: [['Endpoint', 'http://localhost:5000', { mono: true }], ['Auth', 'anonymous · LAN only'], ['Capabilities', 'pull-through cache of docker.io'], ['Last sync', '4 minutes ago']],
              actions: [
                { label: 'Browse', icon: 'globe', cmd: 'demo.toast', arg: 'Browsing localhost:5000/v2/_catalog' },
                { label: 'Reconnect', icon: 'refresh', cmd: 'demo.toast', arg: 'Reconnecting localhost:5000' },
                { label: 'Disconnect', icon: 'x', danger: true, cmd: 'demo.toast', arg: 'Disconnect localhost:5000 (confirm)' },
              ],
            },
            {
              id: 'reg:ghcr', kind: 'registry', name: 'ghcr.io', mono: true, meta: ['token missing'],
              status: { state: 'warn', word: 'not configured' },
              facts: [['Endpoint', 'ghcr.io', { mono: true }], ['Auth', 'none · personal access token needs packages: write'], ['Capabilities', 'pull (public only) · no push']],
              actions: [
                { label: 'Sign in with browser', icon: 'external', primary: true, cmd: 'cmd.docker.browser_login', arg: 'cmd.docker.browser_login -> ghcr.io (device flow in browser)' },
                { label: 'Save personal access token', icon: 'key', cmd: 'cmd.docker.save_pat', arg: 'cmd.docker.save_pat -> ghcr.io (stored in OS keychain)' },
              ],
            },
            {
              id: 'reg:unraid-local', kind: 'registry', name: 'registry.unraid.local:5000', mono: true, meta: ['LAN'],
              status: { state: 'ok', word: 'reachable' },
              facts: [['Endpoint', 'http://registry.unraid.local:5000', { mono: true }], ['Auth', 'anonymous · LAN only'], ['Capabilities', 'push and pull'], ['Last push', 'jared/tastebook:v1.1 · 2 weeks ago', { mono: true }]],
              actions: [
                { label: 'Browse', icon: 'globe', cmd: 'demo.toast', arg: 'Browsing registry.unraid.local:5000/v2/_catalog' },
                { label: 'Reconnect', icon: 'refresh', cmd: 'demo.toast', arg: 'Reconnecting registry.unraid.local:5000' },
                { label: 'Disconnect', icon: 'x', danger: true, cmd: 'demo.toast', arg: 'Disconnect registry.unraid.local:5000 (confirm)' },
              ],
            },
            {
              id: 'reg:quay', kind: 'registry', name: 'quay.io', mono: true, meta: ['no push'],
              status: { state: 'warn', word: 'not configured' },
              facts: [['Endpoint', 'quay.io', { mono: true }], ['Auth', 'none'], ['Capabilities', 'pull only']],
              actions: [
                { label: 'Browse', icon: 'globe', cmd: 'demo.toast', arg: 'Browsing quay.io (public catalog)' },
                { label: 'Reconnect', icon: 'refresh', cmd: 'demo.toast', arg: 'Reconnecting quay.io' },
                { label: 'Disconnect', icon: 'x', danger: true, cmd: 'demo.toast', arg: 'Disconnect quay.io (confirm)' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Build / Bake */
    {
      id: 'build', label: 'Build / Bake', icon: 'flame',
      summary: 'Target runtime · jared/tastebook:v1.2 · not built yet',
      sections: [
        {
          id: 'build', label: 'Build / Bake', open: true, kind: 'list',
          actions: [
            { label: 'Build image', icon: 'flame', primary: true, cmd: 'cmd.docker.build.image', arg: 'cmd.docker.build.image -> building runtime (buildx, amd64+arm64)' },
          ],
          items: [
            { id: 'build:target', kind: 'fact', name: 'Target', mono: true, meta: ['runtime'] },
            { id: 'build:tag', kind: 'fact', name: 'Tag', mono: true, meta: ['jared/tastebook:v1.2'] },
            { id: 'build:digest', kind: 'fact', name: 'Digest', meta: ['not built yet'], status: { state: 'pending', word: 'not built yet' } },
            {
              id: 'build:advanced', kind: 'build-target', name: 'Advanced', meta: ['Dockerfile · context · platforms · build arguments'],
              facts: [
                ['Dockerfile', 'deploy/Dockerfile', { mono: true }],
                ['Context', '.', { mono: true }],
                ['Platforms', 'linux/amd64, linux/arm64', { mono: true }],
                ['Build arguments', 'RUST_PROFILE=release · SQLX_OFFLINE=true', { mono: true }],
              ],
              actions: [
                { label: 'Open Dockerfile in editor', icon: 'external', cmd: 'cmd.docker.open_dockerfile', arg: 'cmd.docker.open_dockerfile -> deploy/Dockerfile' },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Publish / Unraid */
    {
      id: 'publish', label: 'Publish / Unraid', icon: 'upload',
      summary: 'v1.2 to Unraid · waiting for the build',
      count: 5,
      sections: [
        {
          id: 'chain', label: 'Publish chain', count: 'v1.2 to Unraid', open: true, kind: 'chain',
          actions: [
            { label: 'Push', icon: 'upload', cmd: 'cmd.docker.image.push', arg: 'cmd.docker.image.push -> jared/tastebook:v1.2 (digest receipt on success)', disabled: 'image not built yet' },
            { label: 'Commit template', icon: 'check', cmd: 'cmd.docker.template.commit', arg: 'cmd.docker.template.commit -> template committed' },
            { label: 'Push template', icon: 'push', cmd: 'cmd.docker.template.push', arg: 'cmd.docker.template.push -> pushing template repo' },
          ],
          items: [
            {
              id: 'stage:1', kind: 'stage', name: 'Local build', meta: ['step 1', 'current step'],
              status: { state: 'pending', word: 'pending' }, open: true,
              facts: [['Receipt', 'pending — build not run'], ['Target', 'jared/tastebook:v1.2 · runtime', { mono: true }]],
            },
            {
              id: 'stage:2', kind: 'stage', name: 'Push tag and digest', meta: ['step 2'],
              status: { state: 'pending', word: 'pending' },
              facts: [['Receipt', 'pending — blocked by: build not run']],
            },
            {
              id: 'stage:3', kind: 'stage', name: 'Docker Hub repository jared/tastebook', meta: ['step 3'],
              status: { state: 'ok', word: 'exists' },
              facts: [['Repository', 'docker.io/jared/tastebook', { mono: true }], ['Verified', '2026-07-25 14:02']],
            },
            {
              id: 'stage:4', kind: 'stage', name: 'Unraid template repository', meta: ['step 4'],
              status: { state: 'ok', word: 'ready' },
              facts: [['Template', 'github.com/jared/unraid-templates · tastebook.xml', { mono: true }], ['Commit', '91acd4e · 2 days ago', { mono: true }]],
            },
            {
              id: 'stage:5', kind: 'stage', name: 'Unraid follow-on', meta: ['step 5'],
              status: { state: 'pending', word: 'waiting' },
              facts: [['Receipt', 'pending — blocked by: push not run']],
            },
          ],
          note: 'Repository creation is a hard gate · digest receipts recorded · partial chains show a missing-link marker.',
        },
      ],
    },

    /* ------------------------------------------------------------------ Networks (canon) */
    {
      id: 'networks', label: 'Networks', icon: 'link',
      summary: '3 networks · tastebook_default carries 7 containers',
      count: 3,
      canon: 'CRAU-009',
      sections: [
        {
          id: 'networks', label: 'Networks', count: 3, open: true, kind: 'list', canon: 'CRAU-009',
          note: 'Network commands are reserved but not registered yet, so these rows are read-only.',
          items: [
            {
              id: 'net:tastebook_default', kind: 'network', name: 'tastebook_default', mono: true, meta: ['bridge', '7 containers', 'compose project tastebook'],
              status: { state: 'ok', word: 'in use' },
              facts: [['Driver', 'bridge'], ['Subnet', '172.20.0.0/16', { mono: true }], ['Network ID', '6c1e0f4a92bd', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.network.inspect', disabled: 'Network commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
            {
              id: 'net:bridge', kind: 'network', name: 'bridge', mono: true, meta: ['default bridge', '2 containers'],
              status: { state: 'ok', word: 'in use' },
              facts: [['Driver', 'bridge'], ['Subnet', '172.17.0.0/16', { mono: true }], ['Network ID', '0b3d71e8c5a4', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.network.inspect', disabled: 'Network commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
            {
              id: 'net:host', kind: 'network', name: 'host', mono: true, meta: ['host network', 'no containers'],
              status: { state: 'info', word: 'unused' },
              facts: [['Driver', 'host'], ['Network ID', 'e47a02c9b18f', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.network.inspect', disabled: 'Network commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Volumes (canon) */
    {
      id: 'volumes', label: 'Volumes', icon: 'stash',
      summary: '3 volumes · 2.45 GB · 1 unused',
      count: 3,
      canon: 'CRAU-009',
      sections: [
        {
          id: 'volumes', label: 'Volumes', count: 3, open: true, kind: 'list', canon: 'CRAU-009',
          note: 'Volume commands are reserved but not registered yet, so these rows are read-only.',
          items: [
            {
              id: 'vol:tastebook_pgdata', kind: 'volume', name: 'tastebook_pgdata', mono: true, meta: ['local', '1.8 GB', 'used by postgres-16-alpine-primary'],
              status: { state: 'ok', word: 'in use' },
              facts: [['Driver', 'local'], ['Size', '1.8 GB'], ['Used by', 'postgres-16-alpine-primary'], ['Mount point', '/var/lib/docker/volumes/tastebook_pgdata/_data', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.volume.inspect', disabled: 'Volume commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
            {
              id: 'vol:tastebook_registry-cache', kind: 'volume', name: 'tastebook_registry-cache', mono: true, meta: ['local', '640 MB', 'used by registry-cache-pull-through'],
              status: { state: 'ok', word: 'in use' },
              facts: [['Driver', 'local'], ['Size', '640 MB'], ['Used by', 'registry-cache-pull-through'], ['Mount point', '/var/lib/docker/volumes/tastebook_registry-cache/_data', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.volume.inspect', disabled: 'Volume commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
            {
              id: 'vol:anonymous', kind: 'volume', name: 'Anonymous volume', meta: ['local', '12 MB', 'no containers'],
              status: { state: 'info', word: 'unused' },
              facts: [['Driver', 'local'], ['Size', '12 MB'], ['Used by', 'no containers'], ['Volume name', '3f1d9a7c0e5b4d28a61f', { mono: true, group: 'Technical details' }]],
              actions: [{ label: 'Inspect', icon: 'eye', cmd: 'cmd.docker.volume.inspect', disabled: 'Volume commands are reserved but not registered yet', canon: 'CRAU-009' }],
              canon: 'CRAU-009',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Contexts (canon) */
    {
      id: 'contexts', label: 'Contexts', icon: 'monitor',
      summary: '3 contexts · default ready · colima unreachable',
      count: 3,
      attention: { state: 'failed', text: 'colima is unreachable' },
      canon: 'CRAU-009',
      sections: [
        {
          id: 'contexts', label: 'Contexts', count: 3, open: true, kind: 'list', canon: 'CRAU-009',
          items: [
            {
              id: 'ctx:default', kind: 'context', name: 'default', mono: true, meta: ['local', '9 containers', 'current'],
              status: { state: 'ok', word: 'ready' },
              facts: [
                ['Execution Host', 'Home Server (this computer)', { canon: 'CRAU-100' }],
                ['Execution Environment', 'Docker Engine', { canon: 'CRAU-100' }],
                ['Readiness', 'ready', { state: 'ok', canon: 'CRAU-103' }],
                ['Endpoint', 'unix:///var/run/docker.sock', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Use this context', icon: 'check', primary: true, cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> default (9 containers)' },
              ],
              canon: 'CRAU-103',
            },
            {
              id: 'ctx:unraid-tower', kind: 'context', name: 'unraid-tower', mono: true, meta: ['SSH', '7 containers'],
              status: { state: 'ok', word: 'ready' },
              facts: [
                ['Execution Host', 'unraid-tower (SSH)', { canon: 'CRAU-100' }],
                ['Execution Environment', 'Docker Engine on Unraid', { canon: 'CRAU-101' }],
                ['Readiness', 'ready', { state: 'ok', canon: 'CRAU-103' }],
                ['Endpoint', 'ssh://tower:2376', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Use this context', icon: 'check', primary: true, cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> unraid-tower (ssh://tower:2376)' },
              ],
              canon: 'CRAU-103',
            },
            {
              id: 'ctx:colima', kind: 'context', name: 'colima', mono: true, meta: ['offline', 'cached 2 hours ago · read-only'],
              status: { state: 'failed', word: 'unreachable' },
              blocked: {
                code: 'runtime_context_unreachable',
                reason: 'The Colima virtual machine is not running, so its daemon cannot be reached. Showing the last cached state, read-only.',
                allowed: [
                  { label: 'Start Colima and retry', icon: 'play', primary: true, cmd: 'demo.toast', arg: 'colima: starting vm, then retrying context connect', canon: 'CRAU-099' },
                ],
                canon: 'CRAU-099',
              },
              facts: [
                ['Readiness', 'unavailable', { state: 'failed', canon: 'CRAU-103' }],
                ['Diagnosis', 'not running', { canon: 'CRAU-099' }],
                ['Last cached', '2 hours ago · 3 containers', { state: 'stale' }],
                ['Reason code', 'runtime_context_unreachable · not_running', { mono: true, group: 'Technical details' }],
              ],
              actions: [
                { label: 'Start Colima and retry', icon: 'play', primary: true, cmd: 'demo.toast', arg: 'colima: starting vm, then retrying context connect', canon: 'CRAU-099' },
                { label: 'Use this context', icon: 'check', cmd: 'cmd.docker.context.select', arg: 'cmd.docker.context.select -> colima (daemon unreachable)' },
              ],
              canon: 'CRAU-099',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ Kubernetes (canon, conditional) */
    {
      id: 'kubernetes', label: 'Kubernetes', icon: 'cog',
      summary: 'Hidden: no Kubernetes manifests, Helm charts or cluster state in this project',
      canon: 'CRAU-014',
      conditional: {
        shown: false,
        why: 'Kubernetes appears when this project has Kubernetes manifests, Helm charts or saved cluster state. tastebook has none yet.',
        action: { label: 'Show Kubernetes', icon: 'eye', cmd: 'cmd.docker.k8s.select_context', arg: 'cmd.docker.k8s.select_context -> choose a cluster context to show Kubernetes for this project (cluster-wide view stays off)', canon: 'CRAU-014' },
      },
      sections: [],
      empty: {
        kind: 'not_relevant',
        text: 'No Kubernetes manifests, Helm charts or cluster state found in this project.',
        action: { label: 'Show Kubernetes', icon: 'eye', cmd: 'cmd.docker.k8s.select_context', arg: 'cmd.docker.k8s.select_context -> choose a cluster context to show Kubernetes for this project (cluster-wide view stays off)', canon: 'CRAU-014' },
      },
    },
  ],
};
