# Settings Layout Consult: Providers, Servers & Remote Access

## 1. Providers › Services › Account rows

### Proposal 1A — Two-band fixed grid with `Edit` / `Close`

```text
+---------------------------------------------------------------------------------------------------+
| Accounts                                                                        [ + Add account ] |
+---------------------------------------------------------------------------------------------------+
| 1  Work Claude   Used first                              ● Ready        [ ↑ ] [ ↓ ]   [  Edit  ]  |
|    Playty Team · Browser sign-in                                                                  |
|    5-hour    78% · Resets 1h 42m          Weekly    54% · Resets 4d 11h                           |
|    [============================--------] [=====================---------------]                  |
+---------------------------------------------------------------------------------------------------+
| 2  Personal                                              ● Limit reached [ ↑ ] [ ↓ ]  [  Edit  ]  |
|    Personal Max · Browser sign-in                                                                 |
|    5-hour   100% · Resets 54m             Weekly    61%                                           |
|    [====================================] [=======================-------------]                  |
+---------------------------------------------------------------------------------------------------+
| 3  Lab                                                   ● Ready        [ ↑ ] [ ↓ ]   [  Edit  ]  |
|    lab@orbit.example · Browser sign-in                                                            |
|    Weekly    31% · Resets 2d 23h                                                                  |
|    [===========-------------------------]                                                         |
+---------------------------------------------------------------------------------------------------+
| 4  Studio                                                ● Needs sign-in [ ↑ ] [ ↓ ]  [  Edit  ]  |
|    studio@orbit.example · Browser sign-in                                                         |
|    Signed out · Sign in again to use this account                                    [ Sign in ]  |
+---------------------------------------------------------------------------------------------------+
| (When Edit is clicked, the button reads [ Close ] and opens below the bars:)                      |
|    MODELS ON THIS ACCOUNT  Default model [v] · Model toggles                                      |
|    THIS ACCOUNT            Nickname · Use this account · Sign-in method · Region/Key · Jobs · Bill|
|    WHEN IT RUNS LOW        Switch level · Sharing work · Rest after limit · Retries               |
|    FOR EXPERTS             Account type · Quota profile · Key storage · Auth surface              |
|    [ Use for next run ]  [ Sign out ]                                                 [ Remove ]  |
+---------------------------------------------------------------------------------------------------+
```

- **Labels:** `Accounts`, `1`..`4`, `Used first`, `5-hour`, `Weekly`, `Resets 1h 42m`, `Browser sign-in`, `Models on this account`, `This account`, `When it runs low`, `For experts`
- **Buttons:** `+ Add account`, `↑`, `↓`, `Edit` / `Close`, `Sign in`, `Use for next run`, `Sign out`, `Remove`
- **Statuses (fixed 120px non-wrapping column):** `● Ready`, `● Limit reached`, `● Needs sign-in`, `● Not in use`, `● Needs a seat`
- **Why it is easier:** A fixed two-column meter band makes every bar one width (even single windows), stops statuses wrapping, and replaces the third arrow with plain `Edit`.

### Proposal 1B — Fixed two-band rows with `Manage` side sheet

```text
+----------------------------------------------------------+  +-------------------------------------+
| Accounts                               [ + Add account ] |  | Work Claude                 [  ×  ] |
+----------------------------------------------------------+  | Claude · Playty Team                |
| 1  Work Claude  Used first     ● Ready    [↑][↓][Manage] |  +-------------------------------------+
|    Playty Team · Browser sign-in                         |  | MODELS                              |
|    5-hour  78% · 1h 42m     Weekly  54% · 4d 11h         |  | Default model   [ Claude Sonnet v ] |
|    [=================-----] [=============---------]     |  | Claude Opus 4              [ ON ]   |
+----------------------------------------------------------+  | Claude Sonnet 4            [ ON ]   |
| 2  Personal                    ● Limit reached [↑][↓]... |  +-------------------------------------+
|    Personal Max · Browser sign-in                        |  | THIS ACCOUNT                        |
|    5-hour 100% · 54m        Weekly  61%                  |  | Nickname        [ Work Claude     ] |
|    [======================] [===============-------]     |  | Use this account           [ ON ]   |
+----------------------------------------------------------+  | How it signs in [ Claude.ai     v ] |
| 3  Lab                         ● Ready    [↑][↓][Manage] |  | Jobs · Billing · Account default    |
|    lab@orbit.example · Browser sign-in                   |  +-------------------------------------+
|    Weekly  31% · 2d 23h                                  |  | WHEN IT RUNS LOW  /  FOR EXPERTS    |
|    [=======---------------]                              |  +-------------------------------------+
+----------------------------------------------------------+  | [Use next] [Sign out] [Remove][Done]|
```

