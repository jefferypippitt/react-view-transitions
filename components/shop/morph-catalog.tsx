"use client"

import Image from "next/image"
import Link from "next/link"
import { startTransition, useState, ViewTransition } from "react"

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
  variantAlt,
} from "@/lib/media"

/**
 * Filter row + product grid for the Morph + Slide shop. Unlike the fade shop,
 * the grid isn't swapped as a whole: each card keeps its identity, so on a
 * filter change the cards that stay glide to their new cells.
 */
export function MorphCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const shown = getProducts(filter ?? undefined)

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 whitespace-nowrap">
        <h1 className="text-[0.8rem] font-medium tracking-wide">All products</h1>
        <ToggleGroup
          size="sm"
          aria-label="Filter products"
          value={filter ? [filter] : []}
          onValueChange={(value) => {
            const next = value.find(isFilter) ?? null
            startTransition(() => setFilter(next))
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
        {shown.map((product) => (
          // List identity: one boundary per card, keyed by product, directly
          // inside the grid (no wrapper div) so it can move between cells.
          <ViewTransition key={product.id}>
            <ProductCard product={product} />
          </ViewTransition>
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <Link
        href={`/morph/${product.id}`}
        transitionTypes={["nav-forward"]}
        className="group flex flex-col gap-3"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        {/* Shared element: same name as the hero on the product page, so the
            photo morphs between the two. default="none" keeps it out of
            filter changes; the explicit share keeps the morph on. */}
        <ViewTransition
          name={`product-${product.id}`}
          share="morph"
          default="none"
        >
          <div className="relative aspect-square overflow-hidden bg-product">
            <Image
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              // Padding in % of the box (same on the hero), so both ends of
              // the morph have the same proportions.
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
