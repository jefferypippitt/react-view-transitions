import { ViewTransition } from "react"

import { Catalog } from "@/components/shop/catalog"

export default function ShopPage() {
  return (
    <ViewTransition enter="fade-in" exit="fade-out" default="none">
      <div className="px-6 pt-8 pb-16">
        <Catalog />
      </div>
    </ViewTransition>
  )
}
