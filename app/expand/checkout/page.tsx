import { Checkout } from "@/components/shop/checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function ExpandCheckoutPage() {
  return (
    // Checkout is a level deeper than the grid: the header's bag link slides
    // it in (nav-forward), Back slides it out (nav-back).
    <SlideTransition>
      <Checkout shopHref="/expand" backTypes={["nav-back"]} />
    </SlideTransition>
  )
}
