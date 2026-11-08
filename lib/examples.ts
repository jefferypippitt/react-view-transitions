/**
 * The demos listed on the homepage. Each one is a small shop built from the
 * view transitions it lists; the homepage joins them with "+". Add new demos
 * here.
 */
export type Example = {
  href: string
  transitions: [string, ...string[]]
}

export const examples: Example[] = [
  { href: "/fade", transitions: ["Fade"] },
  { href: "/morph", transitions: ["Morph", "Slide"] },
  { href: "/expand", transitions: ["Expand", "Carousel"] },
  { href: "/fly", transitions: ["Fly", "Dock"] },
  { href: "/stagger", transitions: ["Layout", "Stagger"] },
  { href: "/search", transitions: ["Search", "Reflow"] },
  { href: "/swap", transitions: ["Swap", "Roll"] },
  { href: "/tuck", transitions: ["Tuck", "Spill"] },
  { href: "/grow", transitions: ["Grow", "Shift", "Slide"] },
]
