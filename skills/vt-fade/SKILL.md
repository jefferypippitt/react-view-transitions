---
name: vt-fade
description: Add a Fade view transition to any React 19.3+ app. Pages cross-fade on navigation (the old page fades out quickly, the new one fades in just after), a filtered or tabbed list swaps as a whole with the same fade, and swapping a variant or tab fades the content. Works on any pages or swappable content, not just images. Use when the user wants simple page transitions, a cross-fade between routes or tabs, a fade when filtering, or the Fade example from react-view-transitions.
license: MIT
metadata:
  author: jefferypippitt
  version: "0.2.0"
  demo: "/fade"
---

# Fade

The simplest pattern, and the base the others build on. One pair of classes (`fade-in` / `fade-out`) does three jobs:

1. **Pages**: each page's content fades out, and the next one fades in just after.
2. **Swapped sets**: a list keyed by its filter or tab swaps the whole set with the same fade.
3. **Swapped content**: anything keyed by a selection (a variant, a tab panel, a chart range) fades when the selection changes.

## Where this fits

**Shape it needs:** pages, or a region whose content gets replaced. Almost every app has this.

**Fits, for example:** route changes in a dashboard, tab panels in settings, a table that switches between "Open" and "Closed", a profile page's sections, a product photo switching colors.

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
- Next.js App Router: works with no config, because route navigations are already Transitions.
- Other routers (React Router, TanStack Router): the navigation must run inside `startTransition`. If pages don't fade, wrap `navigate(...)` in `startTransition`.
- No router (tabs, state only): works the same, as long as the change is in `startTransition`.
- Browsers without view transitions skip the animation. Nothing breaks.

## Files

- `references/transitions.css`: the tokens, keyframes and classes.
- `references/catalog.tsx`: the demo's filtered grid (filter → keyed boundary).
- `references/product-view.tsx`: the demo's detail view (variant → keyed boundary).

The `.tsx` files are copied from the demo shop, where products stand in for the app's items. `QuantityStepper`, `@/lib/media`, the cart and the `ToggleGroup` UI are shop-only. Port only the `<ViewTransition>` wiring.

## Steps

### 1. Add the CSS

Append `references/transitions.css` to the app's global stylesheet.

- If the app already has `--duration-*` / `--ease-*` tokens, map ours to them. Don't add duplicates.
- If a `fade` / `fade-out` keyframe exists with different behavior, rename ours everywhere in the block.
- Keep the `prefers-reduced-motion` block.

### 2. Fade pages

Wrap each page's content (not the layout, header or nav). `ViewTransition` is imported from `react`:

```tsx
<ViewTransition enter="fade-in" exit="fade-out" default="none">
  <div>…page…</div>
</ViewTransition>
```

On dynamic routes where navigation stays on the same route (`/items/a` → `/items/b`), add `key={item.id}`. Without it React updates in place and nothing fades.

### 3. Fade a swapped set (optional)

Keep the filter or tab in client state (in Next.js a search-param change remounts the whole page, which would fade the controls too). Key a boundary around the set by the selection, and change it in a Transition:

```tsx
<ViewTransition key={filter ?? "all"} enter="fade-in" exit="fade-out" default="none">
  <ul>{items.map(…)}</ul>
</ViewTransition>

onChange={(next) => startTransition(() => setFilter(next))}
```

### 4. Fade swapped content (optional)

Key a boundary by the selection, inside the region that stays:

```tsx
<div className="panel">
  <ViewTransition key={selected.id} enter="fade-in" exit="fade-out" default="none">
    <Content of={selected} />
  </ViewTransition>
</div>
```

Update the selection in `startTransition(() => setSelected(next))`.

## Gotchas

- A plain `setState` never animates. Only Transitions (`startTransition`, router navigations, `useDeferredValue`, Suspense) do.
- `default="none"` stops the boundary from animating on unrelated updates (a badge count changing, say).
- Keyboard shortcuts update state outside a Transition so they stay instant.

## Motion rules

The CSS already follows these. Keep them if you adjust anything:

- Durations stay at or under 300ms, and exits run faster than entrances.
- Custom curves (`--ease-out`). Never `ease-in`.
- Exits use their own `-out` keyframes, never `<keyframes> reverse`, because `reverse` also flips the easing.
- Reduced motion is a short cross-fade, never `0s`.

## Check your work

- Navigating between pages: a quick fade out, then the new page fades in, with no blank beat.
- Changing a filter or tab fades the content only; the controls stay put.
- With reduced motion on: still a short cross-fade.
