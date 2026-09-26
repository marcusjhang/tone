export const STYLING_CATEGORIES = [
  'fashion',
  'makeup',
  'hair',
  'jewelry',
  'glasses',
  'nails',
] as const

export type StylingCategory = (typeof STYLING_CATEGORIES)[number]

export type StylingGuidance = {
  readonly [Category in StylingCategory]: string
}

export const STYLING: Readonly<Record<string, StylingGuidance>> = {
  'spring-warm': {
    fashion:
      'Try warm, clear tones next to your face, such as coral, peach, camel and warm gold. Keep contrast medium and choose simple, clean patterns.',
    makeup:
      'A warm peach or coral blush and a soft warm lip work well. Match your foundation to a warm undertone and keep eyeshadow in warm neutrals.',
    hair: 'Warm golden, honey brown and caramel shades suit you. Steer away from ashy or blue-black tones.',
    jewelry: 'Warm gold is your primary metal, with rose gold as a good runner-up.',
    glasses:
      'Choose warm tortoiseshell, honey or camel frames in a light-to-medium thickness, and a warm lens tint works well.',
    nails: 'Warm coral, peach, warm red and creamy warm nude shades are easy picks.',
  },
  'spring-light': {
    fashion:
      'Reach for light, warm pastels such as soft peach, apricot, pale gold and cream. Keep contrast gentle and patterns small.',
    makeup:
      'A light peach blush and a soft warm pink or sheer coral lip keep the look light. Choose a warm, light foundation shade.',
    hair: 'Light warm golden and honey shades suit you. Avoid very dark or ashy tones.',
    jewelry: 'Gold is your primary metal, and a light rose gold also works.',
    glasses:
      'Pick light warm frames such as pale tortoiseshell, honey or cream in a thin-to-medium shape, with a light lens tint.',
    nails: 'Soft peach, light warm nude and pale coral shades are good choices.',
  },
  'spring-bright': {
    fashion:
      'Use clear, warm, saturated colors such as bright coral, vivid orange and sunny yellow. Medium-to-high contrast and larger, cleaner patterns work well.',
    makeup:
      'A clear warm coral or bright peach blush and a vivid warm lip suit you. Keep your foundation in a warm undertone.',
    hair: 'Warm golden browns with bright caramel or copper highlights suit you. Skip ashy or greyed tones.',
    jewelry: 'Polished gold is the primary metal, with polished rose gold as the runner-up.',
    glasses:
      'Try clear warm tortoiseshell or bright warm frames in a medium thickness with a clean lens.',
    nails: 'Bright coral, vivid warm red, tangerine and clear warm pink are good options.',
  },
  'summer-cool': {
    fashion:
      'Choose cool, softened tones such as dusty blue, slate blue, muted teal and soft periwinkle. Keep contrast low-to-medium and patterns soft.',
    makeup:
      'A dusty rose or cool berry blush and a soft cool lip work well. Match your foundation to a cool or neutral undertone.',
    hair: 'Cool ash brown, soft cool black and cool burgundy suit you. Avoid warm copper and golden tones.',
    jewelry: 'Silver is your primary metal, with white gold as a good runner-up.',
    glasses:
      'Pick cool grey, slate blue or soft navy frames in a light-to-medium thickness with a neutral lens.',
    nails: 'Dusty blue, soft berry, cool mauve and muted rose are easy picks.',
  },
  'summer-light': {
    fashion:
      'Reach for light, cool pastels such as pale blue, icy mint, soft lavender and powder blue. Keep contrast gentle and patterns small.',
    makeup:
      'A soft cool pink blush and a light cool rose or sheer berry lip keep the look light. Choose a cool, light foundation.',
    hair: 'Light cool ash brown and soft cool blonde shades suit you. Avoid warm golden and deep dark tones.',
    jewelry: 'Silver is your primary metal, and a light white gold also works.',
    glasses:
      'Choose light cool frames such as pale grey, soft blue or light silver in a thin shape, with a light lens tint.',
    nails: 'Pale blue, soft lilac, cool pink and icy grey shades are good choices.',
  },
  'summer-mute': {
    fashion:
      'Stay with muted, cool tones such as greyed blue, soft steel, faded denim and smoky teal. Keep contrast low and patterns subtle.',
    makeup:
      'A muted cool rose or soft berry blush and a muted cool lip suit you. Choose a cool or neutral foundation undertone.',
    hair: 'Cool ash brown and soft muted cool shades suit you. Steer away from bright warm or high-shine tones.',
    jewelry:
      'Brushed silver or matte white gold is the primary metal. Keep finishes soft rather than highly polished.',
    glasses:
      'Try matte cool grey, soft navy or muted blue frames in a light-to-medium thickness with a neutral lens.',
    nails: 'Muted grey, dusty rose, soft steel blue and greige are good options.',
  },
  'autumn-warm': {
    fashion:
      'Choose warm, earthy tones such as terracotta, burnt orange, mustard and warm gold. Keep contrast medium and patterns natural.',
    makeup:
      'A warm terracotta or brick blush and a warm brick or cinnamon lip work well. Match your foundation to a warm undertone.',
    hair: 'Warm chestnut, copper and golden brown shades suit you. Avoid ashy or blue-black tones.',
    jewelry:
      'Warm gold, including antique or matte gold, is your primary metal, with bronze as a runner-up.',
    glasses:
      'Pick warm tortoiseshell, olive or amber frames in a medium thickness with a warm lens tint.',
    nails: 'Terracotta, warm brick, mustard and warm olive are easy picks.',
  },
  'autumn-deep': {
    fashion:
      'Use deep, warm, muted tones such as chocolate, deep rust, mahogany and dark gold. Keep contrast medium-to-high and patterns richer.',
    makeup:
      'A deep warm berry or brick blush and a deep warm brown or brick lip suit you. Choose a warm foundation undertone.',
    hair: 'Deep warm brown, chestnut and rich copper suit you. Skip pale ashy or bleached tones.',
    jewelry: 'Antique gold or bronze is the primary metal, with deep copper as the runner-up.',
    glasses:
      'Try dark tortoiseshell, deep olive or rich brown frames in a medium thickness with a warm lens tint.',
    nails: 'Deep brick, dark chocolate, mahogany and dark warm gold are good options.',
  },
  'autumn-mute': {
    fashion:
      'Choose warm, softened tones such as muted clay, soft camel, milk tea and faded rust. Keep contrast low and patterns natural.',
    makeup:
      'A muted warm rose or soft clay blush and a muted brick or warm nude lip work well. Match a warm or neutral undertone.',
    hair: 'Soft warm brown and muted chestnut shades suit you. Avoid bright warm or high-shine tones.',
    jewelry:
      'Brushed gold or matte bronze is the primary metal. Keep finishes soft rather than highly polished.',
    glasses:
      'Pick muted warm frames such as soft tortoiseshell, taupe or olive in a light-to-medium thickness with a neutral lens.',
    nails: 'Muted clay, warm taupe, soft brick and muted olive are easy picks.',
  },
  'winter-cool': {
    fashion:
      'Use cool, clear, deep tones such as royal blue, sapphire, cool plum and deep teal. Keep contrast high and patterns crisp.',
    makeup:
      'A cool berry or plum blush and a clear cool red or berry lip suit you. Choose a cool foundation undertone.',
    hair: 'Cool black, cool dark brown and cool burgundy suit you. Skip warm golden and orange tones.',
    jewelry: 'Polished silver or platinum is the primary metal, with white gold as the runner-up.',
    glasses: 'Try black, cool navy or deep berry frames in a medium thickness with a clean lens.',
    nails: 'Cool red, deep berry, sapphire and cool plum are good options.',
  },
  'winter-deep': {
    fashion:
      'Choose deep, cool tones such as midnight blue, deep navy, deep plum and dark teal. Keep contrast high and patterns clean.',
    makeup:
      'A deep cool berry or plum blush and a deep cool red or wine lip work well. Match a cool foundation undertone.',
    hair: 'Cool black and deep cool brown shades suit you. Avoid warm golden and copper tones.',
    jewelry: 'Polished silver or platinum is the primary metal, with gunmetal as a runner-up.',
    glasses: 'Pick black, deep navy or charcoal frames in a medium thickness with a clean lens.',
    nails: 'Deep wine, cool navy, dark plum and cool charcoal are easy picks.',
  },
  'winter-bright': {
    fashion:
      'Use clear, cool, saturated colors such as electric blue, bright cyan, vivid violet and azure. Keep contrast high and patterns crisp.',
    makeup:
      'A clear cool pink or fuchsia blush and a vivid cool red or berry lip suit you. Choose a cool foundation undertone.',
    hair: 'Cool black with cool blue-black or burgundy shine suits you. Skip warm golden and copper tones.',
    jewelry:
      'Polished silver or platinum is the primary metal, with polished white gold as the runner-up.',
    glasses:
      'Try black, clear cool blue or bright cool frames in a medium thickness with a clean lens.',
    nails: 'Bright cool pink, vivid red, electric blue and clear violet are good options.',
  },
}

export function getStyling(typeId: string): StylingGuidance | undefined {
  return STYLING[typeId]
}

export function getAllStyling(): Readonly<Record<string, StylingGuidance>> {
  return STYLING
}
