"use client"

import {
  preloadOnIntent,
  preloadPhotos,
  ProductImage,
} from "@/components/shop/product-image"
import { RiArrowLeftSLine, RiCheckLine, RiCloseLine } from "@remixicon/react"
import {
  addTransitionType,
  startTransition,
  useEffect,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  type Filter,
  filters,
  formatPrice,
  getProduct,
  getProducts,
  isFilter,
  type Product,
  productHeroSizes,
  productImageSizes,
  type Variant,
  variantAlt,
} from "@/lib/media"
import { cn } from "@/lib/utils"

const MAX_COMPARE = 4

/** Shared-element morph between grid cards and comparison columns. */
const compareShare = {
  "compare-open": "morph",
  "compare-close": "morph",
  default: "none",
}

/** Directional slide when picking colors inside a comparison column. */
const colorSlide = {
  "nav-forward": "carousel-forward",
  "nav-back": "carousel-back",
  default: "none",
}

/**
 * Compare + Split. Pick 2–4 products from the catalog and compare them side by
 * side.
 *
 * - Pin + Layout Displacement: pinning the first product opens an inline
 *   compare bar above the grid (compare-bar-in / compare-bar-out). The grid
 *   below is wrapped in its own <ViewTransition> (update="compare-shift"), so
 *   it glides down to make room instead of jumping.
 * - Multi-element Shared Morph: opening Compare unmounts the grid and mounts
 *   the comparison columns in one transition (compare-open). Every pinned
 *   product's photo shares a name (`compare-${product.id}`) across both views,
 *   so 2–4 product photos fly simultaneously from their grid cells into the
 *   split columns (and back on compare-close).
 * - Column Reflow: inside the split view, each column is a keyed boundary.
 *   Removing a column exits it while the remaining columns smoothly reflow to
 *   fill the row (compare-remove).
 * - Color Swap: picking a color inside a column slides just that photo in the
 *   direction of the pick (nav-forward / nav-back).
 * - Escape closes the comparison view outside a Transition (instant, no
 *   animation for keyboard shortcuts).
 */
