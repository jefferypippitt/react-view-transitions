import Link from "next/link"

import { ProgressiveBlur } from "@/components/progressive-blur"
import { CartCount, CartProvider } from "@/components/shop/cart"

export default function MorphLayout({ children }: LayoutProps<"/morph">) {
  return (
    <CartProvider>
      <div className="flex min-h-svh flex-col font-mono text-xs tracking-wide uppercase">
        {/* Named so it stays pinned while the page content slides beneath it
            (see ::view-transition-group(shop-header) in globals.css). */}
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between px-6 text-sm [view-transition-name:shop-header]">
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
