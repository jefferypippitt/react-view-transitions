import { FlipCatalog } from "@/components/shop/flip-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function FlipShopPage() {
  return (
    // For the trip to a product or checkout and back (typed nav-forward /
    // nav-back). Dealing is typed deal-*, so this boundary stays out of it.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <FlipCatalog />
      </div>
    </SlideTransition>
  )
}
