"use client"

import { Checkout } from "@/components/shop/checkout"
import { FlyCopy, flyName } from "@/components/shop/fly-catalog"

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
