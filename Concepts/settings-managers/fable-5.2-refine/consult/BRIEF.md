# Layout consult: Puppet Master Settings (Providers, Servers & Remote Access)

You are a layout consultant. **Ideas only.** No code changes, no git command that changes anything, no browser, no
build, no ssh, no deleting. Budget: about 15 minutes. Write your answer to ONE new file (named in your task) with
your file-writing tool, and repeat its "Top five" in your final message.

## The product
Puppet Master is a desktop app in which a person runs AI coding agents on their own projects. Its users are
complete beginners. The thing under review is its Settings page (a concept in one HTML page, dark look, 1600x1000).

## What the owner said about the current build (verbatim, 2026-11-23)
"This is better but it doesnt go far enough to make it nice to look at. There are also some visual bugs. [...] the
highlights like in the persona menu look terrible, the left side icons are washed out by the highlight and there is
a box around the indicator light in other managers. This needs to be improved.
-I dont necessarily want you to improve the managers by removing options. But the words, wording, chrome, layout
need to still be improved. If you look at the screenshot of the ai providers, it looks like a mess. The bars are all
uneven, the text isnt even, and there are 3 different arrows. The up and down make sense, but the 3rd that expands
needs to be rethought completely. The add a new service pop up menu is not at all sufficient. Providers is close
though. Servers and remote access are really bad. This section likely needs the most work. It isnt clear where my
files are stored, where work is being done. For example, in my setup, the project is stored on my Truenas Nas, but
I run work on 7 different computers. T3 code nightly has a similar feature called link, where you can link their
environments(we call servers), and also has their connect system to connect all the clients."

Earlier, about a first redesign he rejected: "too radically different", "too sentence heavy", "when i looked at it,
i had no idea what to do or select", "a ton of redundancy everywhere". So: refine what is there.

## Rules that hold
- Keep every option and every action that exists now. Nothing is dropped.
- Keep the look: the same dark theme, fonts, colours, button and row components. Short labels, not sentences.
  One obvious thing to select on each screen.
- The centred tab strip at the top of a manager and the side column that lists the chapter stay.
- No text under 11 px. No label may wrap onto a second line.
- One home per setting: no row that only points to another place.

## What to look at (PNG screenshots of the current build)
Folder: /mnt/Cursor/PuppetMaster-Evidence/tests/settings-refine-20261120/after/t7/
- 02-ai--01-providers--01.png  Providers & Accounts › Services (the screen he calls a mess: the Accounts rows on
  the right, with usage bars, a status at the right, and three arrow buttons: up, down, and a chevron that expands
  the account; the list of services at the left with its selected-row highlight and the boxed status dot)
- 02-ai--01-providers--02.png .. 04.png  the other three tabs (Models, Limits & switching, Usage & budgets)
- 03-servers-access--01-servers--01.png  Servers & Remote Access › Home & Location
- 03-servers-access--01-servers--02.png  › Servers        03.png › Devices
- 03-servers-access--01-servers--04.png  › Away From Home 05.png › Move & Copy
Sources, only if you need the exact options (read-only), under
Concepts/settings-managers/fable-5.2-refine/overlay/onboarding/opus-5.5/src/settings/ :
managers/10-providers.js, managers/50-servers.js, styles.d/95-refine.css

"Add a service" today is a small pop-up list of service names. He finds it "not at all sufficient".

## What I want from you
1. **Providers › Services › the account rows.** A row layout in which the bars are one length, the text lines up,
   the status never wraps, and the up/down (order) arrows stay. Replace the third arrow (expand the account's
   details: sign-in method, models, limits, remove) with something a beginner understands at a glance.
2. **"Add a service".** What should that step be (a sheet? a gallery? grouped how? what does each entry show?) so
   a beginner can pick among about 22 services: subscriptions they already pay for, pay-by-use API keys, local models.
3. **Servers & Remote Access.** The most work. A person must see at a glance: (a) where the project's files are
   stored, (b) which computers do the work, (c) which devices are connected to look and steer, (d) how it is
   reached away from home. Test it against the owner's setup: the project is stored on a NAS; work runs on 7
   different computers; he steers from a desktop, a laptop and a phone. Reference he named: T3 Code nightly's
   "Link" (link environments = our servers) and "Connect" (connect the clients). If you know that Settings layout,
   borrow its organisation; do not invent details of it. Propose the tabs (names and order), what the first screen
   shows, and one computer's row and its opened details. All five current tabs' options must still have a home.
4. **The selected row in a left-hand list** (services, personas, servers). Today the selected row is a solid bright
   blue slab that washes out the row's icon, and the status dot gets a box. Propose the selected, hover and status
   treatment.
5. Anything else on these screens with a high visual payoff for little change (spacing, alignment, wording, chrome).

## Format of your answer
For each of 1-5: at most two proposals. Each proposal = an ASCII wireframe (110 columns at most), the exact words
on screen (labels, buttons, statuses), and one line saying why it is easier. Then "Top five": the five changes with
the most visual payoff per effort, ranked. At most 1,200 words outside the wireframes. Plain words.
