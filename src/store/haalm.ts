import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { characterById, type AgeStage, type CharacterId, type PortraitState } from '../data/characters'
import { accessoryById, type AccessoryId } from '../data/accessories'
import { ANIMAL_UNLOCK_PRICE, foodPriceFor, LEARNING_REWARD, MEDICINE_PRICE } from '../data/economy'

/* ---------------------------------------------------------------- types */

export interface PetState {
  id: CharacterId
  unlockedAt: number
  xp: number
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
  sleeping: boolean
  sleepStart: number | null
  lastTick: number
  location: string
  /** timestamps for gentle cooldowns */
  lastFed: number
  lastCuddled: number
  lastVisit: number
  health: HealthState
  sickSince: number | null
  recoveringUntil: number | null
  lastMedicineAt: number | null
  lastMeaningfulCareAt: number
}

export type HealthState = 'healthy' | 'sick' | 'recovering'

export interface GameRecord {
  best: number
  plays: number
}

interface HaalmStore {
  onboarded: boolean
  pets: Partial<Record<CharacterId, PetState>>
  activePet: CharacterId | null
  treats: number
  /** Universal soft currency for the Alm economy. Kept separate from treats so
   * existing saved demos remain compatible while the shop is rolled out. */
  coins: number
  medicine: number
  ownedAccessories: AccessoryId[]
  equippedAccessories: Partial<Record<CharacterId, AccessoryId>>
  hearts: number
  lastDailyBonus: string
  streak: number
  games: Record<string, GameRecord>
  /** highest level already celebrated per pet (level-up / evolution overlays) */
  celebrated: Partial<Record<CharacterId, number>>
  soundOn: boolean
  childSafe: boolean
  notificationsOn: boolean
  language: 'de' | 'en'
  learningProgress: string[]
  arrivalPet: CharacterId | null
  parentUnlockedUntil: number

  completeOnboarding: () => void
  unlockPet: (id: CharacterId) => void
  buyPet: (id: CharacterId) => boolean
  tick: () => void
  feed: (id: CharacterId) => boolean
  buyFood: (quantity?: number, petId?: CharacterId | null) => boolean
  buyMedicine: () => boolean
  healPet: (id: CharacterId) => boolean
  buyAccessory: (id: AccessoryId) => boolean
  equipAccessory: (petId: CharacterId, id: AccessoryId | null) => void
  clean: (id: CharacterId) => void
  cuddle: (id: CharacterId) => void
  toggleSleep: (id: CharacterId) => void
  visit: (id: CharacterId, locationId: string, boost: 'happiness' | 'energy' | 'hunger') => void
  finishGame: (gameId: string, score: number, petId: CharacterId | null) => GameReward
  claimDailyBonus: () => number
  markCelebrated: (id: CharacterId, level: number) => void
  setSetting: (key: 'soundOn' | 'childSafe' | 'notificationsOn', value: boolean) => void
  setLanguage: (lang: 'de' | 'en') => void
  setActivePet: (id: CharacterId) => void
  completeLesson: (id: string) => boolean
  acknowledgeArrival: () => void
  unlockParent: () => void
  resetAll: () => void
}

export interface GameReward {
  treats: number
  coins: number
  hearts: number
  xp: number
  newBest: boolean
}

/* ------------------------------------------------------------- leveling */

/** xp needed to go from level `l` to `l + 1` */
export const xpForNext = (level: number) => 40 + level * 20

export const levelFromXp = (xp: number) => {
  let level = 1
  let rest = xp
  while (rest >= xpForNext(level) && level < 30) {
    rest -= xpForNext(level)
    level += 1
  }
  return { level, into: rest, needed: xpForNext(level) }
}

export const GROWN_LEVEL = 8
export const MIDDLE_LEVEL = 4

export const stageOf = (pet: PetState): AgeStage => {
  const level = levelFromXp(pet.xp).level
  if (level >= GROWN_LEVEL) return 'adult'
  if (level >= MIDDLE_LEVEL) return 'middle'
  return 'young'
}

export const portraitStateOf = (pet: PetState): PortraitState => {
  if (pet.health === 'sick') return 'sick'
  if (pet.sleeping) return 'asleep'
  if (pet.energy < 30) return 'tired'
  if (pet.happiness < 35 || pet.hunger < 25) return 'sad'
  if (pet.happiness > 75 && pet.hunger > 50) return 'happy'
  return 'neutral'
}

export type MoodKey =
  | 'mood.sick'
  | 'mood.recovering'
  | 'mood.sleeping'
  | 'mood.hungry'
  | 'mood.sleepy'
  | 'mood.bath'
  | 'mood.lonely'
  | 'mood.veryhappy'
  | 'mood.content'

