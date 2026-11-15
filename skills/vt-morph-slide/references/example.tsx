"use client"

import Link from "next/link"
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react"

import {
  preloadOnIntent,
  preloadPhotos,
  ProductImage,
} from "./product-image"
import { SlideTransition } from "@/components/slide-transition"

// Each image slot's rendered size. Preloads must use the same `sizes` as
// the image they warm up, so the browser picks the same srcset file.
const cardSizes = "(min-width: 768px) 25vw, 50vw"
const detailSizes = "(min-width: 768px) 50vw, 100vw"

type Variant = { label: string; src: string }
type Item = { id: string; name: string; category: string; variants: Variant[] }

export function ItemGrid({
  items,
  categories,
}: {
  items: Item[]
  categories: string[]
}) {
  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? items.filter((i) => i.category === filter) : items

  return (
    <div>
      <div role="group" aria-label="Filter">
        {categories.map((c) => (
          <button
            key={c}
            aria-pressed={filter === c}
            onClick={() =>
              startTransition(() => setFilter(filter === c ? null : c))
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map((item) => (
          <ViewTransition key={item.id}>
            <ItemCard item={item} />
          </ViewTransition>
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: Item }) {
  const [variant] = item.variants

  return (
    <Link
      href={`/items/${item.id}`}
      transitionTypes={["nav-forward"]}
      // Start fetching the detail image on hover or focus.
      {...preloadOnIntent(variant.src, detailSizes)}
    >
      <h2>{item.name}</h2>
      <ViewTransition name={`item-${item.id}`} share="morph" default="none">
        <div className="relative aspect-square overflow-hidden">
          <ProductImage
            src={variant.src}
            alt={item.name}
            fill
            sizes={cardSizes}
            className="object-contain p-[8%]"
          />
        </div>
      </ViewTransition>
    </Link>
  )
}

export function ItemDetail({ item }: { item: Item }) {
  const [index, setIndex] = useState(0)
  const variant = item.variants[index]!

  // The other variants, at the detail size: switching swaps at once.
  preloadPhotos(
    item.variants.filter((v) => v !== variant).map((v) => v.src),
    detailSizes
  )

  function selectVariant(next: number) {
    if (next === index) return
    startTransition(() => {
      addTransitionType(next > index ? "nav-forward" : "nav-back")
      setIndex(next)
    })
  }

  return (
    <div>
      <ViewTransition name={`item-${item.id}`} share="morph" default="none">
        <div className="relative aspect-square overflow-hidden">
          <SlideTransition key={variant.label}>
            <ProductImage
              src={variant.src}
              alt={`${item.name}, ${variant.label}`}
              fill
              preload
              sizes={detailSizes}
              className="object-contain p-[8%]"
            />
          </SlideTransition>
        </div>
      </ViewTransition>

      <div role="group" aria-label="Variant">
        {item.variants.map((v, i) => (
          <button
            key={v.label}
            aria-pressed={i === index}
            onClick={() => selectVariant(i)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DetailNav({ prev, next }: { prev?: Item; next?: Item }) {
  return (
    <nav aria-label="Items">
      <Link href="/items" transitionTypes={["nav-back"]}>
        Back
      </Link>
      {prev && (
        <Link href={`/items/${prev.id}`} transitionTypes={["nav-back"]}>
          Previous
        </Link>
      )}
      {next && (
        <Link href={`/items/${next.id}`} transitionTypes={["nav-forward"]}>
          Next
        </Link>
      )}
    </nav>
  )
}
