---
name: vt-tuck-spill
description: Add a Tuck + Spill view transition to any React 19.3+ app. When a category filter hides items, each one's visual flies into the chip or tab that would bring it back and disappears into it; turning that chip on spills them back out into their places, while items that stay glide to make room. Use when the user wants filtering that shows where items go, items collapsing into a tag, chip, tab or folder, many-to-one shared-element transitions, or the Tuck example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/tuck"
---

# Tuck + Spill

Filtering that shows where things go. Turn on "A" and every item only in "B" flies into the "B" chip and disappears into it. They aren't gone: they're in the chip that brings them back. Turn "B" on and they spill back out into their places, while A-only items tuck into "A". Items that stay glide to make room.

## Where this fits

**Shape it needs:** a list of items filtered by **exclusive categories**, each with its own visible control (chip, tab, segmented button, sidebar folder). Every hidden item must belong to one control it can tuck into.

**Fits, for example:** an issue list with status tabs (Open / Closed), a task board filtered by assignee chips, a photo library with album chips, an inbox with category tabs, a store filtered by department.

Doesn't fit free-text search or multi-select tag filters, where a hidden item has no single home: suggest `vt-search-reflow` instead.

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
- `vt-compare-split`: a list where a few items are picked and compared side by side

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition`, `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app: it's client state.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, the `tuck` morph, `tuck-card` (content fade) and `tuck-shift` (glide).
- `references/tuck-catalog.tsx`: `selectFilter`, `tuckedIn`, `TuckTargets`, and the item boundaries.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` file is copied from the demo shop, where products stand in for the app's items and gender for its categories. `QuantityStepper`, `@/lib/media` and the `ToggleGroup` UI are shop-only.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

### 2. One typed Transition

```tsx
function selectFilter(next: Category | null) {
  startTransition(() => {
    addTransitionType("tuck")
    setFilter(next)
  })
}
```

### 3. Two places per visual, one rendered at a time

Every item's visual has the same name in two places: on the item in the list, and an invisible target inside a chip. The filter decides which one is rendered, never both, so React pairs them:

```tsx
const tuckName = (item: Item) => `tuck-${item.id}`
const tuckShare = { tuck: "tuck", default: "none" }

// On the item
<ViewTransition name={tuckName(item)} share={tuckShare} default="none">
  <div className="visual">…</div>
</ViewTransition>

// Inside each chip (give the chip position: relative): the items it's holding
function TuckTargets({ items }: { items: Item[] }) {
  return items.map((item) => (
    <ViewTransition key={item.id} name={tuckName(item)} share={tuckShare} default="none">
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2" />
    </ViewTransition>
  ))
}
```

A chip holds what the **current** filter hides in its category: `filter && filter !== chip ? items.filter((i) => i.category === chip) : []`. The target's snapshot is blank, so the visual cross-fades into nothing as it shrinks into the chip. Targets are out of flow, so the chip never changes size.

If items have no distinct visual (plain text rows), name the row's content instead. It shrinks into the chip the same way.

### 4. The item around the visual

Keyed, directly inside the list container, type-keyed so only filtering animates it:

```tsx
<ViewTransition
  key={item.id}
  enter={{ tuck: "tuck-card", default: "none" }}
  exit={{ tuck: "tuck-card", default: "none" }}
  update={{ tuck: "tuck-shift", default: "none" }}
  default="none"
>
  <Row item={item} />
</ViewTransition>
```

The rest of the item fades out while its visual flies off, and fades in once an arriving visual has landed.

### 5. Accessibility

Label each chip with its count, for example `aria-label="Closed, 12 tucked away"`.

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- Items in no category (or in every category) never tuck; they just stay.
- Every name must be rendered in exactly one place at a time.
- Every hidden item gets a target. Fine for dozens; for hundreds, tuck only the ones on screen and let the rest fade.

## Motion rules

The CSS already follows these: 300ms on the drawer curve, the `tuck` group above the list (`z-index: 50`), content exits (150ms) faster than entrances (250ms), never `ease-in`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Turning a filter on: hidden items' visuals fly into the other chip and vanish. The rest glide together.
- Turning that chip on: they spill back out into their places.
- Unrelated updates don't move anything.
