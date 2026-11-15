---
name: vt-swap-roll
description: Add a Swap + Roll view transition to any React 19.3+ app. Clicking a list item trades it with a featured spotlight item; both visuals morph in one transition, crossing paths (the item's visual up into the spotlight, the old one down into the vacated slot), while the spotlight details and the swapped slot roll like a slot-machine reel, up or down by order. Use when the user wants a featured item, hero or "now playing" area that swaps with list items, crossing shared-element morphs, reel-style text transitions, or the Swap example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/swap"
---

# Swap + Roll

One item sits in a spotlight beside the list.

1. **Swap**: clicking an item trades it with the spotlighted one. Both visuals are named, so in one transition the clicked item's visual morphs up into the spotlight while the old one morphs down into the slot it left. They pass each other on an ease-in-out curve.
2. **Roll**: the spotlight details and the swapped slot are keyed by item, so they exit and enter like a slot-machine reel, clipped to their box. A later item rolls up; an earlier one rolls down.

## Where this fits

**Shape it needs:** one featured item shown larger, beside a list of the others, where picking one from the list makes it the featured one.

**Fits, for example:** a music player's "now playing" with an up-next list, a dashboard's focused metric beside smaller metric tiles, a video page with related videos, a team page's featured member, a pricing page's highlighted plan.

If picking an item opens it rather than trading places, suggest `vt-expand-carousel` or `vt-morph-slide`.

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
- `vt-wipe-dive-stack-cover`: a filtered list, list → detail, variants and a sheet page

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition`, `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app: it's client state.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens (including `--ease-swap`), `swap` / `swap-lead` morphs and `roll-up` / `roll-down`.
- `references/swap-catalog.tsx`: `spotlight()`, the `Stage`, the cards and the `roll` map.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` file is copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the UI kit, colors and the filter are shop-only.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

### 2. Swap in one typed Transition

The list holds every item except the featured one. A swap puts the old featured item into the clicked item's slot:

```tsx
function spotlight(item: Item) {
  startTransition(() => {
    addTransitionType(order(item) > order(featured) ? "roll-up" : "roll-down")
    setSlots((current) => current.map((i) => (i === item ? featured : i)))
    setFeatured(item)
  })
}
```

If the app's list must keep its own order and contents (the featured item stays listed), skip the slot swap and the list item's name: only the spotlight's details roll, and its visual cross-fades.

### 3. Name both visuals

Same name in the spotlight and in the list. The spotlight's boundary is **keyed** by the item so a swap remounts it, and uses `swap-lead` so the visual heading for the spotlight is drawn on top:

```tsx
// Spotlight
<ViewTransition key={`visual-${featured.id}`} name={`swap-${featured.id}`} share="swap-lead" default="none">…</ViewTransition>

// List item
<ViewTransition name={`swap-${item.id}`} share="swap" default="none">…</ViewTransition>
```

### 4. Roll the details and the slot

```tsx
const roll = { "roll-up": "roll-up", "roll-down": "roll-down", default: "none" }

// Spotlight details, keyed by item
<ViewTransition key={`details-${featured.id}`} enter={roll} exit={roll} default="none">…</ViewTransition>

// Each list item, keyed, directly inside the list container
<ViewTransition key={item.id} enter={roll} exit={roll} default="none">…</ViewTransition>
```

Untyped updates (filters, settings, counts) resolve to `none`, so only swaps roll.

### 5. Keep the spotlight in view

Make the spotlight sticky (a bar under the header on phones, a column beside the list on wider screens) so a swap from anywhere in the list is seen end to end.

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

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- **Images must be ready for the new snapshot.** If the spotlight and the list load different image sizes (a responsive `srcset`), the one landing may still be blank when the snapshot is taken. In Next.js the demo uses `unoptimized` + `loading="eager"` on `ProductImage` so both places load the same, already-decoded file. Elsewhere, use the same `src` in both places and don't lazy-load. Non-image visuals don't have this problem.
- The featured item's name must never be mounted in the list at the same time, or the morph fails.

## Motion rules

Swap (400ms) and roll (350ms) are deliberate, above the usual 300ms cap: two things crossing need the time to read. Everything else follows the rules: custom curves (`--ease-swap`, never `ease-in`), separate `-out` keyframes, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Click an item: its visual flies to the spotlight while the old one flies into the vacated slot, crossing mid-way.
- The spotlight text and the slot roll up for a later item, down for an earlier one.
- Unrelated updates don't roll anything.
