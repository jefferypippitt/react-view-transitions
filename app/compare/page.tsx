import { CompareCatalog } from "@/components/shop/compare-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function CompareShopPage() {
  return (
    // For the trip to checkout and back (typed nav-forward / nav-back).
    // Pinning, comparing and column removal use compare-* types, so this
    // boundary stays out of them.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <CompareCatalog />
      </div>
    </SlideTransition>
  )
}
