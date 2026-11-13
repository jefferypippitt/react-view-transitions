import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

export default function WipeCheckoutPage() {
  return (
    // Cover: checkout is a sheet. The bag link (cover-open) slides it up
    // from the bottom edge while the page under it sinks back (a root rule
    // in globals.css); Back (cover-close) drops it away. The boundary also
    // makes React start the transition: it only does when some boundary
    // takes part, and nothing else on this page has one.
    <ViewTransition
      enter={{ "cover-open": "cover-in", default: "none" }}
      exit={{ "cover-close": "cover-out", default: "none" }}
      default="none"
    >
      {/* Opaque and at least as tall as the screen, so the sheet hides
          the page beneath it the whole way up. */}
      <div className="flex-1 bg-background">
        <Checkout shopHref="/wipe" backTypes={["cover-close"]} />
      </div>
    </ViewTransition>
  )
}
