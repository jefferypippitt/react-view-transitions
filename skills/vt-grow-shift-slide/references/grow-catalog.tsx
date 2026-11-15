"use client"

import { ProductImage } from "@/components/shop/product-image"
import { RiCloseLine } from "@remixicon/react"
import {
  addTransitionType,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { SlideTransition } from "@/components/slide-transition"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  type Filter,
  filters,
  formatPrice,
  getProducts,
  isFilter,
  type Product,
  type Variant,
  variantAlt,
} from "@/lib/media"

export function GrowCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [view, setView] = useState<{
    open: string | null
    previous: string | null
  }>({ open: null, previous: null })
  const [colors, setColors] = useState<Record<string, string>>({})

  const shown = getProducts(filter ?? undefined)

  const variantOf = (product: Product): Variant =>
    product.variants.find((v) => v.color === colors[product.id]) ??
    product.variants[0]

  function openCard(id: string | null) {
    startTransition(() => {
      addTransitionType("grow")
      setView((current) => ({ open: id, previous: current.open }))
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

  useEffect(() => {
    if (!view.open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        setView((current) => ({ open: null, previous: current.open }))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [view.open])

  useLayoutEffect(() => {
    if (view.open || !view.previous) return
    document
      .getElementById(`grow-card-${view.previous}`)
      ?.focus({ preventScroll: true })
  }, [view])

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

      <div className="grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {shown.map((product) => {
          const isOpen = product.id === view.open
          const morphs = isOpen || product.id === view.previous

          return (
            <ViewTransition
              key={product.id}
              update={{ grow: morphs ? "grow-card" : "shift", default: "none" }}
              default="none"
            >
              {isOpen ? (
                <OpenTile
                  product={product}
                  variant={variantOf(product)}
                  onColor={(color) => selectColor(product, color)}
                  onClose={() => openCard(null)}
                />
              ) : (
                <Card
                  product={product}
                  variant={variantOf(product)}
                  onOpen={() => openCard(product.id)}
                />
              )}
            </ViewTransition>
          )
        })}
      </div>
    </div>
  )
}

function Photo({
  product,
  children,
}: {
  product: Product
  children: React.ReactNode
}) {
  return (
    <ViewTransition name={`grow-${product.id}`} share="grow" default="none">
      <div className="relative aspect-square overflow-hidden bg-product">
        {children}
      </div>
    </ViewTransition>
  )
}

function Card({
  product,
  variant,
  onOpen,
}: {
  product: Product
  variant: Variant
  onOpen: () => void
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <button
        id={`grow-card-${product.id}`}
        type="button"
        onClick={onOpen}
        aria-expanded={false}
        className="group flex cursor-pointer flex-col gap-3 text-start font-mono tracking-wide uppercase outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span className="truncate font-medium">{`'${product.name}'`}</span>
        <Photo product={product}>
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            unoptimized
            loading="eager"
            className="object-contain p-[8%] transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Photo>
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

function OpenTile({
  product,
  variant,
  onColor,
  onClose,
}: {
  product: Product
  variant: Variant
  onColor: (color: string) => void
  onClose: () => void
}) {
  const tileRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    tileRef.current?.scrollIntoView({ block: "nearest" })
    closeRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <article
      ref={tileRef}
      aria-label={product.name}
      className="col-span-2 row-span-2 flex min-w-0 scroll-mt-16 scroll-mb-6 flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
          <span className="shrink-0 text-muted-foreground">{product.code}</span>
        </div>
        <Button
          ref={closeRef}
          variant="outline"
          size="icon-sm"
          aria-label={`Close ${product.name}`}
          onClick={onClose}
        >
          <RiCloseLine />
        </Button>
      </div>
      <Photo product={product}>
        <SlideTransition key={variant.color}>
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            unoptimized
            loading="eager"
            className="object-contain p-[8%]"
          />
        </SlideTransition>
      </Photo>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {product.variants.length > 1 ? (
          <ToggleGroup
            variant="outline"
            size="sm"
            aria-label="Color"
            value={[variant.color]}
            onValueChange={(value) => {
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
        ) : (
          <span className="text-muted-foreground">
            Color <span className="text-foreground">{variant.color}</span>
          </span>
        )}
        <div className="flex items-center gap-4">
          <span className="whitespace-nowrap tabular-nums">
            {formatPrice(product.price)}
          </span>
          <QuantityStepper
            id={cartKey(product, variant)}
            label={`${product.name} in ${variant.color}`}
          />
        </div>
      </div>
    </article>
  )
}
