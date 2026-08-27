import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell, useGameShell } from './GameShell'
import { useActivePet } from '../../store/haalm'
import { useT } from '../../i18n'
import { portraitSrc } from '../../data/characters'

/**
 * Timing game: a marker swings across a bar; tap while it's inside
 * the soft zone to hop to the next cloud. Zone shrinks as you climb.
 */
export function CloudHop() {
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0)
  const { t } = useT()

  return (
    <GameShell
      gameId="cloud-hop"
      title="Cloud Hop"
      howTo={t('game.cloud.howto')}
      score={score}
      playing={playing}
      onStart={() => {
        setScore(0)
        setRound((r) => r + 1)
        setPlaying(true)
      }}
    >
      {playing && <Sky key={round} onScore={setScore} onEnd={() => setPlaying(false)} />}
      {!playing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            background: 'linear-gradient(to bottom, #BCD6EC, var(--sky) 70%, #C9DDF0)',
            opacity: 0.55,
          }}
        />
      )}
    </GameShell>
  )
}

function Sky({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const { t: t2 } = useT()
  const pet = useActivePet()
  const [hops, setHops] = useState(0)
  const [misses, setMisses] = useState(0)
  const [markerPos, setMarkerPos] = useState(0) // 0..100
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const posRef = useRef(0)
  const dirRef = useRef(1)
  const hopsRef = useRef(0)
  const missesRef = useRef(0)
  const endedRef = useRef(false)

  const zoneWidth = Math.max(14, 34 - hops * 2) // shrinks per hop
  const zoneStart = 50 - zoneWidth / 2

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const speed = 0.055 + hopsRef.current * 0.005 // % per ms
      let p = posRef.current + dirRef.current * speed * dt
      if (p >= 100) {
        p = 100
        dirRef.current = -1
      } else if (p <= 0) {
        p = 0
        dirRef.current = 1
      }
      posRef.current = p
      setMarkerPos(p)
      if (!endedRef.current) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const tap = () => {
    if (endedRef.current) return
    const inZone = Math.abs(posRef.current - 50) <= zoneWidth / 2
    if (inZone) {
      hopsRef.current += 1
      setHops(hopsRef.current)
      onScore(hopsRef.current)
      setFlash('hit')
    } else {
      missesRef.current += 1
      setMisses(missesRef.current)
      setFlash('miss')
      if (missesRef.current >= 3) {
        endedRef.current = true
        setTimeout(() => {
          onEnd()
          finish(hopsRef.current)
        }, 500)
      }
    }
    setTimeout(() => setFlash(null), 350)
  }

  return (
    <div
      onPointerDown={tap}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #BCD6EC, var(--sky) 70%, #C9DDF0)',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          background: 'rgba(255,251,247,0.85)',
          borderRadius: 999,
          padding: '5px 12px',
        }}
      >
        {'♥'.repeat(3 - misses)}
        <span style={{ opacity: 0.25 }}>{'♥'.repeat(misses)}</span>
      </span>

      {/* climbing clouds — the pet sits on the top one */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <motion.div
          key={hops}
          initial={{ y: 18, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <img
            src={pet ? portraitSrc(pet.id) : portraitSrc('gigi')}
            alt=""
            style={{
              width: 62,
              height: 62,
              objectFit: 'contain',
              filter: flash === 'miss' ? 'saturate(0.4)' : undefined,
            }}
          />
          <Cloud size={92} />
        </motion.div>
        <div style={{ opacity: 0.65, marginTop: 8 }}>
          <Cloud size={70} />
        </div>
        <div style={{ opacity: 0.35, marginTop: 6 }}>
          <Cloud size={54} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, marginTop: 10 }}>{t2('game.cloudshigh', { n: hops })}</span>
      </div>

      {/* timing bar */}
      <div style={{ width: '80%', marginBottom: 'calc(26px + var(--safe-bottom))' }}>
        <div
          style={{
            position: 'relative',
            height: 14,
            borderRadius: 999,
            background: 'rgba(255,251,247,0.4)',
            border: flash === 'miss' ? '1px solid var(--berry)' : '1px solid rgba(255,251,247,0.7)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: `${zoneStart}%`,
              width: `${zoneWidth}%`,
              top: 0,
              bottom: 0,
              borderRadius: 999,
              background:
                flash === 'hit' ? 'var(--meadow)' : 'rgba(255,251,247,0.9)',
              transition: 'background 0.2s',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: `${markerPos}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              borderRadius: 999,
              background: 'var(--honey)',
              boxShadow: '0 1px 6px rgba(31,31,31,0.18)',
            }}
          />
        </div>
        <span className="muted" style={{ fontSize: 11, display: 'block', textAlign: 'center', marginTop: 8 }}>
          {t2('game.taptohop')}
        </span>
      </div>
    </div>
  )
}

function Cloud({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 0.34,
        borderRadius: 999,
        background: 'var(--warm-white)',
        boxShadow: '0 3px 12px rgba(31,31,31,0.06)',
      }}
    />
  )
}
