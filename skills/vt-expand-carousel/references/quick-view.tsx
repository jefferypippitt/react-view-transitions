"use client"

import { preloadPhotos, ProductImage } from "@/components/shop/product-image"
import {
  addTransitionType,
  startTransition,
  useEffect,
  useState,
  ViewTransition,
} from "react"

import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCloseLine,
} from "@remixicon/react"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  cartKey,
  formatPrice,
  type Product,
  quickViewImageSizes,
  variantAlt,
} from "@/lib/media"

export type Step = "nav-forward" | "nav-back"

export const expandShare = {
  "nav-forward": "none",
  "nav-back": "none",
  default: "expand",
}

function CarouselTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "carousel-forward",
        "nav-back": "carousel-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "carousel-forward",
        "nav-back": "carousel-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}

export function QuickView({
  product,
  index,
  count,
  onClose,
  onStep,
}: {
  product: Product
  index: number
  count: number
  onClose: (instant?: boolean) => void
  onStep: (step: Step, instant?: boolean) => void
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return onClose(true)
      if ((event.target as Element).closest?.('[role="group"]')) return
      if (event.key === "ArrowRight") onStep("nav-forward", true)
      else if (event.key === "ArrowLeft") onStep("nav-back", true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, onStep])

  return (
    <>
      <div
        aria-hidden
        onClick={() => onClose()}
        className="fixed inset-x-0 top-12 bottom-0 z-20"
      />
      <ViewTransition enter="sheet-in" exit="sheet-out" default="none">
        <div
          role="dialog"
          aria-modal
          aria-label={`Quick view: ${product.name}`}
          className="fixed top-12 right-0 bottom-0 z-30 flex w-full max-w-xl flex-col overflow-y-auto border-s bg-background"
        >
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            <nav aria-label="Products" className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous product"
                disabled={index === 0}
                onClick={() => onStep("nav-back")}
              >
                <RiArrowLeftLine />
              </Button>
              <span className="text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next product"
                disabled={index === count - 1}
                onClick={() => onStep("nav-forward")}
              >
                <RiArrowRightLine />
              </Button>
            </nav>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close quick view"
              autoFocus
              onClick={() => onClose()}
            >
              <RiCloseLine />
            </Button>
          </div>
          <CarouselTransition key={product.id}>
            <QuickViewBody product={product} />
          </CarouselTransition>
        </div>
      </ViewTransition>
    </>
  )
}

function QuickViewBody({ product }: { product: Product }) {
  const [color, setColor] = useState(product.variants[0].color)
  const index = Math.max(
    0,
    product.variants.findIndex((v) => v.color === color)
  )
  const variant = product.variants[index]!

  preloadPhotos(
    product.variants.filter((v) => v !== variant).map((v) => v.src),
    quickViewImageSizes
  )

  function selectColor(next: string) {
    const nextIndex = product.variants.findIndex((v) => v.color === next)
    if (nextIndex === index) return
    startTransition(() => {
      addTransitionType(nextIndex > index ? "nav-forward" : "nav-back")
      setColor(next)
    })
  }

  return (
    <div className="flex flex-col gap-6 px-6 pb-10">
      <ViewTransition
        name={`expand-${product.id}`}
        share={expandShare}
        default="none"
      >
        <div className="relative aspect-square overflow-hidden bg-product">
          <CarouselTransition key={variant.color}>
            <ProductImage
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              preload
              sizes={quickViewImageSizes}
              className="object-contain p-[8%]"
            />
          </CarouselTransition>
        </div>
      </ViewTransition>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">{`'${product.name}'`}</h2>
        <span className="text-muted-foreground">{product.code}</span>
      </div>
      <span className="text-sm tabular-nums">{formatPrice(product.price)}</span>
      <Separator />
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground">
          Color <span className="text-foreground">{variant.color}</span>
        </span>
        {product.variants.length > 1 && (
          <ToggleGroup
            variant="outline"
            size="sm"
            aria-label="Color"
            value={[variant.color]}
            onValueChange={(value) => {
              if (value[0]) selectColor(value[0])
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
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Quantity</span>
        <QuantityStepper
          id={cartKey(product, variant)}
          label={`${product.name} in ${variant.color}`}
        />
      </div>
    </div>
  )
}
