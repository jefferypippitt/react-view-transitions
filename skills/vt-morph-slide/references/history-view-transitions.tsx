"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect } from "react"

type Router = ReturnType<typeof useRouter>

type Shared = {
  router: Router | null
  positions: Map<string, number>
  pendingScroll: number | null
}

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
      if (!router || !event.state?.__NA) return
      event.stopImmediatePropagation()

      const key = entryKey()
      shared.pendingScroll = (key && shared.positions.get(key)) || 0
      const href = location.pathname + location.search + location.hash
      setTimeout(() => router.replace(href, { scroll: false }), 0)
    },
    { capture: true }
  )

  return shared
}

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
