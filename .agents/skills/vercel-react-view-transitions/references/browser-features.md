# Browser-Level Features

`<ViewTransition>` is a thin layer over the browser's same-document View Transition API. This file covers the native CSS and DOM behavior underneath it: what React sets for you, which native hooks still help in a React app, and which vanilla-JS advice does not carry over.

Source: [Chrome — Same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document). The React-mapping claims below were checked against the `react-dom` 19.3 build that ships with Next.js 16.4.

> **Local addition.** This file and the sections marked *Local addition* in other files are not part of upstream `vercel-labs/agent-skills`. Re-apply them after updating the skill.

---

## How React Maps to the Native API

| You write | React does natively |
|-----------|---------------------|
| `name="hero"` (or auto) | Sets `style.viewTransitionName` on the boundary's DOM node for the duration of the transition |
| `enter="slide-in"`, `share="morph"`, … | Sets `style.viewTransitionClass`, so `::view-transition-*(.slide-in)` selectors match |
| `addTransitionType('nav-forward')` / `transitionTypes` on `next/link` | Passes `types` to `document.startViewTransition({ update, types })`, so `:active-view-transition-type(nav-forward)` matches in CSS |
| `startTransition` / `Suspense` / `useDeferredValue` | Calls `document.startViewTransition` and does the DOM mutation inside `update` |

React also does work the vanilla docs tell you to do by hand:

- **Fonts and images.** Inside `update`, React waits (with a timeout) for fonts that started loading and for images in the viewport before the new snapshot is taken. Don't add `document.fonts.ready` waits.
- **`flushSync` conflicts.** A `flushSync` call while a React view transition is still preparing makes React call `skipTransition()` and warn: *"A flushSync update cancelled a View Transition…"*.
- **Overlap.** Only one view transition runs per document. Starting a new one skips the running one to its end state. React batches updates that arrive mid-animation (A→B→C→D becomes B→D).

### Don't Port These From Vanilla Guides

