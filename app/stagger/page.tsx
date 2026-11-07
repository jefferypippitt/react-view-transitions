import { StaggerCatalog } from "@/components/shop/stagger-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function StaggerShopPage() {
  return (
    // For the trip to checkout and back (typed navigations). Switching views
    // is untyped, so this boundary stays out of it.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <StaggerCatalog />
      </div>
    </SlideTransition>
  )
}
