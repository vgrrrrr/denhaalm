import type { Localized } from '../i18n'
import type { CharacterId } from './characters'

export type AccessoryId = 'gigi-scarf' | 'round-hat' | 'round-glasses' | 'soft-bow' | 'little-bag'

export interface Accessory {
  id: AccessoryId
  name: Localized
  price: number
  asset: string
  /** normalized preview anchor; final per-species anchors arrive with the production atlas */
  anchor: 'head' | 'neck' | 'back'
  /** optional species restriction for a character-specific accessory */
  allowedFor?: CharacterId[]
}

export const ACCESSORIES: Accessory[] = [
  {
    id: 'gigi-scarf',
    name: { de: 'Gigis Schal', en: "Gigi's scarf" },
    price: 8,
    asset: '/haalm/ui/runtime/accessories/gigi-scarf.png',
    anchor: 'neck',
    allowedFor: ['gigi'],
  },
  {
    id: 'round-hat',
    name: { de: 'Runder Hut', en: 'Round hat' },
    price: 10,
    asset: '/haalm/ui/runtime/accessories/round-hat.png',
    anchor: 'head',
  },
  {
    id: 'round-glasses',
    name: { de: 'Runde Brille', en: 'Round glasses' },
    price: 12,
    asset: '/haalm/ui/runtime/accessories/round-glasses.png',
    anchor: 'head',
  },
  {
    id: 'soft-bow',
    name: { de: 'Weiche Schleife', en: 'Soft bow' },
    price: 7,
    asset: '/haalm/ui/runtime/accessories/soft-bow.png',
    anchor: 'head',
  },
  {
    id: 'little-bag',
    name: { de: 'Kleine Tasche', en: 'Little bag' },
    price: 14,
    asset: '/haalm/ui/runtime/accessories/little-bag.png',
    anchor: 'back',
  },
]

export const accessoryById = (id: string) => ACCESSORIES.find((item) => item.id === id)
