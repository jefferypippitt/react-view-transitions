import { Checkout } from "@/components/shop/checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function FlipCheckoutPage() {
  return (
    // A level deeper, like a product page: the bag link slides it in
    // (nav-forward), Back slides it out (nav-back).
    <SlideTransition>
      <Checkout shopHref="/flip" backTypes={["nav-back"]} />
    </SlideTransition>
  )
}
