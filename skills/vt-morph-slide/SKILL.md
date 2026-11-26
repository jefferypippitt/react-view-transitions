---
name: vt-morph-slide
description: Add a Morph + Slide view transition to any React 19.3+ app. A visual shared by a list item and its detail view (an image, avatar, icon or title) morphs from one to the other and back, pages slide left/right by navigation direction (deeper or next = forward, up or previous = back), list items glide to their new places when filtered, and ordered swaps (variants, steps) slide in order. Use when the user wants shared-element transitions between a list and a detail page, directional page slides, prev/next slides, or the Morph example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/morph"
---

# Morph + Slide

One pattern, four parts:

1. **Morph**: the same visual on a list item and on its detail view shares a `name`, so the browser flies it from one to the other.
2. **Slide**: pages slide based on the navigation's direction. `nav-forward` (deeper or next) comes in from the right. `nav-back` (up or previous) comes in from the left. Navigation without a type doesn't slide.
3. **Reflow**: when a filter changes, items that stay glide to their new places instead of the whole list swapping.
4. **Ordered swap**: picking another variant or step on the detail view slides it the same way prev/next does.

## Where this fits

**Shape it needs:** a list (or grid, or table) of items, and a detail view for one item, where something visible appears in both.

**Fits, for example:** a contact list → profile (the avatar morphs), an inbox → open email (the subject line), a file grid → preview (the thumbnail), a project board → project page (the project icon and title), a product grid → product page.

If there's no detail view, only the slide and reflow parts apply: say so and offer just those, or suggest `vt-expand-carousel` for an in-page panel.

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

- React 19.3+ (`ViewTransition` and `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: works with no config. `<Link transitionTypes={[...]}>` needs a Next version that supports the prop; if it doesn't exist, use the fallback in step 5.
- Other routers: wrap the navigation in `startTransition(() => { addTransitionType("nav-forward"); navigate(...) })`.
- No router (list and detail in one screen, switched by state): same handler, with `setSelected(...)` in place of `navigate(...)`.
- Browsers without view transition types (pre Chromium 125) just skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, keyframes, `nav-forward` / `nav-back` slides and the `morph` class.
- `references/slide-transition.tsx`: the `SlideTransition` component.
- `references/example.tsx`: the whole pattern with the shop removed (grid, detail, variants, prev/next). Read it before editing.
- `references/history-view-transitions.tsx`: optional Next.js-only fix for browser back/forward.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the app's global stylesheet.

- If the app already defines `--duration-*` / `--ease-*` tokens, keep the existing names and map these to them. Don't add duplicates.
- If a `fade` / `fade-out` keyframe already exists with different behavior, rename ours (for example `vt-fade`) everywhere in the block.
- Keep the `prefers-reduced-motion` block. It replaces movement with a quick cross-fade.

### 2. Add `SlideTransition`

Copy `references/slide-transition.tsx` into the app's components folder. It has no hooks, so it works in server and client components.

### 3. Wrap each page's content

In each page that takes part (the list, the detail view and anything a level deeper), wrap the content in `<SlideTransition>`.

- **Detail views with prev/next on the same route** (`/items/[id]` → `/items/[id]`) must key it: `<SlideTransition key={item.id}>`. Without a key React updates in place and nothing slides.
- Don't wrap the layout, a sticky header or a persistent nav. Only the content that changes.

### 4. Pair the visuals

Wrap the visual's box on **both** the list item and the detail view:

```tsx
<ViewTransition name={`item-${item.id}`} share="morph" default="none">
  <div className="avatar">…</div>
</ViewTransition>
```

- The `name` must be identical on both sides and unique on the page. Only one element can hold a name at a time.
- `default="none"` stops the visual from cross-fading on unrelated transitions. Keep `share="morph"` with it, or the pair stops morphing.
- For images: use the same `object-fit` and the same padding (in %) on both ends so the proportions match mid-flight.
- Pick one or two visuals per item. Naming every field on the row is a different pattern (`vt-layout-stagger`).

### 5. Tag navigations with a direction

| Navigation                             | Type          |
| -------------------------------------- | ------------- |
| List → detail, anything a level deeper | `nav-forward` |
| Back link up the hierarchy             | `nav-back`    |
| Next item / next step                  | `nav-forward` |
| Previous item / step                   | `nav-back`    |
| Filters, tabs, browser back/forward    | none          |

Next.js: `<Link href={…} transitionTypes={["nav-forward"]}>`.

Fallback when `transitionTypes` isn't available (or another router): a click handler that calls `startTransition(() => { addTransitionType("nav-forward"); router.push(href) })`.

### 6. Let the list reflow

If the list has filtering, sorting or search:

- Wrap each item in `<ViewTransition key={item.id}>` **directly inside the list container**, with no wrapper element between them.
- Update the filter state inside `startTransition(() => setFilter(next))`. A plain `setState` does not animate.

### 7. Slide ordered swaps (optional)

If the detail view switches between ordered things (variants, photos, steps, tabs), key a `SlideTransition` by the selection inside the region that stays, and set the direction from the index (see `selectVariant` in `references/example.tsx`).

### 8. Browser back/forward (optional, Next.js only)

By default the browser's back/forward buttons don't animate: React renders `popstate` updates synchronously. `references/history-view-transitions.tsx` works around that. Mount `<HistoryViewTransitions />` once in the root layout's `<body>`. It depends on Next's internal history marker (`__NA`), so tell the user that and let them decide whether to add it.

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

## Motion rules

The values in `transitions.css` already follow these rules. Keep them if you adjust anything:

- UI durations stay at or under 300ms, and exits run faster than entrances.
- Use custom curves (`--ease-out`, `--ease-drawer`). Never `ease-in`.
- Exits use their own `-out` keyframes, never `<keyframes> reverse`, because `reverse` also flips the easing.
- Reduced motion means a short cross-fade with no movement, never `0s`.
- Keyboard shortcuts update state outside a transition, so they stay instant.

## Check your work

- List → detail: the visual flies into place and the rest of the page slides in from the right.
- Back: the page slides out to the right and the visual lands back in its list item.
- Prev/next on the detail view slides in the matching direction.
- Changing a filter glides the remaining items. No page-wide slide.
- With reduced motion turned on in the OS: only cross-fades.
- Common failure: the morph doesn't run because the name differs between pages, appears twice on one page, or `share` is missing next to `default="none"`.
