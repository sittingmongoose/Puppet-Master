# Settings Navigation Video — Non-Visual Reference

The recording demonstrates interaction behavior, not a visual design to copy.

## Overall composition

A large centered Settings window sits over the application. A narrow navigation column is fixed on the left. The larger content area on the right is a long-form settings document.

The left column contains:

- user/account identity at the top;
- a Settings search field;
- major categories;
- nested subcategories under the active category;
- a compact scrollbar when the list exceeds the viewport.

The right content area contains:

- the current category title;
- multiple vertically stacked subcategory sections;
- setting rows, grouped controls, explanatory copy, and occasional destructive actions;
- its own vertical scroll position.

## Navigation behavior

1. Clicking a category loads that category's long document on the right.
2. Clicking a subcategory jumps the right document to its section.
3. Scrolling the right document updates the active subcategory in the left navigation.
4. When the scroll crosses into a later category/section, the left highlight changes without requiring a click.
5. The active item remains readable and visually stable; the left list may scroll to keep it in view.
6. The right content does not close after each setting. The user can keep scrolling through the whole category.
7. Search remains available above the category list.

## Timeline examples visible in the recording

- Account starts at Account Info and scrolls through Password & Security, Account Standing, Family Center, and destructive account actions.
- Data & Privacy opens and scrolls through profile privacy, messaging permissions, filters, direct messages, and activity privacy.
- Notifications opens and scrolls through overview, sounds, email, advanced notification settings, voice/video, and soundboard.
- Appearance opens and exposes theme/palette, sync behavior, reduced motion, accessibility, app icon, messages, chat box, and search-related options.

## Principles to borrow

- Category and subcategory structure is continuously visible.
- Scroll position and left navigation remain synchronized.
- A user can click to jump or simply scroll.
- Long settings are treated as a coherent document, not a stack of tiny popups.
- Search, categories, and content exist in one stable spatial model.

## What not to copy blindly

- Do not copy Discord's styling, dimensions, labels, category taxonomy, colors, or exact animations.
- Do not force every PM manager into ordinary setting rows.
- Do not reproduce narrow text columns or blank space that do not suit PM.
- Do not retain a giant modal if a full PM workspace is more appropriate.
