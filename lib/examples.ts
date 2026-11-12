/**
 * The demos listed on the homepage. Each one is a small shop built from the
 * view transitions it lists; the homepage joins them with "+". Add new demos
 * here.
 *
 * `skill` names the folder in skills/ that lets people add the demo to their
 * own app with the skills CLI (https://skills.sh). Rows without one show no
 * install buttons.
 */
export type Example = {
  href: string
  transitions: [string, ...string[]]
  skill?: string
}

export const examples: Example[] = [
  { href: "/fade", transitions: ["Fade"], skill: "vt-fade" },
  { href: "/morph", transitions: ["Morph", "Slide"], skill: "vt-morph-slide" },
  {
    href: "/expand",
    transitions: ["Expand", "Carousel"],
    skill: "vt-expand-carousel",
  },
  { href: "/fly", transitions: ["Fly", "Dock"], skill: "vt-fly-dock" },
  {
    href: "/stagger",
    transitions: ["Layout", "Stagger"],
    skill: "vt-layout-stagger",
  },
  {
    href: "/search",
    transitions: ["Search", "Reflow"],
    skill: "vt-search-reflow",
  },
  { href: "/swap", transitions: ["Swap", "Roll"], skill: "vt-swap-roll" },
  { href: "/tuck", transitions: ["Tuck", "Spill"], skill: "vt-tuck-spill" },
  {
    href: "/grow",
    transitions: ["Grow", "Shift", "Slide"],
    skill: "vt-grow-shift-slide",
  },
  { href: "/blur", transitions: ["Blur"], skill: "vt-blur" },
  { href: "/flip", transitions: ["Flip", "Deal"], skill: "vt-flip-deal" },
]

/** "'Morph' + 'Slide'", as shown on the homepage. */
export function exampleTitle(example: Example) {
  return example.transitions.map((t) => `'${t}'`).join(" + ")
}

/** Public repo the skills CLI installs from. */
export const skillsRepo =
  "https://github.com/jefferypippitt/react-view-transitions"

/** Installs the skill into the user's project. */
export function skillCommand(skill: string) {
  return `npx skills add ${skillsRepo} --skill ${skill}`
}

/** One-off: paste into an agent, which reads the skill and applies it. */
export function skillPrompt(skill: string) {
  return `Run \`npx skills use "${skillsRepo}" --skill "${skill}"\` and follow the generated skill instructions now. Read its complete output, redirecting it to a temporary file first if necessary. Resolve relative paths from the supporting-files directory it provides.`
}
