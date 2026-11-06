/**
 * Products and color variants gathered for the demo (Nov 2026),
 * stored in public/media/products as 1200px WebP (resized from the originals).
 * Placeholder images — local demo use only, don't deploy or publish.
 *
 * Order, prices (USD), colors and gender tags are the site's. The site only
 * lists codes, so names are short descriptions of each shot. width/height are
 * the files' real pixel sizes. A product's first variant is its default.
 */
export type Variant = {
  color: string
  src: string
  width: number
  height: number
}

export type Gender = "male" | "female" | "unisex"

export type Product = {
  id: string
  code: string
  name: string
  price: number
  /** The site's own tag. Unisex items appear under both filters. */
  gender: Gender
  variants: [Variant, ...Variant[]]
}

function variant(color: string, file: string, width = 1200, height = width) {
  return { color, src: `/media/products/${file}`, width, height } satisfies Variant
}

function product(
  code: string,
  name: string,
  price: number,
  gender: Gender,
  variants: [Variant, ...Variant[]]
) {
  return {
    id: code.toLowerCase(),
    code,
    name,
    price,
    gender,
    variants,
  } satisfies Product
}

export const products: Product[] = [
  product("AB-01", "Boot", 120, "male", [variant("Black", "ab-01-black.webp")]),
  product("800S", "Sneaker", 120, "male", [
    variant("Stealth", "800s-stealth.webp"),
  ]),
  product("YS-02", "Slide 2", 50, "unisex", [
    variant("Coal", "ys-02-coal.webp"),
    variant("Brown", "ys-02-brown.webp"),
  ]),
  product("LS-03", "Base Long Sleeve", 20, "male", [
    variant("White", "ls-03-white.webp"),
    variant("Black", "ls-03-black.webp"),
  ]),
  product("SG-03", "Sunglasses", 20, "unisex", [
    variant("Black", "sg-03-black.webp", 899, 1200),
  ]),
  product("BP-02", "Backpack", 40, "unisex", [
    variant("Black", "bp-02-black.webp"),
  ]),
  product("TS-03", "3 Pack Shrunken Tee", 40, "male", [
    variant("Brown", "ts-03-brown.webp"),
    variant("Black", "ts-03-black.webp"),
    variant("Green", "ts-03-green.webp"),
    variant("White", "ts-03-white.webp"),
  ]),
  product("YS-01", "Slide", 40, "unisex", [
    variant("Chocolate", "ys-01-chocolate.webp"),
    variant("Black", "ys-01-black.webp"),
  ]),
  product("TT-06", "3 Pack Base Tank", 40, "male", [
    variant("Black", "tt-06-black.webp"),
  ]),
  product("BD-10", "Short Sleeve Bodysuit", 40, "female", [
    variant("Black", "bd-10-black.webp"),
  ]),
  product("WJ-02", "Track Jacket", 40, "female", [
    variant("Black", "wj-02-black.webp"),
  ]),
  product("PT-05", "Wide Pant", 40, "male", [
    variant("Black", "pt-05-black.webp"),
  ]),
  product("LG-14", "Ankle Legging", 40, "female", [
    variant("Black", "lg-14-black.webp"),
  ]),
  product("BX-01", "3 Pack Boxer", 40, "male", [
    variant("Black", "bx-01-black.webp"),
  ]),
  product("PT-04", "Straight Pant", 40, "male", [
    variant("Black", "pt-04-black.webp"),
  ]),
  product("SP-06", "Sweatpant", 40, "male", [
    variant("White", "sp-06-white.webp", 1024, 1024),
    variant("Gray", "sp-06-gray.webp"),
    variant("Black", "sp-06-black.webp", 1024, 1024),
  ]),
  product("KP-01", "Thong", 30, "female", [
    variant("White", "kp-01-white.webp"),
    variant("Black", "kp-01-black.webp"),
    variant("Tan", "kp-01-tan.webp"),
  ]),
  product("KS-01", "Boy Short", 40, "female", [
    variant("White", "ks-01-white.webp"),
    variant("Black", "ks-01-black.webp"),
    variant("Tan", "ks-01-tan.webp"),
  ]),
  product("SK-01", "3 Pack Sock", 20, "unisex", [
    variant("White", "sk-01-white.webp"),
    variant("Gray", "sk-01-gray.webp"),
    variant("Black", "sk-01-black.webp"),
  ]),
  product("WB-01", "Windbreaker", 40, "male", [
    variant("Gray", "wb-01-gray.webp"),
    variant("Black", "wb-01-black.webp"),
  ]),
  product("SH-01", "Short", 20, "male", [
    variant("Gray", "sh-01-gray.webp"),
    variant("Black", "sh-01-black.webp"),
  ]),
  product("TS-04", "Fitted Tee", 20, "female", [
    variant("Black", "ts-04-black.webp"),
  ]),
  product("BD-03", "Bodysuit", 20, "female", [
    variant("Black", "bd-03-black.webp"),
  ]),
  product("BD-04", "Long Bodysuit", 40, "female", [
    variant("Black", "bd-04-black.webp"),
  ]),
  product("HD-03", "Zip Hoodie", 40, "male", [
    variant("Black", "hd-03-black.webp"),
  ]),
  product("TT-02", "Tube Top", 20, "female", [
    variant("Black", "tt-02-black.webp"),
  ]),
  product("TT-04", "Bandeau", 20, "female", [
    variant("Black", "tt-04-black.webp"),
  ]),
  product("BR-09", "Bra", 20, "female", [variant("Black", "br-09-black.webp")]),
  product("SH-06", "Mini Short", 20, "female", [
    variant("Black", "sh-06-black.webp"),
  ]),
  product("LG-01", "Footed Legging", 40, "female", [
    variant("Black", "lg-01-black.webp"),
  ]),
  product("LG-04", "Flare Legging", 40, "female", [
    variant("Black", "lg-04-black.webp"),
  ]),
  product("LG-13", "Legging", 40, "female", [
    variant("Black", "lg-13-black.webp"),
  ]),
  product("HL-03", "Heel", 60, "female", [
    variant("Black", "hl-03-black.webp"),
  ]),
  product("HB-01", "Heel Boot", 100, "female", [
    variant("Black", "hb-01-black.webp"),
  ]),
  product("BP-01", "Roll-Top Bag", 40, "unisex", [
    variant("Black", "bp-01-black.webp"),
  ]),
]

export const filters = ["male", "female"] as const
export type Filter = (typeof filters)[number]

export function isFilter(value: unknown): value is Filter {
  return filters.includes(value as Filter)
}

/** All products, or one gender plus unisex. */
export function getProducts(filter?: Filter) {
  return filter
    ? products.filter((p) => p.gender === filter || p.gender === "unisex")
    : products
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id)
}

export function variantAlt(product: Product, variant: Variant) {
  return `${product.code} ${product.name} in ${variant.color}`
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatPrice(price: number) {
  return `${usd.format(price)} USD`
}

/** Cart line id: one line per product color. */
export function cartKey(product: Product, variant: Variant) {
  return `${product.id}:${variant.color.toLowerCase()}`
}
