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

const cardImage =
  "object-contain p-[8%] transition-transform duration-300 ease-out group-hover:scale-105"
const thumbnailImage = "object-contain p-[8%]"

export function flyName(key: string, copy: number) {
  return `fly-${key.replace(/[^a-z0-9-]/g, "-")}-${copy}`
}

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
    setTimeout(resolve, 600)
    item.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    })
  })
}

export function FlyCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const { quantities, setQuantity } = useCart()
  const bag = useCartLines().reverse()
  const shown = getProducts(filter ?? undefined)

  async function change(key: string, next: number) {
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
        <div
          ref={scrollerRef}
          data-dock-scroller
          className="no-scrollbar min-w-0 flex-1 scroll-fade-x snap-x snap-mandatory scroll-px-1.5 overflow-x-auto"
        >
          <ol ref={trackRef} className="flex w-max gap-2 p-1.5">
            {bag.map((line) => (
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
                      <FlyCopy
                        name={flyName(line.key, line.quantity)}
                        src={line.variant.src}
                        className={thumbnailImage}
                      />
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
