import Link from "next/link"
import { notFound } from "next/navigation"
import { ViewTransition } from "react"

import { RiArrowLeftSLine } from "@remixicon/react"
import { ProductView } from "@/components/shop/product-view"
import { buttonVariants } from "@/components/ui/button"
import { getProduct, products } from "@/lib/media"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function BlurProductPage({
  params,
}: PageProps<"/blur/[id]">) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  return (
    <ViewTransition
      key={product.id}
      enter="blur-in"
      exit="blur-out"
      default="none"
    >
      <div className="flex flex-col gap-6 px-6 pt-6 pb-16">
        <Link
          href="/blur"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "-ms-2 w-fit font-mono tracking-wide uppercase"
          )}
        >
          <RiArrowLeftSLine data-icon="inline-start" />
          BACK
        </Link>
        {/* Colors swap with the same focus pull as pages. */}
        <ProductView product={product} enter="blur-in" exit="blur-out" />
      </div>
    </ViewTransition>
  )
}
