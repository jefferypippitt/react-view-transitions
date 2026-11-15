"use client"

import { ProductImage } from "@/components/shop/product-image"
import { RiGridLine, RiLayoutGridLine, RiListUnordered } from "@remixicon/react"
import {
  createContext,
  startTransition,
  use,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react"

import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  cartKey,
  type Filter,
  filters,
  formatPrice,
  getProducts,
  isFilter,
  type Product,
  productImageSizes,
  type Variant,
  variantAlt,
} from "@/lib/media"
import { cn } from "@/lib/utils"

const views = ["list", "grid", "dense"] as const
type View = (typeof views)[number]

function isView(value: unknown): value is View {
  return views.includes(value as View)
}

/** The view toggle's buttons, fewest products per screen to most. */
const viewOptions = [
  { value: "list", label: "List view", icon: RiListUnordered },
  { value: "grid", label: "Grid view", icon: RiLayoutGridLine },
  { value: "dense", label: "Dense view", icon: RiGridLine },
] satisfies { value: View; label: string; icon: React.ComponentType }[]

const ViewContext = createContext<[View, (view: View) => void] | null>(null)

/** Picked color per product id; products not in it show their first color. */
type Colors = [
  Record<string, string>,
  React.Dispatch<React.SetStateAction<Record<string, string>>>,
]

const ColorContext = createContext<Colors | null>(null)

/**
 * Holds the chosen view and each product's picked color in the demo's
 * layout, which stays mounted between the shop and its checkout, so Back
 * returns to the view and colors you left.
 */
export function StaggerViewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const view = useState<View>("grid")
  const colors = useState<Record<string, string>>({})
  return (
    <ViewContext value={view}>
      <ColorContext value={colors}>{children}</ColorContext>
    </ViewContext>
  )
}

function useStaggerView() {
  const state = use(ViewContext)
  if (!state) throw new Error("Missing <StaggerViewProvider>")
  return state
}

/**
 * The color shown for each product, in every view and in the checkout. A
 * pick runs in a Transition: the photo cross-fades to the new color, and the
 * stepper switches to that color's cart line.
 */
export function useStaggerColors() {
  const state = use(ColorContext)
  if (!state) throw new Error("Missing <StaggerViewProvider>")
  const [colors, setColors] = state

  function variantOf(product: Product): Variant {
    return (
      product.variants.find((v) => v.color === colors[product.id]) ??
      product.variants[0]
    )
  }

  function selectColor(product: Product, color: string) {
    startTransition(() =>
      setColors((current) => ({ ...current, [product.id]: color }))
    )
  }

  return { variantOf, selectColor }
}

/**
 * Swatch fill per color name. The catalog only has names; these are close
 * enough to the photos to tell the colors apart.
 */
const swatches: Record<string, string> = {
  Black: "#111111",
  Bone: "#f3f2ee",
  Stone: "#86837d",
  Clay: "#6e5542",
  Moss: "#8a866c",
  Umber: "#4b3f3b",
  Ink: "#2b2c30",
  Shade: "#1c1c1c",
  Sand: "#c8b294",
}

/** The sticky shop header's height (h-12): what's under it is off screen. */
const headerHeight = 48

/** The wave's last step: items past it all start together. */
const lastWave = 16

/**
 * One shared element of a product, in either view. Grid and list are
 * separate components, so switching views unmounts every part in one layout
 * and mounts it in the other under the same name: each pair morphs (share).
 *
 * The second class staggers it: `wave-<n>` delays the morph by the item's
 * place in the list (see globals.css), so the switch sweeps through the shop
 * as a wave instead of moving everything at once.
 *
 * `text` uses the text variant: the old snapshot is hidden and the new one
 * moves unscaled, so a name that's truncated in one view and whole in the
 * other doesn't stretch.
 */
