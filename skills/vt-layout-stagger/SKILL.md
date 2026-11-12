---
name: vt-layout-stagger
description: Add a Layout + Stagger view transition to any React 19.3+ app. Switching between list, grid or compact views morphs every part of every item (visual, title, meta, controls) from its place in one layout to its place in the other, staggered by position so the change sweeps through the page as a wave from where the user is scrolled. Use when the user wants an animated view toggle (list/grid, table/cards, comfortable/compact), staggered shared-element morphs, or the Stagger example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/stagger"
---

# Layout + Stagger

1. **Layout**: each view (list, grid, compact) is a separate component. Every visible part of an item is a named boundary with the same name in each view, so switching unmounts each part in one layout and mounts it in the other, and the pair morphs.
2. **Stagger**: each part carries a `wave-<n>` class from its place in the list, which delays its morph by `n × 20ms`. The wave starts at the first item on screen, and the new layout is scrolled so that item stays where it was.

## Where this fits

**Shape it needs:** one set of items that can be shown in two or more layouts, with a control to switch between them.

**Fits, for example:** a file manager's list/grid toggle, a table ↔ card view in an admin panel, comfortable/compact density in an inbox, a kanban ↔ list view, a photo library's zoom levels.

If the app has only one layout, there's nothing to switch: suggest `vt-search-reflow` for filtering instead.

Terms used below:

- **item**: any record the app lists (a user, file, post, issue, song, product, table row).
- **visual**: the element that carries an item's identity on screen (an image, avatar, icon, chart, heading, or the whole card).

Before editing anything:

1. **Find the shape, not the content.** Look for where the shape above exists in the user's app. The demo is a shop with product photos, but nothing here depends on products or images. If the user named a place, use it. If several places fit, list them and ask which ones.
2. **Stop if nothing fits.** Tell the user what's missing (for example "this needs filter chips, and the app has none") and suggest the closest skill from the list below. Don't build new UI, sample data or placeholder pages to make it fit.
3. **Keep the app's own markup, styling and data.** The snippets use Tailwind classes and `<img>` for brevity. Translate them to whatever the app uses (CSS modules, styled-components, plain CSS, a component library).

Other skills in this set, by the shape they need:

- `vt-fade`, `vt-blur`: any pages or swappable content
- `vt-morph-slide`: a list and a detail view that share a visual
- `vt-expand-carousel`: a list and a side panel or sheet
- `vt-fly-dock`: adding items to a collection (cart, bookmarks, playlist, tray)
- `vt-layout-stagger`: a list/grid view toggle
- `vt-search-reflow`: a searchable or filterable list
- `vt-swap-roll`: one featured item beside a list
- `vt-tuck-spill`: a list filtered by category chips or tabs
- `vt-grow-shift-slide`: a grid of cards that can open in place
- `vt-flip-deal`: a grid whose items change in place, or content that turns over

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app: it's client state.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, `layout` / `layout-text` morphs and `wave-1` … `wave-16`.
- `references/stagger-catalog.tsx`: `StaggerPart`, `switchView`, the scroll anchor and the three views.
- `references/stagger-checkout.tsx`: how a later page reuses the visual names (optional).

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the UI kit, the tooltips and the filter are shop-only. Port `StaggerPart`, `switchView`, the anchor effect and the per-part naming.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block (it drops the waves and delays).

More than 16 items on screen needs no extra rules: everything past 16 starts together.

### 2. One boundary per part

```tsx
function StaggerPart({ name, wave, text = false, children }) {
  return (
    <ViewTransition
      name={name}
      share={`${text ? "layout-text" : "layout"} wave-${Math.min(wave, 16)}`}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
```

Wrap the parts that appear in every view (the visual, the title, a status, the main action) with names like `item-visual-${id}`, `item-title-${id}`. Every name must be identical across views and unique on the page.

- Use `text` for any text that truncates or wraps differently between views: the old snapshot is hidden and the new one moves unscaled, so letters never stretch.
- Give text `w-fit max-w-full` (or `width: fit-content`) so the snapshot is the text, not its column.
- Parts that exist in only one view (a description in the list view) stay unnamed and just fade.
- Table views: name the cell contents, not the `<td>`s.

### 3. Switch views in a Transition, anchored

```tsx
function switchView(next: View) {
  const items = document.querySelectorAll<HTMLElement>("[data-item]")
  const index = [...items].findIndex((el) => el.getBoundingClientRect().bottom > headerHeight)
  const first = items[index]
  anchor.current = first ? { id: first.dataset.item!, top: first.getBoundingClientRect().top } : null
  startTransition(() => {
    setWaveStart(Math.max(0, index))
    setView(next)
  })
}
```

Then in a `useLayoutEffect` on `view`, scroll so the anchored item is back at its old `top`. It runs before the new snapshot, so every part morphs to where it is after the scroll. Use `wave = Math.max(0, index - waveStart)`. Set `headerHeight` to the app's sticky header height (0 if none).

## Gotchas

- Put `data-item={id}` on each item's root in every view so the anchor can find it.
- Filtering is not part of this pattern. Keep it a plain `setState` so the parts don't morph on filter changes.
- Many named boundaries make the snapshot heavier. Fine for a few dozen on-screen items; for very long or virtualized lists, only name items near the viewport.

## Motion rules

The CSS already follows these: 300ms morphs on the drawer curve (never `ease-in`), 20ms stagger steps capped at 16, and a short cross-fade with no movement or delays for reduced motion.

## Check your work

- Switching views: parts glide from one layout to the other in a wave that starts at the top of the screen.
- The item that was first on screen stays in place.
- Text doesn't stretch mid-flight.
