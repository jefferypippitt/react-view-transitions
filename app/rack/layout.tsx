import Link from "next/link"

import { ProgressiveBlur } from "@/components/progressive-blur"
import { BagLink, CartProvider } from "@/components/shop/cart"
import { RACK_BAG } from "@/components/shop/rack-types"

export default function RackLayout({ children }: LayoutProps<"/rack">) {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
        {/* Named so it stays pinned while the rail moves beneath it
            (see ::view-transition-group(shop-header) in globals.css). */}
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between px-6 text-sm [view-transition-name:shop-header]">
          <ProgressiveBlur />
          <Link href="/" className="relative font-semibold tracking-widest">
            Home
          </Link>
          {/* Opening the bag lifts every bagged garment off the rail. */}
          <BagLink href="/rack/checkout" transitionTypes={[RACK_BAG]} />
        </header>
        {children}
      </div>
    </CartProvider>
  )
}
