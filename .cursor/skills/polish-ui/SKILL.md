---
name: polish-ui
description: Polish and unify an existing web app's UI, the way Apple would: consistent page headers, layout-stable actions, one content rhythm, short benefit-led copy, list rows over sparse cards, clickable cards with a shared detail modal, smooth fades over scrolling content, and responsive grids that stay readable on tablets. Use this whenever the user asks to polish, clean up, tidy, make consistent, fix alignment, fix layout shift, fix spacing, improve readability, fix truncated cards, rewrite UI copy or page descriptions, review pages "across the app", or says things like "feels inconsistent", "buttons are uneven", "text is cut off", "too much white space", "make it feel like Apple", even when they only point at one screen or send a screenshot.
---

# Polish UI

A playbook for turning a working but uneven product UI into one that feels designed by one hand. It was distilled from a real polish pass on a Next.js + Tailwind + shadcn app, but the principles are framework-agnostic.

The core belief: users notice *differences* between sibling screens far more than they notice any single screen. Most polish work is finding the differences and removing them by sharing one implementation.

## How to work

1. **Look before you change.** Read the screenshot or page, then read the code that renders it. Check the project's design docs (DESIGN.md, AGENTS.md, token files) so you reuse its tokens and components instead of inventing new ones.
2. **Audit siblings, not just the reported screen.** A complaint about one page ("the buttons don't line up with the title on Projects") is usually true of every page built the same way. Produce a short audit table (page, file:line, container width, title, description, actions, inconsistencies) across all sibling pages before editing.
3. **Pick one convention and encode it once.** Create or fix a shared component or exported class constant (PageHeader, PageSection, list row, grid class, tab classes, detail dialog) and migrate every sibling to it. Repeating magic class strings on six pages is how they drift apart again.
4. **Change the minimum, keep behaviour.** Polish should not silently change what things do. When a merge is needed (two dropdowns into one, two buttons into one menu), keep every handler, state store, persistence key, disabled state and permission gate as it was. If the old interaction was liked (e.g. a slider), keep it inside the new container.
5. **Verify honestly.** Run typecheck, lint on touched files, and focused tests. When a test fails, compare against a clean checkout of HEAD (temporary `git worktree` with node_modules symlinked) before blaming or excusing your change. Report visual checks separately from unit tests, and say plainly when you could not look at the UI.

When the user sends a new screenshot after a change, first confirm the dev server is serving the checkout you edited (`lsof -iTCP:<port> -sTCP:LISTEN`, then the process cwd) and that the page reloaded. "It still looks old" is often a stale page, not a bug.

## Principles and the fixes that came out of them

### 1. Page headers: one component, actions on the title row

- Title, optional description, actions. On desktop the actions sit on the **title's row**, vertically centred on the h1, and the description spans the full width underneath. Centering actions against the title+description block makes them float between the two lines, which reads as misaligned.
- On phones the actions stack under the description at full width.
- Same title size and weight, same description style, same bottom margin, same container max-width and padding on every sibling page.
- Keep page-specific behaviour (focus-on-mount h1 refs, permission gates) by passing it through the shared component.

### 2. No layout shift between sibling pages

When a user switches tabs in a nav, anything that changes width makes the page jump. Give the header actions identical geometry everywhere:

- Search input: one fixed width on every page.
- Exactly **one** trailing control, with one fixed width, height and shape. If a page needs two actions (Import + Create), merge them into one "New X" dropdown (Create X, Import from file), matching any existing "New" menu in the app.
- One label pattern: "New project", "New routine", "New agent", "New artifact". Not "Create" on one page and "New" on another.
- Badges (active filter count) must fit inside the fixed width so toggling a filter does not resize the button.
- Export the width as a shared class constant so the next page gets it for free.

### 3. Copy: short, benefit-led, Apple voice

- Page descriptions are one short line (roughly 30 to 45 characters) that ends before the search box starts. If it wraps, it is too long.
- Describe what it does for the user, not how it works. "Keep related work together", not "Chats, files and sources grouped by project". "Set it once and it runs on its own", not "Requests the assistant runs on its own, once or on a schedule". Think Apple feature names, not AWS service docs.
- Don't name the product in its own UI ("Leo can...") unless it adds meaning.
- No trailing full stop on short UI lines (descriptions, section details, taglines). Sentences inside longer body copy keep their punctuation.
- Counts are not descriptions. "55 artifacts" belongs in a tab or chip badge, not under the title.
- Labels that sit next to each other must not be confusable. Effort levels named "Instant / Balanced / Deep" next to a model list read like model names; "Low / Medium / High" does not.
- Keep any client or white-label variants of strings working and apply the same style to them.
- Follow "Avoid AI tells" below in every string you write.

### 4. One content rhythm below the header

- One section heading style everywhere (e.g. base size, semibold) with an optional single muted detail line. Encode it as a `PageSection` component.
- Fixed spacing values: header to first block, between sections, heading to content. Pick them once.
- Remove headings that restate the page title ("All skills" under "Skills") and stacked double headings ("All plugins" directly above "Built in").
- Use the same tab component and classes for every top-level tab or filter row; extract the classes into a shared constant.
- The user's own items come first; libraries, templates and built-in presets go at the bottom. When the user has none of their own, the empty state points at the library ("Start a chat with one from the library below, or make your own") with a secondary create button.

### 5. Cards vs list rows

