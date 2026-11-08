import { Checkout } from "@/components/shop/checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function TuckCheckoutPage() {
  return (
    // Checkout is a level deeper: the header's bag link slides it in
    // (nav-forward), Back slides it out (nav-back).
    <SlideTransition>
      <Checkout shopHref="/tuck" backTypes={["nav-back"]} />
    </SlideTransition>
  )
}
