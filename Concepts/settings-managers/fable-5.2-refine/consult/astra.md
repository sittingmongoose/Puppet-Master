# Providers and Servers & Remote Access

Keep the centred tabs, chapter column, dark surfaces and existing controls. Use 13 px for row names, 12 px for secondary text and a floor of 11 px throughout. At narrow widths, move whole controls onto the next line. Keep labels on one line and the full value of a long name or path available on focus.

## 1. Accounts

```text
Accounts                                                                            [+ Add account]
Order       Account                                             Status
1 [^] [v]   Work Claude   Used first                            * Ready          [Account settings]
            Playty Team
            5 hours   [################----]    78% used    Resets in 1h 42m
            Weekly    [###########---------]    54% used    Resets in 4d 11h
---------------------------------------------------------------------------------------------------
2 [^] [v]   Personal                                            * Limit reached  [Account settings]
            Personal Max
            5 hours   [####################]   100% used    Resets in 54m
            Weekly    [############--------]    61% used
```

Size the status column once for the widest status. Give the meters their own grid spanning from the account name to the right edge. Every window gets the same track width and a right-aligned percentage. Lab gets its one reported window. Studio gets “Sign in to see usage”. Keep both order arrows in place at the ends of the list and dim the unavailable direction.

**Account settings** opens a sheet headed “Personal / Claude”. Keep all account controls there, including “Sign-in method”, “Models on this account”, “When it runs low”, billing and expert fields. Keep “Use for the next run”, “Sign out” or “Sign in again”, and “Remove account” at the foot. Close returns focus to the same row.

**Why** Personal reaching its limit changes the fill and status while the tracks stay aligned. The arrows move the account and the named button opens it.

## 2. Add a service

```text
Add a service                                                                     [Close]
[Search services                                                                        ]
Service                         How to connect                             Status
Subscriptions
 ( ) Claude                     Sign in with Claude                        Ready
 ( ) Kimi Code                  Key from your Kimi plan                    Ready
Pay as you go
 (*) Anthropic API              Anthropic Console API key                  Not set up
Your servers
 ( ) Local model server         Ollama or LM Studio address                Not set up
 ( ) OpenCode server            Start or connect a server                  Not set up
Free options
 ( ) Free Models                Choose free routes                         Ready
-----------------------------------------------------------------------------------------
[Custom service]                                                          [Enter API key]
```

Use a wide setup sheet with one scrolling list for all 22 services. Pin search and the footer. Searching “Claude” finds both the subscription and Anthropic API. The footer follows the selected service. Claude offers “Add account” once ready, a local model server offers “Enter address”, and a tool can offer “Install” or “Continue setup”. Keep each service’s alternative sign-in methods in its setup. “Custom service” keeps its name, connection type and address form.

**Why** Someone holding a Kimi plan key can find their subscription as easily as someone holding a pay-as-you-go API key.

## 3. Servers & Remote Access

### Workspace opens first

```text
             [Workspace]     Servers     Your devices     Away from home     Move & copy

Project files          Home TrueNAS                                               [Change location]
                       \\truenas\Projects\tastebook
Home server            [Desktop v]
---------------------------------------------------------------------------------------------------
Can run work (7)       Desktop, Laptop, Build PC, Mac mini, Studio, Linux PC, Ubuntu VM
Run new work on        [Build PC v]                       Working now       Ubuntu VM
---------------------------------------------------------------------------------------------------
View and control       3 connected                        Desktop (this device), Laptop, Phone
Connected over         Local network                      From away         Tailscale - Ready

[More options]                                   Check server and devices    How servers and devices work
```

These names, path and connection states illustrate the seven-computer setup. Use one card with three bands and 16 px insets. Give the storage host the weight of a heading and put the configured path directly beneath it. **Change location**, the one filled button, selects a source. **Move & copy** transfers files. The home server holds the workspace. A file-only NAS counts as storage.

Count each eligible computer once, including devices allowed to run work. At smaller widths the list breaks between names. The same desktop can also appear under “View and control”. Keep “Automatic (Home server)” and individual targets in “Run new work on”. “Working now” shows hosts reported by active runs, “Idle” for known inactivity, or “Not reported” when unknown. “From away” shows the first enabled away route and its state, or “Not set up”. Keep saved-work status, last change, runtimes, file authority, sync, and both project and file details under “More options”.

