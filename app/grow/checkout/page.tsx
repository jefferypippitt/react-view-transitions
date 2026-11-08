import { Checkout } from "@/components/shop/checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function GrowCheckoutPage() {
  return (
    // Checkout is a level deeper: the header's bag link slides it in
    // (nav-forward), Back slides it out (nav-back).
    <SlideTransition>
      <Checkout shopHref="/grow" backTypes={["nav-back"]} />
    </SlideTransition>
  )
}