- **Labels:** Same row and group labels as 1A; sheet title `<Account name>`, subtitle `<Service> · <Identity>`
- **Buttons:** `+ Add account`, `↑`, `↓`, `Manage`, `Use for next run`, `Sign out`, `Remove`, `Done`
- **Statuses:** Same non-wrapping statuses as 1A
- **Why it is easier:** Only `↑` and `↓` sit on each row, all accounts stay visible at once, and details open in the app's existing side sheet.

---

## 2. "Add a service"

### Proposal 2A — Grouped gallery dialog with billing tabs and search

```text
+---------------------------------------------------------------------------------------------------+
| Add a service                                                                              [ × ]  |
| [ Search services or models (Claude, Qwen, Ollama...)                                          ]  |
| [ Plans I pay for (13) ]  Pay as you go (6)   Free & local (3)   All (22)                         |
+---------------------------------------------------------------------------------------------------+
| MOST COMMON                                                                                       |
| +--------------------------------------------+   +--------------------------------------------+   |
| | [C ] Claude                        ● Ready |   | [C/] ChatGPT / Codex               ● Ready |   |
| |      Claude Pro, Max, or Team plan         |   |      ChatGPT Plus or Pro plan              |   |
| |      Browser sign-in              [ Open ] |   |      Browser sign-in or API key   [ Open ] |   |
| +--------------------------------------------+   +--------------------------------------------+   |
| +--------------------------------------------+   +--------------------------------------------+   |
| | [GA] Google Antigravity  ● Needs attention |   | [GC] GitHub Copilot     ● Needs attention  |   |
| |      Google subscription                   |   |      Copilot seat                          |   |
| |      Google sign-in               [ Open ] |   |      GitHub sign-in               [ Open ] |   |
| +--------------------------------------------+   +--------------------------------------------+   |
| MORE CODING PLANS                                                                                 |
| +--------------------------------------------+   +--------------------------------------------+   |
| | [GB] Grok Build            ● Not installed |   | [CU] Cursor                                |   |
| |      xAI subscription                      |   |      Cursor plan                           |   |
| |      xAI sign-in                [ Set up ] |   |      Browser sign-in or key     [ Set up ] |   |
| +--------------------------------------------+   +--------------------------------------------+   |
| (Scrolls: Muse Code, Alibaba Coding/Token, Z.AI, Kimi Code, MiniMax M, OpenCode Go)               |
+---------------------------------------------------------------------------------------------------+
| Not listed?  [ Add custom service... ]                                               [ Cancel ]   |
+---------------------------------------------------------------------------------------------------+
```

- **Tabs & groups:** `Plans I pay for (13)` (`Most common`, `More coding plans`), `Pay as you go (6)` (`API keys · billed by use`), `Free & local (3)` (`Free & on your computer`), `All (22)`
- **Entry facts:** Icon, name, status if added (`● Ready`, `● Needs attention`, `● Not installed`), 3–5 word billing note, connection method (`Browser sign-in`, `Plan key`, `API key`, `Network address`, `Free routes`)
- **Buttons:** `Set up`, `Open`, `Add custom service…` (opens existing 3-field custom form), `Cancel`
- **Why it is easier:** Beginners start from how they pay, see what each service needs before clicking, and never confuse monthly plans with pay-by-use APIs.

### Proposal 2B — Existing side sheet with searchable grouped rows

