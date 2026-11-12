"use client"

import { Checkout } from "@/components/shop/checkout"
import {
  StaggerPart,
  staggerPhotoName,
  useStaggerColors,
} from "@/components/shop/stagger-catalog"

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
