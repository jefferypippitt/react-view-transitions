"use client"

import { ProductImage } from "@/components/shop/product-image"
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

/**
 * Search-as-you-type over the shop. The input updates right away; the grid
 * renders from a deferred copy of the query (useDeferredValue), and a
 * deferred render is a Transition, so each result update animates:
 *
 * - Products that still match glide to their new cells (update).
 * - Products that stop matching shrink away (exit), and ones that match
 *   again pop back in (enter).
 *
 * Typing fast doesn't queue an animation per keystroke: the deferred value
 * skips to the latest query whenever the previous render is done.
 */
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
            // Hides the browser's own clear button for search inputs: the
            // InputGroupButton below is the one clear control.
            className="font-sans text-xs tracking-wide uppercase placeholder:normal-case [&::-webkit-search-cancel-button]:appearance-none"
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
            // List identity: one boundary per card, keyed by product,
            // directly inside the grid. default="none" plus explicit
            // enter/exit/update: nothing else (say, a cart change) animates.
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
        // Same pop as a card, so "no results" reads as the last card leaving
        // and a message taking its place.
        <ViewTransition enter="search-in" exit="search-out" default="none">
          <p className="text-muted-foreground">
            Nothing matches {`'${deferredQuery.trim()}'`}.
          </p>
        </ViewTransition>
      )}
    </div>
  )
}

/** The name with the matched part marked. */
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
        <ProductImage
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
