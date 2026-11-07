"use client"

import { ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"

/**
 * Checkout for Morph + Slide. Each row's photo has the same name as the
 * product's photo in the grid and on its product page, so the trip to
 * checkout is the same morph as opening a product: the photos shrink into
 * their rows while the page slides, and grow back on the way out.
 *
 * A product can be in the bag in more than one color; only one element per
 * name may be mounted, so only its first row takes the name.
 */
export function MorphCheckout() {
  return (
    <Checkout
      shopHref="/morph"
      backTypes={["nav-back"]}
      wrapPhoto={(photo, { line, firstOfProduct }) =>
        firstOfProduct ? (
          <ViewTransition
            name={`product-${line.product.id}`}
            share="morph"
            default="none"
          >
            {photo}
          </ViewTransition>
        ) : (
          photo
        )
      }
    />
  )
}
