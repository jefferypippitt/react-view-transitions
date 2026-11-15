/**
 * Demo catalog. Original generated product shots live in
 * public/media/products as 2048px square PNGs on white.
 *
 * Codes follow {TYPE}-{MODEL}; filenames are {code}-{color}.png. Prices and
 * gender tags are made up for the demo. width/height are the files' real
 * pixel sizes. A product's first variant is its default.
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
  /** Unisex items appear under both filters. */
  gender: Gender
  variants: [Variant, ...Variant[]]
}

function variant(color: string, file: string, width = 2048, height = width) {
  return {
    color,
    src: `/media/products/${file}`,
    width,
    height,
  } satisfies Variant
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
  product("HZ-20", "Zip Hoodie", 90, "male", [
    variant("Black", "hz-20-black.png"),
  ]),
  product("SD-20", "Slide", 50, "unisex", [
    variant("Black", "sd-20-black.png"),
    variant("Umber", "sd-20-umber.png"),
  ]),
  product("TE-20", "3 Pack Tee", 45, "male", [
    variant("Black", "te-20-black.png"),
    variant("Bone", "te-20-bone.png"),
    variant("Clay", "te-20-clay.png"),
    variant("Moss", "te-20-moss.png"),
  ]),
  product("RP-20", "Romper", 70, "female", [
    variant("Black", "rp-20-black.png"),
  ]),
  product("RN-20", "Runner", 140, "male", [
    variant("Shade", "rn-20-shade.png"),
  ]),
  product("GL-20", "Sunglasses", 40, "unisex", [
    variant("Black", "gl-20-black.png"),
  ]),
  product("LV-20", "Long Sleeve", 35, "male", [
    variant("Black", "lv-20-black.png"),
    variant("Bone", "lv-20-bone.png"),
  ]),
  product("TB-20", "Long Tube Top", 30, "female", [
    variant("Black", "tb-20-black.png"),
  ]),
  product("PK-20", "Roll-Top Pack", 80, "unisex", [
    variant("Black", "pk-20-black.png"),
  ]),
  product("SW-20", "Sweatpant", 70, "male", [
    variant("Black", "sw-20-black.png"),
    variant("Bone", "sw-20-bone.png"),
    variant("Stone", "sw-20-stone.png"),
  ]),
  product("SU-20", "Cami Bodysuit", 45, "female", [
    variant("Black", "su-20-black.png"),
  ]),
  product("JK-20", "Track Jacket", 95, "female", [
    variant("Black", "jk-20-black.png"),
  ]),
  product("SD-21", "Slide 2", 60, "unisex", [
    variant("Clay", "sd-21-clay.png"),
    variant("Ink", "sd-21-ink.png"),
  ]),
  product("WN-20", "Windbreaker", 110, "male", [
    variant("Black", "wn-20-black.png"),
    variant("Stone", "wn-20-stone.png"),
  ]),
  product("LN-23", "Legging", 50, "female", [
    variant("Black", "ln-23-black.png"),
  ]),
  product("BT-20", "Ankle Boot", 160, "male", [
    variant("Black", "bt-20-black.png"),
  ]),
  product("TE-21", "Fitted Tee", 30, "female", [
    variant("Black", "te-21-black.png"),
  ]),
  product("PN-20", "Baggy Pant", 85, "male", [
    variant("Black", "pn-20-black.png"),
  ]),
  product("KB-20", "Knee-High Boot", 190, "female", [
    variant("Black", "kb-20-black.png"),
  ]),
  product("SC-20", "3 Pack Sock", 25, "unisex", [
    variant("Black", "sc-20-black.png"),
    variant("Bone", "sc-20-bone.png"),
    variant("Stone", "sc-20-stone.png"),
  ]),
  product("NS-20", "Nylon Short", 45, "male", [
    variant("Black", "ns-20-black.png"),
    variant("Stone", "ns-20-stone.png"),
  ]),
  product("BA-20", "Bralette", 30, "female", [
    variant("Black", "ba-20-black.png"),
  ]),
  product("TK-20", "3 Pack Tank", 40, "male", [
    variant("Black", "tk-20-black.png"),
  ]),
  product("LN-22", "Yoga Legging", 55, "female", [
    variant("Black", "ln-22-black.png"),
  ]),
  product("MU-20", "Mule", 90, "unisex", [variant("Black", "mu-20-black.png")]),
  product("PN-21", "Straight Pant", 80, "male", [
    variant("Black", "pn-21-black.png"),
  ]),
  product("SU-21", "Footed Jumpsuit", 75, "female", [
    variant("Black", "su-21-black.png"),
  ]),
  product("PK-21", "Zip Backpack", 90, "unisex", [
    variant("Black", "pk-21-black.png"),
  ]),
  product("BB-20", "3 Pack Boxer Brief", 35, "male", [
    variant("Black", "bb-20-black.png"),
  ]),
  product("TB-21", "Short Tube Top", 25, "female", [
    variant("Black", "tb-21-black.png"),
  ]),
  product("PY-20", "Mid-Rise Brief", 20, "female", [
    variant("Black", "py-20-black.png"),
    variant("Bone", "py-20-bone.png"),
    variant("Sand", "py-20-sand.png"),
  ]),
  product("LN-20", "Capri Legging", 45, "female", [
    variant("Black", "ln-20-black.png"),
  ]),
  product("WS-20", "Shortie Brief", 20, "female", [
    variant("Black", "ws-20-black.png"),
    variant("Bone", "ws-20-bone.png"),
    variant("Sand", "ws-20-sand.png"),
  ]),
  product("BS-20", "Boy Short", 25, "female", [
    variant("Black", "bs-20-black.png"),
  ]),
  product("LN-21", "Footed Legging", 50, "female", [
    variant("Black", "ln-21-black.png"),
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

/** The product and color behind a cartKey. */
export function getCartLine(key: string) {
  const [id, color] = key.split(":")
  const product = id ? getProduct(id) : undefined
  const variant = product?.variants.find((v) => v.color.toLowerCase() === color)
  return product && variant ? { key, product, variant } : undefined
}

/**
 * `sizes` for a product photo in a grid card. Thumbnails of the same photo use
 * it too, so they pick the same srcset file: it's already loaded when a shared
 * element morph snapshots it.
 */
export const productImageSizes =
  "(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"

/**
 * `sizes` for the product page's photo. Cards linking there preload the
 * photo with it on hover, so it must match the page's <ProductImage>.
 */
export const productHeroSizes = "(min-width: 768px) 50vw, 100vw"

/** `sizes` for the quick view's photo (Expand), preloaded the same way. */
export const quickViewImageSizes = "(min-width: 576px) 528px, 100vw"
