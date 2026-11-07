"use client"

import Link from "next/link"
import { createContext, use, useState } from "react"

import { getCartLine, type Product, type Variant } from "@/lib/media"

type Cart = {
  /** Lines in the order they went into the bag (oldest first). */
  quantities: Record<string, number>
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

export type CartLine = {
  key: string
  product: Product
  variant: Variant
  quantity: number
}

const CartContext = createContext<Cart | null>(null)

/**
 * In-memory cart for the shop demos. Lives in each demo's layout, so it
 * survives navigating between the grid, product and checkout pages (layouts
 * don't remount). Each demo has its own cart.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const setQuantity = (id: string, quantity: number) =>
    setQuantities((current) => {
      const { [id]: previous = 0, ...rest } = current
      const next = Math.max(0, quantity)
      if (next === 0) return rest
      // A line that was empty goes to the end: key order is bag order.
      return previous > 0 ? { ...current, [id]: next } : { ...rest, [id]: next }
    })

  const clear = () => setQuantities({})

  return (
    <CartContext value={{ quantities, setQuantity, clear }}>
      {children}
    </CartContext>
  )
}

export function useCart() {
  const cart = use(CartContext)
  if (!cart) throw new Error("useCart must be used inside <CartProvider>")
  return cart
}

/** The bag's lines, oldest first. */
export function useCartLines(): CartLine[] {
  const { quantities } = useCart()
  return Object.entries(quantities).flatMap(([key, quantity]) => {
    const line = getCartLine(key)
    return line && quantity > 0 ? [{ ...line, quantity }] : []
  })
}

export function CartCount() {
  const { quantities } = useCart()
  const count = Object.values(quantities).reduce((sum, n) => sum + n, 0)

  return (
    <span aria-live="polite" className="tabular-nums">
      Bag ({count})
    </span>
  )
}

/** The header's bag count, linking to the demo's checkout. */
export function BagLink({
  href,
  transitionTypes,
}: {
  href: string
  transitionTypes?: string[]
}) {
  return (
    <Link href={href} transitionTypes={transitionTypes} className="relative">
      <CartCount />
    </Link>
  )
}