export const moodOf = (pet: PetState): MoodKey => {
  if (pet.health === 'sick') return 'mood.sick'
  if (pet.health === 'recovering') return 'mood.recovering'
  if (pet.sleeping) return 'mood.sleeping'
  if (pet.hunger < 30) return 'mood.hungry'
  if (pet.energy < 30) return 'mood.sleepy'
  if (pet.cleanliness < 30) return 'mood.bath'
  if (pet.happiness < 35) return 'mood.lonely'
  if (pet.happiness > 75 && pet.hunger > 60) return 'mood.veryhappy'
  return 'mood.content'
}

export const daysTogether = (pet: PetState) =>
  Math.max(1, Math.floor((Date.now() - pet.unlockedAt) / 86400000) + 1)

/* ---------------------------------------------------------------- decay */

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/** stat drift per hour of real time */
const DECAY = { hunger: 5, happiness: 3.5, energy: 3, cleanliness: 4 }
/** energy recovered per hour of sleep */
const SLEEP_REGEN = 22
const ILLNESS_AFTER = 48 * 3600000

const normalizePet = (pet: PetState, now = Date.now()): PetState => ({
  ...pet,
  health: pet.health ?? 'healthy',
  sickSince: pet.sickSince ?? null,
  recoveringUntil: pet.recoveringUntil ?? null,
  lastMedicineAt: pet.lastMedicineAt ?? null,
  // Existing saves must never become ill merely because the schema changed.
  lastMeaningfulCareAt: pet.lastMeaningfulCareAt ?? now,
})

const applyTime = (pet: PetState, now: number): PetState => {
  const hours = Math.max(0, (now - pet.lastTick) / 3600000)
  if (hours <= 0) return pet
  const next = { ...normalizePet(pet, now), lastTick: now }
  next.hunger = clamp(next.hunger - DECAY.hunger * hours)
  next.happiness = clamp(next.happiness - DECAY.happiness * hours)
  next.cleanliness = clamp(next.cleanliness - DECAY.cleanliness * hours)
  if (next.sleeping) {
    next.energy = clamp(next.energy + SLEEP_REGEN * hours)
    if (next.energy >= 100) {
      next.sleeping = false
      next.sleepStart = null
    }
  } else {
    next.energy = clamp(next.energy - DECAY.energy * hours)
  }
  if (next.health === 'recovering' && next.recoveringUntil && now >= next.recoveringUntil) {
    next.health = 'healthy'
    next.recoveringUntil = null
  }
  const seriouslyNeglected = next.hunger < 22 || next.cleanliness < 22
  if (
    next.health === 'healthy' &&
    seriouslyNeglected &&
    now - next.lastMeaningfulCareAt >= ILLNESS_AFTER
  ) {
    next.health = 'sick'
    next.sickSince = now
    next.sleeping = false
    next.sleepStart = null
  }
  return next
}

const newPet = (id: CharacterId): PetState => ({
  id,
  unlockedAt: Date.now(),
  xp: 0,
  hunger: 62,
  happiness: 70,
  energy: 78,
  cleanliness: 80,
  sleeping: false,
  sleepStart: null,
  lastTick: Date.now(),
  location: characterById(id).home,
  lastFed: 0,
  lastCuddled: 0,
  lastVisit: 0,
  health: 'healthy',
  sickSince: null,
  recoveringUntil: null,
  lastMedicineAt: null,
  lastMeaningfulCareAt: Date.now(),
})

const todayKey = () => new Date().toISOString().slice(0, 10)

/* ---------------------------------------------------------------- store */

