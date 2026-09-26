import { TYPES } from './types'

export interface PaletteColor {
  readonly name: string
  readonly hex: string
}

export interface WorstColor extends PaletteColor {
  readonly substitute: PaletteColor
}

export interface Palette {
  readonly typeId: string
  readonly best: readonly PaletteColor[]
  readonly worst: readonly WorstColor[]
  readonly neutral: readonly PaletteColor[]
}

function color(name: string, hex: string): PaletteColor {
  return { name, hex }
}

const WARM_BEST: Record<string, readonly PaletteColor[]> = {
  'spring-warm': [
    color('Coral', '#e27e5a'),
    color('Warm Peach', '#e8a473'),
    color('Golden Yellow', '#e7b540'),
    color('Marigold', '#eaa52e'),
    color('Warm Red', '#dd442c'),
    color('Tangerine', '#eb9447'),
    color('Amber', '#e2af36'),
  ],
  'spring-light': [
    color('Soft Peach', '#edcab6'),
    color('Light Apricot', '#ecccac'),
    color('Pale Gold', '#eadbb8'),
    color('Light Coral', '#eabcae'),
    color('Cream Yellow', '#f0e2c2'),
    color('Warm Blush', '#ebcac2'),
    color('Light Honey', '#e8d5b0'),
  ],
  'spring-bright': [
    color('Bright Coral', '#f65931'),
    color('Vivid Orange', '#f9851f'),
    color('Sunny Yellow', '#fbba23'),
    color('Bright Poppy', '#f43625'),
    color('Vivid Tangerine', '#f87a25'),
    color('Bright Gold', '#f4b625'),
    color('Vivid Salmon', '#f37649'),
  ],
  'autumn-warm': [
    color('Terracotta', '#c66339'),
    color('Burnt Orange', '#c66b2f'),
    color('Mustard', '#c49831'),
    color('Rust', '#b54f30'),
    color('Cinnamon', '#b97131'),
    color('Warm Gold', '#d0a339'),
    color('Amber Brown', '#cc8f33'),
  ],
  'autumn-deep': [
    color('Deep Rust', '#7a3c29'),
    color('Chocolate', '#654229'),
    color('Dark Amber', '#82622b'),
    color('Mahogany', '#6f332a'),
    color('Deep Terracotta', '#84452e'),
    color('Espresso', '#583928'),
    color('Dark Gold', '#856c32'),
  ],
  'autumn-mute': [
    color('Muted Clay', '#9f6e56'),
    color('Soft Camel', '#a78762'),
    color('Warm Taupe', '#9c7e63'),
    color('Faded Rust', '#906451'),
    color('Muted Mustard', '#9b8450'),
    color('Milk Tea', '#a58c69'),
    color('Soft Brick', '#955e50'),
  ],
}

const COOL_BEST: Record<string, readonly PaletteColor[]> = {
  'summer-cool': [
    color('Dusty Blue', '#7c9ec0'),
    color('Soft Periwinkle', '#8d91c4'),
    color('Muted Teal', '#7499b4'),
    color('Slate Blue', '#7c8fb6'),
    color('Dusty Lavender', '#a195c6'),
    color('Powder Blue', '#95b7d0'),
    color('Cool Rose', '#9289bd'),
  ],
  'summer-light': [
    color('Pale Blue', '#c9d9e8'),
    color('Light Lavender', '#d5cfe8'),
    color('Icy Mint', '#d2e0e9'),
    color('Soft Sky', '#c7d9e6'),
    color('Pale Lilac', '#d8d4e8'),
    color('Light Aqua', '#cadae7'),
    color('Baby Blue', '#ccd9ea'),
  ],
  'summer-mute': [
    color('Muted Slate', '#8191a7'),
    color('Muted Blue-Grey', '#8a99a8'),
    color('Greyed Periwinkle', '#9797b4'),
    color('Smoky Teal', '#7e95a5'),
    color('Faded Denim', '#8b98b1'),
    color('Muted Lavender', '#a7a1ba'),
    color('Soft Steel', '#9caab4'),
  ],
  'winter-cool': [
    color('Royal Blue', '#1d41af'),
    color('Deep Teal', '#215a83'),
    color('Cool Plum', '#41288a'),
    color('Sapphire', '#1f4ba3'),
    color('Cool Cerulean', '#23578b'),
    color('Deep Violet', '#44279b'),
    color('Wintry Blue', '#202a97'),
  ],
  'winter-deep': [
    color('Midnight Blue', '#1d2e63'),
    color('Deep Navy', '#162d5a'),
    color('Deep Plum', '#36246b'),
    color('Dark Teal', '#244760'),
    color('Deep Indigo', '#2b2574'),
    color('Blackberry', '#3a2871'),
    color('Deep Sea', '#254d6a'),
  ],
  'winter-bright': [
    color('Electric Blue', '#145ff5'),
    color('Bright Cyan', '#0c8de9'),
    color('Bright Purple', '#450af5'),
    color('Bright Turquoise', '#0f92f0'),
    color('Vivid Violet', '#4e16f3'),
    color('Azure', '#1697f3'),
    color('Icy Blue', '#1e8af6'),
  ],
}

