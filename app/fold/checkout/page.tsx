import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

export default function FoldCheckoutPage() {
  return (
    // Same fold as the grid and product pages.
    <ViewTransition enter="fold-in" exit="fold-out" default="none">
      <Checkout shopHref="/fold" />
    </ViewTransition>
  )
}