export const useHaalm = create<HaalmStore>()(
  persist(
    (set, get) => ({
      onboarded: false,
      pets: {},
      activePet: null,
      treats: 5,
      coins: 8,
      medicine: 0,
      ownedAccessories: [],
      equippedAccessories: {},
      hearts: 0,
      lastDailyBonus: '',
      streak: 0,
      games: {},
      celebrated: {},
      soundOn: true,
      childSafe: true,
      notificationsOn: false,
      language: 'de',
      learningProgress: [],
      arrivalPet: null,
      parentUnlockedUntil: 0,

      completeOnboarding: () =>
        set((s) => {
          if (Object.keys(s.pets).length > 0) return { onboarded: true }
          const gigi = newPet('gigi')
          const beni = newPet('beni')
          return {
            onboarded: true,
            pets: { gigi, beni },
            activePet: 'gigi',
            // Two welcoming friends should be immediately playable.
            treats: Math.max(s.treats, 8),
            coins: Math.max(s.coins, 8),
            celebrated: { ...s.celebrated, gigi: 1, beni: 1 },
          }
        }),

      unlockPet: (id) =>
        set((s) => {
          if (s.pets[id]) return { activePet: id }
          return {
            pets: { ...s.pets, [id]: newPet(id) },
            activePet: id,
            treats: s.treats + 3,
            celebrated: { ...s.celebrated, [id]: 1 },
            arrivalPet: id,
          }
        }),

      buyPet: (id) => {
        const s = get()
        if (s.pets[id]) {
          set({ activePet: id })
          return true
        }
        const balance = s.coins ?? 0
        if (balance < ANIMAL_UNLOCK_PRICE) return false
        set({
          coins: balance - ANIMAL_UNLOCK_PRICE,
          pets: { ...s.pets, [id]: newPet(id) },
          activePet: id,
          celebrated: { ...s.celebrated, [id]: 1 },
          arrivalPet: id,
        })
        return true
      },

      tick: () =>
        set((s) => {
          const now = Date.now()
          const pets: Partial<Record<CharacterId, PetState>> = {}
          for (const [k, p] of Object.entries(s.pets)) {
            pets[k as CharacterId] = applyTime(p as PetState, now)
          }
          return { pets }
        }),

      feed: (id) => {
        const s = get()
        const pet = s.pets[id]
        if (!pet || s.treats < 1 || pet.sleeping || normalizePet(pet).health !== 'healthy') return false
        set({
          treats: s.treats - 1,
          pets: {
            ...s.pets,
            [id]: {
              ...pet,
              hunger: clamp(pet.hunger + 16),
              happiness: clamp(pet.happiness + 3),
              xp: pet.xp + 6,
              lastFed: Date.now(),
              lastMeaningfulCareAt: Date.now(),
            },
          },
        })
        return true
      },

      buyFood: (quantity = 1, petId = null) => {
        const amount = Math.max(1, Math.floor(quantity))
        const cost = amount * foodPriceFor(petId)
        const s = get()
        const balance = s.coins ?? 0
        if (balance < cost) return false
        set({ coins: balance - cost, treats: s.treats + amount })
        return true
      },

      buyMedicine: () => {
        const s = get()
        const balance = s.coins ?? 0
        if (balance < MEDICINE_PRICE) return false
        set({ coins: balance - MEDICINE_PRICE, medicine: (s.medicine ?? 0) + 1 })
        return true
      },

      healPet: (id) => {
        const s = get()
        const pet = s.pets[id]
        if (!pet || normalizePet(pet).health !== 'sick' || (s.medicine ?? 0) < 1) return false
        const now = Date.now()
        set({
          medicine: s.medicine - 1,
          pets: {
            ...s.pets,
            [id]: {
              ...normalizePet(pet, now),
              health: 'recovering',
              recoveringUntil: now + 1200,
              lastMedicineAt: now,
              lastMeaningfulCareAt: now,
              hunger: Math.max(40, pet.hunger),
              cleanliness: Math.max(50, pet.cleanliness),
              happiness: Math.max(50, pet.happiness),
            },
          },
        })
        if (typeof window !== 'undefined') window.setTimeout(() => get().tick(), 1250)
        return true
      },

      buyAccessory: (id) => {
        const item = accessoryById(id)
        if (!item) return false
        const s = get()
        const owned = s.ownedAccessories ?? []
        if (owned.includes(id)) return true
        const balance = s.coins ?? 0
        if (balance < item.price) return false
        set({ coins: balance - item.price, ownedAccessories: [...owned, id] })
        return true
      },

      equipAccessory: (petId, id) =>
        set((s) => {
          const item = id ? accessoryById(id) : undefined
          if (item?.allowedFor && !item.allowedFor.includes(petId)) return s
          return {
            equippedAccessories: id
              ? { ...s.equippedAccessories, [petId]: id }
              : Object.fromEntries(Object.entries(s.equippedAccessories ?? {}).filter(([key]) => key !== petId)),
          }
        }),

      clean: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet || normalizePet(pet).health !== 'healthy') return s
          return {
            pets: {
              ...s.pets,
              [id]: {
                ...pet,
                cleanliness: clamp(pet.cleanliness + 28),
                xp: pet.xp + 4,
                lastMeaningfulCareAt: Date.now(),
              },
            },
          }
        }),

      cuddle: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet || normalizePet(pet).health !== 'healthy') return s
          const bonus = Date.now() - pet.lastCuddled > 60000 ? 5 : 1
          return {
            hearts: s.hearts + 1,
            pets: {
              ...s.pets,
              [id]: {
                ...pet,
                happiness: clamp(pet.happiness + 10),
                xp: pet.xp + bonus,
                lastCuddled: Date.now(),
                lastMeaningfulCareAt: Date.now(),
              },
            },
          }
        }),

      toggleSleep: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet || normalizePet(pet).health !== 'healthy') return s
          const sleeping = !pet.sleeping
          return {
            pets: {
              ...s.pets,
              [id]: {
                ...pet,
                sleeping,
                sleepStart: sleeping ? Date.now() : null,
                energy: sleeping ? pet.energy : clamp(pet.energy + 6),
                lastTick: Date.now(),
                lastMeaningfulCareAt: Date.now(),
              },
            },
          }
        }),

      visit: (id, locationId, boost) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet || normalizePet(pet).health !== 'healthy') return s
          const fresh = Date.now() - pet.lastVisit > 90000
          const boosted = { ...pet, location: locationId, lastVisit: Date.now(), lastMeaningfulCareAt: Date.now() }
          if (fresh) {
            boosted[boost] = clamp(boosted[boost] + 8)
            boosted.xp += 3
          }
          return { pets: { ...s.pets, [id]: boosted } }
        }),

      finishGame: (gameId, score, petId) => {
        const s = get()
        const record = s.games[gameId] ?? { best: 0, plays: 0 }
        const newBest = score > record.best
        const treats = 0
        const coins = Math.min(12, 2 + Math.floor(score / 2))
        const hearts = Math.min(10, Math.floor(score / 2))
        const xp = Math.min(30, 4 + score) + (newBest ? 5 : 0)

        const pets = { ...s.pets }
        if (petId && pets[petId]) {
          const pet = pets[petId]!
          if (normalizePet(pet).health === 'healthy') {
            pets[petId] = {
              ...pet,
              happiness: clamp(pet.happiness + 8),
              energy: clamp(pet.energy - 5),
              xp: pet.xp + xp,
              lastMeaningfulCareAt: Date.now(),
            }
          }
        }
        set({
          coins: (s.coins ?? 0) + coins,
          hearts: s.hearts + hearts,
          pets,
          games: {
            ...s.games,
            [gameId]: { best: Math.max(record.best, score), plays: record.plays + 1 },
          },
        })
        return { treats, hearts, coins, xp, newBest }
      },

      claimDailyBonus: () => {
        const s = get()
        const today = todayKey()
        if (s.lastDailyBonus === today) return 0
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const streak = s.lastDailyBonus === yesterday ? s.streak + 1 : 1
        const bonus = Math.min(6, 2 + streak)
        set({ lastDailyBonus: today, streak, treats: s.treats + bonus, coins: (s.coins ?? 0) + bonus })
        return bonus
      },

      markCelebrated: (id, level) =>
        set((s) => ({
          celebrated: { ...s.celebrated, [id]: Math.max(s.celebrated[id] ?? 1, level) },
        })),

      setSetting: (key, value) => set({ [key]: value }),

      setLanguage: (lang) => set({ language: lang }),

      setActivePet: (id) => set({ activePet: id }),

      completeLesson: (id) => {
        const s = get()
        const completed = s.learningProgress ?? []
        if (completed.includes(id)) return false
        const pets = { ...s.pets }
        if (s.activePet && pets[s.activePet]) {
          pets[s.activePet] = { ...pets[s.activePet]!, xp: pets[s.activePet]!.xp + 3 }
        }
        set({ learningProgress: [...completed, id], coins: (s.coins ?? 0) + LEARNING_REWARD, pets })
        return true
      },

      acknowledgeArrival: () => set({ arrivalPet: null }),

      unlockParent: () => set({ parentUnlockedUntil: Date.now() + 10 * 60_000 }),

      resetAll: () =>
        set({
          onboarded: false,
          pets: {},
          activePet: null,
          treats: 5,
          coins: 8,
          medicine: 0,
          ownedAccessories: [],
          equippedAccessories: {},
          hearts: 0,
          lastDailyBonus: '',
          streak: 0,
          games: {},
          celebrated: {},
          learningProgress: [],
          arrivalPet: null,
          parentUnlockedUntil: 0,
        }),
    }),
    {
      name: 'haalm-v1',
      onRehydrateStorage: () => (state) => {
        if (state && typeof state.coins !== 'number') state.coins = 8
        if (state && typeof state.medicine !== 'number') state.medicine = 0
        if (state && !Array.isArray(state.ownedAccessories)) state.ownedAccessories = []
        if (state && !state.equippedAccessories) state.equippedAccessories = {}
        if (state && !Array.isArray(state.learningProgress)) state.learningProgress = []
        if (state && typeof state.parentUnlockedUntil !== 'number') state.parentUnlockedUntil = 0
        if (state && state.arrivalPet === undefined) state.arrivalPet = null
        if (state?.pets) {
          const now = Date.now()
          state.pets = Object.fromEntries(
            Object.entries(state.pets).map(([id, pet]) => [id, normalizePet(pet as PetState, now)])
          ) as Partial<Record<CharacterId, PetState>>
        }
        state?.tick()
      },
    }
  )
)

export const useActivePet = (): PetState | null => {
  const pets = useHaalm((s) => s.pets)
  const active = useHaalm((s) => s.activePet)
  if (active && pets[active]) return pets[active]!
  const first = Object.values(pets)[0]
  return (first as PetState) ?? null
}
