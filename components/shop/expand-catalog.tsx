"use client"

import Image from "next/image"
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
  products,
  variantAlt,
} from "@/lib/media"

/**
 * Product grid with an in-page quick view. No route change: opening a card is
 * a state change in a Transition. The open product leaves the grid: its photo
 * morphs into the sheet, the rest of the card fades, and the cards after it
 * glide over to close the gap. Closing reverses it, for whichever product the
 * sheet is on.
 */
export function ExpandCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const matching = getProducts(filter ?? undefined)
  // Closed, the gender toggles filter. Open, they group instead: matching
  // products move to the front and the rest follow, so the grid and the
  // carousel keep every product while you browse.
  const shown = openId
    ? [...matching, ...products.filter((p) => !matching.includes(p))]
    : matching
  // The quick view steps through what the grid shows, in its order.
  const index = openId ? shown.findIndex((p) => p.id === openId) : -1
  const open = shown[index]

  function show(id: string | null, step?: Step) {
    startTransition(() => {
      if (step) addTransitionType(step)
      setOpenId(id)
    })
  }

  function close() {
    startTransition(() => {
      // Grouping showed every product, so the sheet may be on one the filter
      // hides. Clear the filter so its card is there for the photo to land in.
      if (open && !matching.includes(open)) setFilter(null)
      setOpenId(null)
    })
  }

  function selectFilter(next: Filter | null) {
    if (open) {
      // Grouping is a reorder of the same cards, so it runs in a Transition:
      // each card's boundary glides it to its new place.
      startTransition(() => setFilter(next))
    } else {
      // Filtering isn't what this demo shows, so it's a plain state update,
      // not a Transition: the grid swaps instantly and the card boundaries
      // (which only run inside Transitions) stay quiet.
      setFilter(next)
    }
  }

  // On close, bring the returning card into view and focus it. A layout
  // effect runs inside the transition's update, before the new snapshot, so
  // the photo morphs to where the card is after the scroll.
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

  function step(direction: Step) {
    const target = shown[index + (direction === "nav-forward" ? 1 : -1)]
    if (target) show(target.id, direction)
  }

  // While the sheet is open, the grid's photos recede except the one Next goes
  // to, which stays lit: it previews where the carousel goes.
  const upNextId = open ? shown[index + 1]?.id : undefined

  return (
    // Room for the sheet. On wide screens, opening the sheet pads the shop by
    // the sheet's width (36rem, its max-w-xl), so the filter row and the grid
    // make space instead of hiding under it. Columns follow the grid's own
    // width (container queries, not the viewport), so the narrower grid drops
    // columns and every card stays in view. Each card's boundary sees its new
    // position as an update, so the cards glide into the new layout while the
    // sheet slides in, and glide back when it closes. Below lg the sheet
    // covers most of the screen anyway, so nothing reflows.
    <div className={cn("flex flex-col gap-10", open && "lg:pe-[36rem]")}>
      {/* Raised above the sheet's click-away layer (z-20): the toggles stay
          usable while the sheet is open, to group the grid. */}
      <div className="relative z-21 grid grid-cols-[1fr_auto_1fr] items-center gap-4 whitespace-nowrap">
        <h1 className="text-[0.8rem] font-medium tracking-wide">
          All products
        </h1>
        {/* The row narrows with the shop when the sheet opens; these two
            boundaries glide the toggles and count over instead of jumping. */}
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
      {/* The query container is just the grid's wrapper (containment would
          trap the fixed sheet and the raised filter row inside it). Same
          columns as the other shops when closed: each container width is a
          viewport breakpoint minus the page's 3rem side padding. */}
      <div className="@container">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 @min-[37rem]:grid-cols-3 @min-[45rem]:grid-cols-4 @min-[61rem]:grid-cols-5 @min-[77rem]:grid-cols-6">
          {shown
            .filter((product) => product.id !== openId)
            .map((product) => (
              // List identity, as in the Morph + Slide grid: one bare boundary
              // per card, keyed by product, directly inside the grid. Cards
              // that move glide (update); the card leaving or returning fades
              // (exit/enter), except its photo, which morphs (share). The same
              // update cross-fades each photo into its dimmed or lit look.
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
  /** Sheet is open and this isn't the product Next goes to. */
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
        className="group flex cursor-pointer flex-col gap-3 text-start tracking-wide uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <h2 className="truncate font-medium">{`'${product.name}'`}</h2>
        {/* Same name as the quick view's photo. Only one may be mounted at a
            time, which holds here: the open product's card isn't rendered. */}
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
            <Image
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-[8%] transition-transform duration-500 ease-out group-hover:scale-105"
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
