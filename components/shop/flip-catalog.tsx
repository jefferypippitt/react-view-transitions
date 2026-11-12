"use client"

import Image from "next/image"
import Link from "next/link"
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
  variantAlt,
} from "@/lib/media"

/** Filter order, for the deal's direction: all, then the toggles left to right. */
function rank(filter: Filter | null) {
  return filter ? filters.indexOf(filter) + 1 : 0
}

/** Last wave step (globals.css has wave-1 … wave-16): later cells deal together. */
const lastWave = 16

/**
 * A cell's flip, keyed by the deal's direction and delayed by its place in
 * the grid, so the cards turn over one after another. Untyped updates (the
 * bag, navigation) resolve to none.
 */
function flip(index: number) {
  const wave = `wave-${Math.min(index, lastWave)}`
  return {
    "deal-forward": `flip-forward ${wave}`,
    "deal-back": `flip-back ${wave}`,
    default: "none",
  }
}

/**
 * Flip + Deal. Every grid cell is a card. Changing the filter deals the new
 * set: each cell whose product changes turns over to show the product that
 * now belongs there, cell after cell. Cells that keep their product stay
 * still, cells past the new end turn away, and new cells turn in.
 *
 * The React side, for lifting into any grid:
 *
 * - One transition per filter change, typed deal-forward or deal-back by the
 *   filter's order.
 * - Each card's boundary is keyed by cell *and* product
 *   (`${index}-${product.id}`). Same product in the same cell: same key,
 *   nothing happens. A different product in that cell: the old key exits
 *   and the new one enters in the same spot, and the two halves of the flip
 *   (flip-forward / flip-back in globals.css) turn the old face away as the
 *   new face turns in.
 */
export function FlipCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const shown = getProducts(filter ?? undefined)

  function selectFilter(next: Filter | null) {
    if (next === filter) return
    startTransition(() => {
      addTransitionType(
        rank(next) > rank(filter) ? "deal-forward" : "deal-back"
      )
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
          {filters.map((f) => (
            <ToggleGroupItem
              key={f}
              value={f}
              className="font-mono tracking-wide uppercase"
            >
              {f}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-end text-muted-foreground tabular-nums">
          {shown.length} items
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((product, index) => {
          const deal = flip(index)
          return (
            // Directly inside the grid, keyed by cell and product: see above.
            <ViewTransition
              key={`${index}-${product.id}`}
              enter={deal}
              exit={deal}
              default="none"
            >
              <ProductCard product={product} />
            </ViewTransition>
          )
        })}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <Link
        href={`/flip/${product.id}`}
        transitionTypes={["nav-forward"]}
        className="group flex flex-col gap-3"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        <div className="relative aspect-square overflow-hidden bg-product">
          <Image
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            sizes={productImageSizes}
            // Eager: a card dealt into a cell must be ready for the new
            // snapshot, not waiting on lazy loading.
            loading="eager"
            className="object-contain p-[8%] transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </div>
      </Link>
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