```text
+--------------------------------------------------------------------+
| Add a service                                               [ × ]  |
| [ Search services or models...                                  ]  |
+--------------------------------------------------------------------+
| PLANS YOU PAY FOR                                                  |
| [C ] Claude                 Browser sign-in     ● Ready   [ Open ] |
| [C/] ChatGPT / Codex        Browser or key      ● Ready   [ Open ] |
| [GA] Google Antigravity     Google sign-in    ● Attention [ Open ] |
| [GB] Grok Build             xAI sign-in                   [Set up] |
| ... (Cursor, Copilot, Muse, Alibaba x2, Z.AI, Kimi, MiniMax, Go)   |
+--------------------------------------------------------------------+
| PAY AS YOU GO (API KEYS)                                           |
| [AN] Anthropic API          Billed by use · Key           [Set up] |
| [GM] Gemini API             Free tier / Key               [Set up] |
| ... (Vertex AI, xAI API, Meta Model API, OpenCode Console)         |
+--------------------------------------------------------------------+
| FREE & ON YOUR COMPUTER                                            |
| [FM] Free Models            Free routes         ● Ready   [ Open ] |
| [OC] OpenCode server        Your server                   [Set up] |
| [LO] Local model server     Ollama / LM Studio            [Set up] |
+--------------------------------------------------------------------+
| Custom service              OpenAI-compatible server      [ Add… ] |
+--------------------------------------------------------------------+
```

- **Labels:** `Add a service`, `Plans you pay for`, `Pay as you go (API keys)`, `Free & on your computer`, `Custom service`
- **Buttons & statuses:** `Set up`, `Open`, `Add…`; `● Ready`, `● Attention`, `● Off`
- **Why it is easier:** Uses the existing side sheet to group all 22 services plus custom servers into one scannable, filterable list.

---

## 3. Servers & Remote Access

### Proposal 3A — 5 tabs with 4-part Setup Strip and unified `Link Servers`

**Tabs:** `Overview` | `Link Servers` | `Connect Devices` | `Away From Home` | `Move & Copy`

```text
                       [ Overview ]  Link Servers  Connect Devices  Away From Home  Move & Copy

+-------------------------+-------------------------+-------------------------+-------------------------+
| FILES STORED ON         | WORK RUNS ON            | STEERED FROM            | AWAY FROM HOME          |
| Home TrueNAS            | 7 computers             | 3 devices               | Tailscale               |
| /mnt/Cursor/Puppet ...  | ● 6 ready · 1 offline   | Desktop, Laptop, Phone  | ● Ready · Local now     |
+-------------------------+-------------------------+-------------------------+-------------------------+

+-------------------------------------------------------------------------------------------------------+
| This project                                                                                          |
+-------------------------------------------------------------------------------------------------------+
| Files live on (Home server)                                                      [ Home TrueNAS   v ] |
| Project folder                                    Server folder · /mnt/Cursor/Puppet Master [Change…] |
| Default work computer                                              [ Automatic (Home server)      v ] |
+-------------------------------------------------------------------------------------------------------+
> More options   (Execution environments · File authority · Sync mode · Technical details)
Check server and devices   How servers and devices work
```

**`Link Servers` — NAS + 7 work computers (Puppet Master & SSH unified) and opened detail:**

