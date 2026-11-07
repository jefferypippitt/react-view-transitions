"use client"

import { Checkout } from "@/components/shop/checkout"
import { FlyCopy, flyName } from "@/components/shop/fly-catalog"

/**
 * Checkout for Fly + Dock. Each row's photo carries the same flying copy as
 * its dock thumbnail, so going to checkout flies every copy from the dock into
 * its row, and Back flies them home.
 */
export function FlyCheckout() {
  return (
    <Checkout
      shopHref="/fly"
      photoOverlay={(line) => (
        <FlyCopy
          name={flyName(line.key, line.quantity)}
          src={line.variant.src}
          className="object-contain p-[8%]"
        />
      )}
    />
  )
}
