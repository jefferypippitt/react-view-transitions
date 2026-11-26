import { ViewTransition } from "react"

import { Catalog } from "@/components/shop/catalog"

export default function ShearShopPage() {
  return (
    // Same structure as Fade, different animation: the old page leans over
    // as it fades and the new one leans in and straightens up.
    <ViewTransition enter="shear-in" exit="shear-out" default="none">
      <div className="px-6 pt-8 pb-16">
        <Catalog href="/shear" enter="shear-in" exit="shear-out" />
      </div>
    </ViewTransition>
  )
}
