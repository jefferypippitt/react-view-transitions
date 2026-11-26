---
name: vt-lift-swing-sway
description: Add Lift + Swing + Sway page transitions to any React 19.3+ app. The list is a clothing rail. Opening an item lifts it off its hanger, so its visual morphs into the detail page swinging from its top edge while the other cards jostle. Prev/next rides the next item in along the rail, where it stops and swings before settling. Going back hangs the item up again and the whole rail sways card after card. Use when the user wants physical, storytelling page transitions, pendulum or swing animations, hanging cards, a clothing-rack or wardrobe metaphor, or the Lift + Swing + Sway example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.1.0"
  demo: "/rack"
---

# Lift + Swing + Sway

Page transitions told as a clothing rail. Each one is a moment from browsing a rack in a store:

1. **Lift** (list → detail): the item comes off its hanger. Its visual morphs into the detail page while the image pair swings from a pivot at its top edge: first lifted and lagging behind, then one swing back and it settles. The other cards tip on their hangers as they fade. The detail page's blocks drop into place under it one after another.
2. **Swing** (prev/next on the detail page): you push along the rail. The leaving item is pushed off with its bottom lagging. The arriving one rides in, stops, swings once past centre and settles. The text blocks slide more quietly.
3. **Sway** (detail → list): you hang it back up. Its visual drops onto the hook and swings into its cell, and every card on the rail swings in on its hanger, one after another, as if the rail was bumped.

Everything that swings pivots at its top edge (`transform-origin: 50% 0`), so it hangs instead of spinning. Each swing is a short damped pendulum written as keyframes: two half-swings, the second smaller, each with its own curve so it slows at the end of the arc.

## Where this fits

**Shape it needs:** a list or grid of items that each open a detail page, ideally with prev/next between details, and a way back.

**Fits, for example:** an apparel or accessories shop, a lookbook, a gallery of prints or posters, a wardrobe or outfit app, a hanging-tag product catalog, any collection with a playful, physical tone.

The swing is loud on purpose. For a quiet or very data-heavy app (dashboards, admin tables), suggest `vt-morph-slide` instead.

Terms used below:

- **item**: any record the app lists (a user, file, post, issue, song, product, table row).
- **visual**: the element that carries an item's identity on screen (an image, avatar, icon, chart, heading, or the whole card).

Before editing anything:

1. **Find the shape, not the content.** Look for where the shape above exists in the user's app. The demo is a clothing shop, but nothing here depends on clothes or images. If the user named a place, use it. If several places fit, list them and ask which ones.
2. **Stop if nothing fits.** Tell the user what's missing (for example "this needs a list whose items open their own page, and the app has only one page") and suggest the closest skill from the list below. Don't build new UI, sample data or placeholder pages to make it fit.
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

