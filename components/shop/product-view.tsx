"use client"

import { preloadPhotos, ProductImage } from "@/components/shop/product-image"
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  formatPrice,
  productHeroSizes,
  type Product,
  variantAlt,
} from "@/lib/media"

type PhotoClass = React.ComponentProps<typeof ViewTransition>["enter"]

export function ProductView({
  product,
  enter = "fade-in",
  exit = "fade-out",
  photoName,
}: {
  product: Product
  /**
   * View transition classes for the photo swapping on a color pick. A
   * class name, or a map keyed by the pick's direction: nav-forward (a color
   * further right in the row) or nav-back.
   */
  enter?: PhotoClass
  exit?: PhotoClass
  /**
   * Shared-element name for the photo box, to pair it with a grid card's
   * photo (share="morph"). Omit it and the photo has no name.
   */
  photoName?: string
}) {
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
      // Colors are an ordered row; maps on enter/exit can pick a direction.
      addTransitionType(nextIndex > index ? "nav-forward" : "nav-back")
      setColor(next)
    })
  }

  const photo = (
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
        <ProductImage
          src={variant.src}
          alt={variantAlt(product, variant)}
          fill
          preload
          sizes={productHeroSizes}
          // Opaque, like the box: a shot that slides over another must
          // cover it, padding included.
          className="bg-product object-contain p-10"
        />
      </ViewTransition>
    </div>
  )

  return (
    <div className="grid max-w-5xl gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12">
      {photoName ? (
        <ViewTransition name={photoName} share="morph" default="none">
          {photo}
        </ViewTransition>
      ) : (
        photo
      )}
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
                if (next) selectColor(next)
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
