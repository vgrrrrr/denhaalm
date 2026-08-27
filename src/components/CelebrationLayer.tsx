import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SoftButton, softSpring } from './ui'
import { ParticleBurst } from './Particles'
import { characterById, spriteSrc, type CharacterId } from '../data/characters'
import { GROWN_LEVEL, levelFromXp, useHaalm, type PetState } from '../store/haalm'

interface Pending {
  id: CharacterId
  level: number
  evolution: boolean
}

/**
 * Watches every pet's level and plays a level-up toast — or the full
 * baby-to-grown evolution ceremony — the moment a threshold is crossed.
 */
export function CelebrationLayer() {
  const pets = useHaalm((s) => s.pets)
  const celebrated = useHaalm((s) => s.celebrated)
  const markCelebrated = useHaalm((s) => s.markCelebrated)
  const [active, setActive] = useState<Pending | null>(null)

  const pending = useMemo<Pending | null>(() => {
    for (const pet of Object.values(pets) as PetState[]) {
      const { level } = levelFromXp(pet.xp)
      const seen = celebrated[pet.id] ?? 1
      if (level > seen) {
        return {
          id: pet.id,
          level,
          evolution: level >= GROWN_LEVEL && seen < GROWN_LEVEL,
        }
      }
    }
    return null
  }, [pets, celebrated])

  useEffect(() => {
    if (pending && !active) setActive(pending)
  }, [pending, active])

  // plain level-ups auto-dismiss; evolutions wait for the button
  useEffect(() => {
    if (active && !active.evolution) {
      const t = setTimeout(() => {
        markCelebrated(active.id, active.level)
        setActive(null)
      }, 2600)
      return () => clearTimeout(t)
    }
  }, [active, markCelebrated])

  const char = active ? characterById(active.id) : null

  return (
    <AnimatePresence>
      {active && char && !active.evolution && (
        <motion.div
          key="levelup"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={softSpring}
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            x: '-50%',
            zIndex: 90,
            background: 'var(--warm-white)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '10px 20px',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ position: 'relative', width: 30, height: 30 }}>
            <img
              src={`/haalm/characters/${active.id}/portrait.png`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <ParticleBurst kind="sparkles" trigger={active.level} count={6} />
          </div>
          <span style={{ fontSize: 14 }}>
            <strong style={{ fontWeight: 500 }}>{char.name}</strong> reached Lv. {active.level}!
          </span>
        </motion.div>
      )}

      {active && char && active.evolution && (
        <motion.div
          key="evolution"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 95,
            background: 'rgba(255,244,236,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <motion.img
            src="/haalm/ui/overlays/confetti.svg"
            alt=""
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.85, scale: 1.05 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: '6%',
              width: 'min(88vw, 380px)',
              pointerEvents: 'none',
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 15, color: 'var(--muted)' }}
          >
            something wonderful happened…
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ fontSize: 30, lineHeight: 1.1, marginTop: 6 }}
          >
            {char.name} grew up!
          </motion.h1>

          <div style={{ position: 'relative', margin: '26px 0', height: 'min(52vw, 240px)' }}>
            {/* baby fades away */}
            <motion.img
              src={spriteSrc(active.id, 'baby')}
              alt=""
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 0.86 }}
              transition={{ delay: 0.7, duration: 0.9, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 0,
                translate: '-50% 0',
                height: '86%',
                objectFit: 'contain',
              }}
            />
            {/* grown form blooms in */}
            <motion.img
              src={spriteSrc(active.id, 'grown')}
              alt={char.name}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: [0.7, 1.05, 1] }}
              transition={{ delay: 1.3, duration: 0.9, ...softSpring }}
              style={{
                position: 'relative',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            <ParticleBurst kind="sparkles" trigger={1} count={14} />
          </div>

          <p className="muted" style={{ fontSize: 14, maxWidth: 250, lineHeight: 1.45 }}>
            All your love and care made {char.name} a grown {char.species.toLowerCase()}.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            style={{ width: '100%', maxWidth: 300, marginTop: 22 }}
          >
            <SoftButton
              onClick={() => {
                markCelebrated(active.id, active.level)
                setActive(null)
              }}
            >
              How wonderful!
            </SoftButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
