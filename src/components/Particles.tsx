import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type ParticleKind = 'hearts' | 'sparkles' | 'petals' | 'bubbles' | 'stars'

const KIND_SRC: Record<ParticleKind, string[]> = {
  hearts: ['/haalm/ui/icons/heart.svg'],
  sparkles: ['/haalm/ui/fx/sparkle-honey.svg', '/haalm/ui/fx/star.svg'],
  petals: ['/haalm/ui/fx/petal.svg', '/haalm/ui/fx/leaf-fall.svg'],
  bubbles: [],
  stars: ['/haalm/ui/fx/star.svg'],
}

interface Particle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  size: number
  delay: number
  rotate: number
  src?: string
}

const makeParticles = (kind: ParticleKind, count: number, seed: number): Particle[] => {
  const rng = mulberry32(seed)
  return Array.from({ length: count }, (_, i) => {
    const angle = rng() * Math.PI * 2
    const dist = 34 + rng() * 52
    const srcs = KIND_SRC[kind]
    return {
      id: seed * 100 + i,
      x: 40 + rng() * 20,
      y: kind === 'bubbles' ? 70 + rng() * 20 : 42 + rng() * 16,
      dx: Math.cos(angle) * dist,
      dy: kind === 'bubbles' ? -(50 + rng() * 60) : Math.sin(angle) * dist - 30,
      size: kind === 'bubbles' ? 8 + rng() * 14 : 12 + rng() * 12,
      delay: rng() * 0.18,
      rotate: (rng() - 0.5) * 70,
      src: srcs.length ? srcs[Math.floor(rng() * srcs.length)] : undefined,
    }
  })
}

function mulberry32(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One-shot particle burst. Bump `trigger` (any changing number > 0) to fire.
 * Renders inside a relatively-positioned parent.
 */
export function ParticleBurst({
  kind,
  trigger,
  count = 9,
}: {
  kind: ParticleKind
  trigger: number
  count?: number
}) {
  const particles = useMemo(
    () => (trigger > 0 ? makeParticles(kind, count, trigger) : []),
    [kind, count, trigger]
  )
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
              x: p.dx,
              y: p.dy,
              scale: [0.5, 1, 0.85],
              rotate: p.rotate,
            }}
            transition={{ duration: 1.15, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
          >
            {p.src ? (
              <img src={p.src} alt="" style={{ width: '100%', height: '100%' }} />
            ) : (
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  borderRadius: 999,
                  border: '1.5px solid rgba(169,203,232,0.9)',
                  background: 'rgba(255,251,247,0.35)',
                }}
              />
            )}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** endless gentle drift of petals/leaves across a scene */
export function AmbientDrift({ count = 5 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 6 + ((i * 37) % 86),
        size: 10 + ((i * 13) % 8),
        duration: 11 + ((i * 7) % 9),
        delay: (i * 3.1) % 10,
        src: i % 3 === 0 ? '/haalm/ui/fx/leaf-fall.svg' : '/haalm/ui/fx/petal.svg',
      })),
    [count]
  )
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((p) => (
        <motion.img
          key={p.id}
          src={p.src}
          alt=""
          initial={{ y: '-6%', opacity: 0 }}
          animate={{
            y: '106%',
            x: [0, 22, -14, 18, 0],
            rotate: [0, 90, 200, 320, 380],
            opacity: [0, 0.8, 0.8, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.2, 0.5, 0.8, 1],
          }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  )
}