```text
+----------------------------------+--------------------------------------------------------------------+
| LINKED COMPUTERS (8) [+ Link]    | Linux Build 1   ● Connected             [ Open web UI ]   [ ... ]  |
| [ Filter computers             ] | Work computer · 192.168.50.41 · Puppet Master 0.8.0                |
|                                  +--------------------------------------------------------------------+
| HOME & STORAGE                   | Role                Runs work · Not home server                    |
| [HT] Home TrueNAS              ● | Runs work                                                 [  ON  ] |
|      Home · Files only           | Default for new workspaces                                [  OFF ] |
|                                  | Version             0.8.0  ● Update ready        [ App Updates -> ]|
| WORK COMPUTERS (7)               | Signs in with       Paired · no key needed        [ Attach a key ] |
| [WW] Windows Workstation       ● | Connection          Checked 1 min ago          [ Test connection ] |
|      Runs work · This PC         |                                                                    |
| [UV] Ubuntu VM                 ● | > More options   (Claimed · Identity · Trust · Deployment · Envs)  |
|      Runs work · SSH             |                                                                    |
| [MS] Mac Studio                ● |  (... menu: Connect · Rename · Restart · Update… · Back up… ·      |
|      Runs work                   |   Remove; unclaimed servers show the 4-step Claim flow here.)      |
| >[L1] Linux Build 1            ● |                                                                    |
|      Runs work · Update          |                                                                    |
| [L2] Linux Build 2             ● |                                                                    |
| [ML] Mini PC Lab · SSH         ● |                                                                    |
| [OR] Office Rig · Offline      ● |                                                                    |
+----------------------------------+--------------------------------------------------------------------+
| SSH keys (2)                                                                           [ + Add key ]  |
| [key] id_ed25519 · Ed25519 · Used by Ubuntu VM, Mini PC Lab, GitHub      [ Copy public key ]  [ ... ] |
| [key] id_rsa     · RSA 2048 · Not attached · Older key type              [ Copy public key ]  [ ... ] |
+-------------------------------------------------------------------------------------------------------+
```

- **Option homes:** `Overview` (status strip, Home server, Project folder, Default work computer, More options); `Link Servers` (all servers + SSH computers, Claim flow, SSH keys); `Connect Devices` (Paired devices, `+ Connect a device` QR/code, Pending requests, Continue on another device, Trust/History/Revoke all); `Away From Home` (5 ordered routes, Headscale, Funnel, Technical details); `Move & Copy` (Move/Copy/Import, history, Conflicts).
- **Exact words:** `Files stored on`, `Work runs on`, `Steered from`, `Away from home`, `Files live on (Home server)`, `Project folder`, `Default work computer`, `+ Link`, `+ Connect a device`, `Home · Files only`, `Runs work · SSH`, `Open web UI`, `Attach a key`, `Test connection`.
- **Why it is easier:** The 4-cell strip answers files, work computers, steering devices, and away access in one glance, while `Link Servers` unifies all 8 machines in one searchable list.

### Proposal 3B — 4 tabs (`Move & Copy` on Tab 1) + full-width list on `Link Servers`

**Tabs:** `Workspace & Files` | `Link Servers` | `Connect Devices` | `Away From Home`

```text
                    [ Workspace & Files ]  Link Servers  Connect Devices  Away From Home

+-------------------------+-------------------------+-------------------------+-------------------------+
| FILES STORED ON         | WORK RUNS ON            | STEERED FROM            | AWAY FROM HOME          |
| Home TrueNAS            | 7 computers             | 3 devices               | Tailscale               |
| /mnt/Cursor/Puppet ...  | ● 6 ready · 1 offline   | Desktop, Laptop, Phone  | ● Ready · Local now     |
+-------------------------+-------------------------+-------------------------+-------------------------+
| Files & execution                                                                                     |
| Home server (stores files)                                                       [ Home TrueNAS   v ] |
| Project folder                                    Server folder · /mnt/Cursor/Puppet Master [Change…] |
| Default work computer                                              [ Automatic (Home server)      v ] |
+-------------------------------------------------------------------------------------------------------+
| Move, copy & conflicts                                                                                |
| Move to another server                                                                    [ Move…   ] |
| Make a copy                                                                               [ Copy…   ] |
| Import from an SSH computer                                                               [ Import… ] |
| When both sides changed                                                   [ Keep both and pause   v ] |
| Open conflicts                                                                         0  [ View    ] |
| Moves and copies                                                                      None yet        |
+-------------------------------------------------------------------------------------------------------+
> More options   (Execution environments · File authority · Sync mode · Technical details)
```

**`Link Servers` — full-width scannable list with an SSH work computer opened inline:**