- If an item is just icon + name + one line + a toggle, use a **list row** (like Apple Settings or App Store lists), not a tall card. Cards with one truncated line and a lot of padding read as empty and are hard to scan.
- Sibling pages that list similar things (Plugins and Skills) should use the same row component and the same grid.
- Cards and rows show a separate short **tagline** written to fit one line. Keep the long description for the detail view. If the long text is also consumed by a model or runtime (skill frontmatter, tool descriptions), add a display-only field rather than editing it.
- For user-generated items with no tagline, show the first line of their description, truncated.

### 6. Clickable cards and one shared detail modal

- Make the whole card or row the click target (a button whose `::after` stretches over the card), keyboard reachable with a visible focus ring. Nested controls (overflow menu, switches, connect buttons) sit above it with `relative z-10` and keep working.
- Remove repetitive per-card CTAs ("Start chat" on every card). The primary action moves into the detail modal.
- One shared detail dialog for every item type (agents, skills, plugins, templates): header with icon tile, name, secondary actions and the primary CTA on the right; then the full description; then bordered panels with small muted headings ("Information" rows such as Category, Developer, Status). Only show rows whose data exists.
- The modal's corner radius matches the cards, and inner panels use the same radius family. Full-height sheet on phones.
- Don't expose fields to restricted users (clients, guests) in the modal that they couldn't see before.

### 7. Responsive grids that stay readable

- Choose columns by **container width**, not viewport width (Tailwind container queries such as `@2xl:grid-cols-2`), so an open side panel cannot squeeze cards. Keep each card at least about 300px wide.
- Check tablet widths (around 1024px with any side panel open), not just desktop and phone. That is where three-column grids truncate.
- Text-heavy items get two columns at most.

### 8. Floating headers over scrolling content

- Give a floating title pill breathing room from the top edge (around 12px) and size it generously (40px tall, slightly larger text, bigger avatar).
- Fade content out with a **plain multi-stop gradient** of the background colour, opaque-ish at the top easing to fully transparent, over a band taller than the bar. Avoid hard-edged backdrop-blur bands: they show a visible line where blurred text becomes sharp. Avoid near-opaque fades: content looks cut off rather than fading. Stacked progressive-blur layers are heavy and still produce smears; most apps users admire (Grok, Claude) use no blur at all.
- Remember to push the scroll content's top padding down so the first message is readable at rest, and keep the overlay `pointer-events-none` so scrolling still works through it.

### 9. Don't repeat context

If the whole screen is already scoped to something (a chat with one agent), don't label every item with it. Hide the label only when it equals the screen's context; keep it when it carries information (a message addressed to a different agent). Fix this in the shared component every caller goes through, not with CSS.

### 10. Combine related controls without changing behaviour

- Related pickers (model + reasoning effort) become one trigger showing "Model" plus a muted suffix for the secondary value once it is set.
- Inside the menu, sections are separated, and secondary options can be an inline segmented row ("Effort: Low Medium High") with the selected segment filled.
- If the container must host a slider or arrow-key control, use a popover rather than a menu: menus capture arrow keys and Tab.

### 11. Resizable panels

Drag handle on the panel edge: an 8px invisible hit area, `cursor-col-resize`, a 1px line on hover thickening while dragging, min and max clamps, the width persisted (read during render the same way other shell state is, to avoid a flash), double-click to reset, `role="separator"` with aria values and arrow-key support, no width transition while dragging, desktop only.

### 12. Tokens and settings

- Change colours by changing semantic tokens (`--background`, `--sidebar-panel`), never hardcoded values in components, and check what else inherits the token. After a change, look at adjacent surfaces: a rail that was "a step darker" may now match the panel.
- When a per-item setting is really per-user (time zone on every routine), move it to Settings: infer it once on first use (browser `Intl` time zone), fall back to a sensible default, let the user change it, make the server authoritative, and propagate changes to existing items through the normal update path. Show a quiet helper line where the old field was ("Times are in Asia/Dubai. Change in Settings").

## Avoid AI tells (writing and UI)

These patterns read as AI-generated and undo the polish. Never produce them in prose, docs, commit messages, code comments, UI copy, or designs. While auditing, also hunt for existing instances and remove them.

- Never use em-dashes (U+2014). Rewrite with a comma, colon, semicolon, parentheses, or a full stop. Don't substitute an en-dash (U+2013) or `--`.
- Never join metadata or list items with middle dots or bullets as separators (e.g. `Drupal · published 30 Aug 2026`, `5 min read • Engineering`). Use separate elements with spacing, a line break, or plain words ("Drupal, published 30 Aug 2026").
- Never use a colored left border as an accent on cards, callouts, or quotes (e.g. `border-l-4 border-primary`). Use background, elevation, spacing, or typography for emphasis instead.

A quick sweep before reporting: `grep -rn $'—\|·\|•' <changed files>` and `grep -rn 'border-l-[2-8]' <changed files>`.

## Delegating the work

Polish passes split naturally into independent tasks (headers, actions, copy, content rhythm, cards, modal). When using subagents, give each one: the files involved, the convention to apply, which other agents are editing which files (so they don't collide), the project rules to respect, and the exact verification to run. Review every diff yourself before reporting, and confirm claimed "pre-existing" failures against a clean HEAD.

## Reporting back

Lead with what changed in user terms, then a before/after table for copy, the convention chosen (one or two lines), the checks actually run with results, and what was not verified (usually the visual check). Offer the obvious next tweak (the one number most likely to need tuning) rather than an essay.
