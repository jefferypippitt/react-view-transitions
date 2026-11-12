import Link from "next/link"
import { notFound } from "next/navigation"

import { RiArrowLeftSLine } from "@remixicon/react"
import { ProductView } from "@/components/shop/product-view"
import { SlideTransition } from "@/components/slide-transition"
import { buttonVariants } from "@/components/ui/button"
import { getProduct, products } from "@/lib/media"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

/**
 * Picking a color turns the photo over like a card: the old shot turns away
 * as the new one turns in, leftward for a color further along the row and
 * rightward for one before it (ProductView tags the pick nav-forward /
 * nav-back).
 */
const flip = {
  "nav-forward": "flip-forward",
  "nav-back": "flip-back",
  default: "none",
}

export default async function FlipProductPage({
  params,
}: PageProps<"/flip/[id]">) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  return (
    <SlideTransition key={product.id}>
      <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
        <Link
          href="/flip"
          transitionTypes={["nav-back"]}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "-ms-2 w-fit font-mono tracking-wide uppercase"
          )}
        >
          <RiArrowLeftSLine data-icon="inline-start" />
          BACK
        </Link>
        <ProductView product={product} enter={flip} exit={flip} />
      </div>
    </SlideTransition>
  )
}
