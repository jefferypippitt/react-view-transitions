import { MorphCheckout } from "@/components/shop/morph-checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function MorphCheckoutPage() {
  return (
    // Checkout is a level deeper, like a product page: the header's bag link
    // slides it in (nav-forward), Back slides it out (nav-back), and the
    // bag's photos morph between the shop and the table.
    <SlideTransition>
      <MorphCheckout />
    </SlideTransition>
  )
}
