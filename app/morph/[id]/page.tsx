import Link from "next/link"
import { notFound } from "next/navigation"

import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
} from "@remixicon/react"
import { MorphProductView } from "@/components/shop/morph-product-view"
import { SlideTransition } from "@/components/slide-transition"
import { buttonVariants } from "@/components/ui/button"
import { getProduct, type Product, products } from "@/lib/media"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function MorphProductPage({
  params,
}: PageProps<"/morph/[id]">) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  const index = products.indexOf(product)

  return (
    // Keyed by product: prev/next stays on this route, so without a key the
    // page would update in place instead of exiting and entering.
    <SlideTransition key={product.id}>
      <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
        <div className="flex items-center justify-between gap-4">
          {/* Back up the hierarchy: the page slides right and the photo
              morphs back into its grid card. */}
          <Link
            href="/morph"
            transitionTypes={["nav-back"]}
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
              type="nav-back"
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
              type="nav-forward"
              label="Next product"
            >
              <RiArrowRightLine />
            </StepLink>
          </nav>
        </div>
        <MorphProductView product={product} />
      </div>
    </SlideTransition>
  )
}

/** Prev/next is an ordered sequence, so it slides: next from the right. */
function StepLink({
  product,
  type,
  label,
  children,
}: {
  product: Product | undefined
  type: "nav-forward" | "nav-back"
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
      href={`/morph/${product.id}`}
      transitionTypes={[type]}
      aria-label={`${label}: ${product.name}`}
      className={className}
    >
      {children}
    </Link>
  )
}
