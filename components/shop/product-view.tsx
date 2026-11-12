"use client"

import Image from "next/image"
import { startTransition, useState, ViewTransition } from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cartKey, formatPrice, type Product, variantAlt } from "@/lib/media"

export function ProductView({
  product,
  enter = "fade-in",
  exit = "fade-out",
}: {
  product: Product
  /** View transition classes for the photo swapping on a color pick. */
  enter?: string
  exit?: string
}) {
  const [color, setColor] = useState(product.variants[0].color)
  const variant =
    product.variants.find((v) => v.color === color) ?? product.variants[0]

  return (
    <div className="grid max-w-5xl gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12">
      <div className="relative aspect-square overflow-hidden bg-product">
        {/* Keyed by color: picking a color swaps this subtree, so the old
            shot exits and the new one enters with the same animation as
            pages. */}
        <ViewTransition
          key={variant.color}
          enter={enter}
          exit={exit}
          default="none"
        >
          <Image
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-10"
          />
        </ViewTransition>
      </div>
      <div className="flex flex-col gap-6 md:pt-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-sm font-semibold">{`'${product.name}'`}</h1>
          <span className="text-muted-foreground">{product.code}</span>
        </div>
        <span className="text-sm tabular-nums">
          {formatPrice(product.price)}
        </span>
        <Separator />
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground">
            Color <span className="text-foreground">{variant.color}</span>
          </span>
          {product.variants.length > 1 && (
            <ToggleGroup
              variant="outline"
              size="sm"
              aria-label="Color"
              value={[variant.color]}
              onValueChange={(value) => {
                const next = value[0]
                // Base UI lets you un-press the active item; keep one selected.
                if (next) startTransition(() => setColor(next))
              }}
              className="flex-wrap"
            >
              {product.variants.map((v) => (
                <ToggleGroupItem
                  key={v.color}
                  value={v.color}
                  className="font-mono tracking-wide uppercase"
                >
                  {v.color}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Quantity</span>
          <QuantityStepper
            id={cartKey(product, variant)}
            label={`${product.name} in ${variant.color}`}
          />
        </div>
      </div>
    </div>
  )
}
