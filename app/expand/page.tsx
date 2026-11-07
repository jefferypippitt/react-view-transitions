import { ExpandCatalog } from "@/components/shop/expand-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function ExpandShopPage() {
  return (
    // Only for the trip to checkout and back (typed navigations). The quick
    // view's own transitions are untyped, so this boundary stays out of them.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <ExpandCatalog />
      </div>
    </SlideTransition>
  )
}
