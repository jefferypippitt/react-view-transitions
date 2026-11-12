"use client"

import { Checkout } from "@/components/shop/checkout"
import {
  StaggerPart,
  staggerPhotoName,
  useStaggerColors,
} from "@/components/shop/stagger-catalog"

/**
 * Checkout for Layout + Stagger. The row for the color a product shows in
 * the shop carries the same name as its photo there, so the bag's photos
 * morph into the table, one row after another. Other colors of the same
 * product are separate rows with their own photos, and just slide with the
 * page.
 */
export function StaggerCheckout() {
  const { variantOf } = useStaggerColors()

  return (
    <Checkout
      shopHref="/stagger"
      backTypes={["nav-back"]}
      wrapPhoto={(photo, { line, index }) =>
        line.variant.color === variantOf(line.product).color ? (
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