- React 19.3+ (`ViewTransition`, `addTransitionType` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: `transitionTypes` on `<Link>` adds the types. Other routers: navigate inside `startTransition` and call `addTransitionType`.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, the `lift` / `hang` swings, `sway-off` / `sway-on`, `rail-next` / `rail-prev`, `drop-in` / `lift-off`, `wave-1`…`wave-6`, the prev/next text slide, the type-scoped root cross-fade and reduced motion.
- `references/rack-types.ts`: the five type names. A plain module, so server components can import the values too (values exported from a `"use client"` file reach server components as client references, not strings).
- `references/rack-catalog.tsx`: the grid with one boundary per card, `ProductCard`, `photoShare`, `RackBlock` (a detail-page block), the detail view and the checkout wrapper.
- `references/product-image.tsx`: `ProductImage`, a drop-in for Next.js `<Image>` that never blinks in a transition, plus `preloadOnIntent` and `preloadPhotos` (see Gotchas). Outside Next.js, keep a plain `<img>`.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `Checkout`, `@/lib/media`, the cart, the filter and the UI kit are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens, `fade` / `slide` keyframes or `wave-N` classes, map ours to them instead of duplicating. Keep the reduced-motion block: it replaces every swing with a plain cross-fade.

### 2. Types on every link

| Link | Types |
|------|-------|
| Card → detail | `rack-lift` |
| Detail → list (Back) | `rack-return` |
| Prev / next | `rail-prev` / `rail-next` |
| Any → a page that shows several items (cart, checkout) | `rack-bag` |

```tsx
<Link href={`/items/${item.id}`} transitionTypes={["rack-lift"]}>…</Link>
<Link href="/items" transitionTypes={["rack-return"]}>Back</Link>
<Link href={`/items/${next.id}`} transitionTypes={["rail-next"]}>Next</Link>
```

### 3. The visual: one share map everywhere

The same map on the card's visual, the detail hero, and any other place the item appears (checkout rows). Off the rail it lifts, back on it hangs:

```tsx
const photoShare = { "rack-lift": "lift", "rack-bag": "lift", "rack-return": "hang", default: "none" }

<ViewTransition name={`item-${item.id}`} share={photoShare} default="none">
  <div className="visual">…</div>
</ViewTransition>
```

On the detail hero, add the rail swing for prev/next (no pair forms, so enter/exit run):

```tsx
<ViewTransition
  name={`item-${item.id}`}
  share={photoShare}
  enter={{ "rail-next": "rail-next", "rail-prev": "rail-prev", default: "none" }}
  exit={{ "rack-bag": "lift-off", "rail-next": "rail-next", "rail-prev": "rail-prev", default: "none" }}
  default="none"
>
```

Swinging needs the visual's top edge to be its hook. If the visual is wider than tall, the swing reads as a tilt: lower the angles in `swing-lift` / `swing-hang`.

### 4. The rail: one boundary per card

Each card is a boundary directly inside the grid (no wrapper div), with its place along the rail as a wave:

```tsx
{items.map((item, index) => {
  const wave = Math.min(index, 6)
  const w = wave ? ` wave-${wave}` : ""
  return (
    <ViewTransition
      key={item.id}
      exit={{ "rack-lift": `sway-off${w}`, "rack-bag": `sway-off${w}`, default: "none" }}
      enter={{ "rack-return": `sway-on${w}`, default: "none" }}
      default="none"
    >
      <Card item={item} />
    </ViewTransition>
  )
})}
```

**No page-level boundary around the grid.** A parent `<ViewTransition>` that enters or exits as one unit swallows its children's own enter/exit, so the rail couldn't sway card by card.

### 5. The detail page's blocks

Wrap each block (top bar, title, price, options…) in its own boundary with a growing wave, and key them by item so prev/next swaps them:

```tsx
<ViewTransition
  enter={{ "rack-lift": `drop-in wave-${wave}`, "rack-bag": `drop-in wave-${wave}`, "rail-next": "nav-forward", "rail-prev": "nav-back", default: "none" }}
  exit={{ "rack-return": "lift-off", "rack-bag": "lift-off", "rail-next": "nav-forward", "rail-prev": "nav-back", default: "none" }}
  default="none"
>
  {block}
</ViewTransition>
```

Same rule as the grid: no boundary around the whole page.

## Gotchas

- **Snapshots inherit the image pair's duration.** The swing runs on `::view-transition-image-pair` with `linear` timing (each keyframe sets its own curve), and the UA stylesheet makes `-old` / `-new` inherit the pair's duration and timing, so the cross-fade inside would be linear. The CSS gives them their own 300ms ease-out. Keep that rule if you retime the swing.
- **Images can blink in.** During a Transition, React waits for each newly mounted `<img>` to load and decode (up to about 800ms) before the new snapshot is taken, but only for an `<img>` that has no `onLoad` handler and isn't `loading="lazy"`. Next.js's `<Image>` always attaches its own `onLoad`: render a plain `<img>` with `getImageProps()` from `next/image` instead (`references/product-image.tsx`, `ProductImage`), and preload the hero on hover or focus (`preloadOnIntent`) with the same `sizes` as the hero.
- **Browser back/forward** runs no view transition at all (React renders `popstate` updates synchronously). The Back link is what sways the rail.
- **One element per name.** A checkout or cart with the same item in two variants can name only its first row, or the morph breaks.
- Filtering, variants and quantities are plain updates outside any Transition, so they don't swing.

## Motion rules

The travel stays inside the usual limits: the visual's morph lands in 300ms on the drawer curve, blocks drop in 250ms (40ms apart) and lift off in 150ms, cards fade out in 200ms. Every swing fits inside 300ms: two half-swings, the visual's in step with its morph, cards 30ms apart (capped at six, so the last starts by 180ms). A 2px blur at the peak of the first half-swing masks the cross-fade between the two snapshots, and pressed cards give `scale(0.97)`. No `ease-in`, separate `-out` keyframes, nothing scales from 0, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Open an item: its visual lifts, swings and settles in the detail page; the other cards tip as they fade; the blocks drop in one after another.
- Next / previous: the new visual rides in from the side, swings past centre and settles; it swings the other way for previous.
- Back: the visual drops into its cell with a swing, and the rail sways card after card.
- The bag / checkout: bagged items lift into their rows; Back hangs them all up again.
- Reduced motion: only quick cross-fades.
