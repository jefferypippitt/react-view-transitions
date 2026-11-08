import { SwapCatalog } from "@/components/shop/swap-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function SwapShopPage() {
  return (
    // For the trip to checkout and back (typed nav-forward / nav-back).
    // Swaps and shuffles use their own types, so this boundary stays out.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <SwapCatalog />
      </div>
    </SlideTransition>
  )
}
