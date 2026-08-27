import type { Localized } from '../i18n'

export interface AlmLocation {
  id: string
  name: Localized
  description: Localized
  /** percentage coordinates relative to the full alm map image */
  x: number
  y: number
  boost: 'happiness' | 'energy' | 'hunger'
}

export const ALM_LOCATIONS: AlmLocation[] = [
  {
    id: 'cloud-peak',
    name: { de: 'Wolkengipfel', en: 'Cloud Peak' },
    description: {
      de: 'Der höchste Punkt der Haalm — weiche Wolken und stille Aussicht.',
      en: 'The highest point of the Haalm — soft clouds and quiet views.',
    },
    x: 49,
    y: 13,
    boost: 'energy',
  },
  {
    id: 'mountain-trail',
    name: { de: 'Bergpfad', en: 'Mountain Trail' },
    description: {
      de: 'Ein gewundener Pfad mit Wildblumen am Wegesrand.',
      en: 'A winding path with wildflowers along the way.',
    },
    x: 52,
    y: 29,
    boost: 'happiness',
  },
  {
    id: 'berry-forest',
    name: { de: 'Beerenwald', en: 'Berry Forest' },
    description: {
      de: 'Zwischen den Bäumen verstecken sich süße Beeren.',
      en: 'Sweet berries hide between the trees here.',
    },
    x: 28,
    y: 44,
    boost: 'hunger',
  },
  {
    id: 'flower-hill',
    name: { de: 'Blumenhügel', en: 'Flower Hill' },
    description: {
      de: 'Ein sanfter Hügel voller Gänseblümchen — Gigis Lieblingsplatz.',
      en: 'A gentle hill covered in daisies — Gigi’s favorite spot.',
    },
    x: 67,
    y: 53,
    boost: 'happiness',
  },
  {
    id: 'cozy-cabin',
    name: { de: 'Gemütliche Hütte', en: 'Cozy Cabin' },
    description: {
      de: 'Eine warme kleine Hütte für Nickerchen an Regentagen.',
      en: 'A warm little hut for naps on rainy days.',
    },
    x: 37,
    y: 69,
    boost: 'energy',
  },
  {
    id: 'pond',
    name: { de: 'Teich', en: 'Pond' },
    description: {
      de: 'Stilles Wasser, Libellen und ein sehr entspannter Aal.',
      en: 'Still water, dragonflies, and a very relaxed eel.',
    },
    x: 62,
    y: 79,
    boost: 'happiness',
  },
]

export const locationById = (id: string) => ALM_LOCATIONS.find((l) => l.id === id)