const NEUTRALS_BY_TYPE: Record<string, readonly PaletteColor[]> = {
  'spring-warm': [
    color('Warm Ivory', '#f4efe4'),
    color('Warm Beige', '#ddcdb5'),
    color('Golden Tan', '#cbb089'),
    color('Camel', '#c9a97e'),
  ],
  'spring-light': [
    color('Ivory', '#f7f2e7'),
    color('Cream', '#f2ead6'),
    color('Light Sand', '#ecdfc3'),
    color('Pale Peach', '#f6e3d4'),
  ],
  'spring-bright': [
    color('Clear Cream', '#f0dfa8'),
    color('Warm Ivory', '#f5e9c8'),
    color('Peach Cream', '#f3d9bd'),
    color('Light Amber', '#edc98a'),
  ],
  'summer-cool': [
    color('Icy Grey', '#c8d0da'),
    color('Cool Grey', '#b9c0c9'),
    color('Slate Mist', '#8a93a1'),
    color('Cool Taupe', '#9aa0ad'),
  ],
  'summer-light': [
    color('Icy White', '#f2f5f8'),
    color('Pale Grey', '#e4e8ee'),
    color('Light Blue Grey', '#d6dfe8'),
    color('Soft Snow', '#eef1f6'),
  ],
  'summer-mute': [
    color('Mist Grey', '#d5d8dc'),
    color('Cool Stone', '#bfc4ca'),
    color('Slate Mist', '#aab0b8'),
    color('Blue Grey', '#9aa3ad'),
  ],
  'autumn-warm': [
    color('Warm Taupe', '#a08b74'),
    color('Soft Camel', '#b39a77'),
    color('Sandstone', '#c2ad8c'),
    color('Warm Brown', '#7d5c3f'),
  ],
  'autumn-deep': [
    color('Espresso', '#3f2a1e'),
    color('Dark Cocoa', '#4a3223'),
    color('Deep Olive Brown', '#4c3d22'),
    color('Dark Chestnut', '#4e2f24'),
  ],
  'autumn-mute': [
    color('Greige', '#d9d2c6'),
    color('Warm Stone', '#c8bfae'),
    color('Soft Taupe', '#b7ab97'),
    color('Muted Sand', '#cfc6b4'),
  ],
  'winter-cool': [
    color('Cool Charcoal', '#3c4653'),
    color('Steel Blue Grey', '#6b7a8d'),
    color('Cool Slate', '#566374'),
    color('Deep Mist', '#4a5666'),
  ],
  'winter-deep': [
    color('Midnight', '#1d2434'),
    color('Charcoal Navy', '#232c3d'),
    color('Black Plum', '#2a2233'),
    color('Deep Slate', '#28323d'),
  ],
  'winter-bright': [
    color('Ice Blue', '#cfe4f7'),
    color('Cool Lilac', '#ddd4f2'),
    color('Pale Cyan', '#c8ecf2'),
    color('Bright Mist', '#d3e6fb'),
  ],
}

const WARM_WORST_BASE: readonly PaletteColor[] = [
  color('Icy Blue', '#bcd5e6'),
  color('Cool Magenta', '#9b4b9b'),
  color('Cool Grey', '#b0b6bf'),
  color('Silver', '#c9cccf'),
  color('Blue-Black', '#1c212c'),
]

const COOL_WORST_BASE: readonly PaletteColor[] = [
  color('Bright Orange', '#ea862e'),
  color('Mustard Yellow', '#e3bb1c'),
  color('Warm Camel', '#b9986e'),
  color('Rust', '#b64b2b'),
  color('Warm Red', '#d33122'),
]

