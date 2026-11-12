---
name: vt-blur
description: Add a Blur (focus pull) view transition to any React 19.3+ app. The old view drifts out of focus as it fades and the new one sharpens into place, on navigation, on a filtered or tabbed list swap and on any swapped content. Works on any pages or content, not just images. Use when the user wants a blur page transition, a focus-pull or depth effect between routes, tabs or views, or the Blur example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/blur"
---

# Blur

Same structure as a page fade, with a different feel: the outgoing view blurs (12px) as it fades out, and the incoming one sharpens from a blur as it fades in. It works on three things:

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

- `vt-fade`, `vt-blur`: any pages or swappable content
- `vt-morph-slide`: a list and a detail view that share a visual
- `vt-expand-carousel`: a list and a side panel or sheet
- `vt-fly-dock`: adding items to a collection (cart, bookmarks, playlist, tray)
- `vt-layout-stagger`: a list/grid view toggle
- `vt-search-reflow`: a searchable or filterable list
- `vt-swap-roll`: one featured item beside a list
- `vt-tuck-spill`: a list filtered by category chips or tabs
- `vt-grow-shift-slide`: a grid of cards that can open in place

Install any of them with `npx skills add https://github.com/jefferypippitt/react-view-transitions --skill <name>`.

## Requirements

- React 19.3+ (`ViewTransition` exported from `react`). On older React, tell the user to upgrade and stop.
- Next.js App Router: works with no config.
- Other routers: the navigation must run inside `startTransition`. No router: wrap the state change in `startTransition`.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: tokens, keyframes and the `blur-in` / `blur-out` classes.
- `references/catalog.tsx`, `references/product-view.tsx`: the demo's grid and detail view. The demo passes `enter="blur-in" exit="blur-out"` to both.

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart and the `ToggleGroup` UI are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the global stylesheet. If the app already has motion tokens or `fade` keyframes, map ours to them instead of duplicating. Keep the reduced-motion block: it replaces the blur with a plain cross-fade.

### 2. Blur pages

Wrap each page's content (not the layout, header or nav):

```tsx
<ViewTransition enter="blur-in" exit="blur-out" default="none">
  <div>…page…</div>
</ViewTransition>
```

Add `key={item.id}` on dynamic routes where navigation stays on the same route.

### 3. Blur a swapped set (optional)

```tsx
<ViewTransition key={filter ?? "all"} enter="blur-in" exit="blur-out" default="none">
  <ul>{items.map(…)}</ul>
</ViewTransition>

onChange={(next) => startTransition(() => setFilter(next))}
```

Keep the selection in client state so only the set blurs, not the whole page.

### 4. Blur swapped content (optional)

Key a boundary by the selection, inside the region that stays, and update it in `startTransition`:

```tsx
<ViewTransition key={selected.id} enter="blur-in" exit="blur-out" default="none">
  <Content of={selected} />
</ViewTransition>
```

## Gotchas

- `filter: blur()` is costly on very large areas. Keep it to page content and panels, not full-bleed video or canvas.
- A plain `setState` never animates. Wrap updates in `startTransition`.
- Keyboard shortcuts stay outside Transitions so they're instant.

## Motion rules

The CSS already follows these: durations at or under 300ms, exits faster than entrances, custom `--ease-out` (never `ease-in`), a separate `blur-out` keyframe instead of `reverse`, and a short cross-fade (never `0s`) for reduced motion.

## Check your work

- Navigation: the old page goes soft and fades, the new one sharpens in.
- With reduced motion on: a plain short cross-fade, no blur.
