import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell, useGameShell } from './GameShell'
import { stageOf, useActivePet } from '../../store/haalm'
import { useT } from '../../i18n'
import { spriteSrc } from '../../data/characters'

/**
 * Timing game: the little sun swings across a bar; tap while it's inside
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
      {/* illustrated sky backdrop */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden' }}>
        <img
          src="/haalm/games/cloud-hop.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: playing
              ? 'linear-gradient(to bottom, rgba(255,251,247,0.12), rgba(255,251,247,0.28))'
              : 'rgba(255,244,236,0.55)',
          }}
        />
      </div>
      {playing && <Sky key={round} onScore={setScore} onEnd={() => setPlaying(false)} />}
    </GameShell>
  )
}

function Sky({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const { t: t2 } = useT()
  const pet = useActivePet()
  const [hops, setHops] = useState(0)
  const [misses, setMisses] = useState(0)
  const [markerPos, setMarkerPos] = useState(0)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const posRef = useRef(0)
  const dirRef = useRef(1)
  const hopsRef = useRef(0)
  const missesRef = useRef(0)
  const endedRef = useRef(false)

  const zoneWidth = Math.max(14, 34 - hops * 2)
  const zoneStart = 50 - zoneWidth / 2

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const speed = 0.055 + hopsRef.current * 0.005
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
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        className="glass--chip"
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          borderRadius: 999,
          padding: '6px 13px',
          color: 'var(--berry)',
          zIndex: 3,
        }}
      >
        {'♥'.repeat(3 - misses)}
        <span style={{ opacity: 0.25 }}>{'♥'.repeat(misses)}</span>
      </span>

      {/* climbing clouds — the pet rides the top one */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          zIndex: 1,
        }}
      >
        <motion.div
          key={hops}
          initial={{ y: 22, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.img
            src={pet ? spriteSrc(pet.id, stageOf(pet)) : spriteSrc('gigi', 'baby')}
            alt=""
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              height: 78,
              objectFit: 'contain',
              marginBottom: -6,
              filter: flash === 'miss' ? 'saturate(0.4)' : 'drop-shadow(0 3px 5px rgba(31,31,31,0.18))',
            }}
          />
          <img src="/haalm/ui/fx/cloud-soft.svg" alt="" style={{ width: 108, filter: 'drop-shadow(0 6px 10px rgba(31,31,31,0.12))' }} />
        </motion.div>
        <img src="/haalm/ui/fx/cloud-soft.svg" alt="" style={{ width: 82, opacity: 0.7, marginTop: 6 }} />
        <img src="/haalm/ui/fx/cloud-soft.svg" alt="" style={{ width: 60, opacity: 0.4, marginTop: 4 }} />
        <span
          className="glass--chip"
          style={{ fontSize: 13, fontWeight: 500, marginTop: 12, borderRadius: 999, padding: '6px 16px' }}
        >
          {t2('game.cloudshigh', { n: hops })}
        </span>
      </div>

      {/* timing bar */}
      <div style={{ width: '78%', marginBottom: 'calc(26px + var(--safe-bottom))', zIndex: 1 }}>
        <div
          className="glass--chip"
          style={{
            position: 'relative',
            height: 22,
            borderRadius: 999,
            border: flash === 'miss' ? '1.5px solid var(--berry)' : undefined,
            overflow: 'visible',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: `${zoneStart}%`,
              width: `${zoneWidth}%`,
              top: 3,
              bottom: 3,
              borderRadius: 999,
              background: flash === 'hit' ? 'var(--meadow)' : 'rgba(184,204,166,0.55)',
              border: '1px solid rgba(143,167,125,0.6)',
              transition: 'background 0.2s',
            }}
          />
          <img
            src="/haalm/ui/fx/sun.svg"
            alt=""
            style={{
              position: 'absolute',
              left: `${markerPos}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 30,
              filter: 'drop-shadow(0 1px 4px rgba(31,31,31,0.2))',
            }}
          />
        </div>
        <span
          className="muted"
          style={{ fontSize: 11, display: 'block', textAlign: 'center', marginTop: 8 }}
        >
          {t2('game.taptohop')}
        </span>
      </div>
    </div>
  )
}
