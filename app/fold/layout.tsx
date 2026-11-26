import Link from "next/link"

import { ProgressiveBlur } from "@/components/progressive-blur"
import { BagLink, CartProvider } from "@/components/shop/cart"

export default function FoldLayout({ children }: LayoutProps<"/fold">) {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
        {/* Named so it stays pinned (and flat) above the content while it
            folds (see ::view-transition-group(shop-header) in globals.css). */}
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between px-6 text-sm [view-transition-name:shop-header]">
          <ProgressiveBlur />
          <Link href="/" className="relative font-semibold tracking-widest">
            Home
          </Link>
          <BagLink href="/fold/checkout" />
        </header>
        {children}
      </div>
    </CartProvider>
  )
}
