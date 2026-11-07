"use client"

import Image from "next/image"
import Link from "next/link"
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSubtractLine,
} from "@remixicon/react"
import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react"

import { type CartLine, useCart, useCartLines } from "@/components/shop/cart"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

// Shared by each photo and its FlyCopy, so the two always match.
const cardImage =
  "object-contain p-[8%] transition-transform duration-500 ease-out group-hover:scale-105"
const thumbnailImage = "object-contain p-[8%]"

/**
 * Name of the n-th copy of a cart line in the bag. The flight is a shared
 * element morph between two FlyCopy boundaries with this name:
 *
 * - On the card, the copy is named after the next one to go in
 *   (quantity + 1).
 * - In the dock, and in the checkout row, after the last one that went in
 *   (quantity).
 *
 * Each name is also its boundary's key, so a quantity change remounts both,
 * and the name that leaves one place is the name that arrives in the other:
 *
 *   add, 1 → 2:    card fly-x-2 → dock fly-x-2  (a copy flies down)
 *   remove, 2 → 1: dock fly-x-2 → card fly-x-2  (a copy flies back)
 *   to checkout:   dock fly-x-2 → row fly-x-2   (every copy flies)
 *
 * The leftover name on each side (the card's new fly-x-3, the dock's old
 * fly-x-1) has no partner, and default="none" keeps it still.
 */
export function flyName(key: string, copy: number) {
  return `fly-${key.replace(/[^a-z0-9-]/g, "-")}-${copy}`
}

/**
 * The flying copy: the same cut-out photo, stacked exactly over the real one
 * inside its box. Only the copy is named, so a transition lifts the copy off
 * and the photo underneath never moves. Nothing is left empty: a card keeps
 * its photo while one flies to the dock, and a copy flying back lands on top
 * of it. The two match pixel for pixel, so the copy is invisible at rest.
 *
 * Put it after the real photo, in the same `relative` box, with the same
 * image classes.
 */
export function FlyCopy({
  name,
  src,
  className,
}: {
  name: string
  src: string
  className?: string
}) {
  return (
    <ViewTransition key={name} name={name} share="fly" default="none">
      <div aria-hidden className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes={productImageSizes}
          className={className}
        />
      </div>
    </ViewTransition>
  )
}

/**
 * Scrolls the dock to a line's thumbnail if it's out of view, and resolves
 * once it's there (right away if it already is).
 */
function revealInDock(key: string) {
  const item = document.querySelector(`[data-line="${CSS.escape(key)}"]`)
  const scroller = item?.closest("[data-dock-scroller]")
  if (!item || !scroller) return Promise.resolve()

  const thumbnail = item.getBoundingClientRect()
  const visible = scroller.getBoundingClientRect()
  if (thumbnail.left >= visible.left && thumbnail.right <= visible.right) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    scroller.addEventListener("scrollend", () => resolve(), { once: true })
    // In case scrollend never fires (no support, or no scroll after all).
    setTimeout(resolve, 600)
    item.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    })
  })
}

/**
 * Product grid with a bag dock. Every add tosses a copy of the photo from its
 * card into the dock, every remove tosses one back, and Checkout flies the
 * whole dock into the checkout table. See flyName.
 */
export function FlyCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const { quantities, setQuantity } = useCart()
  // Newest first: a new line enters at the front of the dock.
  const bag = useCartLines().reverse()
  const shown = getProducts(filter ?? undefined)

  async function change(key: string, next: number) {
    // A copy flying back starts from its dock thumbnail, so bring that into
    // view first. It has to happen before the Transition: the old snapshot
    // is taken as soon as it starts.
    if (next < (quantities[key] ?? 0)) await revealInDock(key)
    startTransition(() => setQuantity(key, next))
  }

  return (
    <div className="flex flex-col gap-10 pb-28">
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
        <span className="text-end text-muted-foreground">
          {shown.length} items
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((product) => {
          const key = cartKey(product, product.variants[0])
          return (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[key] ?? 0}
              onChange={(next) => change(key, next)}
            />
          )
        })}
      </div>
      {bag.length > 0 && (
        // The dock rises when the first item goes in and drops when the last
        // one comes out. default="none": it doesn't animate between those.
        <ViewTransition enter="dock-in" exit="dock-out" default="none">
          <Dock
            bag={bag}
            onRemove={(line) => change(line.key, line.quantity - 1)}
          />
        </ViewTransition>
      )}
    </div>
  )
}

function ProductCard({
  product,
  quantity,
  onChange,
}: {
  product: Product
  quantity: number
  onChange: (quantity: number) => void
}) {
  const [variant] = product.variants
  const key = cartKey(product, variant)

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
      <button
        type="button"
        aria-label={`Add one ${product.name} in ${variant.color} to bag`}
        onClick={() => onChange(quantity + 1)}
        className="group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div className="relative aspect-square overflow-hidden bg-product">
          <Image
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            sizes={productImageSizes}
            className={cardImage}
          />
          {/* The next copy to go in. */}
          <FlyCopy
            name={flyName(key, quantity + 1)}
            src={variant.src}
            className={cardImage}
          />
        </div>
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="whitespace-nowrap tabular-nums">
          {formatPrice(product.price)}
        </span>
        <QuantityStepper
          id={key}
          label={`${product.name} in ${variant.color}`}
          onChange={onChange}
        />
      </div>
    </article>
  )
}

