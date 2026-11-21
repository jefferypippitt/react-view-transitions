---
name: vt-flip-deal
description: Add a Flip + Deal view transition to any React 19.3+ app. Content swapped in place turns over like a card (a 3D flip), and when a filter changes, every grid cell whose item changes flips to the new one, cell after cell, like dealing cards. Use when the user wants a card flip transition, a flip-over effect when a filter, tab, page of results or variant changes, or the Flip + Deal example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/flip"
---

# Flip + Deal

Two uses of one card flip. The old face turns away as the new face turns in from behind, on one curve, so it reads as a single card turning over.

1. **Deal**: a grid whose contents change (a filter, tabs, a results page). Each cell keeps its place. A cell that now holds a different item flips over to show it, one cell after another. Cells that keep their item stay still, extra cells flip away, new cells flip in.
2. **Flip**: one piece of swapped content (a variant photo, a card's front/back, a step). It turns over, leftward when moving forward through an ordered set and rightward when moving back.

## Where this fits

**Shape it needs:** a grid or list whose items get replaced in place (Deal), or one region whose content gets swapped (Flip).

**Fits, for example:** a filtered card grid, paginated results, a dashboard's tiles switching time ranges, flashcards, a product or avatar picker, a two-sided card (front/back).

**Doesn't fit:** lists where items should visibly move to new positions (use `vt-search-reflow` or `vt-tuck-spill`), or long text-heavy rows, where a 3D turn reads as noise.

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

- React 19.3+ (`ViewTransition` and `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: works with no config. Other setups: run the state change inside `startTransition`.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, `wave-1` … `wave-16` stagger classes, the `flip-forward` / `flip-back` classes and the reduced-motion block.
- `references/flip-catalog.tsx`: the dealt grid.
- `references/product-view.tsx`: the flipping photo (picking a color).
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart and the `ToggleGroup` UI are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens, `fade` keyframes or wave classes, map ours to them instead of duplicating.

### 2. Deal a grid

Type the change by direction, and key each cell's boundary by its **position and item**:

```tsx
function deal(index: number) {
  const wave = `wave-${Math.min(index, 16)}`
  return {
    "deal-forward": `flip-forward ${wave}`,
    "deal-back": `flip-back ${wave}`,
    default: "none",
  }
}

function select(next) {
  startTransition(() => {
    addTransitionType(order(next) > order(current) ? "deal-forward" : "deal-back")
    setCurrent(next)
  })
}

<ul className="grid …">
  {items.map((item, index) => (
    <ViewTransition key={`${index}-${item.id}`} enter={deal(index)} exit={deal(index)} default="none">
      <li>…</li>
    </ViewTransition>
  ))}
</ul>
```

- The key is the whole trick. Same item in the same cell: same key, nothing happens. A different item: the old key exits and the new one enters in the same spot, so one flips away as the other flips in.
- Keep `<ViewTransition>` directly inside the grid, with no wrapper element between them.
- No natural order (search results)? Always use `deal-forward`.

### 3. Flip swapped content (optional)

Key a boundary by the selection, inside the region that stays, and type the change by direction:

```tsx
const flip = { "nav-forward": "flip-forward", "nav-back": "flip-back", default: "none" }

<div className="relative aspect-square">
  <ViewTransition key={selected.id} enter={flip} exit={flip} default="none">
    <img src={selected.src} alt="" />
  </ViewTransition>
</div>

startTransition(() => {
  addTransitionType(nextIndex > index ? "nav-forward" : "nav-back")
  setSelected(next)
})
```

If the app already uses `nav-forward` / `nav-back` for page slides, use your own type names here (for example `flip-next` / `flip-prev`) so a page boundary never picks them up.

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- A plain `setState` never animates. Wrap updates in `startTransition`.
- Keyboard shortcuts stay outside Transitions, so they're instant.
- Grids past 16 cells share the last wave, so long grids finish in about 600ms rather than dragging on.

## Motion rules

The CSS already follows these: 300ms on a shared ease-in-out curve (`--ease-swap`, the two halves of one moving object), 20ms between cells, a separate `flip-out` keyframe instead of `reverse`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Changing the filter: cells with a new item flip one after another; unchanged cells stay still.
- Picking a later color flips the photo leftward, an earlier one rightward.
- With reduced motion on: a plain short cross-fade, no turning.
