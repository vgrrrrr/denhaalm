import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CharacterId } from '../data/characters'

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
}

export interface GameRecord {
  best: number
  plays: number
}

interface HaalmStore {
  onboarded: boolean
  pets: Partial<Record<CharacterId, PetState>>
  activePet: CharacterId | null
  treats: number
  hearts: number
  lastDailyBonus: string
  streak: number
  games: Record<string, GameRecord>
  /** highest level already celebrated per pet (level-up / evolution overlays) */
  celebrated: Partial<Record<CharacterId, number>>
  soundOn: boolean
  childSafe: boolean
  notificationsOn: boolean

  completeOnboarding: () => void
  unlockPet: (id: CharacterId) => void
  tick: () => void
  feed: (id: CharacterId) => boolean
  clean: (id: CharacterId) => void
  cuddle: (id: CharacterId) => void
  toggleSleep: (id: CharacterId) => void
  visit: (id: CharacterId, locationId: string, boost: 'happiness' | 'energy' | 'hunger') => void
  finishGame: (gameId: string, score: number, petId: CharacterId | null) => GameReward
  claimDailyBonus: () => number
  markCelebrated: (id: CharacterId, level: number) => void
  setSetting: (key: 'soundOn' | 'childSafe' | 'notificationsOn', value: boolean) => void
  setActivePet: (id: CharacterId) => void
  resetAll: () => void
}

export interface GameReward {
  treats: number
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

export const stageOf = (pet: PetState): 'baby' | 'grown' =>
  levelFromXp(pet.xp).level >= GROWN_LEVEL ? 'grown' : 'baby'

export const moodOf = (pet: PetState): string => {
  if (pet.sleeping) return 'Sleeping'
  if (pet.hunger < 30) return 'Hungry'
  if (pet.energy < 30) return 'Sleepy'
  if (pet.cleanliness < 30) return 'Needs a bath'
  if (pet.happiness < 35) return 'A bit lonely'
  if (pet.happiness > 75 && pet.hunger > 60) return 'Very happy'
  return 'Content'
}

export const daysTogether = (pet: PetState) =>
  Math.max(1, Math.floor((Date.now() - pet.unlockedAt) / 86400000) + 1)

/* ---------------------------------------------------------------- decay */

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/** stat drift per hour of real time */
const DECAY = { hunger: 5, happiness: 3.5, energy: 3, cleanliness: 4 }
/** energy recovered per hour of sleep */
const SLEEP_REGEN = 22

const applyTime = (pet: PetState, now: number): PetState => {
  const hours = Math.max(0, (now - pet.lastTick) / 3600000)
  if (hours <= 0) return pet
  const next = { ...pet, lastTick: now }
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
  location: 'flower-hill',
  lastFed: 0,
  lastCuddled: 0,
  lastVisit: 0,
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
      hearts: 0,
      lastDailyBonus: '',
      streak: 0,
      games: {},
      celebrated: {},
      soundOn: true,
      childSafe: true,
      notificationsOn: false,

      completeOnboarding: () => set({ onboarded: true }),

      unlockPet: (id) =>
        set((s) => {
          if (s.pets[id]) return { activePet: id }
          return {
            pets: { ...s.pets, [id]: newPet(id) },
            activePet: id,
            treats: s.treats + 3,
            celebrated: { ...s.celebrated, [id]: 1 },
          }
        }),

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
        if (!pet || s.treats < 1 || pet.sleeping) return false
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
            },
          },
        })
        return true
      },

      clean: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet) return s
          return {
            pets: {
              ...s.pets,
              [id]: {
                ...pet,
                cleanliness: clamp(pet.cleanliness + 28),
                xp: pet.xp + 4,
              },
            },
          }
        }),

      cuddle: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet) return s
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
              },
            },
          }
        }),

      toggleSleep: (id) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet) return s
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
              },
            },
          }
        }),

      visit: (id, locationId, boost) =>
        set((s) => {
          const pet = s.pets[id]
          if (!pet) return s
          const fresh = Date.now() - pet.lastVisit > 90000
          const boosted = { ...pet, location: locationId, lastVisit: Date.now() }
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
        const treats = Math.min(6, Math.floor(score / 4))
        const hearts = Math.min(10, Math.floor(score / 2))
        const xp = Math.min(30, 4 + score) + (newBest ? 5 : 0)

        const pets = { ...s.pets }
        if (petId && pets[petId]) {
          const pet = pets[petId]!
          pets[petId] = {
            ...pet,
            happiness: clamp(pet.happiness + 8),
            energy: clamp(pet.energy - 5),
            xp: pet.xp + xp,
          }
        }
        set({
          treats: s.treats + treats,
          hearts: s.hearts + hearts,
          pets,
          games: {
            ...s.games,
            [gameId]: { best: Math.max(record.best, score), plays: record.plays + 1 },
          },
        })
        return { treats, hearts, xp, newBest }
      },

      claimDailyBonus: () => {
        const s = get()
        const today = todayKey()
        if (s.lastDailyBonus === today) return 0
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const streak = s.lastDailyBonus === yesterday ? s.streak + 1 : 1
        const bonus = Math.min(6, 2 + streak)
        set({ lastDailyBonus: today, streak, treats: s.treats + bonus })
        return bonus
      },

      markCelebrated: (id, level) =>
        set((s) => ({
          celebrated: { ...s.celebrated, [id]: Math.max(s.celebrated[id] ?? 1, level) },
        })),

      setSetting: (key, value) => set({ [key]: value }),

      setActivePet: (id) => set({ activePet: id }),

      resetAll: () =>
        set({
          onboarded: false,
          pets: {},
          activePet: null,
          treats: 5,
          hearts: 0,
          lastDailyBonus: '',
          streak: 0,
          games: {},
          celebrated: {},
        }),
    }),
    {
      name: 'haalm-v1',
      onRehydrateStorage: () => (state) => {
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
