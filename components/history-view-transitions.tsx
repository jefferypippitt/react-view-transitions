"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect } from "react"

/**
 * Makes the browser's back/forward buttons run <ViewTransition> animations.
 *
 * Why they don't by default: React renders an update scheduled inside a
 * `popstate` event synchronously (SyncLane), so the browser can restore the
 * scroll position against the new page. View transitions only run for
 * transition lanes, so a back/forward commit never calls
 * `document.startViewTransition`. Next's own popstate handler wraps its
 * restore in startTransition, but React upgrades it to sync anyway.
 *
 * The workaround: a capture listener registered before Next's (at module load,
 * ahead of the app router's effect) stops Next's handler for app-router history
 * entries, then replays the URL with `router.replace` in a macrotask, outside
 * the popstate event. React treats that as an ordinary transition, so the
 * page's enter/exit animations run. Because the render no longer happens inside
 * popstate, the browser can't restore scroll, so this saves each history entry's
 * position and restores it in a layout effect (inside the transition's update,
 * before the new snapshot is taken).
 *
 * Trade-offs: it relies on Next's history-state marker (`__NA`) and on listener
 * order, and `router.replace` re-navigates rather than replaying Next's cached
 * history tree (fine for static pages; dynamic pages may refetch).
 */

type Router = ReturnType<typeof useRouter>

type Shared = {
  router: Router | null
  positions: Map<string, number>
  pendingScroll: number | null
}

// Navigation API, used only for a stable per-entry key. Not in this TS lib yet.
type NavigationLike = { currentEntry: { key: string } | null }

const SHARED = Symbol.for("history-view-transitions")

function entryKey() {
  const navigation = (window as Window & { navigation?: NavigationLike })
    .navigation
  return navigation?.currentEntry?.key ?? null
}

function install(): Shared {
  const shared: Shared = {
    router: null,
    positions: new Map(),
    pendingScroll: null,
  }

  // We restore scroll ourselves. With "auto", the browser would scroll the
  // outgoing page to the destination's position before the fade starts.
  history.scrollRestoration = "manual"

  addEventListener(
    "scroll",
    () => {
      const key = entryKey()
      if (key) shared.positions.set(key, scrollY)
    },
    { passive: true }
  )

  addEventListener(
    "popstate",
    (event) => {
      const router = shared.router
      // Only entries written by the app router. Anything else (pages router,
      // hand-rolled pushState) stays with Next's handler.
      if (!router || !event.state?.__NA) return
      event.stopImmediatePropagation()

      const key = entryKey()
      shared.pendingScroll = (key && shared.positions.get(key)) || 0
      const href = location.pathname + location.search + location.hash
      // A macrotask, not a microtask: microtasks still see `window.event` as
      // the popstate event, and React would render synchronously again.
      setTimeout(() => router.replace(href, { scroll: false }), 0)
    },
    { capture: true }
  )

  return shared
}

// One set of listeners per page, kept across Fast Refresh re-evaluations.
const shared =
  typeof window === "undefined"
    ? null
    : ((window as unknown as Record<symbol, Shared | undefined>)[SHARED] ??=
        install())

export function HistoryViewTransitions() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (shared) shared.router = router
  }, [router])

  useLayoutEffect(() => {
    if (shared?.pendingScroll == null) return
    scrollTo(0, shared.pendingScroll)
    shared.pendingScroll = null
  }, [pathname])

  return null
}
