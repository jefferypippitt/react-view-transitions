/**
 * Smoky backdrop for sticky bars: stacked blur layers that get stronger toward
 * the top and fade out past the bar's bottom edge. Styles live in globals.css
 * (.progressive-blur). Place inside a `relative` (or sticky) parent.
 */
export function ProgressiveBlur() {
  return (
    <div aria-hidden className="progressive-blur">
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  )
}
