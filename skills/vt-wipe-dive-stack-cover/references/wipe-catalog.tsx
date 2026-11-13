"use client"

import Image from "next/image"
import Link from "next/link"
import {
  addTransitionType,
  startTransition,
  useOptimistic,
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

/** Filter order, for the wipe's direction: all, then the toggles left to right. */
function rank(filter: Filter | null) {
  return filter ? filters.indexOf(filter) + 1 : 0
}

/**
 * The grid's swap, keyed by the wipe's direction. Untyped updates (the bag)
 * and the page dives resolve to none.
 */
const wipe = {
  "wipe-forward": "wipe-forward",
  "wipe-back": "wipe-back",
  default: "none",
}

/** The photo morphs into the product page only on the dive in and out. */
const dive = { "dive-in": "morph", "dive-out": "morph", default: "none" }

/**
 * Wipe + Dive + Stack + Cover: the grid. Changing the filter wipes the new
 * set across the old one, like a squeegee: rightward for a filter further
 * along the row, leftward for one before it.
 *
 * The React side, for lifting into any filtered list:
 *
 * - The grid's boundary is keyed by filter, so a change swaps it whole: the
 *   old grid exits and the new one enters, and the wipe-* classes clip both
 *   with the same moving edge (globals.css).
 * - The toggles and the item count read an optimistic copy of the filter.
 *   useOptimistic values commit before the transition's old snapshot, so
 *   the controls switch at once instead of cross-fading with the page.
 */
export function WipeCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [pressed, setPressed] = useOptimistic(filter)
  const shown = getProducts(filter ?? undefined)
  const count = getProducts(pressed ?? undefined).length

  function selectFilter(next: Filter | null) {
    if (next === pressed) return
    startTransition(() => {
      addTransitionType(
        rank(next) > rank(filter) ? "wipe-forward" : "wipe-back"
      )
      setPressed(next)
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
          value={pressed ? [pressed] : []}
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
          {count} items
        </span>
      </div>
      {/* Keyed by filter: see above. */}
      <ViewTransition
        key={filter ?? "all"}
        enter={wipe}
        exit={wipe}
        default="none"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </ViewTransition>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <Link
        href={`/wipe/${product.id}`}
        transitionTypes={["dive-in"]}
        className="group flex flex-col gap-3"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        {/* Shared element with the product page's photo. The share is keyed
            to the dives: a product in both the old and new grid would pair
            with itself on a filter change and fly over the wipe. */}
        <ViewTransition
          name={`product-${product.id}`}
          share={dive}
          default="none"
        >
          <div className="relative aspect-square overflow-hidden bg-product">
            <Image
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              sizes={productImageSizes}
              // Eager: the incoming grid is a fresh mount, and its photos must
              // be ready for the new snapshot, not waiting on lazy loading.
              loading="eager"
              className="object-contain p-[8%] transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
        </ViewTransition>
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
