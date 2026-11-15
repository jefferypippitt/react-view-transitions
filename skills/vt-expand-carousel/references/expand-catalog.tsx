"use client"

import { preloadOnIntent, ProductImage } from "@/components/shop/product-image"
import {
  addTransitionType,
  startTransition,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react"

import { expandShare, QuickView, type Step } from "@/components/shop/quick-view"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  cartKey,
  type Filter,
  filters,
  formatPrice,
  getProducts,
  isFilter,
  type Product,
  quickViewImageSizes,
  products,
  variantAlt,
} from "@/lib/media"

export function ExpandCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const matching = getProducts(filter ?? undefined)
  const shown = openId
    ? [...matching, ...products.filter((p) => !matching.includes(p))]
    : matching
  const index = openId ? shown.findIndex((p) => p.id === openId) : -1
  const open = shown[index]

  function show(id: string | null, step?: Step, instant = false) {
    if (instant) return setOpenId(id)
    startTransition(() => {
      if (step) addTransitionType(step)
      setOpenId(id)
    })
  }

  function close(instant = false) {
    const update = () => {
      if (open && !matching.includes(open)) setFilter(null)
      setOpenId(null)
    }
    if (instant) update()
    else startTransition(update)
  }

  function selectFilter(next: Filter | null) {
    if (open) {
      startTransition(() => setFilter(next))
    } else {
      setFilter(next)
    }
  }

  const lastOpenId = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (openId) {
      lastOpenId.current = openId
      return
    }
    const card = lastOpenId.current
      ? document.getElementById(`card-${lastOpenId.current}`)
      : null
    lastOpenId.current = null
    card?.scrollIntoView({ block: "nearest" })
    card?.querySelector("button")?.focus({ preventScroll: true })
  }, [openId])

  function step(direction: Step, instant = false) {
    const target = shown[index + (direction === "nav-forward" ? 1 : -1)]
    if (target) show(target.id, direction, instant)
  }

  const upNextId = open ? shown[index + 1]?.id : undefined

  return (
    <div className={cn("flex flex-col gap-10", open && "lg:pe-[36rem]")}>
      <div className="relative z-21 grid grid-cols-[1fr_auto_1fr] items-center gap-4 whitespace-nowrap">
        <h1 className="text-[0.8rem] font-medium tracking-wide">
          All products
        </h1>
        <ViewTransition>
          <ToggleGroup
            size="sm"
            aria-label={open ? "Group products" : "Filter products"}
            value={filter ? [filter] : []}
            onValueChange={(value) =>
              selectFilter(value.find(isFilter) ?? null)
            }
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
        </ViewTransition>
        <ViewTransition>
          <span className="text-end text-muted-foreground">
            {shown.length} items
          </span>
        </ViewTransition>
      </div>
      <div className="@container">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 @min-[37rem]:grid-cols-3 @min-[45rem]:grid-cols-4 @min-[61rem]:grid-cols-5 @min-[77rem]:grid-cols-6">
          {shown
            .filter((product) => product.id !== openId)
            .map((product) => (
              <ViewTransition key={product.id}>
                <ProductCard
                  product={product}
                  dimmed={!!open && product.id !== upNextId}
                  onOpen={() => show(product.id)}
                />
              </ViewTransition>
            ))}
        </div>
      </div>
      {open && (
        <QuickView
          product={open}
          index={index}
          count={shown.length}
          onClose={close}
          onStep={step}
        />
      )}
    </div>
  )
}

function ProductCard({
  product,
  dimmed,
  onOpen,
}: {
  product: Product
  dimmed: boolean
  onOpen: () => void
}) {
  const [variant] = product.variants

  return (
    <article
      id={`card-${product.id}`}
      className="flex min-w-0 scroll-mt-16 flex-col gap-3"
    >
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={onOpen}
        {...preloadOnIntent(variant.src, quickViewImageSizes)}
        className="group flex cursor-pointer flex-col gap-3 text-start tracking-wide uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        <ViewTransition
          name={`expand-${product.id}`}
          share={expandShare}
          default="none"
        >
          <div
            className={cn(
              "relative aspect-square overflow-hidden bg-product",
              dimmed && "opacity-30"
            )}
          >
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
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
