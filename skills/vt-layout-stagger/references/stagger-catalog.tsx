"use client"

import Image from "next/image"
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

const viewOptions = [
  { value: "list", label: "List view", icon: RiListUnordered },
  { value: "grid", label: "Grid view", icon: RiLayoutGridLine },
  { value: "dense", label: "Dense view", icon: RiGridLine },
] satisfies { value: View; label: string; icon: React.ComponentType }[]

const ViewContext = createContext<[View, (view: View) => void] | null>(null)

type Colors = [
  Record<string, string>,
  React.Dispatch<React.SetStateAction<Record<string, string>>>,
]

const ColorContext = createContext<Colors | null>(null)

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

const swatches: Record<string, string> = {
  Black: "#111111",
  White: "#f4f4f2",
  Gray: "#8b8b8b",
  Tan: "#c9ae8c",
  Brown: "#6b4a33",
  Chocolate: "#4a2e21",
  Coal: "#303030",
  Green: "#4f5b3d",
  Stealth: "#3b3e42",
}

const headerHeight = 48

const lastWave = 16

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

export function staggerPhotoName(product: Product) {
  return `stagger-photo-${product.id}`
}

export function StaggerCatalog() {
  const [filter, setFilter] = useState<Filter | null>(null)
  const [view, setView] = useStaggerView()
  const shown = getProducts(filter ?? undefined)

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
          <TooltipProvider>
            <ToggleGroup
              size="sm"
              aria-label="View"
              value={[view]}
              onValueChange={(value) => {
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
        <ViewTransition
          key={variant.color}
          enter="fade-in"
          exit="fade-out"
          default="none"
        >
          <Image
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

function Name({ product, wave }: ItemProps) {
  return (
    <StaggerPart name={`stagger-name-${product.id}`} wave={wave} text>
      <h2 className="w-fit max-w-full min-w-0 truncate font-medium">{`'${product.name}'`}</h2>
    </StaggerPart>
  )
}

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
