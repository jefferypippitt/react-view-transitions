---
name: vt-expand-carousel
description: Add an Expand + Carousel view transition to any React 19.3+ app. Clicking a list item opens an in-page side panel or sheet without a route change; the item's visual (image, avatar, icon or title) morphs into the panel while it slides in, the remaining items close the gap, and prev/next inside the panel slides the content like a carousel. Use when the user wants a quick view, inspector, preview pane or drawer that expands from a list item, or the Expand example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/expand"
---

# Expand + Carousel

A panel that opens in the page. It's state, not a route:

1. **Expand**: opening an item removes it from the list and mounts a panel. The item's visual and the panel's visual share a `name`, so it morphs into the panel while the panel slides in from the edge. The rest of the item fades, and the items after it glide over to close the gap. Closing reverses all of it for whichever item the panel is on.
2. **Carousel**: prev/next inside the panel is typed `nav-forward` / `nav-back`. The panel stays put and its content slides. Ordered swaps inside it (variants, tabs) slide the same way.

## Where this fits

**Shape it needs:** a list (or grid, or table) and a panel, sheet or drawer that shows one item in more detail on the same page.

**Fits, for example:** an issue tracker's inspector panel, an inbox preview pane, a CRM contact drawer, a file browser's details sheet, a product quick view.

If the detail opens on its own route instead, suggest `vt-morph-slide`.

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
- Any React app: it's all client state, no router involved.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, keyframes, the `expand` morph, `sheet-in` / `sheet-out`, `carousel-forward` / `carousel-back`, and `nav-forward` / `nav-back` for page slides.
- `references/expand-catalog.tsx`: the list, open/close/step logic, focus and scroll restore.
- `references/quick-view.tsx`: the panel, `expandShare`, `CarouselTransition`, keyboard shortcuts.
- `references/slide-transition.tsx`: only needed if the user also wants directional page slides.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart, the UI kit and the filter/grouping logic are shop-only. Port the `<ViewTransition>` wiring and the open/close/step handlers.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` / `slide` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block.

If the app's panel opens from the left or the bottom, change `--slide-offset` in `.sheet-in` / `.sheet-out` (to `-100%`, or `0 100%`).

### 2. Open and close in a Transition

```tsx
const [openId, setOpenId] = useState<string | null>(null)

function show(id: string | null, step?: "nav-forward" | "nav-back") {
  startTransition(() => {
    if (step) addTransitionType(step)
    setOpenId(id)
  })
}
```

### 3. Take the open item out of the list

Render the list without the open item, each item in a bare keyed boundary **directly inside the list container**:

```tsx
{items.filter((i) => i.id !== openId).map((item) => (
  <ViewTransition key={item.id}>
    <Row item={item} onOpen={() => show(item.id)} />
  </ViewTransition>
))}
```

A name can be mounted only once, so removing the item is what lets its visual pair with the panel. If the app must keep the row visible (a table that shouldn't reflow), keep the row but drop its `name` while open. The visual then fades instead of morphing, which is fine.

### 4. Pair the visuals, but only for open and close

Use the same `name` on the item's visual and the panel's visual, with a type-keyed `share` so prev/next doesn't fly visuals back to their rows:

```tsx
const expandShare = { "nav-forward": "none", "nav-back": "none", default: "expand" }

<ViewTransition name={`expand-${item.id}`} share={expandShare} default="none">
  <div className="visual">…</div>
</ViewTransition>
```

### 5. Slide the panel in and out

```tsx
<ViewTransition enter="sheet-in" exit="sheet-out" default="none">
  <div role="dialog" className="fixed top-0 right-0 bottom-0 w-full max-w-xl">…</div>
</ViewTransition>
```

The `expand` group has `z-index: 50` so the morphing visual stays above the panel. If the app already has a dialog or drawer component, wrap its content element, as long as it mounts and unmounts with the open state (not after its own exit animation).

### 6. Carousel inside the panel

Key the panel's body by the item inside a `CarouselTransition` (in `quick-view.tsx`). It's like `SlideTransition`, but the new content fades in while the old leaves, so the panel never looks empty. Do the same for ordered swaps inside it.

### 7. Focus, scroll and keys

- On close, scroll the returning item into view and focus it in a `useLayoutEffect`. It runs before the new snapshot, so the visual lands where the item really is.
- Esc and arrow keys call the same handlers **without** `startTransition`, so they're instant.
- Focus the close button on open, and give the panel `role="dialog"` and an `aria-label`.

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
- If the item isn't removed from the list (or its name dropped) while open, the name is mounted twice and the morph silently fails.
- Prev/next must be typed. An untyped step would resolve `share` to `expand` and fly visuals to and from their rows.
- Unrelated updates (a badge count) shouldn't move anything: every named boundary has `default="none"`.

## Motion rules

The CSS already follows these: durations at or under 300ms, closing faster than opening (200ms vs 300ms), custom curves (never `ease-in`), separate `-out` keyframes instead of `reverse`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Open an item: its visual flies into the panel as it slides in, and the items after it close the gap.
- Next/prev: the content slides, the panel stays, and no visual flies to the list.
- Close: the visual flies back into its item, which is scrolled into view and focused.
- Esc closes instantly.
