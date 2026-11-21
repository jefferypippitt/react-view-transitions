---
name: vt-compare-split
description: Add a Compare + Split view transition to any React 19.3+ app. Pinning items opens a compare tray that rises in place while the list below glides down to make room; opening Compare flies every pinned item's visual from its spot in the list into side-by-side columns at once, removing a column lets the rest reflow to fill the row, and ordered swaps inside a column slide in order. Use when the user wants side-by-side comparison, a compare tray or bar, pinning or shortlisting items, many shared-element morphs in one transition, or the Compare example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/compare"
---

# Compare + Split

Pick a few items and see them side by side.

1. **Pin**: pinning the first item opens a compare tray above the list. The tray rises in, its chips scale in one by one, and the list below is its own boundary, so it glides down to make room instead of jumping.
2. **Compare**: opening the comparison swaps the list for 2–4 columns in one transition. Every pinned item's visual has the same name in the list and in its column, so all of them fly from their cells into the split at once, and back on close.
3. **Split**: each column is a keyed boundary. Removing one fades it out while the others reflow to fill the row. Ordered swaps inside a column (variants, sizes, plans) slide in the direction of the pick.

Pinning is typed `compare-pin`, opening `compare-open`, closing `compare-close`, removing a column `compare-remove`. Nothing else runs these animations.

## Where this fits

**Shape it needs:** a list or grid of items with comparable attributes, where the user picks a small set (2–4) to look at together.

**Fits, for example:** pricing plans, laptops or phones in a store, hotel rooms, insurance quotes, candidate profiles, cloud instance types, apartments, a product grid.

If the user only ever looks at one item at a time, suggest `vt-morph-slide` (list → detail) or `vt-expand-carousel` (side panel) instead. If they're collecting items for later rather than comparing them, suggest `vt-fly-dock`.

Terms used below:

- **item**: any record the app lists (a user, file, post, issue, song, product, table row).
- **visual**: the element that carries an item's identity on screen (an image, avatar, icon, chart, heading, or the whole card).

Before editing anything:

1. **Find the shape, not the content.** Look for where the shape above exists in the user's app. The demo is a shop with product photos, but nothing here depends on products or images. If the user named a place, use it. If several places fit, list them and ask which ones.
2. **Stop if nothing fits.** Tell the user what's missing (for example "this needs items with attributes worth comparing, and the app lists only names") and suggest the closest skill from the list below. Don't build new UI, sample data or placeholder pages to make it fit.
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
- Any React app: it's client state. The comparison view replaces the list in place; it can also be its own route if the pinned ids live in the URL or a shared store (see Gotchas).
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, the `morph` visual flight, `fade-in`, `carousel-forward` / `carousel-back` slides, and the `compare-*` classes (tray, chips, shift, columns).
- `references/compare-catalog.tsx`: `togglePin`, `openCompare`, `closeCompare`, `removeFromCompare`, `selectColor`, the tray, the list boundary, the columns and `ProductCard`.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` file is copied from the demo shop, where products stand in for the app's items and price, fit and color for the attributes being compared. `QuantityStepper`, `@/lib/media`, the UI kit and the filter are shop-only.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

### 2. Pinned ids and four typed Transitions

```tsx
const MAX_COMPARE = 4
const [pinnedIds, setPinnedIds] = useState<string[]>([])
const [comparing, setComparing] = useState(false)

function togglePin(id: string) {
  const isPinned = pinnedIds.includes(id)
  if (!isPinned && pinnedIds.length >= MAX_COMPARE) return
  startTransition(() => {
    addTransitionType("compare-pin")
    setPinnedIds((current) => (isPinned ? current.filter((i) => i !== id) : [...current, id]))
  })
}

function openCompare() {
  startTransition(() => {
    addTransitionType("compare-open")
    setComparing(true)
  })
}

function closeCompare() {
  startTransition(() => {
    addTransitionType("compare-close")
    setComparing(false)
  })
}

function removeFromCompare(id: string) {
  const remaining = pinnedIds.filter((i) => i !== id)
  startTransition(() => {
    // One column left isn't a comparison: close instead.
    addTransitionType(remaining.length < 2 ? "compare-close" : "compare-remove")
    setPinnedIds(remaining)
    if (remaining.length < 2) setComparing(false)
  })
}
```

Keep pinned order as the order of the columns: users expect the first thing they pinned on the left.

### 3. The tray and the list it pushes

The tray mounts with the first pin and unmounts with the last. Its chips are keyed, so new ones scale in and the rest shift over. The list below is wrapped in its own boundary with only `update`, so it glides instead of jumping when the tray appears:

```tsx
{pinned.length > 0 && (
  <ViewTransition
    enter={{ "compare-pin": "compare-bar-in", default: "none" }}
    exit={{ "compare-pin": "compare-bar-out", default: "none" }}
    default="none"
  >
    <section aria-label="Compare tray">
      {pinned.map((item) => (
        <ViewTransition
          key={item.id}
          enter={{ "compare-pin": "compare-chip-in", default: "none" }}
          exit={{ "compare-pin": "compare-chip-out", default: "none" }}
          update={{ "compare-pin": "compare-shift", default: "none" }}
          default="none"
        >
          <Chip item={item} />
        </ViewTransition>
      ))}
      <button disabled={pinned.length < 2} onClick={openCompare}>Compare ({pinned.length})</button>
    </section>
  </ViewTransition>
)}

