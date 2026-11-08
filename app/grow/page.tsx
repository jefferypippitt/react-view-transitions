import { GrowCatalog } from "@/components/shop/grow-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function GrowShopPage() {
  return (
    // For the trip to checkout and back (typed nav-forward / nav-back).
    // Opening a tile is typed "grow", and a color pick changes no page, so
    // this boundary stays out of both.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <GrowCatalog />
      </div>
    </SlideTransition>
  )
}
