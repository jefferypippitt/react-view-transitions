import { WipeCatalog } from "@/components/shop/wipe-catalog"

export default function WipeShopPage() {
  return (
    // No page boundary: on a dive the page goes with the root snapshot,
    // which globals.css scales by transition type (dive-in / dive-out).
    <div className="px-6 pt-8 pb-16">
      <WipeCatalog />
    </div>
  )
}
