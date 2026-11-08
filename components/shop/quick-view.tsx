"use client"

import Image from "next/image"
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
import { cartKey, formatPrice, type Product, variantAlt } from "@/lib/media"

export type Step = "nav-forward" | "nav-back"

/**
 * The photo's share class, on both the grid card and the quick view. Opening
 * and closing morph it (untyped transitions resolve `default`). Stepping
 * prev/next is typed, and resolves to none: otherwise the old photo would fly
 * back to its card and the next one would fly out of its card. Unnamed, the
 * photos slide along with the rest of the sheet's content instead.
 */
export const expandShare = {
  "nav-forward": "none",
  "nav-back": "none",
  default: "expand",
}

/**
 * Like <SlideTransition> (same nav-forward / nav-back types), but with the
 * carousel timing: the incoming content fades in at the same moment the old
 * starts to leave. SlideTransition waits for the old content to fade out
 * first, which is right for whole pages but leaves the sheet blank for a beat,
 * so it read as the sheet closing and reopening.
 */
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
  /** `instant`: skip the animation (keyboard shortcuts). */
  onClose: (instant?: boolean) => void
  onStep: (step: Step, instant?: boolean) => void
}) {
  useEffect(() => {
    // Keyboard shortcuts act instantly: they get pressed over and over, and an
    // animation on each press makes them feel slow. Clicks still animate.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return onClose(true)
      // Arrow keys inside a control (the color toggles) belong to it.
      if ((event.target as Element).closest?.('[role="group"]')) return
      if (event.key === "ArrowRight") onStep("nav-forward", true)
      else if (event.key === "ArrowLeft") onStep("nav-back", true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, onStep])

  return (
    <>
      {/* Click-away layer only. It's transparent: the grid dims its own
          photos (so the up-next one can stay lit), so there's nothing here
          to animate. */}
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
          {/* Keyed by product: prev/next swaps this subtree, so the old
              product slides out as the next slides in. The sheet stays. */}
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
          {/* Keyed by color: the shot slides in the direction of the pick. */}
          <CarouselTransition key={variant.color}>
            <Image
              src={variant.src}
              alt={variantAlt(product, variant)}
              fill
              preload
              sizes="(min-width: 576px) 528px, 100vw"
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
