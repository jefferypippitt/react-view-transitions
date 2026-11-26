"use client"

import {
  preloadOnIntent,
  preloadPhotos,
  ProductImage,
} from "@/components/shop/product-image"
import Link from "next/link"
import { useState, ViewTransition } from "react"

import { Checkout } from "@/components/shop/checkout"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import {
  RACK_BAG,
  RACK_LIFT,
  RACK_RETURN,
  RAIL_NEXT,
  RAIL_PREV,
} from "@/components/shop/rack-types"
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
  productHeroSizes,
  variantAlt,
} from "@/lib/media"

/**
 * Lift + Swing + Sway: the shop as a clothing rail.
 *
 * - Lift: opening a product takes it off its hanger. Its photo morphs into
 *   the product page swinging from a pivot at its top edge, like a garment
 *   pulled off a rail, while the other garments jostle as they go.
 * - Swing: on the product page, prev/next slides along the rail. The photo
 *   travels in, stops and swings back and forth before settling, the way a
 *   hanger does when it's pushed along.
 * - Sway: Back hangs the garment on the rail again. Its photo swings into
 *   its cell, and the whole rail sways in a wave, card after card, as if
 *   it was bumped.
 *
 * Every swing pivots at the top edge (transform-origin: 50% 0 on the
 * snapshots), so things hang rather than spin. The physics is all CSS
 * keyframes; React's part is which boundary gets which class for which
 * transition type.
 */

/** Rail positions past this one sway together, so the wave stays short. */
const MAX_WAVE = 6

/**
 * The photo's shared-element class, the same map on every side of a pair:
 * going off the rail it lifts, going back on it hangs.
 */
const photoShare = {
  [RACK_LIFT]: "lift",
  [RACK_BAG]: "lift",
  [RACK_RETURN]: "hang",
  default: "none",
}

export function RackCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const shown = getProducts(filter ?? undefined)

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
          onValueChange={(value) => {
            // Plain update, no Transition: the rail moves only on pages.
            setFilter(value.find(isFilter) ?? null)
          }}
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
        <span className="text-end text-muted-foreground">
          {shown.length} items
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((product, index) => {
          // The sway runs along the rail in reading order.
          const wave = Math.min(index, MAX_WAVE)
          const waveClass = wave ? ` wave-${wave}` : ""
          return (
            // One boundary per garment, directly inside the grid and with
            // no page-level boundary around it: a parent that enters or
            // exits as one unit would swallow each card's own sway.
            <ViewTransition
              key={product.id}
              exit={{
                [RACK_LIFT]: `sway-off${waveClass}`,
                [RACK_BAG]: `sway-off${waveClass}`,
                default: "none",
              }}
              enter={{
                [RACK_RETURN]: `sway-on${waveClass}`,
                default: "none",
              }}
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
        {...preloadOnIntent(variant.src, productHeroSizes)}
        href={`/rack/${product.id}`}
        transitionTypes={[RACK_LIFT]}
        // Press feedback: the garment gives a little under the finger.
        className="group flex flex-col gap-3 transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        {/* Shared element: pairs with the hero and with checkout rows. Its
            own group rides above the rail and carries the swing. */}
        <ViewTransition
          name={`product-${product.id}`}
          share={photoShare}
          default="none"
        >
          <div className="relative aspect-square overflow-hidden bg-product">
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
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

/**
 * A block of the product or checkout page. Taken off the rail, the blocks
 * drop into place one after another (wave), like tags settling under the
 * garment. Going back they lift away together, fast. Along the rail
 * (prev/next) they slide, quieter than the photo's swing.
 */
export function RackBlock({
  wave = 0,
  children,
}: {
  wave?: number
  children: React.ReactNode
}) {
  const drop = wave ? `drop-in wave-${wave}` : "drop-in"
  return (
    <ViewTransition
      enter={{
        [RACK_LIFT]: drop,
        [RACK_BAG]: drop,
        [RAIL_NEXT]: "nav-forward",
        [RAIL_PREV]: "nav-back",
        default: "none",
      }}
      exit={{
        [RACK_RETURN]: "lift-off",
        [RACK_BAG]: "lift-off",
        [RAIL_NEXT]: "nav-forward",
        [RAIL_PREV]: "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}

export function RackProductView({ product }: { product: Product }) {
  const [color, setColor] = useState(product.variants[0].color)
  const variant =
    product.variants.find((v) => v.color === color) ?? product.variants[0]

  preloadPhotos(
    product.variants.filter((v) => v !== variant).map((v) => v.src),
    productHeroSizes
  )

  return (
    <div className="grid max-w-5xl gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-12">
      {/* The garment. Paired with its card (lift / hang) or a checkout row.
          Unpaired, along the rail, it rides in and swings (rail-next /
          rail-prev). */}
      <ViewTransition
        name={`product-${product.id}`}
        share={photoShare}
        enter={{
          [RAIL_NEXT]: "rail-next",
          [RAIL_PREV]: "rail-prev",
          default: "none",
        }}
        exit={{
          [RACK_BAG]: "lift-off",
          [RAIL_NEXT]: "rail-next",
          [RAIL_PREV]: "rail-prev",
          default: "none",
        }}
        default="none"
      >
        <div className="relative aspect-square overflow-hidden bg-product">
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            preload
            sizes={productHeroSizes}
            className="object-contain p-[8%]"
          />
        </div>
      </ViewTransition>
      <div className="flex flex-col gap-6 md:pt-2">
        <RackBlock wave={1}>
          <div className="flex flex-col gap-2">
            <h1 className="text-sm font-semibold">{`'${product.name}'`}</h1>
            <span className="text-muted-foreground">{product.code}</span>
          </div>
        </RackBlock>
        <RackBlock wave={2}>
          <div className="flex flex-col gap-6">
            <span className="text-sm tabular-nums">
              {formatPrice(product.price)}
            </span>
            <Separator />
          </div>
        </RackBlock>
        <RackBlock wave={3}>
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
                  // Plain update: colors aren't part of this story.
                  if (value[0]) setColor(value[0])
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
        </RackBlock>
        <RackBlock wave={4}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <QuantityStepper
              id={cartKey(product, variant)}
              label={`${product.name} in ${variant.color}`}
            />
          </div>
        </RackBlock>
      </div>
    </div>
  )
}

/**
 * Checkout: opening the bag lifts every bagged garment off the rail into
 * its row (same swing as opening a product) while the rest jostle, and the
 * table drops in. Back hangs them all on the rail again.
 */
export function RackCheckout() {
  return (
    <RackBlock wave={1}>
      <Checkout
        shopHref="/rack"
        backTypes={[RACK_RETURN]}
        wrapPhoto={(photo, { line, firstOfProduct }) =>
          firstOfProduct ? (
            <ViewTransition
              name={`product-${line.product.id}`}
              share={photoShare}
              default="none"
            >
              {photo}
            </ViewTransition>
          ) : (
            photo
          )
        }
      />
    </RackBlock>
  )
}
