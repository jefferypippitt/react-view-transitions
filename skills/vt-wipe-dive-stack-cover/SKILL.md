---
name: vt-wipe-dive-stack-cover
description: Add a Wipe + Dive + Stack + Cover set of view transitions to any React 19.3+ app. A filtered list wipes its new results across the old ones, opening an item dives the whole page in depth while its visual morphs into the detail view, swapping a variant stacks the new one over the old, and a cart or side page rises as a sheet over the page. Use when the user wants a wipe or reveal on filter, a zoom/depth page transition, a slide-over card stack, a bottom-sheet page transition, or the Wipe + Dive + Stack + Cover example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.1.0"
  demo: "/wipe"
---

# Wipe + Dive + Stack + Cover

Four transitions, each on a different part of an app:

1. **Wipe**: a filter change. The new results are uncovered by one moving edge as the old ones are wiped off, rightward for a filter further along the row and leftward for one before it. The filter controls switch at once (`useOptimistic`), so they never cross-fade with the page.
2. **Dive**: list → detail and back. The whole page moves in depth: going in, the list swells past the viewer as the detail page comes up from behind, while the item's visual morphs into place. Coming back out reverses it. The page is styled through the root snapshot with type-scoped CSS (`:root:active-view-transition-type(dive-in)`), not a page boundary.
3. **Stack**: swapping a variant (a color, a photo). The new one slides in over the old one, which sinks back beneath it.
4. **Cover**: opening a cart, checkout or other side page. It rises from the bottom edge like a sheet while the page under it sinks back, and drops away on Back.

They're independent. Add the ones that fit.

## Where this fits

**Shapes it needs:**

- Wipe: a list or grid filtered by chips, tabs or a segmented control.
- Dive: a list and a detail view that share a visual (an image, avatar, cover).
- Stack: one region whose content switches between ordered options.
- Cover: a page reached from persistent chrome (a cart, inbox, settings) that the user opens and closes.

**Fits, for example:** a catalog with category chips, a photo library, a music app's album grid → album page, a dashboard with a notifications page.

**Doesn't fit:** lists where items should visibly move to new places (use `vt-search-reflow` or `vt-tuck-spill`), or apps whose pages already use directional slides (Dive replaces them; don't mix the two on the same links).

Terms used below:

- **item**: any record the app lists (a user, file, post, issue, song, product, table row).
- **visual**: the element that carries an item's identity on screen (an image, avatar, icon, chart, heading, or the whole card).

Before editing anything:

1. **Find the shape, not the content.** Look for where the shapes above exist in the user's app. The demo is a shop with product photos, but nothing here depends on products or images. If the user named a place, use it. If several places fit, list them and ask which ones.
2. **Stop if nothing fits.** Tell the user what's missing (for example "Wipe needs filter chips, and the app has none") and suggest the closest skill from the list below. Don't build new UI, sample data or placeholder pages to make it fit.
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

