"use client"

import { RiAddLine, RiSubtractLine } from "@remixicon/react"

import { useCart } from "@/components/shop/cart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  id,
  label,
  size = "sm",
}: {
  id: string
  label: string
  /** "xs" for grid cards, "sm" for the product page. */
  size?: "xs" | "sm"
}) {
  const { quantities, setQuantity } = useCart()
  const quantity = quantities[id] ?? 0
  const buttonSize = size === "xs" ? "icon-xs" : "icon-sm"

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size={buttonSize}
        aria-label={`Remove one ${label}`}
        disabled={quantity === 0}
        onClick={() => setQuantity(id, quantity - 1)}
      >
        <RiSubtractLine />
      </Button>
      <span
        aria-live="polite"
        aria-label={`${quantity} in bag`}
        className={cn("text-center tabular-nums", size === "xs" ? "w-6" : "w-8")}
      >
        {quantity}
      </span>
      <Button
        variant="outline"
        size={buttonSize}
        aria-label={`Add one ${label}`}
        onClick={() => setQuantity(id, quantity + 1)}
      >
        <RiAddLine />
      </Button>
    </div>
  )
}