export function StaggerPart({
  name,
  wave,
  text = false,
  children,
}: {
  name: string
  wave: number
  text?: boolean
  children: React.ReactNode
}) {
  return (
    <ViewTransition
      name={name}
      share={`${text ? "layout-text" : "layout"} wave-${Math.min(wave, lastWave)}`}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}

/** The photo's name, shared with the checkout table. */
export function staggerPhotoName(product: Product) {
  return `stagger-photo-${product.id}`
}

/**
 * Filter row + the products as a list, a grid or a dense grid. Switching
 * views runs in a Transition; every visible part of every product (photo,
 * name, colors, price, quantity) is a named boundary, so each one morphs from its
 * place in one layout to its place in the other. The dense view has no name:
 * it has no partner there, so it fades out with the page (default="none")
 * while the other parts move.
 */
export function StaggerCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [view, setView] = useStaggerView()
  const shown = getProducts(filter ?? undefined)

  // Your place in the shop: the first product on screen when you switch. The
  // wave starts from it (products above are off screen anyway), and the new
  // layout is scrolled so it sits where it was.
  const [waveStart, setWaveStart] = useState(0)
  const anchor = useRef<{ id: string; top: number } | null>(null)

  function switchView(next: View) {
    const items = document.querySelectorAll<HTMLElement>("[data-product]")
    const index = Array.from(items).findIndex(
      (item) => item.getBoundingClientRect().bottom > headerHeight
    )
    const first = items[index]
    anchor.current = first
      ? {
          id: first.dataset.product ?? "",
          top: first.getBoundingClientRect().top,
        }
      : null
    startTransition(() => {
      setWaveStart(Math.max(0, index))
      setView(next)
    })
  }

  // Runs inside the transition's update, before the new snapshot, so every
  // part morphs to where it is after the scroll.
  useLayoutEffect(() => {
    const target = anchor.current
    anchor.current = null
    if (!target) return
    const item = document.querySelector(
      `[data-product="${CSS.escape(target.id)}"]`
    )
    if (item) window.scrollBy(0, item.getBoundingClientRect().top - target.top)
  }, [view])

  const waveOf = (index: number) => Math.max(0, index - waveStart)

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
        <div className="flex items-center justify-end gap-4">
          <span className="hidden text-muted-foreground sm:inline">
            {shown.length} items
          </span>
          {/* One provider for the three: once a tooltip is showing, moving
              to the next button swaps it without waiting again. */}
          <TooltipProvider>
            <ToggleGroup
              size="sm"
              aria-label="View"
              value={[view]}
              onValueChange={(value) => {
                // Single choice: clicking the current view clears the
                // group's value, which leaves the view as is.
                const next = value.find(isView)
                if (next && next !== view) switchView(next)
              }}
            >
              {viewOptions.map(({ value, label, icon: Icon }) => (
                <Tooltip key={value}>
                  <TooltipTrigger
                    render={
                      <ToggleGroupItem value={value} aria-label={label} />
                    }
                  >
                    <Icon />
                  </TooltipTrigger>
                  {/* Portalled out of the shop's wrapper, so it takes the
                      shop's type here. Its layer (z-50) is above the
                      sticky header's, so going up is fine. */}
                  <TooltipContent className="font-mono tracking-wide uppercase">
                    {label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </TooltipProvider>
        </div>
      </div>
      {view === "list" && (
        <ol className="flex flex-col border-t">
          {shown.map((product, index) => (
            <ListRow key={product.id} product={product} wave={waveOf(index)} />
          ))}
        </ol>
      )}
      {view === "grid" && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((product, index) => (
            <GridCard key={product.id} product={product} wave={waveOf(index)} />
          ))}
        </div>
      )}
      {view === "dense" && (
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {shown.map((product, index) => (
            <DenseTile
              key={product.id}
              product={product}
              wave={waveOf(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type ItemProps = { product: Product; wave: number }

function Photo({
  product,
  wave,
  sizeClass,
}: ItemProps & { sizeClass: string }) {
  const variant = useStaggerColors().variantOf(product)
  return (
    <StaggerPart name={staggerPhotoName(product)} wave={wave}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-product",
          sizeClass
        )}
      >
        {/* Keyed by color: a pick swaps the shot, which cross-fades. A view
            switch keeps the key, so only the morph above runs then. */}
        <ViewTransition
          key={variant.color}
          enter="fade-in"
          exit="fade-out"
          default="none"
        >
          <ProductImage
            src={variant.src}
            alt={variantAlt(product, variant)}
            fill
            sizes={productImageSizes}
            className="object-contain p-[8%]"
          />
        </ViewTransition>
      </div>
    </StaggerPart>
  )
}

/** Name, price and quantity: the parts both views share, besides the photo. */
function Name({ product, wave }: ItemProps) {
  return (
    <StaggerPart name={`stagger-name-${product.id}`} wave={wave} text>
      {/* w-fit: the snapshot is the text, not the column it sits in. */}
      <h2 className="w-fit max-w-full min-w-0 truncate font-medium">{`'${product.name}'`}</h2>
    </StaggerPart>
  )
}

/**
 * The product's colors as swatches, in every view: one more part that morphs
 * with the rest. A single-color product shows its one swatch, not pickable,
 * so every product has the same parts in every view.
 */
function Colors({ product, wave }: ItemProps) {
  const { variantOf, selectColor } = useStaggerColors()
  const current = variantOf(product)
  const pickable = product.variants.length > 1

  return (
    <StaggerPart name={`stagger-colors-${product.id}`} wave={wave}>
      <div
        role="group"
        aria-label={`${product.name} color`}
        className="flex w-fit shrink-0 items-center"
      >
        {product.variants.map((variant) => {
          const selected = variant === current
          return (
            <button
              key={variant.color}
              type="button"
              aria-label={variant.color}
              aria-pressed={selected}
              title={variant.color}
              disabled={!pickable}
              onClick={() => {
                if (!selected) selectColor(product, variant.color)
              }}
              className="group/swatch grid size-5 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-default"
            >
              <span
                style={{ backgroundColor: swatches[variant.color] }}
                className={cn(
                  "size-3 rounded-full border border-foreground/20 transition-[scale,box-shadow] duration-150 ease-out group-active/swatch:scale-[0.97]",
                  pickable &&
                    (selected
                      ? "ring-1 ring-foreground ring-offset-2 ring-offset-background"
                      : "group-hover/swatch:scale-110")
                )}
              />
            </button>
          )
        })}
      </div>
    </StaggerPart>
  )
}

function Price({ product, wave }: ItemProps) {
  return (
    <StaggerPart name={`stagger-price-${product.id}`} wave={wave}>
      <span className="whitespace-nowrap tabular-nums">
        {formatPrice(product.price)}
      </span>
    </StaggerPart>
  )
}

function Quantity({ product, wave, size }: ItemProps & { size?: "xs" | "sm" }) {
  const variant = useStaggerColors().variantOf(product)
  return (
    <StaggerPart name={`stagger-quantity-${product.id}`} wave={wave}>
      <div className="w-fit">
        <QuantityStepper
          id={cartKey(product, variant)}
          label={`${product.name} in ${variant.color}`}
          size={size}
        />
      </div>
    </StaggerPart>
  )
}

function GridCard({ product, wave }: ItemProps) {
  return (
    <article data-product={product.id} className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Name product={product} wave={wave} />
        <Colors product={product} wave={wave} />
      </div>
      <Photo product={product} wave={wave} sizeClass="aspect-square w-full" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Price product={product} wave={wave} />
        <Quantity product={product} wave={wave} />
      </div>
    </article>
  )
}

function ListRow({ product, wave }: ItemProps) {
  const variant = useStaggerColors().variantOf(product)
  return (
    <li
      data-product={product.id}
      className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b py-3 sm:grid-cols-[5rem_minmax(0,1fr)_8rem_auto_auto]"
    >
      <Photo
        product={product}
        wave={wave}
        sizeClass="row-span-2 size-16 sm:row-span-1 sm:size-20"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <Name product={product} wave={wave} />
        <span className="truncate text-muted-foreground">
          {product.code} · {variant.color}
        </span>
      </div>
      {/* Phones: colors and price share the second line. From sm up this
          wrapper drops out (contents) and they take their own columns. */}
      <div className="col-start-2 row-start-2 flex items-center gap-3 sm:contents">
        <Colors product={product} wave={wave} />
        <div className="sm:w-28 sm:text-end">
          <Price product={product} wave={wave} />
        </div>
      </div>
      <div className="col-start-3 row-span-2 row-start-1 justify-self-end sm:col-start-auto sm:row-span-1 sm:row-start-auto">
        <Quantity product={product} wave={wave} />
      </div>
    </li>
  )
}

/**
 * Dense view: photo, price and a compact stepper; no name, so twice the
 * products fit on screen. The stepper is the small (xs) size: the tiles are
 * too narrow for the regular one, so it morphs down a size on the way in.
 */
function DenseTile({ product, wave }: ItemProps) {
  return (
    <article
      data-product={product.id}
      title={product.name}
      className="flex min-w-0 flex-col gap-1.5"
    >
      <Photo product={product} wave={wave} sizeClass="aspect-square w-full" />
      <Colors product={product} wave={wave} />
      <Price product={product} wave={wave} />
      <Quantity product={product} wave={wave} size="xs" />
    </article>
  )
}
