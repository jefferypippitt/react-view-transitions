/**
 * Transition types for Lift + Swing + Sway (components/shop/rack-catalog.tsx).
 * A plain module, not "use client", so server pages can use the values too.
 *
 * - RACK_LIFT: a product taken off the rail (card → product page).
 * - RACK_BAG: the bag opened (anything → checkout); bagged items are lifted.
 * - RACK_RETURN: back to the rail (product page or checkout → grid).
 * - RAIL_NEXT / RAIL_PREV: moving along the rail on the product page.
 *
 * The root rules in globals.css key off these.
 */
export const RACK_LIFT = "rack-lift"
export const RACK_BAG = "rack-bag"
export const RACK_RETURN = "rack-return"
export const RAIL_NEXT = "rail-next"
export const RAIL_PREV = "rail-prev"
