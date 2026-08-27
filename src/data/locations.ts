export interface AlmLocation {
  id: string
  name: string
  description: string
  /** percentage coordinates relative to the full alm map image */
  x: number
  y: number
  boost: 'happiness' | 'energy' | 'hunger'
}

export const ALM_LOCATIONS: AlmLocation[] = [
  {
    id: 'cloud-peak',
    name: 'Cloud Peak',
    description: 'The highest point of the Haalm — soft clouds and quiet views.',
    x: 49,
    y: 13,
    boost: 'energy',
  },
  {
    id: 'mountain-trail',
    name: 'Mountain Trail',
    description: 'A winding path with wildflowers along the way.',
    x: 52,
    y: 29,
    boost: 'happiness',
  },
  {
    id: 'berry-forest',
    name: 'Berry Forest',
    description: 'Sweet berries hide between the trees here.',
    x: 28,
    y: 44,
    boost: 'hunger',
  },
  {
    id: 'flower-hill',
    name: 'Flower Hill',
    description: 'A gentle hill covered in daisies — Gigi’s favorite spot.',
    x: 67,
    y: 53,
    boost: 'happiness',
  },
  {
    id: 'cozy-cabin',
    name: 'Cozy Cabin',
    description: 'A warm little hut for naps on rainy days.',
    x: 37,
    y: 69,
    boost: 'energy',
  },
  {
    id: 'pond',
    name: 'Pond',
    description: 'Still water, dragonflies, and a very relaxed eel.',
    x: 62,
    y: 79,
    boost: 'happiness',
  },
]

export const locationById = (id: string) => ALM_LOCATIONS.find((l) => l.id === id)
