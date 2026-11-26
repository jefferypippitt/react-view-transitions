import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

export default function ShearCheckoutPage() {
  return (
    // Same shear as the grid and product pages.
    <ViewTransition enter="shear-in" exit="shear-out" default="none">
      <Checkout shopHref="/shear" />
    </ViewTransition>
  )
}
