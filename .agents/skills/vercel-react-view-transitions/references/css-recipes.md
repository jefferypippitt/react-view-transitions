# CSS Animation Recipes

> **Local override (react-view-transitions repo). Re-add after updating this skill.**
> Use the recipes below for their *structure* only: selectors, keyframes, `both` fill modes and type-keyed classes. Motion values in this repo follow the `emil-design-eng` skill, and the tokens in `app/globals.css` are the source of truth. Where this file differs, use these instead:
>
> | This file | This repo | Why |
> | --- | --- | --- |
> | `ease-in` on exits, played as `<keyframes> reverse` | `var(--ease-out)` on dedicated `-out` keyframes (`fade-out`, `slide-out`, …), never `reverse` | `reverse` also flips the easing curve. That's why the recipes pair `ease-in` with `reverse`: it shows on screen as ease-out. An ease-out curve played in reverse looks like ease-in |
> | Built-in `ease-out` / `ease-in-out` / default `ease` | `var(--ease-out)` for entering or leaving, `var(--ease-drawer)` for morphs and on-screen travel | The built-in curves are too weak |
> | `--duration-exit/enter/move: 150/210/400ms` | `150/250/300ms`, nothing past 300ms except rare moments meant to delight | UI motion stays at or under 300ms |
> | New content waits the full `--duration-exit` | Waits `var(--enter-delay)` (half the exit) | With an ease-out exit the old content is mostly gone by then, so there's no blank moment |
> | Same speed in and out | Exits faster (e.g. sheet in 300ms, out 200ms) | Close fast: the user has already decided |
> | Reduced motion sets everything to `0s` | Groups and image pairs get `animation: none`, old/new get a quick cross-fade | Reduced motion means gentler, not none |
>
> Keyboard shortcuts (Esc, arrow keys) update state outside a Transition, so they never animate.

Ready-to-use CSS for `<ViewTransition>` props. Copy into your global stylesheet.

This file contains the complete CSS recipe set for the patterns in this skill. Copy only what the app needs.

---

## Timing Variables

```css
:root {
  --duration-exit: 150ms;
  --duration-enter: 210ms;
  --duration-move: 400ms;
}
```

### Shared Keyframes

```css
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide {
  from { translate: var(--slide-offset); }
  to { translate: 0; }
}

@keyframes slide-y {
  from { transform: translateY(var(--slide-y-offset, 10px)); }
  to { transform: translateY(0); }
}
```

---

## Fade

```css
::view-transition-old(.fade-out) {
  animation: var(--duration-exit) ease-in both fade reverse;
}
::view-transition-new(.fade-in) {
  animation: var(--duration-enter) ease-out var(--duration-exit) both fade;
}
```

Usage: `<ViewTransition enter="fade-in" exit="fade-out" />`

*Local fix:* every exit animation needs a fill mode (`both`). A view transition lasts until its **longest** animation ends; without a fill, the old snapshot snaps back to full opacity when its short exit finishes and stays visible behind the delayed fade-in (old content bleeding into the new page). Measured: old opacity 0.09 at 150ms, back to 1.00 from 250ms until the 550ms fade-in completed.

Keep the shared fade keyframe opacity-only. If a specific morph needs softness, give that class its own blur keyframe so ordinary content reveals stay crisp.

---

## Slide (Vertical)

```css
::view-transition-old(.slide-down) {
  animation:
    var(--duration-exit) ease-out both fade reverse,
    var(--duration-exit) ease-out both slide-y reverse;
}
::view-transition-new(.slide-up) {
  animation:
    var(--duration-enter) ease-in var(--duration-exit) both fade,
    var(--duration-move) ease-in both slide-y;
}
```

Usage:
```jsx
<Suspense fallback={<ViewTransition exit="slide-down"><Skeleton /></ViewTransition>}>
  <ViewTransition default="none" enter="slide-up"><Content /></ViewTransition>
</Suspense>
```

---

## Directional Navigation

### Separate Enter/Exit Classes