```text
+-------------------------------------------------------------------------------------------------------+
| Linked computers (8)                      [ Filter computers... ]                 [ + Link a server ] |
+-------------------------------------------------------------------------------------------------------+
| COMPUTER                       JOB               LINK           STATUS                                |
| [HT] Home TrueNAS              Files · Home      Paired         ● Connected              [ Details ]  |
| [WW] Windows Workstation       Runs work         This PC        ● Connected              [ Details ]  |
| [UV] Ubuntu VM                 Runs work         SSH · ed25519  ● Connected              [  Close  ]  |
|   +-------------------------------------------------------------------------------------------------+ |
|   | Address   ubuntu@192.168.50.200 · /home/ubuntu/projects                               [ Edit  ] | |
|   | Runs work                                                                              [  ON  ] | |
|   | Signs in  SSH key id_ed25519                                                     [ Change key ] | |
|   | Connection                                                                             [ Test ] | |
|   |                                                                                      [ Remove ] | |
|   +-------------------------------------------------------------------------------------------------+ |
| [MS] Mac Studio                Runs work         Paired         ● Connected              [ Details ]  |
| [L1] Linux Build 1             Runs work         Paired · 0.8.0 ● Update ready           [ Details ]  |
| [L2] Linux Build 2             Runs work         Paired         ● Connected              [ Details ]  |
| [ML] Mini PC Lab               Runs work         SSH · ed25519  ● Connected              [ Details ]  |
| [OR] Office Rig                Runs work         Paired         ● Offline                [ Details ]  |
+-------------------------------------------------------------------------------------------------------+
| SSH keys (2)                                                                           [ + Add key ]  |
```

- **Option homes:** `Workspace & Files` folds `Move & Copy` and `Conflicts` beneath the workspace card; `Link Servers`, `Connect Devices`, and `Away From Home` hold all remaining options identically to 3A.
- **Exact words:** `Workspace & Files`, `Link Servers`, `Connect Devices`, `Away From Home`, `Computer`, `Job`, `Link`, `Status`, `Files · Home`, `Runs work`, `Paired`, `SSH · ed25519`, `Details`, `Close`.
- **Why it is easier:** Merging two sparse tabs into `Workspace & Files` keeps file actions next to file storage, and a full-width list displays all 7 work computers plus the NAS without squeezing them into a narrow sidebar.

---

## 4. Selected row in a left-hand list (services, personas, servers)

### Proposal 4A — Soft accent tint + 1px accent outline + bare dot

```text
  RESTING   +----------------------------------+
            | [GA]  Google Antigravity         |  Transparent bg, no border
            |       Needs attention          ● |  Dark icon box (--k3-surface-2), bare 7px dot
            +----------------------------------+

  HOVER     +----------------------------------+
            | [C/]  ChatGPT / Codex            |  Subtle lift (60% --k3-surface-2)
            |       Ready · 3 accounts       ● |  Icon box and bare dot unchanged
            +----------------------------------+

  SELECTED  +==================================+
            | [C ]  Claude                     |  14% accent tint over dark surface + 1px 45% border
            |       Ready · 3 of 4 accounts  ● |  Dark icon box stays crisp (subtle accent edge)
            +==================================+  White title, readable sub, bare 7px dot (no box)
```

- **Exact styling:** Selected fill `color-mix(in srgb, var(--k3-accent) 14%, var(--k3-surface-1))`, `1px solid` 45% accent outline (9px radius, no side stripe), preserved dark icon box, bare 7px circular status dot with no box-shadow.
- **Why it is easier:** A dark tinted surface keeps icons sharp and lets coloured status dots pop naturally without needing a square box around them.

### Proposal 4B — Elevated neutral charcoal card + accent icon glyph

```text
  RESTING   +----------------------------------+
            | [GA]  Google Antigravity         |  Transparent bg, muted icon tile, bare 7px dot
            |       Needs attention          ● |
            +----------------------------------+

  HOVER     +----------------------------------+
            | [C/]  ChatGPT / Codex            |  4% white overlay, bare 7px dot
            |       Ready · 3 accounts       ● |
            +----------------------------------+

  SELECTED  +----------------------------------+
            | [C ]  Claude                     |  Elevated --k3-surface-2 + 1px --k3-line-strong border
            |       Ready · 3 of 4 accounts  ● |  Recessed dark icon box with accent glyph, bare dot
            +----------------------------------+
```

