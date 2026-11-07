"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { RiArrowLeftSLine } from "@remixicon/react"

import { type CartLine, useCart, useCartLines } from "@/components/shop/cart"
import { QuantityStepper } from "@/components/shop/quantity-stepper"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatPrice, productImageSizes } from "@/lib/media"
import { cn } from "@/lib/utils"

type Order = { number: string; count: number; total: number }

export type PhotoRow = {
  line: CartLine
  index: number
  /** The product's first row: a product in two colors has two rows, and a
   *  name shared with the shop can only go on one of them. */
  firstOfProduct: boolean
}

// Demo order number, made on click (an event, not render).
function orderNumber() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * Checkout for the shop demos: the bag as a table, a summary and a Place order
 * button. Shared by every demo; each one's page wraps it in that demo's own
 * page transition.
 */
export function Checkout({
  shopHref,
  backTypes,
  photoOverlay,
  wrapPhoto = (photo) => photo,
}: {
  /** The demo's grid, for Back and Continue shopping. */
  shopHref: string
  /** transitionTypes for the links back to the grid. */
  backTypes?: string[]
  /** Rendered over each line's photo, inside its box (Fly + Dock's copy). */
  photoOverlay?: (line: CartLine) => React.ReactNode
  /** Wraps each line's photo box, e.g. in a named <ViewTransition>. */
  wrapPhoto?: (photo: React.ReactNode, row: PhotoRow) => React.ReactNode
}) {
  const { clear } = useCart()
  const lines = useCartLines()
  const [order, setOrder] = useState<Order | null>(null)

  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  )

  function placeOrder() {
    setOrder({ number: orderNumber(), count, total })
    clear()
  }

  const backToShop = (label: string, variant: "ghost" | "outline") => (
    <Link
      href={shopHref}
      transitionTypes={backTypes}
      className={cn(
        buttonVariants({ variant }),
        "w-fit font-mono tracking-wide uppercase",
        variant === "ghost" && "-ms-2"
      )}
    >
      {variant === "ghost" && <RiArrowLeftSLine data-icon="inline-start" />}
      {label}
    </Link>
  )

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
      {backToShop("Back", "ghost")}
      <div className="flex items-center justify-between gap-4 whitespace-nowrap">
        <h1 className="text-[0.8rem] font-medium tracking-wide">Checkout</h1>
        {!order && (
          <span className="text-muted-foreground tabular-nums">
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {order ? (
        <div className="flex flex-col items-start gap-6 border-t pt-6">
          <div className="flex flex-col gap-2">
            <p className="font-medium">Order placed</p>
            <p className="text-muted-foreground tabular-nums">
              No. {order.number} · {order.count}{" "}
              {order.count === 1 ? "item" : "items"} ·{" "}
              {formatPrice(order.total)}
            </p>
          </div>
          {backToShop("Continue shopping", "outline")}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-start gap-6 border-t pt-6">
          <p className="text-muted-foreground">Your bag is empty.</p>
          {backToShop("Continue shopping", "outline")}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="text-muted-foreground hover:bg-transparent">
                <TableHead className="ps-0 font-normal text-muted-foreground">
                  Product
                </TableHead>
                <TableHead className="hidden font-normal text-muted-foreground sm:table-cell">
                  Price
                </TableHead>
                <TableHead className="font-normal text-muted-foreground">
                  Quantity
                </TableHead>
                <TableHead className="pe-0 text-end font-normal text-muted-foreground">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={line.key} className="hover:bg-transparent">
                  <TableCell className="py-3 ps-0">
                    <div className="flex items-center gap-4">
                      {wrapPhoto(
                        <div className="relative size-12 shrink-0 overflow-hidden bg-product">
                          <Image
                            src={line.variant.src}
                            alt=""
                            fill
                            sizes={productImageSizes}
                            className="object-contain p-[8%]"
                          />
                          {photoOverlay?.(line)}
                        </div>,
                        {
                          line,
                          index,
                          firstOfProduct:
                            lines.findIndex(
                              (other) => other.product.id === line.product.id
                            ) === index,
                        }
                      )}
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate font-medium">{`'${line.product.name}'`}</span>
                        <span className="text-muted-foreground">
                          {line.product.code} · {line.variant.color}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden tabular-nums sm:table-cell">
                    {formatPrice(line.product.price)}
                  </TableCell>
                  <TableCell>
                    <QuantityStepper
                      id={line.key}
                      label={`${line.product.name} in ${line.variant.color}`}
                    />
                  </TableCell>
                  <TableCell className="pe-0 text-end tabular-nums">
                    {formatPrice(line.product.price * line.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex w-full flex-col gap-4 self-end sm:max-w-80">
            <dl className="flex flex-col gap-2 tabular-nums">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-2 font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button
              onClick={placeOrder}
              className="w-full font-mono tracking-wide uppercase"
            >
              Place order
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
