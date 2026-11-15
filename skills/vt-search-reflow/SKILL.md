---
name: vt-search-reflow
description: Add a Search + Reflow view transition to any React 19.3+ app. As the user types, filters or sorts, results that stop matching shrink away, ones that match again pop back in, and results that stay glide to their new places, driven by useDeferredValue so fast typing never queues animations. Works on any list, grid or table of results. Use when the user wants animated search results, filter-as-you-type, list items that reflow on filtering or sorting, or the Search example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/search"
---

# Search + Reflow

The input updates right away. The results render from a deferred copy of the query (`useDeferredValue`), and a deferred render is a Transition, so each result update animates:

- **Exit**: results that stop matching shrink and fade away quickly.
- **Enter**: results that match again pop in just after.
- **Update (reflow)**: results that stay glide to their new places.

Fast typing doesn't queue an animation per keystroke: the deferred value skips to the latest query once the previous render is done.

## Where this fits

**Shape it needs:** a list, grid or table of items that changes as the user types, filters or sorts.

**Fits, for example:** a contacts search, a command palette's results, a docs sidebar filter, a settings search, an icon picker, a product search, a sortable leaderboard.

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

- React 19.3+ (`ViewTransition` exported from `react`). On older React, tell the user to upgrade and stop.
- Any React app. Client-side filtering works as shown. For server search, the same boundaries work if the results arrive through a Transition or Suspense.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, `search-in` / `search-out` / `search-move`.
- `references/search-catalog.tsx`: the deferred query, the result boundaries, the empty state and match highlighting.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` file is copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the UI kit and the gender filter are shop-only.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

### 2. Defer the query

```tsx
const [query, setQuery] = useState("")
const deferredQuery = useDeferredValue(query)
const results = items.filter((item) => matches(item, deferredQuery.trim().toLowerCase()))

<input value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
```

The input stays instant; only the results animate. For sort or filter controls (not typing), use `startTransition(() => setSort(next))` instead.

### 3. One boundary per result

Keyed, directly inside the results container, with explicit classes and `default="none"` so nothing else (a badge count) animates them:

```tsx
{results.map((item) => (
  <ViewTransition key={item.id} enter="search-in" exit="search-out" update="search-move" default="none">
    <Result item={item} />
  </ViewTransition>
))}
```

### 4. Empty state

Give "no results" the same pop, so it reads as the last result leaving and a message taking its place:

```tsx
<ViewTransition enter="search-in" exit="search-out" default="none">
  <p>Nothing matches '{deferredQuery.trim()}'.</p>
</ViewTransition>
```

### 5. Accessibility

Announce the count with `aria-live="polite"`, label the input, and have Esc clear it (a plain `setState` on the input).

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- No wrapper element between the results container and the boundaries, or results can't move.
- Don't key the container by the query: that would swap the whole set instead of reflowing it.
- Tables: wrap each row. If the table's layout breaks during the transition, lay the rows out with CSS grid instead of `display: table`.
- Virtualized lists only render what's on screen, so items scrolling in or out of the window will pop. That's expected.

## Motion rules

The CSS already follows these: exits (120ms) faster than entrances (200ms, starting 60ms later so the leaving result is gone first), 250ms reflow on the drawer curve, never `ease-in`, separate `-out` keyframes, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Typing narrows the results: non-matches shrink away and the rest glide together.
- Deleting characters pops results back in.
- Typing fast doesn't stack up animations.
