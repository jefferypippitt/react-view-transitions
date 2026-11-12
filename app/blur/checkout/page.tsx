import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

export default function BlurCheckoutPage() {
  return (
    // Same focus pull as the grid and product pages.
    <ViewTransition enter="blur-in" exit="blur-out" default="none">
      <Checkout shopHref="/blur" />
    </ViewTransition>
  )
}
