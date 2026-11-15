import { getImageProps, type ImageProps } from "next/image"
import { preload as preloadResource } from "react-dom"

type ProductImageProps = Omit<
  ImageProps,
  "onLoad" | "onLoadingComplete" | "placeholder" | "blurDataURL" | "priority"
>

/**
 * next/image's optimized srcset on a plain <img>, so view transitions never
 * blink.
 *
 * During a Transition, React holds the commit (and so the view transition's
 * new snapshot) until each newly mounted <img> has loaded and decoded, up
 * to about 800ms. It only does that for an <img> with no onLoad that isn't
 * loading="lazy". The <Image> component always attaches its own onLoad, so
 * React never waits for it: the snapshot is taken with the photo still
 * blank and it pops in mid-animation. getImageProps gives the same
 * optimized src/srcset/sizes without the component.
 *
 * Same props as <Image> for what the shop uses (src, alt, fill, sizes,
 * loading, preload, className). No blur placeholder: that needs onLoad.
 */
export function ProductImage({ preload, ...rest }: ProductImageProps) {
  const { props } = getImageProps({ ...rest, preload })
  // What <Image preload> does: a <link rel="preload"> in the head, with the
  // srcset, so the browser fetches the right file before it parses the <img>.
  if (preload) {
    preloadResource(props.src, {
      as: "image",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority: "high",
    })
  }
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt is in props
  return <img {...props} />
}

/**
 * Fetches photos ahead of time at the size a slot will show them (the same
 * `sizes` as that slot's <ProductImage>), so the browser picks the same
 * srcset file and it's already in cache when that photo mounts. For the
 * colors not on screen yet: picking one then swaps instantly instead of
 * holding the transition while it loads.
 */
export function preloadPhotos(
  srcs: string[],
  sizes: string,
  fetchPriority: "high" | "low" = "low"
) {
  for (const src of srcs) {
    const { props } = getImageProps({ src, alt: "", fill: true, sizes })
    // React dedupes by href + srcset: calling this again is free.
    preloadResource(props.src, {
      as: "image",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority,
    })
  }
}

/**
 * Event handlers for a card that opens a bigger photo (a product page link,
 * a quick-view button): pointing at it or focusing it starts fetching that
 * photo at the size it will show, so it's usually cached by the click and
 * the transition starts at once instead of waiting for it. Pointer events
 * cover touch too (pointerenter fires as the finger lands); focus covers
 * the keyboard. Spread onto the card's link or button.
 */
export function preloadOnIntent(src: string, sizes: string) {
  const preload = () => preloadPhotos([src], sizes, "high")
  return { onPointerEnter: preload, onFocus: preload }
}
