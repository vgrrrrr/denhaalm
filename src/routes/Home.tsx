import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Icon, SoftButton } from '../components/ui'
import { WorldScene, type DayPhase } from '../components/WorldScene'
import { PetSprite } from '../components/PetSprite'
import { useChatter } from '../components/useChatter'
import { characterById } from '../data/characters'
import { moodOf, stageOf, useActivePet, useHaalm, levelFromXp } from '../store/haalm'
import { useT } from '../i18n'

const greetingKey = () => {
  const h = new Date().getHours()
  if (h < 5) return 'greet.night' as const
  if (h < 11) return 'greet.morning' as const
  if (h < 18) return 'greet.afternoon' as const
  return 'greet.evening' as const
}

/** icon hint for the pet's most urgent need */
const emoteFor = (pet: { hunger: number; energy: number; cleanliness: number; happiness: number }) => {
  if (pet.hunger < 35) return 'apple'
  if (pet.energy < 30) return 'moon'
  if (pet.cleanliness < 30) return 'drop'
  if (pet.happiness < 35) return 'heart'
  return null
}

export function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const pet = useActivePet()
  // demo/debug: /#/home?phase=night forces a time of day
  const phaseOverride = (new URLSearchParams(location.search).get('phase') ?? undefined) as
    | DayPhase
    | undefined
  const claimDailyBonus = useHaalm((s) => s.claimDailyBonus)
  const streak = useHaalm((s) => s.streak)
  const [bonus, setBonus] = useState(0)
  const { t, loc } = useT()
  const { speech, say } = useChatter(pet)

  useEffect(() => {
    const b = claimDailyBonus()
    if (b > 0) {
      const t = setTimeout(() => setBonus(b), 700)
      return () => clearTimeout(t)
    }
  }, [claimDailyBonus])

  useEffect(() => {
    if (!bonus) return
    const t = setTimeout(() => setBonus(0), 3600)
    return () => clearTimeout(t)
  }, [bonus])

  if (!pet) {
    return <Navigate to="/scan" replace />
  }

  const char = characterById(pet.id)
  const { level } = levelFromXp(pet.xp)
  const stage = stageOf(pet)

  return (
    <div className="page page--bare" style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <WorldScene dimmed={pet.sleeping} phase={phaseOverride}>
        {/* the character living in the scene */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16%)',
            transform: 'translateX(-46%)',
            zIndex: 2,
          }}
        >
          <PetSprite
            id={pet.id}
            stage={stage}
            width="40vw"
            maxWidth={190}
            sleeping={pet.sleeping}
            emote={emoteFor(pet)}
            speech={speech}
            onTap={() => say('tap')}
          />
        </div>
      </WorldScene>

      {/* top copy */}
      <div className="px" style={{ position: 'relative', paddingTop: 26, zIndex: 6 }}>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="muted"
          style={{ fontSize: 15 }}
        >
          {t(greetingKey())}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          style={{ fontSize: 32, lineHeight: 1.05, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {char.name}
          <Icon name="leaf" size={18} style={{ opacity: 0.7 }} />
        </motion.h1>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="muted"
          style={{ fontSize: 12 }}
        >
          {loc(stage === 'baby' ? char.babySpecies : char.species)} · Lv. {level} · {t(moodOf(pet))}
        </motion.span>
      </div>

      {/* daily bonus toast */}
      <AnimatePresence>
        {bonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 24,
              right: 20,
              zIndex: 7,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 12,
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="apple" size={14} />
            {t('home.bonus', { n: bonus, d: streak })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* status capsule + CTA */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <motion.button
          onClick={() => navigate(`/pet/${pet.id}`)}
          whileTap={{ scale: 0.985 }}
          className="glass"
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderRadius: 999,
            padding: '11px 18px',
          }}
        >
          <Stat icon="apple" value={pet.hunger} />
          <Stat icon="heart" value={pet.happiness} />
          <Stat icon="moon" value={pet.energy} />
          <Stat icon="drop" value={pet.cleanliness} />
        </motion.button>
        <SoftButton onClick={() => navigate(`/care/${pet.id}`)}>{t('home.care', { name: char.name })}</SoftButton>
      </div>
    </div>
  )
}

function Stat({ icon, value }: { icon: string; value: number }) {
  const low = value < 35
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <motion.span
        animate={low ? { scale: [1, 1.18, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex' }}
      >
        <Icon name={icon} size={16} />
      </motion.span>
      <span style={{ fontSize: 12, fontWeight: 500, color: low ? 'var(--berry)' : undefined }}>
        {Math.round(value)}
      </span>
    </span>
  )
}
