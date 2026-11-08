import { TuckCatalog } from "@/components/shop/tuck-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function TuckShopPage() {
  return (
    // For the trip to checkout and back (typed nav-forward / nav-back).
    // Filtering is typed "tuck", so this boundary stays out of it.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <TuckCatalog />
      </div>
    </SlideTransition>
  )
}
