"use client"

import { preloadPhotos, ProductImage } from "@/components/shop/product-image"
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { SlideTransition } from "@/components/slide-transition"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  formatPrice,
  productHeroSizes,
  type Product,
  variantAlt,
} from "@/lib/media"

export function MorphProductView({ product }: { product: Product }) {
  const [color, setColor] = useState(product.variants[0].color)
  const index = Math.max(
    0,
    product.variants.findIndex((v) => v.color === color)
  )
  const variant = product.variants[index]!

  // The other colors, fetched now at the photo's size: picking one swaps
  // at once instead of holding the transition while it loads.
  preloadPhotos(
    product.variants.filter((v) => v !== variant).map((v) => v.src),
    productHeroSizes
  )

  function selectColor(next: string) {
    const nextIndex = product.variants.findIndex((v) => v.color === next)
    if (nextIndex === index) return
    startTransition(() => {
      // Colors are an ordered row, so the photo slides like prev/next:
      // a color to the right comes in from the right.
      addTransitionType(nextIndex > index ? "nav-forward" : "nav-back")
      setColor(next)
    })
  }

  return (
    <div className="grid max-w-5xl gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12">
      {/* Shared element: pairs with the grid card's photo of the same name. */}
      <ViewTransition
        name={`product-${product.id}`}
        share="morph"
        default="none"
      >
        <div className="relative aspect-square overflow-hidden bg-product">
          {/* Keyed by color: picking a color swaps this subtree, so the old
              shot slides out and the new one slides in. */}
          <SlideTransition key={variant.color}>
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              preload
              sizes={productHeroSizes}
              className="object-contain p-[8%]"
            />
          </SlideTransition>
        </div>
      </ViewTransition>
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
                // Base UI lets you un-press the active item; keep one selected.
                if (value[0]) selectColor(value[0])
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
