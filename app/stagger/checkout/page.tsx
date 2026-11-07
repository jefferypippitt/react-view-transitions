import { StaggerCheckout } from "@/components/shop/stagger-checkout"
import { SlideTransition } from "@/components/slide-transition"

export default function StaggerCheckoutPage() {
  return (
    // Checkout is a level deeper: the header's bag link slides it in
    // (nav-forward), Back slides it out (nav-back). The bag's photos morph
    // between the grid and the table, in the same wave as the view switch.
    <SlideTransition>
      <StaggerCheckout />
    </SlideTransition>
  )
}
