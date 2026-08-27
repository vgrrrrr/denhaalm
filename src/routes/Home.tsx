import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { Icon, SoftButton } from '../components/ui'
import { CharacterSprite } from '../components/CharacterSprite'
import { CareOverlay, type OverlayKind } from '../components/Overlays'
import { characterById } from '../data/characters'
import { moodOf, stageOf, useActivePet, useHaalm, levelFromXp } from '../store/haalm'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 11) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Home() {
  const navigate = useNavigate()
  const pet = useActivePet()
  const claimDailyBonus = useHaalm((s) => s.claimDailyBonus)
  const streak = useHaalm((s) => s.streak)
  const [bonus, setBonus] = useState(0)
  const [tapOverlay, setTapOverlay] = useState<OverlayKind>(null)

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

  const tapPet = () => {
    setTapOverlay('hearts')
    setTimeout(() => setTapOverlay(null), 1200)
  }

  return (
    <div className="page page--bare" style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {/* world scene */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img
          src="/haalm/environments/home-meadow-390x844@3x.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        {pet.sleeping && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--lavender)',
              opacity: 0.12,
            }}
          />
        )}
      </div>

      {/* top copy */}
      <div className="px" style={{ position: 'relative', paddingTop: 26, zIndex: 3 }}>
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="muted"
          style={{ fontSize: 15 }}
        >
          {greeting()}
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
          {stage === 'baby' ? char.babySpecies : char.species} · Lv. {level} · {moodOf(pet)}
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
              zIndex: 5,
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
            +{bonus} treats · day {streak}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the character living in the scene */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 15%)',
          transform: 'translateX(-44%)',
          zIndex: 2,
        }}
      >
        <div style={{ position: 'relative' }}>
          <CharacterSprite
            id={pet.id}
            stage={stage}
            width="38vw"
            sleeping={pet.sleeping}
            onTap={tapPet}
            style={{ maxWidth: 180 }}
          />
          <CareOverlay kind={tapOverlay} />
          {pet.sleeping && (
            <motion.img
              src="/haalm/ui/overlays/sleep.svg"
              alt=""
              animate={{ opacity: [0.5, 0.8, 0.5], y: [0, -4, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '-18%',
                right: '-14%',
                width: '46%',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* status capsule + CTA */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 16px)',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <motion.button
          onClick={() => navigate(`/pet/${pet.id}`)}
          whileTap={{ scale: 0.985 }}
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            background: 'rgba(255,251,247,0.86)',
            backdropFilter: 'blur(6px)',
            borderRadius: 999,
            border: '1px solid var(--line)',
            padding: '11px 18px',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Stat icon="apple" value={pet.hunger} />
          <Stat icon="heart" value={pet.happiness} />
          <Stat icon="moon" value={pet.energy} />
          <Stat icon="drop" value={pet.cleanliness} />
        </motion.button>
        <SoftButton onClick={() => navigate(`/care/${pet.id}`)}>Care for {char.name}</SoftButton>
      </div>
    </div>
  )
}

function Stat({ icon, value }: { icon: string; value: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={16} />
      <span style={{ fontSize: 12, fontWeight: 500 }}>{Math.round(value)}</span>
    </span>
  )
}
