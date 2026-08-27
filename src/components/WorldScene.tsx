import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export type DayPhase = 'dawn' | 'day' | 'evening' | 'night'

export const dayPhase = (): DayPhase => {
  const h = new Date().getHours()
  if (h >= 5 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

const PHASE_TINT: Record<DayPhase, string> = {
  dawn: 'linear-gradient(to bottom, rgba(232,162,175,0.14), rgba(241,211,122,0.08) 55%, rgba(255,244,236,0))',
  day: 'none',
  evening:
    'linear-gradient(to bottom, rgba(241,211,122,0.16), rgba(232,162,175,0.1) 50%, rgba(205,185,219,0.1))',
  night:
    'linear-gradient(to bottom, rgba(52,50,86,0.5), rgba(78,74,112,0.34) 55%, rgba(52,50,86,0.3))',
}

/**
 * The living alpine scene: background image, time-of-day tint, drifting
 * clouds, butterflies by day, stars & fireflies by night, and a swaying
 * foreground grass strip that the character nestles into.
 */
export function WorldScene({
  children,
  phase: forcedPhase,
  grassBottom = 0,
  dimmed = false,
}: {
  children?: ReactNode
  phase?: DayPhase
  /** px offset of the foreground grass strip from the container bottom */
  grassBottom?: number
  /** e.g. while the pet sleeps */
  dimmed?: boolean
}) {
  const phase = forcedPhase ?? dayPhase()
  const night = phase === 'night'

  const stars = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 41 + 13) % 92,
        top: 2 + ((i * 23) % 30),
        size: 6 + ((i * 5) % 7),
        delay: (i * 1.7) % 4,
      })),
    []
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* backdrop */}
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

      {/* drifting clouds */}
      {[
        { top: '6%', dur: 90, delay: 0, scale: 1, from: '-30%', to: '115%' },
        { top: '14%', dur: 130, delay: -40, scale: 0.7, from: '-25%', to: '112%' },
      ].map((c, i) => (
        <motion.img
          key={i}
          src="/haalm/ui/fx/cloud-soft.svg"
          alt=""
          initial={{ left: c.from }}
          animate={{ left: [c.from, c.to] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: c.top,
            width: `${44 * c.scale}%`,
            opacity: night ? 0.35 : 0.8,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* day life: birds & butterflies */}
      {!night && (
        <>
          <motion.img
            src="/haalm/ui/fx/bird.svg"
            alt=""
            animate={{ x: ['-10vw', '110vw'], y: [0, -14, 6, -10, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear', repeatDelay: 9 }}
            style={{ position: 'absolute', top: '11%', width: 26, opacity: 0.7, pointerEvents: 'none' }}
          />
          <Butterfly src="/haalm/ui/fx/butterfly-berry.svg" path={[8, 62, 30, 74, 8]} tops={[46, 38, 52, 42, 46]} duration={17} />
          <Butterfly src="/haalm/ui/fx/butterfly-sky.svg" path={[78, 30, 62, 18, 78]} tops={[40, 50, 34, 46, 40]} duration={21} delay={4} />
        </>
      )}

      {/* night life: stars & fireflies */}
      {night && (
        <>
          {/* moon */}
          <motion.div
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '7%',
              right: '12%',
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'radial-gradient(circle at 38% 35%, #FFFBF7 0%, #F3E9D8 60%, #E8DCC6 100%)',
              boxShadow: '0 0 34px 14px rgba(241,211,122,0.35)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
          {stars.map((s) => (
            <motion.img
              key={s.id}
              src="/haalm/ui/fx/star.svg"
              alt=""
              animate={{ opacity: [0.25, 0.9, 0.25] }}
              transition={{ duration: 3.2, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          ))}
          {[18, 44, 70, 84].map((left, i) => (
            <motion.img
              key={i}
              src="/haalm/ui/fx/firefly.svg"
              alt=""
              animate={{
                x: [0, 18, -12, 8, 0],
                y: [0, -20, 6, -14, 0],
                opacity: [0.2, 0.95, 0.4, 0.9, 0.2],
              }}
              transition={{ duration: 9 + i * 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 1.4 }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${58 + (i % 2) * 10}%`,
                width: 20,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          ))}
        </>
      )}

      {/* character layer */}
      {children}

      {/* swaying foreground grass — occludes the characters' bottom edge */}
      <motion.img
        src="/haalm/ui/fx/grass-front.svg"
        alt=""
        animate={{ rotate: [-0.4, 0.4, -0.4] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '-2%',
          right: '-2%',
          width: '104%',
          bottom: grassBottom,
          transformOrigin: '50% 100%',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* time-of-day tint above everything scenic */}
      {PHASE_TINT[phase] !== 'none' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: PHASE_TINT[phase],
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}
      {dimmed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--lavender)',
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      )}
    </div>
  )
}

function Butterfly({
  src,
  path,
  tops,
  duration,
  delay = 0,
}: {
  src: string
  path: number[]
  tops: number[]
  duration: number
  delay?: number
}) {
  return (
    <motion.div
      animate={{ left: path.map((p) => `${p}%`), top: tops.map((t) => `${t}%`) }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'absolute', width: 26, pointerEvents: 'none', zIndex: 2 }}
    >
      <motion.img
        src={src}
        alt=""
        animate={{ scaleX: [1, 0.35, 1], rotate: [-6, 6, -6] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: '100%', display: 'block' }}
      />
    </motion.div>
  )
}
