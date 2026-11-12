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

export function Catalog({
  href = "/fade",
  enter = "fade-in",
  exit = "fade-out",
}: {
  href?: string
  enter?: string
  exit?: string
} = {}) {
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
      <ViewTransition
        key={filter ?? "all"}
        enter={enter}
        exit={exit}
        default="none"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} href={href} />
          ))}
        </div>
      </ViewTransition>
    </div>
  )
}

function ProductCard({ product, href }: { product: Product; href: string }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <Link
        href={`${href}/${product.id}`}
        className="group flex flex-col gap-3"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        <div className="relative aspect-square overflow-hidden bg-product">
          <Image
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-5 transition-transform duration-300 ease-out group-hover:scale-105"
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