function Dock({
  bag,
  onRemove,
}: {
  bag: CartLine[]
  onRemove: (line: CartLine) => void
}) {
  const total = bag.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  )

  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  // Whether the thumbnails overflow, and whether there's more to either side.
  const [edges, setEdges] = useState({
    overflow: false,
    start: false,
    end: false,
  })

  useEffect(() => {
    const scroller = scrollerRef.current
    const track = trackRef.current
    if (!scroller || !track) return
    function measure() {
      if (!scroller) return
      const { scrollLeft, scrollWidth, clientWidth } = scroller
      const next = {
        overflow: scrollWidth > clientWidth + 1,
        start: scrollLeft > 1,
        end: scrollLeft + clientWidth < scrollWidth - 1,
      }
      setEdges((current) =>
        current.overflow === next.overflow &&
        current.start === next.start &&
        current.end === next.end
          ? current
          : next
      )
    }
    // The scroller resizes with the window, the track as thumbnails come
    // and go.
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    observer.observe(track)
    scroller.addEventListener("scroll", measure, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener("scroll", measure)
    }
  }, [])

  function scrollBy(direction: 1 | -1) {
    const scroller = scrollerRef.current
    scroller?.scrollBy({
      left: direction * scroller.clientWidth * 0.8,
      behavior: "smooth",
    })
  }

  // Keep the thumbnail that just grew in view, so a copy never lands out of
  // sight. A layout effect runs inside the transition's update, before the
  // new snapshot, so the copy flies to where the thumbnail is after the
  // scroll.
  const previous = useRef<Record<string, number>>({})
  useLayoutEffect(() => {
    const grown = bag.find(
      (line) => line.quantity > (previous.current[line.key] ?? 0)
    )
    previous.current = Object.fromEntries(
      bag.map((line) => [line.key, line.quantity])
    )
    if (!grown) return
    scrollerRef.current
      ?.querySelector(`[data-line="${CSS.escape(grown.key)}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [bag])

  return (
    // Full width, so it never resizes as items come and go: only the
    // thumbnails move.
    <aside
      aria-label="Bag"
      className="fixed inset-x-6 bottom-6 z-20 flex items-center gap-4 rounded-lg border bg-background p-2 ps-4 shadow-lg"
    >
      <span className="shrink-0 font-medium">Bag</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {edges.overflow && (
          <ScrollButton
            direction={-1}
            disabled={!edges.start}
            onClick={() => scrollBy(-1)}
          />
        )}
        {/* No scrollbar: the arrows page through instead, and the edges
            fade where there's more to see. */}
        <div
          ref={scrollerRef}
          data-dock-scroller
          className="no-scrollbar min-w-0 flex-1 scroll-fade-x snap-x snap-mandatory scroll-px-1.5 overflow-x-auto"
        >
          <ol ref={trackRef} className="flex w-max gap-2 p-1.5">
            {bag.map((line) => (
              // List identity: a new line enters at the front and the rest
              // shift over; one that empties out leaves and the rest close up.
              <ViewTransition key={line.key}>
                <li data-line={line.key} className="shrink-0 snap-start">
                  <button
                    type="button"
                    aria-label={`Remove one ${line.product.name} in ${line.variant.color}`}
                    onClick={() => onRemove(line)}
                    className="group/thumb relative block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <div className="relative size-14 overflow-hidden bg-product">
                      <Image
                        src={line.variant.src}
                        alt=""
                        fill
                        sizes={productImageSizes}
                        className={thumbnailImage}
                      />
                      {/* The last copy that went in. */}
                      <FlyCopy
                        name={flyName(line.key, line.quantity)}
                        src={line.variant.src}
                        className={thumbnailImage}
                      />
                      {/* Says what a click does: take one out. */}
                      <span className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100">
                        <RiSubtractLine className="size-4" />
                      </span>
                    </div>
                    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[0.625rem] text-background tabular-nums">
                      {line.quantity}
                    </span>
                  </button>
                </li>
              </ViewTransition>
            ))}
          </ol>
        </div>
        {edges.overflow && (
          <ScrollButton
            direction={1}
            disabled={!edges.end}
            onClick={() => scrollBy(1)}
          />
        )}
      </div>
      <span className="hidden shrink-0 whitespace-nowrap tabular-nums sm:inline">
        {formatPrice(total)}
      </span>
      <Link
        href="/fly/checkout"
        className={cn(
          buttonVariants(),
          "shrink-0 font-mono tracking-wide uppercase"
        )}
      >
        Checkout
      </Link>
    </aside>
  )
}

/** Pages the dock's thumbnails left or right. Only shown once they overflow. */
function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 1 | -1
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={direction === 1 ? "Scroll bag right" : "Scroll bag left"}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0"
    >
      {direction === 1 ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
    </Button>
  )
}