**Why** A beginner can read where the files live, where a job is running and which device they are holding without opening a second tab.

### Servers and devices

```text
Servers (7)          [+ Link a server] | Build PC                      [Open in browser] [...]
  Desktop                              | build-pc.home                       * Connected
  Home server       * Connected        |
| Build PC                             | Allow work on this computer                [On]
| Can run work      * Connected        | Default for new workspaces                [Off]
  Laptop                               | Signs in with          id_ed25519  [Change key]
  Can run work      * Connected        | Last check          1 minute ago   [Test connection]
                                       | Version                    0.8.0   * Update ready
                                       | [Technical details]
SSH computers                                                           [+ Add SSH computer]
SSH keys                                                                        [+ Add a key]
Server tools
Install required tools                                             [When safety checks pass v]
```

- **Servers** retains guided setup, identity confirmation and claim. “Link a server” is the primary action. Selecting a computer opens its details alongside the list. Its menu holds Connect, Rename, Restart, Update, Back up and Remove. SSH computers, shared SSH keys and tool installation keep their controls below the list.
- **Your devices** starts with “Connect a device” for QR or code pairing. Keep the connected and offline devices, requests, approval, rejection, device access, checks, renaming, revocation, continuity switches, trust roles and pairing history here.
- **Away from home** owns “Set up a way in”, route checks, switches and order. Local network stays first. Keep Tailscale and Headscale, existing VPN, custom domain, Remote Link, public browser access, recommended order and route details.
- **Move & copy** opens the existing guided chooser with “Move, copy or import”. Keep all three tasks, including SSH import, their contents, destination, history choices, checks, transfer records and conflicts. Each tab keeps its scoped diagnostics and help.

**Why** “Link a server” adds somewhere work can run. “Connect a device” pairs the phone or computer someone uses to steer it.

## 4. Selected rows

```text
Rest                        Hover                        Selected
  [C] Claude                  [C] Claude                 | [C] Claude
      * Ready                     * Ready                |     * Ready
```

Reserve a 3 px inset at the left of every row. Selection fills that edge with accent blue and tints the dark row at 10%. Keep the icon on its usual dark tile, the portrait in its own colours and the name in bright text. Hover lifts the neutral surface one shade. Keyboard focus outlines the whole row. Put a bare 6 px circle beside the existing status word. Use green for “Ready” or “Connected”, amber for “Needs sign-in”, red for “Limit reached” and grey for “Off”. Personas use the same selection edge.

**Why** The edge identifies what is selected, the icon still identifies the item, and the dot and word identify its state.

## 5. Small changes

```text
Each service        On      Switch at           Warn at             Rest after a limit
Claude              [On]    [Shared 10% left]   [Shared 20% left]   [Shared default]
ChatGPT / Codex     [On]    [15% left       ]   [Shared 20% left]   [Shared default]   [Use shared]
```

On **Limits & switching**, use the same columns for headings and controls. Put “Use shared” in a reserved end slot on overridden rows.

**Why** The “On” heading sits over its switches, and one override no longer makes the Codex row taller than Claude.

```text
Conflicts
When both sides changed                                  [Keep both and compare v]
                                                          Keep both and compare
                                                          Pause affected work for a three-way comparison
                                                          Use server copy
                                                          Save the device copy alongside
                                                          Use device copy
                                                          Save the server copy alongside
Open conflicts                                          0 [View]
```

Use the short policy name in the closed field. Give each open menu choice one line for its consequence.

**Why** The current choice fits where “Preserve both, pause affected work, a…” is cut off today.

## Top five

1. **Soften selected rows.** Use a thin blue edge, preserve the icon colours and put a bare dot beside the status word.
2. **Align the account rows.** Give every usage bar the same track and place “Account settings” across from the order arrows.
3. **Put the project folder first.** Show the NAS path, the computers doing work, the connected devices and the away route together on Workspace.
4. **Give each connection a clear verb.** Use “Link a server” for work computers and “Connect a device” for the computers and phones that control the workspace.
5. **Replace the service pop-up.** Give subscriptions, pay-as-you-go APIs, model servers and free options one searchable sheet with a clear next action.