- React 19.3+ (`ViewTransition`, `addTransitionType` and `useOptimistic` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: works with no config. Other setups: run the state change or navigation inside `startTransition`.
- Dive and Cover style the root by transition type, which needs `:active-view-transition-type()` (Chromium 125+, Safari 18.2+, Firefox 144+). Elsewhere the page falls back to the browser's cross-fade. Browsers without view transitions skip everything. Nothing breaks.

## Files

- `references/transitions.css`: tokens, shared keyframes, the shared morph, the four transitions and the reduced-motion block.
- `references/wipe-catalog.tsx`: Wipe (the keyed grid and the optimistic filter) and the list side of Dive.
- `references/product-page.tsx`: the detail side of Dive and the Stack type map.
- `references/product-view.tsx`: the stacking photo and the named detail visual.
- `references/checkout-page.tsx`: Cover's sheet boundary.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart, `Checkout` and the `ToggleGroup` UI are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the `prefers-reduced-motion` block.

If the app has a sticky header, pin it so the root animations don't take it along: give it a unique `view-transition-name` (say `site-header`) and add

```css
::view-transition-group(site-header) {
  animation: none;
  z-index: 100;
}
```

### 2. Wipe a filtered list

Key the list's boundary by the filter, type the change by direction, and give the controls an optimistic copy of the filter:

```tsx
const wipe = { "wipe-forward": "wipe-forward", "wipe-back": "wipe-back", default: "none" }

const [filter, setFilter] = useState(null)
const [pressed, setPressed] = useOptimistic(filter)

function select(next) {
  startTransition(() => {
    addTransitionType(order(next) > order(filter) ? "wipe-forward" : "wipe-back")
    setPressed(next) // controls: before the old snapshot, no animation
    setFilter(next) // list: animates
  })
}

<Chips value={pressed} onChange={select} />
<span>{countFor(pressed)} items</span>
<ViewTransition key={filter ?? "all"} enter={wipe} exit={wipe} default="none">
  <ul className="grid …">…</ul>
</ViewTransition>
```

- The key swaps the list whole, so the old and new lists are two boundaries in the same box. The CSS clips both with one moving edge.
- Items in the list with their own shared names (step 3) must not pair with themselves on a filter change. Key their `share` to the navigation types, as in step 3.
- No natural order (search results)? Always use `wipe-forward`.
- Avoid lazy-loaded images in the list: the new list is a fresh mount, and its images must be ready for the snapshot.

### 3. Dive between list and detail

Name the visual on both sides, with the share keyed to the dive types on the list side:

```tsx
// list item
<ViewTransition name={`item-${item.id}`} share={{ "dive-in": "morph", "dive-out": "morph", default: "none" }} default="none">
  <div className="thumb">…</div>
</ViewTransition>

// detail view
<ViewTransition name={`item-${item.id}`} share="morph" default="none">
  <div className="hero">…</div>
</ViewTransition>
```

Tag the links: list → detail `dive-in`, Back `dive-out`. Next.js: `<Link href={…} transitionTypes={["dive-in"]}>`.

- Don't wrap the pages in a page-level boundary. The page has to stay in the root snapshot, which the CSS scales: a root snapshot is the size of the viewport, so it scales around the screen's center however far the page is scrolled.
- The morph is what makes React start the transition. React only starts one when some boundary takes part; a link to a page with no shared visual won't dive.

### 4. Stack variants (optional)

Key a boundary by the selection, inside the region that stays, and type the change by direction:

```tsx
const stack = { "stack-forward": "stack-forward", "stack-back": "stack-back", default: "none" }

<div className="relative aspect-square overflow-hidden">
  <ViewTransition key={selected.id} enter={stack} exit={stack} default="none">
    <img src={selected.src} alt="" className="absolute inset-0 bg-white" />
  </ViewTransition>
</div>

startTransition(() => {
  addTransitionType(nextIndex > index ? "stack-forward" : "stack-back")
  setSelected(next)
})
```

- The swapped element must be opaque edge to edge (a background, no transparent padding), or the old one shows through the new one as it slides over.
- The demo's `ProductView` tags picks `nav-forward` / `nav-back` and maps them to the stack classes. Use your own type names if the app's pages already slide on `nav-*`.

### 5. Cover a sheet page (optional)

Wrap the sheet page's content in a boundary keyed to the cover types, opaque and at least as tall as the screen:

```tsx
<ViewTransition
  enter={{ "cover-open": "cover-in", default: "none" }}
  exit={{ "cover-close": "cover-out", default: "none" }}
  default="none"
>
  <div className="min-h-svh bg-background">…</div>
</ViewTransition>
```

Tag the link that opens it `cover-open` and every link that leaves it `cover-close`.

- The boundary also makes React start the transition, since the page beneath may have none.
- Without an opaque background, the page under the sheet shows through it on the way up.

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- A plain `setState` never animates. Wrap updates in `startTransition`.
- Keyboard shortcuts stay outside Transitions, so they're instant.
- Browser back/forward start no view transition in React (popstate commits synchronously), so they don't dive or cover. Use links with explicit types for animated Back.
- Don't give any element a CSS `view-transition-name` that matches a React `name`: a duplicate name makes the browser skip the whole transition.

## Motion rules

The CSS already follows these: 300ms or less, custom curves (`--ease-out` for things leaving or arriving, `--ease-drawer` for things travelling, `--ease-swap` for the wipe's edge), exits faster than entrances (the sheet drops in 200ms), separate `-out` keyframes instead of `reverse`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Changing the filter: the new results wipe across, rightward for a filter further along the row. The chips and count switch instantly.
- Opening an item: the list swells and fades, the detail page rises, the visual morphs into place. Back reverses it.
- Picking a later variant slides it in from the right over the old one, which sinks back.
- Opening the sheet page: it rises from the bottom while the page beneath sinks; Back drops it.
- With reduced motion on: plain short cross-fades, nothing moves.
