import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from './ui'
import { ParticleBurst, type ParticleKind } from './Particles'
import { spriteSrc, type CharacterId } from '../data/characters'

type Behavior = 'idle' | 'hop' | 'look' | 'wiggle'
type Reaction = { kind: ParticleKind; seq: number } | null

import type { TargetAndTransition } from 'framer-motion'

const BEHAVIOR_ANIM: Record<Behavior, TargetAndTransition> = {
  idle: {},
  hop: { y: [0, -16, 0, -8, 0] },
  look: { rotate: [0, -4, -4, 4, 4, 0] },
  wiggle: { scaleX: [1, 1.04, 0.97, 1.03, 1], scaleY: [1, 0.97, 1.03, 0.98, 1] },
}

/**
 * The living pet: breathing, a soft contact shadow, a grass tuft it
 * nestles into, spontaneous idle behaviors (hopping, looking around,
 * wiggling, strolling a few steps), stat emote bubbles and tap reactions.
 */
export function PetSprite({
  id,
  stage,
  width,
  maxWidth = 190,
  sleeping = false,
  emote = null,
  wander = true,
  withGrass = true,
  onTap,
}: {
  id: CharacterId
  stage: 'baby' | 'grown'
  width: string | number
  maxWidth?: number
  sleeping?: boolean
  /** icon name shown in a thought bubble (e.g. 'apple' when hungry) */
  emote?: string | null
  wander?: boolean
  withGrass?: boolean
  onTap?: () => void
}) {
  const [behavior, setBehavior] = useState<Behavior>('idle')
  const [behaviorSeq, setBehaviorSeq] = useState(0)
  const [strollX, setStrollX] = useState(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [reaction, setReaction] = useState<Reaction>(null)
  const reactionCycle = useRef(0)

  // spontaneous idle behaviors
  useEffect(() => {
    if (sleeping) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        if (cancelled) return
        const roll = Math.random()
        if (wander && roll < 0.3) {
          const target = Math.round((Math.random() - 0.5) * 90)
          setStrollX((prev) => {
            setFacing(target >= prev ? 1 : -1)
            return target
          })
        } else if (roll < 0.55) {
          setBehavior('hop')
          setBehaviorSeq((s) => s + 1)
        } else if (roll < 0.8) {
          setBehavior('look')
          setBehaviorSeq((s) => s + 1)
        } else {
          setBehavior('wiggle')
          setBehaviorSeq((s) => s + 1)
        }
        schedule()
      }, 4500 + Math.random() * 5500)
    }
    schedule()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sleeping, wander])

  const tap = () => {
    const kinds: ParticleKind[] = ['hearts', 'sparkles', 'petals']
    reactionCycle.current += 1
    setReaction({ kind: kinds[reactionCycle.current % kinds.length], seq: reactionCycle.current })
    setBehavior(reactionCycle.current % 2 ? 'hop' : 'wiggle')
    setBehaviorSeq((s) => s + 1)
    onTap?.()
  }

  return (
    <motion.div
      animate={{ x: strollX }}
      transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      style={{ position: 'relative', width, maxWidth }}
    >
      {/* contact shadow */}
      <motion.div
        animate={{ scaleX: sleeping ? [1, 1.03, 1] : [1, 1.05, 1], opacity: [0.22, 0.28, 0.22] }}
        transition={{ duration: sleeping ? 5.5 : 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: '2%',
          left: '12%',
          right: '12%',
          height: '9%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(31,31,31,0.5) 0%, rgba(31,31,31,0) 70%)',
          zIndex: 0,
        }}
      />

      {/* emote thought bubble */}
      <AnimatePresence>
        {emote && !sleeping && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              top: '-14%',
              right: '-8%',
              zIndex: 6,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: '999px 999px 999px 6px',
              padding: 9,
              boxShadow: 'var(--shadow)',
            }}
          >
            <Icon name={emote} size={16} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* behavior wrapper */}
      <motion.div
        key={`${behavior}-${behaviorSeq}`}
        animate={sleeping ? {} : BEHAVIOR_ANIM[behavior]}
        transition={{ duration: behavior === 'look' ? 1.6 : 0.8, ease: 'easeInOut' }}
        onTap={tap}
        style={{ position: 'relative', zIndex: 1, cursor: 'pointer', transformOrigin: '50% 100%' }}
      >
        {/* breathing */}
        <motion.div
          animate={{
            y: sleeping ? [0, 3, 0] : [0, -2, 0],
            scale: sleeping ? [1, 1.004, 1] : [1, 1.008, 1],
          }}
          transition={{ duration: sleeping ? 5.5 : 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 100%' }}
        >
          <img
            src={spriteSrc(id, stage)}
            alt={id}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              transform: facing === -1 ? 'scaleX(-1)' : undefined,
              filter: sleeping ? 'brightness(0.94)' : undefined,
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* grass tuft occluder — the pet sits in the meadow */}
      {withGrass && (
        <motion.img
          src="/haalm/ui/fx/grass-tuft.svg"
          alt=""
          animate={{ rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '-3%',
            left: '-11%',
            width: '122%',
            zIndex: 2,
            pointerEvents: 'none',
            transformOrigin: '50% 100%',
          }}
        />
      )}

      {/* sleep zzz */}
      {sleeping && (
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
            zIndex: 5,
          }}
        />
      )}

      {reaction && <ParticleBurst kind={reaction.kind} trigger={reaction.seq} />}
    </motion.div>
  )
}
