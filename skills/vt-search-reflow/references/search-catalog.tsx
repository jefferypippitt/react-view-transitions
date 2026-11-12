"use client"

import Image from "next/image"
import { RiCloseLine, RiSearchLine } from "@remixicon/react"
import { useDeferredValue, useState, ViewTransition } from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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

function matches(product: Product, query: string) {
  if (!query) return true
  const haystack = [
    product.name,
    product.code,
    ...product.variants.map((v) => v.color),
  ]
  return haystack.some((text) => text.toLowerCase().includes(query))
}

export function SearchCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const search = deferredQuery.trim().toLowerCase()
  const shown = getProducts(filter ?? undefined).filter((product) =>
    matches(product, search)
  )

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
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
          <span
            aria-live="polite"
            className="text-end text-muted-foreground tabular-nums"
          >
            {shown.length} {shown.length === 1 ? "item" : "items"}
          </span>
        </div>
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <RiSearchLine />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Search products"
            placeholder="Search by name, code or color"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("")
            }}
            className="font-mono text-xs tracking-wide uppercase placeholder:normal-case [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <RiCloseLine />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {shown.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((product) => (
            <ViewTransition
              key={product.id}
              enter="search-in"
              exit="search-out"
              update="search-move"
              default="none"
            >
              <ProductCard product={product} query={search} />
            </ViewTransition>
          ))}
        </div>
      ) : (
        <ViewTransition enter="search-in" exit="search-out" default="none">
          <p className="text-muted-foreground">
            Nothing matches {`'${deferredQuery.trim()}'`}.
          </p>
        </ViewTransition>
      )}
    </div>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  const start = query ? text.toLowerCase().indexOf(query) : -1
  if (start === -1) return text
  const end = start + query.length
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-foreground text-background">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  )
}

function ProductCard({ product, query }: { product: Product; query: string }) {
  const [variant] = product.variants

  return (
    <article className="flex min-w-0 flex-col gap-3">
      <h2 className="truncate font-medium">
        {"'"}
        <Highlight text={product.name} query={query} />
        {"'"}
      </h2>
      <div className="relative aspect-square overflow-hidden bg-product">
        <Image
          src={variant.src}
          alt={variantAlt(product, variant)}
          fill
          sizes={productImageSizes}
          className="object-contain p-[8%]"
        />
      </div>
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
