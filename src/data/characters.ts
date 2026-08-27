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
  species: string
  babySpecies: string
  trait: string
  favoriteSnack: string
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
    species: 'Giraffe',
    babySpecies: 'Baby Giraffe',
    trait: 'Curious & kind',
    favoriteSnack: 'Alpine Leaves',
    snackIcon: 'leaf',
    home: 'Flower Hill',
    accent: 'var(--honey)',
    code: 'HAALM-GIGI',
  },
  {
    id: 'elli',
    name: 'Elli',
    species: 'Elephant',
    babySpecies: 'Baby Elephant',
    trait: 'Gentle & wise',
    favoriteSnack: 'Meadow Grass',
    snackIcon: 'flower',
    home: 'Pond',
    accent: 'var(--lavender)',
    code: 'HAALM-ELLI',
  },
  {
    id: 'roary',
    name: 'Roary',
    species: 'Lion',
    babySpecies: 'Baby Lion',
    trait: 'Brave & warm',
    favoriteSnack: 'Honey Oats',
    snackIcon: 'sparkle',
    home: 'Mountain Trail',
    accent: 'var(--honey)',
    code: 'HAALM-ROARY',
  },
  {
    id: 'zeddy',
    name: 'Zeddy',
    species: 'Zebra',
    babySpecies: 'Baby Zebra',
    trait: 'Playful & quick',
    favoriteSnack: 'Berry Mix',
    snackIcon: 'apple',
    home: 'Berry Forest',
    accent: 'var(--sky)',
    code: 'HAALM-ZEDDY',
  },
  {
    id: 'hoppy',
    name: 'Hoppy',
    species: 'Hippo',
    babySpecies: 'Baby Hippo',
    trait: 'Calm & cuddly',
    favoriteSnack: 'Water Lilies',
    snackIcon: 'drop',
    home: 'Pond',
    accent: 'var(--lavender)',
    code: 'HAALM-HOPPY',
  },
  {
    id: 'dino',
    name: 'Dino',
    species: 'Dinosaur',
    babySpecies: 'Baby Dinosaur',
    trait: 'Bold & silly',
    favoriteSnack: 'Fern Salad',
    snackIcon: 'leaf',
    home: 'Berry Forest',
    accent: 'var(--meadow)',
    code: 'HAALM-DINO',
  },
  {
    id: 'haal',
    name: 'Haal',
    species: 'Eel',
    babySpecies: 'Baby Eel',
    trait: 'Dreamy & smooth',
    favoriteSnack: 'Pond Pearls',
    snackIcon: 'drop',
    home: 'Pond',
    accent: 'var(--sky)',
    code: 'HAALM-HAAL',
  },
  {
    id: 'beni',
    name: 'Beni',
    species: 'Bear',
    babySpecies: 'Baby Bear',
    trait: 'Cozy & loyal',
    favoriteSnack: 'Wild Honey',
    snackIcon: 'sparkle',
    home: 'Cozy Cabin',
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
