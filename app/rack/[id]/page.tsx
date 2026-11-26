import Link from "next/link"
import { notFound } from "next/navigation"

import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
} from "@remixicon/react"
import { RackBlock, RackProductView } from "@/components/shop/rack-catalog"
import { RACK_RETURN, RAIL_NEXT, RAIL_PREV } from "@/components/shop/rack-types"
import { buttonVariants } from "@/components/ui/button"
import { getProduct, type Product, products } from "@/lib/media"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function RackProductPage({
  params,
}: PageProps<"/rack/[id]">) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  const index = products.indexOf(product)

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
      {/* Keyed by product so prev/next exits and enters the blocks instead
          of updating them in place. */}
      <RackBlock key={`bar-${product.id}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Back hangs the garment on the rail again: its photo swings
              into its cell and the rail sways. */}
          <Link
            href="/rack"
            transitionTypes={[RACK_RETURN]}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "-ms-2 w-fit font-mono tracking-wide uppercase"
            )}
          >
            <RiArrowLeftSLine data-icon="inline-start" />
            BACK
          </Link>
          <nav aria-label="Products" className="flex items-center gap-2">
            <StepLink
              product={products[index - 1]}
              type={RAIL_PREV}
              label="Previous product"
            >
              <RiArrowLeftLine />
            </StepLink>
            <span className="text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(products.length).padStart(2, "0")}
            </span>
            <StepLink
              product={products[index + 1]}
              type={RAIL_NEXT}
              label="Next product"
            >
              <RiArrowRightLine />
            </StepLink>
          </nav>
        </div>
      </RackBlock>
      <RackProductView key={product.id} product={product} />
    </div>
  )
}

/** Prev/next moves along the rail: the next garment rides in from the right. */
function StepLink({
  product,
  type,
  label,
  children,
}: {
  product: Product | undefined
  type: typeof RAIL_NEXT | typeof RAIL_PREV
  label: string
  children: React.ReactNode
}) {
  const className = buttonVariants({ variant: "outline", size: "icon-sm" })

  if (!product) {
    return (
      <span
        aria-disabled
        aria-label={label}
        className={cn(className, "pointer-events-none opacity-50")}
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={`/rack/${product.id}`}
      transitionTypes={[type]}
      aria-label={`${label}: ${product.name}`}
      className={className}
    >
      {children}
    </Link>
  )
}
