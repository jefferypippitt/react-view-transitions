import { SearchCatalog } from "@/components/shop/search-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function SearchShopPage() {
  return (
    // For the trip to checkout and back (typed navigations). Search results
    // update untyped, so this boundary stays out of them.
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <SearchCatalog />
      </div>
    </SlideTransition>
  )
}
