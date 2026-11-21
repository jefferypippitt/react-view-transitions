import { Checkout } from "@/components/shop/checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function CompareCheckoutPage() {
  return (
    <SlideTransition>
      <Checkout shopHref="/compare" backTypes={["nav-back"]} />
    </SlideTransition>
  )
}
