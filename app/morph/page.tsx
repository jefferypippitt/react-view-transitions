import { MorphCatalog } from "@/components/shop/morph-catalog"
import { SlideTransition } from "@/components/slide-transition"

export default function MorphShopPage() {
  return (
    <SlideTransition>
      <div className="px-6 pt-8 pb-16">
        <MorphCatalog />
      </div>
    </SlideTransition>
  )
}
