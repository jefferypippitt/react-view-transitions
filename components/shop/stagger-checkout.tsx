"use client"

import { Checkout } from "@/components/shop/checkout"
import {
  StaggerPart,
  staggerPhotoName,
} from "@/components/shop/stagger-catalog"

/**
 * Checkout for Layout + Stagger. Each row's photo has the same name as the
 * product's photo in the shop, so the bag's photos morph into the table, one
 * row after another.
 */
export function StaggerCheckout() {
  return (
    <Checkout
      shopHref="/stagger"
      backTypes={["nav-back"]}
      wrapPhoto={(photo, { line, index, firstOfProduct }) =>
        firstOfProduct ? (
          <StaggerPart name={staggerPhotoName(line.product)} wave={index}>
            {photo}
          </StaggerPart>
        ) : (
          photo
        )
      }
    />
  )
}
