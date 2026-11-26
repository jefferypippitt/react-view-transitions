---
name: vt-shear
description: Add a Shear view transition to any React 19.3+ app. The old view leans over (skewX) as it fades and the new one arrives leaning the other way and straightens up, on navigation, on a filtered or tabbed list swap and on any swapped content. Works on any pages or content, not just images. Use when the user wants a skew, shear, lean or italic-style page transition between routes, tabs or views, or the Shear example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.1.0"
  demo: "/shear"
---

# Shear

Same structure as a page fade, with one 2D animation: a shear. Nothing travels, rotates or scales. The outgoing view leans over (`skewX(-4deg)`) as it fades out, and the incoming one arrives leaning the other way (`skewX(6deg)`) and straightens as it fades in, so the hand-off reads as one rocking motion. It works on three things:

1. **Pages** on navigation.
2. **A swapped set** (a filtered or tabbed list), keyed by the selection.
3. **Swapped content** (a variant, a tab panel), keyed by the selection.

## Where this fits

**Shape it needs:** pages, or a region whose content gets replaced. Almost every app has this.

**Fits, for example:** route changes, onboarding steps, tab panels, a modal's steps, switching a chart's time range, a photo switching colors.

Terms used below:

- **item**: any record the app lists (a user, file, post, issue, song, product, table row).
- **visual**: the element that carries an item's identity on screen (an image, avatar, icon, chart, heading, or the whole card).

Before editing anything:

1. **Find the shape, not the content.** Look for where the shape above exists in the user's app. The demo is a shop with product photos, but nothing here depends on products or images. If the user named a place, use it. If several places fit, list them and ask which ones.
2. **Stop if nothing fits.** Tell the user what's missing (for example "this needs filter chips, and the app has none") and suggest the closest skill from the list below. Don't build new UI, sample data or placeholder pages to make it fit.
3. **Keep the app's own markup, styling and data.** The snippets use Tailwind classes and `<img>` for brevity. Translate them to whatever the app uses (CSS modules, styled-components, plain CSS, a component library).

Other skills in this set, by the shape they need:

- `vt-fade`, `vt-blur`, `vt-fold`, `vt-shear`: any pages or swappable content
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
- `vt-lift-swing-sway`: a grid that opens detail pages with prev/next, told as a clothing rail

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: works with no config.
- Other routers: the navigation must run inside `startTransition`. No router: wrap the state change in `startTransition`.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, keyframes and the `shear-in` / `shear-out` classes.
- `references/catalog.tsx`, `references/product-view.tsx`: the demo's grid and detail view. The demo passes `enter="shear-in" exit="shear-out"` to both.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart and the `ToggleGroup` UI are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block: it replaces the shear with a plain cross-fade.

### 2. Shear pages

Wrap each page's content (not the layout, header or nav):

```tsx
<ViewTransition enter="shear-in" exit="shear-out" default="none">
  <div>…page…</div>
</ViewTransition>
```

Add `key={item.id}` on dynamic routes where navigation stays on the same route.

### 3. Shear a swapped set (optional)

```tsx
<ViewTransition key={filter ?? "all"} enter="shear-in" exit="shear-out" default="none">
  <ul>{items.map(…)}</ul>
</ViewTransition>

onChange={(next) => startTransition(() => setFilter(next))}
```

Keep the selection in client state so only the set shears, not the whole page.

### 4. Shear swapped content (optional)

Key a boundary by the selection, inside the region that stays, and update it in `startTransition`:

```tsx
<ViewTransition key={selected.id} enter="shear-in" exit="shear-out" default="none">
  <Content of={selected} />
</ViewTransition>
```

## Gotchas

- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Any other image can be snapshotted blank and pop in mid-animation. So don't lazy-load images a transition mounts, and don't give them `onLoad`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead, which gives the same optimized `src` / `srcSet` / `sizes`. `references/product-image.tsx` is that as a drop-in (`ProductImage`). To skip the wait as well, preload the bigger image when the user points at or focuses whatever opens it (`preload(src, { as: "image", imageSrcSet, imageSizes })` from `react-dom`, on `pointerenter` and `focus`), which `preloadOnIntent` in the same file does,, with the same `sizes` as the image that will show it, so the browser picks the same file.
- Skew shifts each edge by its distance from the pivot (the snapshot center), so very tall snapshots lean further at the top and bottom. Wrap the content, not a full-height layout box, and lower the angles if a long page leans too far.
- A pinned header or nav inside the boundary shears with it. Keep it outside the boundary, or give it its own `view-transition-name` so it stays put.
- A plain `setState` never animates. Wrap updates in `startTransition`.
- Keyboard shortcuts stay outside Transitions so they're instant.

## Motion rules

The CSS already follows these: durations at or under 300ms, exits faster than entrances, custom `--ease-out` (never `ease-in`), a separate `shear-out` keyframe instead of `reverse`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Navigation: the old page leans over and fades, the new one leans in from the other side and straightens.
- With reduced motion on: a plain short cross-fade, no skew.
