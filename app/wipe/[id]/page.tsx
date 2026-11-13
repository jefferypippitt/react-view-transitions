import Link from "next/link"
import { notFound } from "next/navigation"

import { RiArrowLeftSLine } from "@remixicon/react"
import { ProductView } from "@/components/shop/product-view"
import { buttonVariants } from "@/components/ui/button"
import { getProduct, products } from "@/lib/media"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

/**
 * Picking a color stacks the new shot on the old one: it slides in over it
 * while the old shot sinks back, from the right for a color further along
 * the row and from the left for one before it (ProductView tags the pick
 * nav-forward / nav-back).
 */
const stack = {
  "nav-forward": "stack-forward",
  "nav-back": "stack-back",
  default: "none",
}

export default async function WipeProductPage({
  params,
}: PageProps<"/wipe/[id]">) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  return (
    // No page boundary, as on the grid: the dive scales the root snapshot
    // while the photo morphs between its card and this page.
    <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
      <Link
        href="/wipe"
        transitionTypes={["dive-out"]}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "-ms-2 w-fit font-mono tracking-wide uppercase"
        )}
      >
        <RiArrowLeftSLine data-icon="inline-start" />
        BACK
      </Link>
      <ProductView
        product={product}
        photoName={`product-${product.id}`}
        enter={stack}
        exit={stack}
      />
    </div>
  )
}
