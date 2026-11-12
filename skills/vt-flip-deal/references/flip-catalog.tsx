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

function rank(filter: Filter | null) {
  return filter ? filters.indexOf(filter) + 1 : 0
}

const lastWave = 16

function flip(index: number) {
  const wave = `wave-${Math.min(index, lastWave)}`
  return {
    "deal-forward": `flip-forward ${wave}`,
    "deal-back": `flip-back ${wave}`,
    default: "none",
  }
}

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
