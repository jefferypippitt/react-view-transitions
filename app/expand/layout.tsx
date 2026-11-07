import Link from "next/link"

import { ProgressiveBlur } from "@/components/progressive-blur"
import { CartCount, CartProvider } from "@/components/shop/cart"

export default function ExpandLayout({ children }: LayoutProps<"/expand">) {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
        {/* Named so it stays pinned above the sheet and the morphing photo
            (see ::view-transition-group(shop-header) in globals.css).
            z-30: above the raised filter row (z-21) as it scrolls under. */}
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between px-6 text-sm [view-transition-name:shop-header]">
          <ProgressiveBlur />
          <Link href="/" className="relative font-semibold tracking-widest">
            Home
          </Link>
          <span className="relative">
            <CartCount />
          </span>
        </header>
        {children}
      </div>
    </CartProvider>
  )
}
