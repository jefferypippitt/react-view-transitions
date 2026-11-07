import { ViewTransition } from "react"

/**
 * Directional slide, keyed by transition type. Tag a navigation with
 * `nav-forward` (deeper / next) or `nav-back` (up / previous) and the old
 * content slides out one way while the new content slides in from the other.
 * Untyped transitions (browser back/forward, filters) don't slide.
 * CSS: ::view-transition-old/new(.nav-forward | .nav-back) in globals.css.
 */
export function SlideTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
