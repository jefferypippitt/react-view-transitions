---
name: vt-grow-shift-slide
description: Add a Grow + Shift + Slide view transition to any React 19.3+ app. Clicking a grid card opens it in place as a larger tile; its visual (image, chart, avatar or icon) morphs to the bigger size, the card grows from its corner while its content cross-fades, the neighbouring cards glide to the cells the tile pushes them into, and ordered swaps inside the open tile slide in order. Use when the user wants cards that expand inline inside a grid, in-place detail tiles, dashboard widgets that enlarge, grid items pushing neighbours aside, or the Grow example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/grow"
---

# Grow + Shift + Slide

A card opens in place, inside the grid.

1. **Grow**: the clicked card becomes a larger tile (2×2 in the demo). Its visual is named, so it morphs to the big size. The card's box grows from its corner while the small card's content fades out and the tile's fades in.
2. **Shift**: every card is a keyed boundary, so the neighbours glide to the cells the tile pushes them into, and back when it closes.
3. **Slide**: ordered things in the open tile (variants, tabs, time ranges) slide in the direction of the pick.

Opening and closing are typed `grow`; only those move the cards.

## Where this fits

**Shape it needs:** a CSS grid of cards, where one card can open into a larger version of itself without leaving the page.

**Fits, for example:** dashboard widgets that expand to show more detail, a team grid where a member card opens to a bio, a gallery, a pricing grid with an expandable plan, app tiles in a launcher, a product grid.

If the app's list isn't a grid (a vertical list or a table), suggest `vt-expand-carousel` for a side panel instead.

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

- React 19.3+ (`ViewTransition`, `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app: it's client state.
- A CSS grid layout (`grid-auto-flow: row dense` lets later cards fill gaps the tile leaves).
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, `nav-forward` / `nav-back` slides, the `grow` visual morph, `grow-card` and `shift`.
- `references/grow-catalog.tsx`: `openCard`, `selectColor`, the per-card boundary, `Card`, `OpenTile` and focus handling.
- `references/slide-transition.tsx`: the directional slide used for ordered swaps.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the UI kit and the filter are shop-only.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

Copy `references/slide-transition.tsx` into the app's components.

### 2. Track the open card and the one before it

The card that was open is shrinking back, so it morphs like the opening one instead of just moving:

```tsx
const [view, setView] = useState<{ open: string | null; previous: string | null }>({ open: null, previous: null })

function openCard(id: string | null) {
  startTransition(() => {
    addTransitionType("grow")
    setView((current) => ({ open: id, previous: current.open }))
  })
}
```

### 3. One boundary per card

```tsx
<div className="grid grid-flow-row-dense grid-cols-2 md:grid-cols-4">
  {items.map((item) => {
    const isOpen = item.id === view.open
    const morphs = isOpen || item.id === view.previous
    return (
      <ViewTransition key={item.id} update={{ grow: morphs ? "grow-card" : "shift", default: "none" }} default="none">
        {isOpen ? <OpenTile item={item} … /> : <Card item={item} onOpen={() => openCard(item.id)} />}
      </ViewTransition>
    )
  })}
</div>
```

The open tile spans more cells (`col-span-2 row-span-2` in the demo). Pick a size that fits the app's grid; on a one-column phone layout, span the full width.

### 4. Name the visual in both

```tsx
<ViewTransition name={`grow-${item.id}`} share="grow" default="none">
  <div className="visual">…</div>
</ViewTransition>
```

If the card has no distinct visual (a stat card with a number), name its main element (the number or the chart). The rest of the content cross-fades with the card.

### 5. Slide ordered swaps in the tile (optional)

Inside the tile, key a `SlideTransition` by the selection, and set the direction from the index:

```tsx
startTransition(() => {
  addTransitionType(to > from ? "nav-forward" : "nav-back")
  setSelection(next)
})
```

### 6. Focus, scroll and keys

- When the tile opens, scroll it into view and focus its close button in a `useLayoutEffect` (runs before the new snapshot, so the morph lands where the tile really is).
- When it closes, focus the card that was open.
- Esc closes with a plain `setView`, outside a Transition, so it's instant.

### Text visuals

If the shared visual is text (a title, a name), scaling its snapshot stretches the letters. Give it its own class that hides the old snapshot and moves the new one unscaled, and give the element `width: fit-content` so the snapshot is the text, not its column:

```css
::view-transition-group(.morph-text) {
  animation-duration: var(--duration-move);
  animation-timing-function: var(--ease-drawer);
}
::view-transition-old(.morph-text) {
  display: none;
}
::view-transition-new(.morph-text) {
  animation: none;
  object-fit: none;
  object-position: left top;
}
```

Then use `share="morph-text"` in place of the image class on that boundary.

## Gotchas

- **Images must be ready for the new snapshot.** If the card and tile load different image sizes (`srcset`), the bigger one may be blank when snapshotted. In Next.js the demo uses `unoptimized` + `loading="eager"` on `next/image`. Elsewhere, use the same `src` in both and don't lazy-load. Non-image visuals don't have this problem.
- `grow-card` keeps both snapshots unscaled and pinned top-left inside a clipping group, so card text never stretches.
- Other updates (filters, counts) aren't typed `grow`, so they don't move the cards.

## Motion rules

Grow and shift share one curve and duration (350ms), so the tile, its visual and the cards it pushes move as one. That's deliberate, slightly above the usual 300ms cap. Everything else follows the rules: content out (120ms) before content in (200ms), never `ease-in`, separate `-out` keyframes, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Click a card: it grows into a larger tile, its visual scales up, and the neighbours glide aside.
- Clicking another card closes the first while opening the second.
- Ordered swaps in the tile slide left or right.
- Esc closes instantly and focus returns to the card.