- **Exact styling:** Neutral elevated `--k3-surface-2` fill, 1px crisp border, accent-tinted glyph inside dark icon tile, bare 7px dot.
- **Why it is easier:** Keeping blue off list selections eliminates visual clutter so toggles and primary buttons stand out right away.

---

## 5. High-payoff polish for little change

### Proposal 5A — Align `Limits & switching` columns, quiet blue nav chrome, unclip search

```text
  BEFORE (Limits & switching › Each service — headers shifted left of controls):
     On   Switch at            Warn at              Rest after a limit
  Claude          [ON]  [ Shared · 10% left v ]  [ Shared · 20% left v ]  [ Shared · default v ]

  AFTER (shared grid tracks between header and rows):
                  On    Switch at                Warn at                  Rest after a limit
  Claude          [ON]  [ Shared · 10% left v ]  [ Shared · 20% left v ]  [ Shared · default v ]

  RAIL SEARCH:   [ Q Search settings, provi [⌘K] ]   --->   [ Q Search settings      [⌘K] ]
  NAV CHROME:    7 competing solid-blue slabs        --->   Soft tint on rails/lists; solid blue only on
                                                            primary buttons and ON toggles
```

- **Exact words:** `Search settings`, `On`, `Switch at`, `Warn at`, `Rest after a limit`
- **Why it is easier:** Aligning headers over their controls, unclipping search, and reserving bright blue for actions fixes obvious layout glitches in minutes.

### Proposal 5B — Non-truncating labels, clearer budgets, one-line readiness strip

```text
  CONFLICTS DROPDOWN (Move & Copy):
    Before: [ Preserve both, pause affected work, a... v ]
    After:  [ Keep both and pause                      v ]
            (Options: Keep both and pause / Keep server copy / Keep this device's copy)

  USAGE & BUDGETS:
    Monthly spending limit     [ No limit  USD ]   (replaces misleading "0 USD")
    Monthly token budget       [ No limit  tok ]   (replaces "0 tokens")
    Warn at                    [======o---]  80%   (adds missing % sign)

  CLAUDE READINESS STRIP (single baseline, no orphan second line):
    ✓ Installed 1.8.4 · ✓ Playty Team · ✓ 3 accounts · ✓ 3 models   Checked 4m ago [ Check connection ]
    (Replace "Provider CLI sign-in" with "Browser sign-in".)
```

- **Exact words:** `Keep both and pause`, `Keep server copy`, `Keep this device's copy`, `No limit`, `80%`, `Browser sign-in`, `Checked 4m ago`, `Check connection`
- **Why it is easier:** Shortening clipped choices, replacing `0 USD` with `No limit`, and cutting CLI jargon stops beginners from misreading settings.

---

## Top five

1. **Fix left-list selection and delete the square dot box (Proposal 4A):** One CSS update restores washed-out icons and removes the square frame around status dots in Services, Servers, and Personas.
2. **Use a two-band fixed grid with `Edit` on account rows (Proposal 1A):** Makes every usage bar one length, stops status wrapping, aligns `1–4` cleanly, and replaces the third arrow with plain `Edit`.
3. **Fix misaligned `Limits & switching` columns, clipped labels, and blue-slab overload (Proposals 5A & 5B):** Tiny CSS and copy edits align `Each service` headers, unclip `Search settings` and Conflicts, fix `0 USD` / `80%`, and save bright blue for actions.
4. **Reorganise `Servers & Remote Access` with a 4-part Setup Strip, unified `Link Servers`, and `Connect Devices` (Proposal 3B):** Shows files, 7 work computers, steering devices, and away access at a glance on Tab 1 and lists all linked computers in one scannable view.
5. **Replace `+ Add a service` with a grouped, searchable gallery (Proposal 2A):** Lets beginners pick among all 22 services by how they pay (`Plans I pay for`, `Pay as you go`, `Free & local`) plus `Add custom service…`.
