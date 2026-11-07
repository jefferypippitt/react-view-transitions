"use client"

import { createContext, use, useState } from "react"

type Cart = {
  quantities: Record<string, number>
  setQuantity: (id: string, quantity: number) => void
}

const CartContext = createContext<Cart | null>(null)

/**
 * In-memory cart for the shop demos. Lives in each demo's layout, so it
 * survives navigating between the grid and product pages (layouts don't
 * remount). Each demo has its own cart.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const setQuantity = (id: string, quantity: number) =>
    setQuantities((current) => ({ ...current, [id]: Math.max(0, quantity) }))

  return <CartContext value={{ quantities, setQuantity }}>{children}</CartContext>
}

export function useCart() {
  const cart = use(CartContext)
  if (!cart) throw new Error("useCart must be used inside <CartProvider>")
  return cart
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
