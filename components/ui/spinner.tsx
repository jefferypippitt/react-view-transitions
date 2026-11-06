import { cn } from "cn"
import { RiLoaderLine } from "@remixicon/react"

// Typed from the icon itself: RemixiconProps doesn't accept `children`, so
// React.ComponentProps<"svg"> fails to typecheck.
function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof RiLoaderLine>) {
  return (
    <RiLoaderLine data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
