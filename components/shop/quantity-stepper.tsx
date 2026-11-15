"use client"

import { RiAddLine, RiSubtractLine } from "@remixicon/react"

import { useCart } from "@/components/shop/cart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  id,
  label,
  size = "sm",
  onChange,
}: {
  id: string
  label: string
  /** "xs" for grid cards, "sm" for the product page. */
  size?: "xs" | "sm"
  /** Replaces the plain cart update, e.g. to run it in a Transition. */
  onChange?: (quantity: number) => void
}) {
  const cart = useCart()
  const quantity = cart.quantities[id] ?? 0
  const change = (next: number) =>
    onChange ? onChange(next) : cart.setQuantity(id, next)
  const buttonSize = size === "xs" ? "icon-xs" : "icon-sm"

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size={buttonSize}
        aria-label={`Remove one ${label}`}
        disabled={quantity === 0}
        onClick={() => change(quantity - 1)}
      >
        <RiSubtractLine />
      </Button>
      <span
        aria-live="polite"
        aria-label={`${quantity} in bag`}
        className={cn(
          "text-center tabular-nums",
          size === "xs" ? "w-6" : "w-8"
        )}
      >
        {quantity}
      </span>
      <Button
        variant="outline"
        size={buttonSize}
        aria-label={`Add one ${label}`}
        onClick={() => change(quantity + 1)}
      >
        <RiAddLine />
      </Button>
    </div>
  )
}