```css
::view-transition-new(.slide-from-right) {
  --slide-offset: 60px;
  animation:
    var(--duration-enter) ease-out var(--duration-exit) both fade,
    var(--duration-move) ease-in-out both slide;
}
::view-transition-old(.slide-to-left) {
  --slide-offset: -60px;
  animation:
    var(--duration-exit) ease-in both fade reverse,
    var(--duration-move) ease-in-out both slide reverse;
}

::view-transition-new(.slide-from-left) {
  --slide-offset: -60px;
  animation:
    var(--duration-enter) ease-out var(--duration-exit) both fade,
    var(--duration-move) ease-in-out both slide;
}
::view-transition-old(.slide-to-right) {
  --slide-offset: 60px;
  animation:
    var(--duration-exit) ease-in both fade reverse,
    var(--duration-move) ease-in-out both slide reverse;
}
```

### Single-Class Approach

```css
::view-transition-old(.nav-forward) {
  --slide-offset: -60px;
  animation:
    var(--duration-exit) ease-in both fade reverse,
    var(--duration-move) ease-in-out both slide reverse;
}
::view-transition-new(.nav-forward) {
  --slide-offset: 60px;
  animation:
    var(--duration-enter) ease-out var(--duration-exit) both fade,
    var(--duration-move) ease-in-out both slide;
}

::view-transition-old(.nav-back) {
  --slide-offset: 60px;
  animation:
    var(--duration-exit) ease-in both fade reverse,
    var(--duration-move) ease-in-out both slide reverse;
}
::view-transition-new(.nav-back) {
  --slide-offset: -60px;
  animation:
    var(--duration-enter) ease-out var(--duration-exit) both fade,
    var(--duration-move) ease-in-out both slide;
}
```

---

## Shared Element Morph

```css
::view-transition-group(.morph) {
  animation-duration: var(--duration-move);
}

::view-transition-image-pair(.morph) {
  animation-name: via-blur;
}

@keyframes via-blur {
  30% { filter: blur(3px); }
}
```

Usage: `<ViewTransition name={`product-${id}`} share="morph" />`

**Note:** Shared element transitions take raster snapshots. For text with significant size differences (e.g., `<h3>` → `<h1>`), the old snapshot gets scaled up, producing a visible ghost artifact. Use `text-morph` for text shared elements.

## Text Morph

Avoids raster scaling artifacts on text by hiding the old snapshot and showing the new text at full resolution:

```css
::view-transition-group(.text-morph) {
  animation-duration: var(--duration-move);
}
::view-transition-old(.text-morph) {
  display: none;
}
::view-transition-new(.text-morph) {
  animation: none;
  object-fit: none;
  object-position: left top;
}
```

Usage: `<ViewTransition name={`title-${id}`} share="text-morph" />`

---

## Aspect-Ratio Morph

*Local addition, from Chrome's same-document guide.* When a shared image changes shape (a square thumbnail becomes a 16:9 hero), the default snapshots keep their own aspect ratio at the group's width. The image visibly squashes, or overflows the group, mid-morph. Make both snapshots fill the group's height and choose how each one fits:

```css
::view-transition-group(.morph-media) {
  animation-duration: var(--duration-move);
}
::view-transition-old(.morph-media),
::view-transition-new(.morph-media) {
  height: 100%;
  overflow: clip;
}
/* Outgoing shape shrinks to fit (no crop); incoming fills (cropped like the final layout) */
::view-transition-old(.morph-media) {
  object-fit: contain;
}
::view-transition-new(.morph-media) {
  object-fit: cover;
}
```

Usage: `<ViewTransition name={`photo-${id}`} share="morph-media"><Image … /></ViewTransition>` on both views.

- Use `object-fit: cover` on both if letterboxing during the morph looks worse than cropping.
- Put `border-radius` on the captured element itself (the snapshot keeps it). The group does not inherit it.
- Use this class instead of `morph` for media. Keep `morph` (with its blur) for cards and blocks of mixed content.

---

## Video and Live Media

*Local addition.* `::view-transition-old` is a screenshot, so a playing `<video>` (or canvas or animated element) freezes and then cross-fades into the live one. Hide the screenshot and show the live element during the move:

```css
::view-transition-old(.live-media) {
  display: none;
}
::view-transition-new(.live-media) {
  animation: none;
}
```

Usage: `<ViewTransition name="player" share="live-media" update="live-media"><video … /></ViewTransition>`. The group still morphs position and size. Only the cross-fade is removed. At normal speed the freeze is often invisible, so check before adding this.

---

## Scale

