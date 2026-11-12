"use client"

import { Checkout } from "@/components/shop/checkout"
import {
  StaggerPart,
  staggerPhotoName,
} from "@/components/shop/stagger-catalog"

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
