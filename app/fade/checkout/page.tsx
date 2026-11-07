import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

export default function FadeCheckoutPage() {
  return (
    // Same page fade as the grid and product pages.
    <ViewTransition enter="fade-in" exit="fade-out" default="none">
      <Checkout shopHref="/fade" />
    </ViewTransition>
  )
}