| Vanilla advice | In React |
|----------------|----------|
| `document.startViewTransition(() => flushSync(() => setState(x)))` | Use `startTransition` and `<ViewTransition>`. `flushSync` skips React's own transitions. Only exception: DOM that React doesn't animate, see [Circular Theme Reveal](patterns.md#circular-theme-reveal). |
| Toggling a class on `<html>` for direction, removing it after `transition.finished` | Use transition types (`addTransitionType`, `transitionTypes`) |
| `transitionHelper()` fallback wrapper | Not needed. React feature-detects and skips gracefully |
| `thumbnail.style.viewTransitionName = 'x'` before the transition, cleared in the callback | Same `name` on two `<ViewTransition>`s; React assigns and clears names |
| `:only-child` on `::view-transition-new(x)` to detect enter vs exit | Use the `enter` / `exit` props, which map to different classes |

---

## Type-Aware Global CSS

Because React passes types to the browser, two pseudo-classes on `:root` work in any global stylesheet:

- `:active-view-transition-type(a, b)` matches while a transition with **any** of those types runs.
- `:active-view-transition` matches while **any** view transition runs, typed or not.

They complement per-boundary type maps (`enter={{ 'nav-forward': … }}`). Use them for document-wide rules that don't belong to one boundary.

### Retune Timing Per Type

The timing variables from [css-recipes.md](css-recipes.md#timing-variables) inherit into the `::view-transition` pseudo-tree, so you can redefine them per type:

```css
/* Back navigation feels snappier than going deeper */
:root:active-view-transition-type(nav-back) {
  --duration-exit: 100ms;
  --duration-enter: 160ms;
  --duration-move: 280ms;
}
```

### Name Elements Only for Certain Types

A CSS `view-transition-name` inside a type selector isolates an element only during those transitions. The name applies before the old snapshot is taken.

```css
/* Keep the header pinned during page navigations only */
:root:active-view-transition-type(nav-forward, nav-back) .site-header {
  view-transition-name: site-header;
}
::view-transition-group(site-header) {
  animation: none;
  z-index: 100;
}
```

Rules:

- A raw CSS name **isolates** an element. It does not activate a React boundary or get React's classes, so it animates with the browser default (cross-fade plus position/size morph) unless you style it by name.
- Names must be unique among rendered elements. A CSS name that collides with a React `name` (or with another element's name) makes the browser **skip the entire transition**.
- Types aren't present during Suspense reveals. Rules keyed on types don't apply there. Browser back/forward start no transition at all unless you defer them ([nextjs.md](nextjs.md#browser-backforward)).

### Exclude the Root Snapshot for a Type

```css
:root:active-view-transition-type(nav-forward, nav-back) {
  view-transition-name: none;
}
```

With no `root` group, unnamed content swaps instantly and stays live. Only named and classed groups animate. This is a type-scoped version of [No Root Cross-Fade](css-recipes.md#no-root-cross-fade-live-root).

---

## The Pseudo-Element Tree

```
::view-transition                      ← overlay above the page (position: fixed)
├─ ::view-transition-group(root)
│  └─ ::view-transition-image-pair(root)
│     ├─ ::view-transition-old(root)   ← static screenshot
│     └─ ::view-transition-new(root)   ← live rendering
└─ ::view-transition-group(hero)       ← every named element is a sibling, not nested
   └─ …
```

Defaults worth knowing before overriding them:

- **Groups are flat.** A named element's group is a sibling of `root`, not a child of its DOM parent. Parent `overflow: hidden` and `border-radius` don't clip it mid-flight.
- **Groups animate `transform`, `width` and `height`** from the old box to the new box.
- **Old and new snapshots** default to `width: 100%` of the group with `height: auto`, so they keep their own aspect ratio. See [Aspect-Ratio Morph](css-recipes.md#aspect-ratio-morph) when that looks wrong.
- **Cross-fade blending.** Old and new use `mix-blend-mode: plus-lighter` inside an `isolation: isolate` image pair, so a 50/50 cross-fade doesn't dip in opacity. Only set `mix-blend-mode: normal` when you deliberately disable the cross-fade, as in the theme reveal and media recipes.
- **`::view-transition-old` is a screenshot.** Anything moving inside it (video, canvas, CSS animation) freezes. See [Video and Live Media](css-recipes.md#video-and-live-media).

---

## Performance

- **Size morphs run layout every frame.** A group whose width or height changes animates those properties on the main thread. Chrome plans to move this off the main thread but hasn't yet. On heavy pages, keep size-changing morphs short, or keep a shared element's box size the same and change only position.
- **The page is frozen while `update` runs.** React keeps that window short, but any `await` you add before a navigation's DOM commit (for example `router.push` after a slow fetch) delays the start. Fetch first, then navigate.

---

## Browser Support

| Feature | Chrome / Edge | Safari | Firefox |
|---------|---------------|--------|---------|
| Same-document `startViewTransition(callback)` | 111 | 18 | 144 |
| Object form with `types`, plus `:active-view-transition-type()` (React needs this) | 125 | 18.2 | 144 |
| `view-transition-class` (React's class props) | 125 | 18.2 | 144 |

Unsupported browsers run the update without animation. Check [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) for newer additions (scoped transitions, nested groups, `match-element`), which are not covered here.

---

## Inspecting a Transition

- **DevTools Animations panel** (⋮ → More tools → Animations): record, then replay at 25% or 10% speed, or pause and scrub. Every `::view-transition-*` animation appears as a track.
- **Elements panel while paused:** the `::view-transition` tree appears under `<html>`. Select a pseudo-element to see its computed `animation`, `object-fit` and size.
- **Find the active types:** `document.__reactViewTransition?.types` is React's internal handle on the running transition. It is undocumented and only for debugging in the console, never for app code.
- **Slow-motion demo toggle:** see [Slow-Motion Demo Mode](css-recipes.md#slow-motion-demo-mode).
