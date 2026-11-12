import { ViewTransition } from "react"

import { Catalog } from "@/components/shop/catalog"

export default function BlurShopPage() {
  return (
    // Same structure as Fade, different animation: the old page blurs out
    // of focus and the new one sharpens in.
    <ViewTransition enter="blur-in" exit="blur-out" default="none">
      <div className="px-6 pt-8 pb-16">
        <Catalog href="/blur" enter="blur-in" exit="blur-out" />
      </div>
    </ViewTransition>
  )
}
