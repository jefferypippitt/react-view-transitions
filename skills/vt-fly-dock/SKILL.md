---
name: vt-fly-dock
description: Add a Fly + Dock view transition to any React 19.3+ app. Adding an item to a collection tosses a copy of its visual (image, icon, avatar or chip) in an arc into a floating dock or tray, removing one tosses it back, the dock rises with the first item and drops when it empties, and moving to a review page flies every item into its row. Use when the user wants add-to-cart, add-to-playlist, bookmark, attach or select-to-tray animations, items flying into a dock, basket or tray, or the Fly example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/fly"
---

# Fly + Dock

1. **Fly**: every add tosses a copy of the item's visual from the list into the dock along an arc. Every remove tosses one back.
2. **Dock**: the dock rises from the bottom edge with the first item and drops when the last one leaves. Entries in it enter, shift and leave as a keyed list.
3. **To the next page** (optional): the destination rows carry the same names, so navigating flies every copy from the dock into its row.

## Where this fits

**Shape it needs:** items the user adds to a collection, and a visible place where that collection lives (a dock, tray, sidebar, badge or header icon).

**Fits, for example:** a shopping cart, adding songs to a queue, selecting files into an upload or share tray, saving articles to a reading list, picking people for a group chat, bulk-select in an admin table.

If there's no collection, suggest a different skill (`vt-search-reflow` or `vt-tuck-spill` for list changes).

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

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app for the fly and dock. The flight to another page needs a router whose navigations are Transitions (Next.js App Router is; elsewhere wrap the navigation in `startTransition`).
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, keyframes, the `fly` group and its `toss` arc, `dock-in` / `dock-out`.
- `references/fly-catalog.tsx`: `flyName`, `FlyCopy`, `revealInDock`, the list and the `Dock`. Step 3 explains how `flyName` works: it's the whole trick.
- `references/fly-checkout.tsx`: how the destination rows reuse `FlyCopy`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items and the bag for its collection. `useCart`, `QuantityStepper`, `@/lib/media`, the UI kit and the filter are shop-only. Port `flyName`, `FlyCopy`, the dock boundaries and the `change()` handler, wired to the app's own collection state.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

### 2. A flying copy, not the real visual

Stack an invisible, named copy of the visual exactly over the real one, in the same positioned box with the same classes. Only the copy is named, so the real visual never moves and nothing is left empty:

```tsx
function FlyCopy({ name, children }) {
  return (
    <ViewTransition key={name} name={name} share="fly" default="none">
      <div aria-hidden className="absolute inset-0">{children}</div>
    </ViewTransition>
  )
}
```

The copy can be any markup that looks identical to the visual: an `<img>`, an icon, an avatar, a text chip.

### 3. Name copies by count

`flyName(key, n)` names the n-th copy of an entry. In the list, render the copy named after the **next** one to go in (`count + 1`). In the dock, render the copy named after the **last** one in (`count`). The name is also the key, so a count change remounts both, and the name that leaves one place arrives in the other:

- add, 1 → 2: list `x-2` → dock `x-2`, a copy flies down.
- remove, 2 → 1: dock `x-2` → list `x-2`, a copy flies back.

For collections without counts (an item is in or out), the count is just 0 or 1.

### 4. Change the collection in a Transition

```tsx
async function change(key: string, next: number) {
  // A copy flying back starts from its dock entry: scroll it into view first,
  // before the Transition takes the old snapshot.
  if (next < (counts[key] ?? 0)) await revealInDock(key)
  startTransition(() => setCount(key, next))
}
```

### 5. The dock

```tsx
{collection.length > 0 && (
  <ViewTransition enter="dock-in" exit="dock-out" default="none">
    <Dock … />
  </ViewTransition>
)}
```

Inside it, wrap each entry in `<ViewTransition key={entry.key}>` so entries enter, shift and leave. Keep the dock a fixed size so it never resizes, and keep the grown entry in view with a `useLayoutEffect` (see `Dock`).

If the app's collection lives somewhere else (a header icon, a sidebar), put the dock-side `FlyCopy` there and skip the dock component.

### 6. Fly to the next page (optional)

On the destination page (checkout, review, upload), put a `FlyCopy` named `flyName(entry.key, entry.count)` over each row's visual. Navigating there flies every copy from the dock into its row, and Back flies them home.

## Gotchas

- The copy must match the real visual pixel for pixel (same box, same classes), or it shows at rest.
- The `fly` group has `z-index: 50` so copies fly above the dock, which comes later in the DOM.
- The flight is 450ms with an arc: a deliberate, rare "delight" moment above the usual 300ms cap. Keep it to add/remove.

## Motion rules

The rest of the CSS follows these: dock movement at or under 300ms, dropping faster than rising, custom curves (never `ease-in`), separate `-out` keyframes, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Add: a copy arcs from the item into the dock. The item keeps its visual.
- Remove from the dock: a copy flies back to its item. Off-screen entries scroll into view first.
- The first add raises the dock, and removing the last drops it.
- Reduced motion: no flight, just quick cross-fades.