<ViewTransition update={{ "compare-pin": "compare-shift", default: "none" }} default="none">
  <div className="grid">…cards…</div>
</ViewTransition>
```

Each card shows whether it's pinned (`aria-pressed`) and disables pinning at the limit.

### 4. Name each visual in both views

The same name on the card's visual and on the column's visual. Only one view is rendered at a time, so React pairs every pinned item and they all fly in the same transition:

```tsx
const compareShare = { "compare-open": "morph", "compare-close": "morph", default: "none" }

// In the card
<ViewTransition name={`compare-${item.id}`} share={compareShare} default="none">
  <div className="visual">…</div>
</ViewTransition>

// In the column
<ViewTransition
  name={`compare-${item.id}`}
  share={compareShare}
  enter={{ "compare-open": "fade-in", default: "none" }}
  default="none"
>
  <div className="visual">…</div>
</ViewTransition>
```

Unpinned cards have names too, but nothing in the comparison matches them, so they leave with the list.

### 5. One boundary per column

Directly inside the columns container, keyed by item:

```tsx
<ViewTransition
  key={item.id}
  enter={{ "compare-open": "compare-col-in", default: "none" }}
  exit={{ "compare-close": "compare-col-out", "compare-remove": "compare-col-out", default: "none" }}
  update={{ "compare-remove": "compare-shift", default: "none" }}
  default="none"
>
  <Column item={item} onRemove={() => removeFromCompare(item.id)} />
</ViewTransition>
```

The column text fades in after the visuals start flying. Set the grid's column count from the number of pinned items (2, 3 or 4 across on wide screens, one on phones) so the remaining columns widen and reflow when one is removed.

Line the attributes up in the same order in every column, so the eye can scan across. Highlight what differs (the demo tags the lowest price).

### 6. Slide ordered swaps in a column (optional)

Key the column's visual content by the selection, and set the direction from the index:

```tsx
startTransition(() => {
  addTransitionType(to > from ? "nav-forward" : "nav-back")
  setSelection(next)
})

<ViewTransition
  key={selection}
  enter={{ "nav-forward": "carousel-forward", "nav-back": "carousel-back", default: "none" }}
  exit={{ "nav-forward": "carousel-forward", "nav-back": "carousel-back", default: "none" }}
  default="none"
>
  <img … />
</ViewTransition>
```

### 7. Keys

Esc closes the comparison with a plain `setComparing(false)`, outside a Transition, so it's instant. Keyboard shortcuts never animate.

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does, with the same `sizes` as the image that will show it, so the browser picks the same file.
- **Preload every pinned item's big visual.** The comparison mounts up to four large images at once. The demo preloads each pinned item's column-sized images (all variants) as soon as it's pinned, so Compare opens without waiting.
- **Cap the set.** Four columns is the most that stays readable side by side. Disable pinning past the limit and say why (the button reads "Pick 1 more" below two).
- **Every name in one place at a time.** If the tray's chips reused the visual's name, they'd collide with the card. The demo's chips have their own unnamed thumbnails.
- **As a separate route.** In Next.js, put the pinned ids in the URL (`/compare?ids=a,b,c`) and navigate with `transitionTypes={["compare-open"]}` on the link. The visual pairs across the route just like across the in-page swap. Browser back runs no view transition (see the React skill's notes on `popstate`).
- Filtering, quantities and other updates aren't typed `compare-*`, so they move nothing.

## Motion rules

The CSS already follows these: visuals fly 300ms on the drawer curve with a brief blur mid-flight, the tray and chips enter in 250ms and leave in 150ms, columns fade in after a short delay so the visuals lead, never `ease-in`, nothing scales from 0 (chips start at `scale(0.95)`), separate `-out` keyframes, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Pin one item: the tray rises in and the list glides down. Pin more: chips scale in beside the first.
- Unpin the last item: the tray leaves and the list glides back up.
- Open Compare: every pinned visual flies into its column at once, and the column details fade in.
- Remove a column: it fades out and the others widen to fill the row. Removing down to one closes the comparison.
- Swaps inside a column slide left or right.
- Esc closes instantly. Filtering doesn't animate.
