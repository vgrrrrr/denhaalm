import { type CharacterId } from './characters'

export const DEFAULT_FOOD_PRICE = 2
export const MEDICINE_PRICE = 6
export const LEARNING_REWARD = 2
export const ANIMAL_UNLOCK_PRICE = 24

/**
 * A single food inventory remains deliberately universal in V1. The table
 * still makes the price contract explicit per animal so real food variants can
 * be introduced later without silently changing the care flow.
 */
export const FOOD_PRICE_BY_CHARACTER: Record<CharacterId, number> = {
  gigi: 2,
  beni: 2,
  elli: 2,
  roary: 2,
  zeddy: 2,
  hoppy: 2,
  dino: 2,
  haal: 2,
}

export const foodPriceFor = (id?: CharacterId | null) =>
  id ? FOOD_PRICE_BY_CHARACTER[id] : DEFAULT_FOOD_PRICE
