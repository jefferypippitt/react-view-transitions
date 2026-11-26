import { RackCatalog } from "@/components/shop/rack-catalog"

export default function RackShopPage() {
  return (
    // No page-level boundary: each garment is its own boundary so the rail
    // can sway card after card.
    <div className="px-6 pt-8 pb-16">
      <RackCatalog />
    </div>
  )
}