export function CompareCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)
  const [colors, setColors] = useState<Record<string, string>>({})

  const shown = getProducts(filter ?? undefined)
  const pinnedProducts = pinnedIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => p !== undefined)

  const variantOf = (product: Product): Variant =>
    product.variants.find((v) => v.color === colors[product.id]) ??
    product.variants[0]

  // Preload hero-sized photos (and alternate colors) for pinned items so the
  // multi-element morph and color swaps start without waiting on the network.
  preloadPhotos(
    pinnedProducts.flatMap((p) => p.variants.map((v) => v.src)),
    productHeroSizes
  )

  function togglePin(product: Product) {
    const isPinned = pinnedIds.includes(product.id)
    if (!isPinned && pinnedIds.length >= MAX_COMPARE) return
    startTransition(() => {
      addTransitionType("compare-pin")
      setPinnedIds((current) =>
        isPinned
          ? current.filter((id) => id !== product.id)
          : [...current, product.id]
      )
    })
  }

  function clearPinned() {
    if (pinnedIds.length === 0) return
    startTransition(() => {
      addTransitionType(comparing ? "compare-close" : "compare-pin")
      setComparing(false)
      setPinnedIds([])
    })
  }

  function openCompare() {
    if (pinnedProducts.length < 2) return
    startTransition(() => {
      addTransitionType("compare-open")
      setComparing(true)
    })
  }

  function closeCompare() {
    startTransition(() => {
      addTransitionType("compare-close")
      setComparing(false)
    })
  }

  function removeFromCompare(id: string) {
    const remaining = pinnedIds.filter((item) => item !== id)
    startTransition(() => {
      if (remaining.length < 2) {
        addTransitionType("compare-close")
        setPinnedIds(remaining)
        setComparing(false)
      } else {
        addTransitionType("compare-remove")
        setPinnedIds(remaining)
      }
    })
  }

  function selectColor(product: Product, next: string) {
    const from = product.variants.indexOf(variantOf(product))
    const to = product.variants.findIndex((v) => v.color === next)
    if (from === to) return
    startTransition(() => {
      addTransitionType(to > from ? "nav-forward" : "nav-back")
      setColors((current) => ({ ...current, [product.id]: next }))
    })
  }

  // Esc closes the comparison view immediately: keyboard shortcuts update
  // state outside a Transition so they never animate.
  useEffect(() => {
    if (!comparing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setComparing(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [comparing])

  if (comparing) {
    const prices = pinnedProducts.map((p) => p.price)
    const lowestPrice = Math.min(...prices)
    const hasPriceSpread = new Set(prices).size > 1

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={closeCompare}
            className="-ms-2 w-fit font-mono tracking-wide uppercase"
          >
            <RiArrowLeftSLine data-icon="inline-start" />
            Back to catalog
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground tabular-nums">
              Comparing {pinnedProducts.length} items
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPinned}
              className="font-mono tracking-wide uppercase"
            >
              Clear all
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-6",
            pinnedProducts.length === 2 && "grid-cols-1 sm:grid-cols-2",
            pinnedProducts.length === 3 &&
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            pinnedProducts.length >= 4 &&
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {pinnedProducts.map((product) => {
            const variant = variantOf(product)
            const isLowest = hasPriceSpread && product.price === lowestPrice
            return (
              <ViewTransition
                key={product.id}
                enter={{ "compare-open": "compare-col-in", default: "none" }}
                exit={{
                  "compare-close": "compare-col-out",
                  "compare-remove": "compare-col-out",
                  default: "none",
                }}
                update={{
                  "compare-remove": "compare-shift",
                  default: "none",
                }}
                default="none"
              >
                <article className="flex flex-col gap-5 border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <h2 className="truncate font-semibold">{`'${product.name}'`}</h2>
                      <span className="text-muted-foreground">
                        {product.code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Remove ${product.name} from compare`}
                      onClick={() => removeFromCompare(product.id)}
                    >
                      <RiCloseLine />
                    </Button>
                  </div>

                  {/* Shared element with the catalog card's photo box. */}
                  <ViewTransition
                    name={`compare-${product.id}`}
                    share={compareShare}
                    enter={{ "compare-open": "fade-in", default: "none" }}
                    default="none"
                  >
                    <div className="relative aspect-square overflow-hidden bg-product">
                      <ViewTransition
                        key={variant.color}
                        enter={colorSlide}
                        exit={colorSlide}
                        default="none"
                      >
                        <ProductImage
                          src={variant.src}
                          alt={variantAlt(product, variant)}
                          fill
                          loading="eager"
                          sizes={productHeroSizes}
                          className="bg-product object-contain p-8"
                        />
                      </ViewTransition>
                    </div>
                  </ViewTransition>

                  <dl className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="flex items-center gap-2 tabular-nums">
                        {isLowest && (
                          <span className="border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            Lowest
                          </span>
                        )}
                        <span className="font-medium">
                          {formatPrice(product.price)}
                        </span>
                      </dd>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Fit</dt>
                      <dd>{product.gender}</dd>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Color</dt>
                        <dd>{variant.color}</dd>
                      </div>
                      {product.variants.length > 1 && (
                        <ToggleGroup
                          variant="outline"
                          size="sm"
                          aria-label={`Color for ${product.name}`}
                          value={[variant.color]}
                          onValueChange={(value) => {
                            const next = value[0]
                            if (next) selectColor(product, next)
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
                    <Separator />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <dt className="text-muted-foreground">Quantity</dt>
                      <dd>
                        <QuantityStepper
                          id={cartKey(product, variant)}
                          label={`${product.name} in ${variant.color}`}
                        />
                      </dd>
                    </div>
                  </dl>
                </article>
              </ViewTransition>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
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
        <span className="text-end text-muted-foreground tabular-nums">
          {shown.length} items
        </span>
      </div>

      {/* Inline Compare Bar: enters when the first product is pinned. The
          catalog grid below is a separate ViewTransition boundary, so it
          glides smoothly to make room instead of jumping. */}
      {pinnedProducts.length > 0 && (
        <ViewTransition
          enter={{ "compare-pin": "compare-bar-in", default: "none" }}
          exit={{ "compare-pin": "compare-bar-out", default: "none" }}
          default="none"
        >
          <section
            aria-label="Compare tray"
            className="flex flex-wrap items-center justify-between gap-4 border px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-muted-foreground tabular-nums">
                {pinnedProducts.length}/{MAX_COMPARE}
              </span>
              {pinnedProducts.map((product) => {
                const variant = variantOf(product)
                return (
                  <ViewTransition
                    key={product.id}
                    enter={{
                      "compare-pin": "compare-chip-in",
                      default: "none",
                    }}
                    exit={{
                      "compare-pin": "compare-chip-out",
                      default: "none",
                    }}
                    update={{
                      "compare-pin": "compare-shift",
                      default: "none",
                    }}
                    default="none"
                  >
                    <div className="flex items-center gap-2 border bg-background py-1 ps-1.5 pe-1">
                      <div className="relative size-6 shrink-0 overflow-hidden bg-product">
                        <ProductImage
                          src={variant.src}
                          alt=""
                          fill
                          sizes={productImageSizes}
                          className="object-contain p-0.5"
                        />
                      </div>
                      <span className="font-medium">{product.code}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name} from compare`}
                        onClick={() => togglePin(product)}
                        className="flex size-5 cursor-pointer items-center justify-center text-muted-foreground transition-[color,scale] duration-150 ease-out hover:text-foreground active:scale-[0.97]"
                      >
                        <RiCloseLine className="size-3.5" />
                      </button>
                    </div>
                  </ViewTransition>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPinned}
                className="font-mono tracking-wide uppercase"
              >
                Clear
              </Button>
              <Button
                size="sm"
                disabled={pinnedProducts.length < 2}
                onClick={openCompare}
                className="font-mono tracking-wide uppercase"
              >
                {pinnedProducts.length < 2
                  ? "Pick 1 more"
                  : `Compare (${pinnedProducts.length})`}
              </Button>
            </div>
          </section>
        </ViewTransition>
      )}

      {/* Layout Displacement Morph: glides down when the compare bar enters,
          and back up when it exits. */}
      <ViewTransition
        update={{ "compare-pin": "compare-shift", default: "none" }}
        default="none"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((product) => {
            const variant = variantOf(product)
            const isPinned = pinnedIds.includes(product.id)
            const atLimit = !isPinned && pinnedIds.length >= MAX_COMPARE
            return (
              <ProductCard
                key={product.id}
                product={product}
                variant={variant}
                isPinned={isPinned}
                atLimit={atLimit}
                onTogglePin={() => togglePin(product)}
              />
            )
          })}
        </div>
      </ViewTransition>
    </div>
  )
}

function ProductCard({
  product,
  variant,
  isPinned,
  atLimit,
  onTogglePin,
}: {
  product: Product
  variant: Variant
  isPinned: boolean
  atLimit: boolean
  onTogglePin: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Shared element: morphs into the comparison column when Compare opens. */}
      <ViewTransition
        name={`compare-${product.id}`}
        share={compareShare}
        default="none"
      >
        <button
          type="button"
          disabled={atLimit}
          aria-pressed={isPinned}
          aria-label={
            isPinned
              ? `Remove ${product.name} from compare`
              : `Pin ${product.name} to compare`
          }
          onClick={onTogglePin}
          {...preloadOnIntent(variant.src, productHeroSizes)}
          className={cn(
            "group relative aspect-square w-full cursor-pointer overflow-hidden bg-product text-start transition-[scale] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100",
            isPinned &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-background"
          )}
        >
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            loading="eager"
            sizes={productImageSizes}
            className="object-contain p-[8%] transition-transform duration-200 ease-out group-hover:scale-[1.03] group-disabled:scale-100"
          />
          {isPinned && (
            <span className="absolute top-2 right-2 flex size-5 items-center justify-center bg-foreground text-background">
              <RiCheckLine className="size-3.5" />
            </span>
          )}
        </button>
      </ViewTransition>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{`'${product.name}'`}</span>
          <span className="shrink-0 text-muted-foreground">{product.code}</span>
        </div>
        <span className="text-muted-foreground tabular-nums">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant={isPinned ? "secondary" : "outline"}
          size="sm"
          disabled={atLimit}
          onClick={onTogglePin}
          className="font-mono tracking-wide uppercase"
        >
          {isPinned ? "Pinned" : "Compare"}
        </Button>
        <QuantityStepper
          id={cartKey(product, variant)}
          label={`${product.name} in ${variant.color}`}
        />
      </div>
    </div>
  )
}
