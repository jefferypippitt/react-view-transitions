"use client"

import { ProductImage } from "@/components/shop/product-image"
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
  type Filter,
  filters,
  formatPrice,
  getProducts,
  isFilter,
  type Product,
  products,
  type Variant,
  variantAlt,
} from "@/lib/media"

/**
 * Reel direction, keyed by transition type: a product further along the
 * catalog rolls up, an earlier one rolls down. Untyped updates (filters,
 * colors, the bag) don't roll.
 */
const roll = {
  "roll-up": "roll-up",
  "roll-down": "roll-down",
  default: "none",
}

/**
 * Swap + Roll. One product sits in the spotlight next to the grid.
 *
 * - Swap: clicking a card trades it with the spotlighted product. Both
 *   photos are named, so in one transition the card's photo morphs up into
 *   the stage while the old one morphs down into the cell it left.
 * - Roll: the stage details and the swapped cell's card are keyed by
 *   product, so they exit and enter like a slot-machine reel.
 *
 * Photos are `unoptimized`: the stage and a cell then load the same file, so
 * a photo landing in either place is already decoded when the new view is
 * snapshotted (different srcset picks would arrive blank).
 */
export function SwapCatalog() {
  const [featured, setFeatured] = useState(products[0]!)
  // The grid's cells in order. The spotlighted product is never in it.
  const [slots, setSlots] = useState(() => products.slice(1))
  const [filter, setFilter] = useState<Filter | null>(null)
  // Picked color per product, so a product swapped back into the grid
  // shows the color it had in the spotlight.
  const [colors, setColors] = useState<Record<string, string>>({})

  const allowed = new Set(getProducts(filter ?? undefined))
  const shown = slots.filter((product) => allowed.has(product))

  const variantOf = (product: Product): Variant =>
    product.variants.find((v) => v.color === colors[product.id]) ??
    product.variants[0]

  function spotlight(product: Product) {
    startTransition(() => {
      addTransitionType(
        products.indexOf(product) > products.indexOf(featured)
          ? "roll-up"
          : "roll-down"
      )
      // The old spotlight takes the clicked card's cell: a true swap.
      setSlots((current) => current.map((p) => (p === product ? featured : p)))
      setFeatured(product)
    })
  }

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Stage
        product={featured}
        variant={variantOf(featured)}
        // Not part of the demo: a plain state update, no Transition.
        onColor={(color) =>
          setColors((current) => ({ ...current, [featured.id]: color }))
        }
      />

      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 whitespace-nowrap">
          <h1 className="text-[0.8rem] font-medium tracking-wide">
            All products
          </h1>
          <ToggleGroup
            size="sm"
            aria-label="Filter products"
            value={filter ? [filter] : []}
            // Filtering isn't what this demo shows, so it's a plain state
            // update: no Transition, no boundaries run.
            onValueChange={(value) => setFilter(value.find(isFilter) ?? null)}
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
          <span
            aria-live="polite"
            className="text-end text-muted-foreground tabular-nums"
          >
            {shown.length} {shown.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {shown.map((product) => (
            // List identity, keyed by product, directly inside the grid. On
            // a swap the cell's old card exits and the new one enters, as a
            // reel.
            <ViewTransition
              key={product.id}
              enter={roll}
              exit={roll}
              default="none"
            >
              <SwapCard
                product={product}
                variant={variantOf(product)}
                onSpotlight={() => spotlight(product)}
              />
            </ViewTransition>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * The spotlight: a sticky bar under the header on phones, a sticky column
 * beside the grid from md up. Either way it stays in view, so a swap from
 * anywhere in the grid is seen end to end.
 */
function Stage({
  product,
  variant,
  onColor,
}: {
  product: Product
  variant: Variant
  onColor: (color: string) => void
}) {
  return (
    <section
      aria-label="Spotlight"
      className="sticky top-12 z-5 -mx-6 flex flex-col gap-3 border-b bg-background px-6 py-3 md:top-20 md:mx-0 md:gap-4 md:border-b-0 md:bg-transparent md:p-0"
    >
      <span className="hidden text-muted-foreground md:block">Spotlight</span>
      <div className="flex gap-4 md:flex-col md:gap-6">
        {/* Shared element: same name as the card's photo in the grid. Keyed
            so a swap remounts it: the old photo leaves for its cell and the
            new one arrives from its card. */}
        <ViewTransition
          key={`photo-${product.id}`}
          name={`swap-${product.id}`}
          share="swap-lead"
          default="none"
        >
          {/* From md up the stage is a sticky column and can't scroll, so
              the photo takes only the height the details leave free (header,
              label, details ≈ 25rem): the + / − stepper stays on screen. */}
          <div className="relative size-24 shrink-0 overflow-hidden bg-product md:aspect-square md:size-auto md:w-[min(100%,calc(100svh-25rem))]">
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              unoptimized
              loading="eager"
              className="object-contain p-[8%]"
            />
          </div>
        </ViewTransition>

        {/* The reel: keyed by product, rolls up or down by catalog order. */}
        <ViewTransition
          key={`details-${product.id}`}
          enter={roll}
          exit={roll}
          default="none"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
            <div className="flex min-w-0 flex-col gap-1 md:gap-2">
              <h2 className="truncate text-sm font-semibold">{`'${product.name}'`}</h2>
              <span className="text-muted-foreground">{product.code}</span>
            </div>
            <span className="text-sm tabular-nums">
              {formatPrice(product.price)}
            </span>
            <Separator className="hidden md:block" />
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
                    // Base UI lets you un-press the active item; keep one
                    // selected.
                    if (value[0]) onColor(value[0])
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
            {/* Add to / remove from the bag right in the spotlight, same
                cart line as the card's stepper for this color. */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <QuantityStepper
                id={cartKey(product, variant)}
                label={`${product.name} in ${variant.color}`}
              />
            </div>
          </div>
        </ViewTransition>
      </div>
    </section>
  )
}

function SwapCard({
  product,
  variant,
  onSpotlight,
}: {
  product: Product
  variant: Variant
  onSpotlight: () => void
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      {/* Buttons don't inherit text-transform, so the shop's mono uppercase
          is set here again. */}
      <button
        type="button"
        onClick={onSpotlight}
        aria-label={`Spotlight ${product.name}`}
        className="group flex cursor-pointer flex-col gap-3 text-start font-mono tracking-wide uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span className="truncate font-medium">{`'${product.name}'`}</span>
        {/* Shared element: pairs with the stage photo of the same name. */}
        <ViewTransition name={`swap-${product.id}`} share="swap" default="none">
          <div className="relative aspect-square overflow-hidden bg-product">
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              unoptimized
              // Eager: a photo swapped into a cell must be ready for the
              // new snapshot, not waiting on lazy loading.
              loading="eager"
              className="object-contain p-[8%] transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </div>
        </ViewTransition>
      </button>
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
