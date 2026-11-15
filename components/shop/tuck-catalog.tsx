"use client"

import { ProductImage } from "@/components/shop/product-image"
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  type Filter,
  filters,
  formatPrice,
  getProducts,
  isFilter,
  type Product,
  productImageSizes,
  products,
  variantAlt,
} from "@/lib/media"

/**
 * Tuck + Spill: filtering shows where things go.
 *
 * Turn on "female" and every male-only product's photo flies into the
 * "male" chip and disappears into it: they aren't gone, they're in the chip
 * that brings them back. Turn "male" on and they spill back out into their
 * cells, while the female-only ones fly the other way into the "female"
 * chip. Products that stay glide to make room.
 *
 * The React side, for lifting into any filterable list:
 *
 * - One transition, typed "tuck": startTransition + addTransitionType.
 * - Every product photo has a name (tuck-<id>) in two places: its card in
 *   the grid, and an invisible target inside a chip. The filter decides
 *   which one is rendered, never both, so every change unmounts one and
 *   mounts the other and React pairs them: the photo flies between them
 *   (share).
 * - The card around the photo is a keyed list boundary: its text exits or
 *   enters (fades), and when it stays but moves, it updates (glides).
 * - All of it is type-keyed with default "none", so nothing else on the page
 *   (cart changes, page navigation) runs these animations.
 */

/** The photo's name, the same in the grid and in the chip. */
const tuckName = (product: Product) => `tuck-${product.id}`

/** The photo's share, only for the filter's own transitions. */
const tuckShare = { tuck: "tuck", default: "none" }

export function TuckCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const shown = getProducts(filter ?? undefined)

  /** What a chip is holding: what the other filter hides (never unisex). */
  const tuckedIn = (chip: Filter) =>
    filter && filter !== chip ? products.filter((p) => p.gender === chip) : []

  function selectFilter(next: Filter | null) {
    startTransition(() => {
      addTransitionType("tuck")
      setFilter(next)
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 whitespace-nowrap">
        <h1 className="text-[0.8rem] font-medium tracking-wide">
          All products
        </h1>
        <ToggleGroup
          size="sm"
          aria-label="Filter products"
          value={filter ? [filter] : []}
          // Un-pressing the active item clears the filter (back to all).
          onValueChange={(value) => selectFilter(value.find(isFilter) ?? null)}
        >
          {filters.map((f) => {
            const tucked = tuckedIn(f)
            return (
              <ToggleGroupItem
                key={f}
                value={f}
                aria-label={
                  tucked.length ? `${f}, ${tucked.length} tucked away` : f
                }
                className="relative font-mono tracking-wide uppercase"
              >
                {f}
                <TuckTargets products={tucked} />
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        <span className="text-end text-muted-foreground tabular-nums">
          {shown.length} items
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((product) => (
          // List identity: one boundary per card, keyed, directly inside the
          // grid. Its photo is pulled out (named) and flies on its own.
          <ViewTransition
            key={product.id}
            enter={{ tuck: "tuck-card", default: "none" }}
            exit={{ tuck: "tuck-card", default: "none" }}
            update={{ tuck: "tuck-shift", default: "none" }}
            default="none"
          >
            <ProductCard product={product} />
          </ViewTransition>
        ))}
      </div>
    </div>
  )
}

/**
 * Where a chip's tucked products fly to: one empty, invisible box per
 * product, all stacked in the middle of the chip. Each carries its
 * product's name, so the photo has a partner to pair with. Its snapshot is
 * blank, so the flying photo cross-fades into nothing as it shrinks into
 * the chip, and grows back out of it on the way out. Nothing is drawn
 * outside a transition. Out of flow, so the chip's size never changes.
 */
function TuckTargets({ products }: { products: Product[] }) {
  return products.map((product) => (
    <ViewTransition
      key={product.id}
      name={tuckName(product)}
      share={tuckShare}
      default="none"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2"
      />
    </ViewTransition>
  ))
}

function ProductCard({ product }: { product: Product }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
      <ViewTransition name={tuckName(product)} share={tuckShare} default="none">
        <div className="relative aspect-square overflow-hidden bg-product">
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            sizes={productImageSizes}
            loading="eager"
            className="object-contain p-[8%]"
          />
        </div>
      </ViewTransition>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="whitespace-nowrap tabular-nums">
          {formatPrice(product.price)}
        </span>
        <QuantityStepper
          id={cartKey(product, variant)}
          label={`${product.name} in ${variant.color}`}
        />
      </div>
    </article>
  )
}