const WARM_SUBSTITUTES: Record<string, readonly PaletteColor[]> = {
  'spring-warm': [
    color('Warm Peach', '#e8a473'),
    color('Coral', '#e27e5a'),
    color('Golden Yellow', '#e7b540'),
    color('Marigold', '#eaa52e'),
    color('Warm Red', '#dd442c'),
  ],
  'spring-light': [
    color('Soft Peach', '#edcab6'),
    color('Light Apricot', '#ecccac'),
    color('Pale Gold', '#eadbb8'),
    color('Cream Yellow', '#f0e2c2'),
    color('Light Coral', '#eabcae'),
  ],
  'spring-bright': [
    color('Vivid Orange', '#f9851f'),
    color('Bright Coral', '#f65931'),
    color('Sunny Yellow', '#fbba23'),
    color('Vivid Tangerine', '#f87a25'),
    color('Bright Gold', '#f4b625'),
  ],
  'autumn-warm': [
    color('Terracotta', '#c66339'),
    color('Burnt Orange', '#c66b2f'),
    color('Warm Gold', '#d0a339'),
    color('Cinnamon', '#b97131'),
    color('Amber Brown', '#cc8f33'),
  ],
  'autumn-deep': [
    color('Deep Rust', '#7a3c29'),
    color('Chocolate', '#654229'),
    color('Dark Gold', '#856c32'),
    color('Mahogany', '#6f332a'),
    color('Espresso', '#583928'),
  ],
  'autumn-mute': [
    color('Muted Clay', '#9f6e56'),
    color('Soft Camel', '#a78762'),
    color('Milk Tea', '#a58c69'),
    color('Faded Rust', '#906451'),
    color('Warm Taupe', '#9c7e63'),
  ],
}

const COOL_SUBSTITUTES: Record<string, readonly PaletteColor[]> = {
  'summer-cool': [
    color('Dusty Blue', '#7c9ec0'),
    color('Powder Blue', '#95b7d0'),
    color('Soft Periwinkle', '#8d91c4'),
    color('Muted Teal', '#7499b4'),
    color('Slate Blue', '#7c8fb6'),
  ],
  'summer-light': [
    color('Pale Blue', '#c9d9e8'),
    color('Soft Sky', '#c7d9e6'),
    color('Icy Mint', '#d2e0e9'),
    color('Light Lavender', '#d5cfe8'),
    color('Baby Blue', '#ccd9ea'),
  ],
  'summer-mute': [
    color('Muted Slate', '#8191a7'),
    color('Muted Blue-Grey', '#8a99a8'),
    color('Faded Denim', '#8b98b1'),
    color('Smoky Teal', '#7e95a5'),
    color('Soft Steel', '#9caab4'),
  ],
  'winter-cool': [
    color('Royal Blue', '#1d41af'),
    color('Sapphire', '#1f4ba3'),
    color('Deep Teal', '#215a83'),
    color('Cool Plum', '#41288a'),
    color('Wintry Blue', '#202a97'),
  ],
  'winter-deep': [
    color('Midnight Blue', '#1d2e63'),
    color('Deep Navy', '#162d5a'),
    color('Deep Sea', '#254d6a'),
    color('Deep Plum', '#36246b'),
    color('Deep Indigo', '#2b2574'),
  ],
  'winter-bright': [
    color('Electric Blue', '#145ff5'),
    color('Azure', '#1697f3'),
    color('Bright Cyan', '#0c8de9'),
    color('Icy Blue', '#1e8af6'),
    color('Vivid Violet', '#4e16f3'),
  ],
}

function buildWorst(
  base: readonly PaletteColor[],
  substitutes: readonly PaletteColor[],
): readonly WorstColor[] {
  return base.map((worst, index) => ({
    ...worst,
    substitute: substitutes[index] as PaletteColor,
  }))
}

function bestFor(typeId: string): readonly PaletteColor[] {
  return WARM_BEST[typeId] ?? (COOL_BEST[typeId] as readonly PaletteColor[])
}

function neutralFor(typeId: string): readonly PaletteColor[] {
  return NEUTRALS_BY_TYPE[typeId] as readonly PaletteColor[]
}

function isWarmSeasonType(typeId: string): boolean {
  return typeId in WARM_BEST
}

export const PALETTES: readonly Palette[] = TYPES.map((type) => {
  const warm = isWarmSeasonType(type.id)
  const worstBase = warm ? WARM_WORST_BASE : COOL_WORST_BASE
  const substitutes = warm ? WARM_SUBSTITUTES[type.id] : COOL_SUBSTITUTES[type.id]
  return {
    typeId: type.id,
    best: bestFor(type.id),
    worst: buildWorst(worstBase, substitutes as readonly PaletteColor[]),
    neutral: neutralFor(type.id),
  }
})

const PALETTE_BY_ID = new Map<string, Palette>(PALETTES.map((palette) => [palette.typeId, palette]))

export function getPalette(typeId: string): Palette | undefined {
  return PALETTE_BY_ID.get(typeId)
}

export function getAllPalettes(): readonly Palette[] {
  return PALETTES
}
