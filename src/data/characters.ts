import type { Localized } from '../i18n'

export type CharacterId =
  | 'gigi'
  | 'elli'
  | 'roary'
  | 'zeddy'
  | 'hoppy'
  | 'dino'
  | 'haal'
  | 'beni'

export interface Character {
  id: CharacterId
  name: string
  species: Localized
  babySpecies: Localized
  trait: Localized
  favoriteSnack: Localized
  snackIcon: string
  home: string
  accent: string
  /** demo QR code printed on the physical haalm product */
  code: string
}

export const CHARACTERS: Character[] = [
  {
    id: 'gigi',
    name: 'Gigi',
    species: { de: 'Giraffe', en: 'Giraffe' },
    babySpecies: { de: 'Baby-Giraffe', en: 'Baby Giraffe' },
    trait: { de: 'Neugierig & lieb', en: 'Curious & kind' },
    favoriteSnack: { de: 'Alpenblätter', en: 'Alpine Leaves' },
    snackIcon: 'leaf',
    home: 'flower-hill',
    accent: 'var(--honey)',
    code: 'HAALM-GIGI',
  },
  {
    id: 'elli',
    name: 'Elli',
    species: { de: 'Elefant', en: 'Elephant' },
    babySpecies: { de: 'Baby-Elefant', en: 'Baby Elephant' },
    trait: { de: 'Sanft & weise', en: 'Gentle & wise' },
    favoriteSnack: { de: 'Wiesengras', en: 'Meadow Grass' },
    snackIcon: 'flower',
    home: 'pond',
    accent: 'var(--lavender)',
    code: 'HAALM-ELLI',
  },
  {
    id: 'roary',
    name: 'Roary',
    species: { de: 'Löwe', en: 'Lion' },
    babySpecies: { de: 'Baby-Löwe', en: 'Baby Lion' },
    trait: { de: 'Mutig & warmherzig', en: 'Brave & warm' },
    favoriteSnack: { de: 'Honigflocken', en: 'Honey Oats' },
    snackIcon: 'sparkle',
    home: 'mountain-trail',
    accent: 'var(--honey)',
    code: 'HAALM-ROARY',
  },
  {
    id: 'zeddy',
    name: 'Zeddy',
    species: { de: 'Zebra', en: 'Zebra' },
    babySpecies: { de: 'Baby-Zebra', en: 'Baby Zebra' },
    trait: { de: 'Verspielt & flink', en: 'Playful & quick' },
    favoriteSnack: { de: 'Beerenmix', en: 'Berry Mix' },
    snackIcon: 'apple',
    home: 'berry-forest',
    accent: 'var(--sky)',
    code: 'HAALM-ZEDDY',
  },
  {
    id: 'hoppy',
    name: 'Hoppy',
    species: { de: 'Nilpferd', en: 'Hippo' },
    babySpecies: { de: 'Baby-Nilpferd', en: 'Baby Hippo' },
    trait: { de: 'Ruhig & kuschelig', en: 'Calm & cuddly' },
    favoriteSnack: { de: 'Seerosen', en: 'Water Lilies' },
    snackIcon: 'drop',
    home: 'pond',
    accent: 'var(--lavender)',
    code: 'HAALM-HOPPY',
  },
  {
    id: 'dino',
    name: 'Dino',
    species: { de: 'Dinosaurier', en: 'Dinosaur' },
    babySpecies: { de: 'Baby-Dino', en: 'Baby Dinosaur' },
    trait: { de: 'Kühn & albern', en: 'Bold & silly' },
    favoriteSnack: { de: 'Farnsalat', en: 'Fern Salad' },
    snackIcon: 'leaf',
    home: 'berry-forest',
    accent: 'var(--meadow)',
    code: 'HAALM-DINO',
  },
  {
    id: 'haal',
    name: 'Haal',
    species: { de: 'Aal', en: 'Eel' },
    babySpecies: { de: 'Baby-Aal', en: 'Baby Eel' },
    trait: { de: 'Verträumt & geschmeidig', en: 'Dreamy & smooth' },
    favoriteSnack: { de: 'Teichperlen', en: 'Pond Pearls' },
    snackIcon: 'drop',
    home: 'pond',
    accent: 'var(--sky)',
    code: 'HAALM-HAAL',
  },
  {
    id: 'beni',
    name: 'Beni',
    species: { de: 'Bär', en: 'Bear' },
    babySpecies: { de: 'Baby-Bär', en: 'Baby Bear' },
    trait: { de: 'Gemütlich & treu', en: 'Cozy & loyal' },
    favoriteSnack: { de: 'Wilder Honig', en: 'Wild Honey' },
    snackIcon: 'sparkle',
    home: 'cozy-cabin',
    accent: 'var(--honey)',
    code: 'HAALM-BENI',
  },
]

export const characterById = (id: string): Character =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]

export const characterByCode = (code: string): Character | undefined =>
  CHARACTERS.find((c) => c.code === code.trim().toUpperCase())

export const spriteSrc = (id: CharacterId, stage: 'baby' | 'grown') =>
  `/haalm/characters/${id}/${stage}.png`

export const portraitSrc = (id: CharacterId) => `/haalm/characters/${id}/portrait.png`

/** total roster size shown in the herd counter — matches "8 / 24 unlocked" */
export const ROSTER_SIZE = 24
