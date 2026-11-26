import { ViewTransition } from "react"

import { Catalog } from "@/components/shop/catalog"

export default function FoldShopPage() {
  return (
    // Same structure as Fade, different animation: the old page folds forward
    // off its top crease and the new one folds down into place.
    <ViewTransition enter="fold-in" exit="fold-out" default="none">
      <div className="px-6 pt-8 pb-16">
        <Catalog href="/fold" enter="fold-in" exit="fold-out" />
      </div>
    </ViewTransition>
  )
}