```css
::view-transition-old(.scale-out) {
  animation: var(--duration-exit) ease-in both scale-down;
}
::view-transition-new(.scale-in) {
  animation: var(--duration-enter) ease-out var(--duration-exit) both scale-up;
}

@keyframes scale-down {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.85); opacity: 0; }
}
@keyframes scale-up {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

Usage: `<ViewTransition enter="scale-in" exit="scale-out" />`

---

## Interactivity During Transitions

The `::view-transition` overlay captures all pointer events. React shrinks it to zero when the root group doesn't animate, but in-flight animations still block clicks. To pass clicks/hover through even while animating:

```css
::view-transition {
  pointer-events: none;
}
```

Trade-offs: clicks can hit live elements under still-moving snapshots, and it only helps **unnamed** content — named participants are skipped by hit-testing for the transition's duration, no CSS override ([csswg#10930](https://github.com/w3c/csswg-drafts/issues/10930)). Weigh that before naming interactive elements; portal named popovers (see [Isolate Elements from Parent Animations](patterns.md#isolate-elements-from-parent-animations)).

---

## No Root Cross-Fade (Live Root)

The root cross-fades on every transition, freezing unnamed content behind a stale snapshot — hover and active styles stop rendering until it settles. `::view-transition-new(root)` is a **live** capture, so disabling the root animation keeps unnamed regions rendering (and, with the `pointer-events` recipe above, interactive):

```css
::view-transition-old(root) {
  display: none;
}
::view-transition-new(root) {
  animation: none;
}
```

Named and classed groups still animate — they stack above root. Trade-off: unnamed content swaps instantly, so regions that should fade need their own VT. This also removes the main reason to hand-name static chrome; keep names only for elements that must stack above animating groups.

Pairs well with enter-only reveals: skip the fallback-exit VT entirely (`<ViewTransition enter="auto" default="none">` around the content, nothing on the skeleton) — the skeleton snaps out live while the content fades in.

---

## Persistent Element Isolation

```css
::view-transition-group(persistent-nav) {
  animation: none;
  z-index: 100;
}
```

Layer multiple pinned groups with z-index tiers — chrome at `100`, toasts/overlays that must beat everything at `200`.

### Backdrop-Blur Workaround

For elements with `backdrop-filter`, hide the old snapshot to avoid flash:

```css
::view-transition-old(persistent-nav) {
  display: none;
}
::view-transition-new(persistent-nav) {
  animation: none;
}
```

### Floating Element Isolation (popovers, menus, tooltips, control clusters)

Same freeze as persistent chrome. A floating/interactive element left rendered while a background transition runs is otherwise captured in the `root` snapshot and flickers as it settles. Give it a real, unique `view-transition-name` (never `none` — that's the CSS default = no isolation) and:

```css
::view-transition-group(popover) {
  animation: none;
  z-index: 100;
}
::view-transition-old(popover),
::view-transition-new(popover) {
  animation: none;
}
```

### Sliding Indicator (tab underline / segmented pill)

One shared-name indicator morphs between positions. Slide the group; disable old/new so the solid bar slides instead of cross-fading:

```css
::view-transition-group(.tab-underline) {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.5, 0, 0.2, 1);
}
::view-transition-old(.tab-underline),
::view-transition-new(.tab-underline) {
  animation: none;
  height: 100%;
}
```

---

## Type-Scoped Global Rules

*Local addition.* React passes transition types to the browser, so `:root:active-view-transition-type(…)` can retune timing variables, isolate elements, or drop the root snapshot for specific navigations only. See [browser-features.md](browser-features.md#type-aware-global-css).

---

## Slow-Motion Demo Mode

*Local addition.* For presenting or debugging, slow every recipe down from one attribute. The timing variables inherit into the `::view-transition` pseudo-tree:

```css
:root[data-vt-slowmo] {
  --duration-exit: 600ms;
  --duration-enter: 840ms;
  --duration-move: 1600ms;
}
:root[data-vt-slowmo]::view-transition-group(*) {
  animation-duration: var(--duration-move);
}
```

Toggle it with `document.documentElement.toggleAttribute('data-vt-slowmo')`. Only recipes built on the timing variables slow down. The browser's own `auto` cross-fade keeps its default duration. For frame-exact inspection of everything, use the DevTools Animations panel at 10–25% speed ([Inspecting a Transition](browser-features.md#inspecting-a-transition)).

---

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```
