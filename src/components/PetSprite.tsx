import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from './ui'
import { ParticleBurst, type ParticleKind } from './Particles'
import { displaySpriteSrc, hasSleepSprite, type AgeStage, type BodyPose, type CharacterId } from '../data/characters'

type Behavior = 'idle' | 'hop' | 'look' | 'wiggle'
type Reaction = { kind: ParticleKind; seq: number } | null
export type PetCareAction = 'feed' | 'clean' | 'sleep' | 'cuddle' | null

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
  bedtimeReady = false,
  careAction = null,
  emote = null,
  speech = null,
  wander = true,
  withGrass = true,
  onTap,
}: {
  id: CharacterId
  stage: AgeStage
  width: string | number
  maxWidth?: number
  sleeping?: boolean
  /** Uses the production-v1 bedtime outfit while the blanket interaction is ready. */
  bedtimeReady?: boolean
  /** Short visual cue played while a care action is being completed. */
  careAction?: PetCareAction
  /** icon name shown in a thought bubble (e.g. 'apple' when hungry) */
  emote?: string | null
  /** a spoken line shown in a speech bubble (takes over from the emote) */
  speech?: string | null
  wander?: boolean
  withGrass?: boolean
  onTap?: () => void
}) {
  const [behavior, setBehavior] = useState<Behavior>('idle')
  const [behaviorSeq, setBehaviorSeq] = useState(0)
  const [strollX, setStrollX] = useState(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [reaction, setReaction] = useState<Reaction>(null)
  const [sleepFrame, setSleepFrame] = useState(0)
  const reducedMotion = useReducedMotion()
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

  useEffect(() => {
    if (!sleeping) {
      return
    }
    if (reducedMotion) return
    const timer = window.setInterval(() => setSleepFrame((frame) => (frame + 1) % 8), 420)
    return () => window.clearInterval(timer)
  }, [sleeping, reducedMotion])

  const tap = () => {
    const kinds: ParticleKind[] = ['hearts', 'sparkles', 'petals']
    reactionCycle.current += 1
    setReaction({ kind: kinds[reactionCycle.current % kinds.length], seq: reactionCycle.current })
    setBehavior(reactionCycle.current % 2 ? 'hop' : 'wiggle')
    setBehaviorSeq((s) => s + 1)
    onTap?.()
  }

  const pose: BodyPose = behavior === 'look'
    ? behaviorSeq % 2
      ? facing === -1 ? 'look-left-slight' : 'look-right-slight'
      : facing === -1 ? 'look-left-turned' : 'look-right-turned'
    : 'body'
  const imageSource = sleeping
    ? reducedMotion
      ? `/haalm/characters-v1/${id}/${stage}/sleep.png`
      : `/haalm/characters-v1/${id}/${stage}/animations/sleep/${String(sleepFrame).padStart(2, '0')}.png`
    : bedtimeReady
      ? `/haalm/characters-v1/${id}/${stage}/pyjama.png`
    : displaySpriteSrc(id, stage, false, pose)

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
          zIndex: -1,
        }}
      />

      {/* speech bubble — the pet talking to its human */}
      <AnimatePresence>
        {speech && (
          <motion.div
            key={speech}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -3, 0], scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 },
              y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              bottom: '96%',
              left: '50%',
              translate: '-50% 0',
              zIndex: 7,
              width: 'max-content',
              maxWidth: 'min(62vw, 230px)',
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: '18px 18px 18px 5px',
              padding: '9px 13px',
              boxShadow: 'var(--shadow)',
              fontSize: 12.5,
              lineHeight: 1.45,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {speech}
          </motion.div>
        )}
      </AnimatePresence>

      {/* emote thought bubble */}
      <AnimatePresence>
        {emote && !speech && !sleeping && (
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
            src={imageSource}
            alt={id}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              transform: pose === 'body' && facing === -1 ? 'scaleX(-1)' : undefined,
              filter: sleeping && !hasSleepSprite(id) ? 'brightness(0.94)' : undefined,
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* Small, tactile care cues sit over the existing raster character so
          Alm actions feel immediate without replacing the character art. */}
      <AnimatePresence initial={false}>
        {careAction && careAction !== 'sleep' && (
          <motion.img
            key={careAction}
            src={careAction === 'feed' ? '/haalm/ui/runtime/food/feeding-bowl.png' : careAction === 'clean' ? '/haalm/ui/runtime/care/wash-kit.png' : '/haalm/ui/runtime/care/cuddle-pillow.png'}
            alt=""
            initial={{ opacity: 0, scale: 0.72, x: careAction === 'clean' ? 18 : -18, y: 10, rotate: -8 }}
            animate={
              careAction === 'clean'
                ? { opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.76], x: [18, -14, 14, 24], y: [10, -2, 4, 10], rotate: [8, -9, 10, 12] }
                : careAction === 'feed'
                  ? { opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.8], x: [-18, 0, 3, 8], y: [18, -2, 3, 14], rotate: [-8, 0, -5, 8] }
                  : { opacity: [0, 1, 1, 0], scale: [0.72, 1, 1, 0.82], x: [-20, 18, -14, 20], y: [3, -4, 2, 4], rotate: [-8, 8, -6, 8] }
            }
            transition={{ duration: careAction === 'clean' ? 1.45 : 1.15, ease: 'easeInOut', times: [0, 0.16, 0.78, 1] }}
            style={{ position: 'absolute', left: '50%', top: careAction === 'clean' ? '30%' : '42%', width: careAction === 'clean' ? '38%' : '34%', height: 'auto', translate: '-50% 0', zIndex: 6, pointerEvents: 'none', filter: 'drop-shadow(0 4px 5px rgba(31,31,31,0.16))' }}
          />
        )}
        {careAction === 'sleep' && (
          <motion.div
            key="sleep-cue"
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, -2, -4, -10], scale: [0.85, 1, 1.04, 1.1] }}
            transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.18, 0.76, 1] }}
            style={{ position: 'absolute', top: '-8%', right: '-5%', zIndex: 7, pointerEvents: 'none', fontSize: 18, color: 'var(--lavender)' }}
          >
            ✦ z
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightweight ground contact; no extra image request for tiny scenery. */}
      {withGrass && (
        <motion.div
          animate={{ scaleX: [1, 1.025, 1] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '-2%',
            left: '7%',
            width: '86%',
            height: '12%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(184,204,166,0.46) 0%, rgba(184,204,166,0) 72%)',
            zIndex: 0,
            pointerEvents: 'none',
            transformOrigin: '50% 100%',
          }}
        />
      )}

      {/* The pyjama/sleep frames carry bedtime on their own; a tiny zZ cue is
          enough and keeps the scene calmer than the previous blanket asset. */}
      {sleeping && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.38, 0.76, 0.38], y: [0, -5, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-6%',
            right: '2%',
            pointerEvents: 'none',
            zIndex: 5,
            color: 'var(--lavender)',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textShadow: '0 2px 5px rgba(31,31,31,0.12)',
          }}
        >
          zZ
        </motion.span>
      )}

      {reaction && <ParticleBurst kind={reaction.kind} trigger={reaction.seq} />}
    </motion.div>
  )
}
