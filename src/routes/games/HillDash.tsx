import { useEffect, useRef, useState } from 'react'
import { GameShell, useGameShell } from './GameShell'
import { useActivePet } from '../../store/haalm'
import { portraitSrc } from '../../data/characters'

interface Bush {
  id: number
  x: number // % from left
}

export function HillDash() {
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)

  return (
    <GameShell
      gameId="hill-dash"
      title="Hill Dash"
      howTo="Tap anywhere to hop over the bushes. Every bush you clear counts. Three stumbles and the run is over!"
      score={score}
      playing={playing}
      onStart={() => {
        setScore(0)
        setPlaying(true)
      }}
    >
      {playing ? (
        <Track onScore={setScore} onEnd={() => setPlaying(false)} />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            background: 'linear-gradient(to bottom, var(--sky) 0%, #E3EFF9 55%, var(--meadow) 55.5%, #A6BD92 100%)',
            opacity: 0.5,
          }}
        />
      )}
    </GameShell>
  )
}

const GROUND = 62 // % from top where the ground line is
const JUMP_MS = 620

function Track({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const pet = useActivePet()
  const [bushes, setBushes] = useState<Bush[]>([])
  const [jumping, setJumping] = useState(false)
  const [lives, setLives] = useState(3)
  const [hit, setHit] = useState(false)

  const jumpingRef = useRef(false)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const nextId = useRef(1)
  const clearedIds = useRef(new Set<number>())
  const speedRef = useRef(26) // % per second

  const jump = () => {
    if (jumpingRef.current) return
    jumpingRef.current = true
    setJumping(true)
    setTimeout(() => {
      jumpingRef.current = false
      setJumping(false)
    }, JUMP_MS)
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let spawnIn = 900
    let ended = false

    const loop = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      spawnIn -= dt
      speedRef.current = Math.min(46, speedRef.current + dt * 0.0012)

      setBushes((prev) => {
        let next = prev.map((b) => ({ ...b, x: b.x - (speedRef.current * dt) / 1000 }))
        for (const b of next) {
          // the runner stands at x=20%
          if (b.x < 23 && b.x > 15 && !clearedIds.current.has(b.id)) {
            clearedIds.current.add(b.id)
            if (jumpingRef.current) {
              scoreRef.current += 1
              onScore(scoreRef.current)
            } else {
              livesRef.current -= 1
              setLives(livesRef.current)
              setHit(true)
              setTimeout(() => setHit(false), 400)
              if (livesRef.current <= 0 && !ended) {
                ended = true
                cancelAnimationFrame(raf)
                onEnd()
                finish(scoreRef.current)
              }
            }
          }
        }
        next = next.filter((b) => b.x > -10)
        if (spawnIn <= 0) {
          spawnIn = 1050 + Math.random() * 900 - Math.min(500, scoreRef.current * 18)
          next.push({ id: nextId.current++, x: 106 })
        }
        return next
      })
      if (!ended) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      onPointerDown={jump}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, var(--sky) 0%, #E3EFF9 55%, var(--meadow) 55.5%, #A6BD92 100%)',
        touchAction: 'none',
      }}
    >
      {/* lives */}
      <span
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          background: 'rgba(255,251,247,0.85)',
          borderRadius: 999,
          padding: '5px 12px',
          zIndex: 3,
        }}
      >
        {'♥'.repeat(lives)}
        <span style={{ opacity: 0.25 }}>{'♥'.repeat(3 - lives)}</span>
      </span>

      {/* scrolling clouds */}
      {[18, 52, 80].map((left, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${10 + i * 9}%`,
            width: 54,
            height: 18,
            borderRadius: 999,
            background: 'rgba(255,251,247,0.8)',
          }}
        />
      ))}

      {/* ground line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${GROUND + 7}%`,
          height: 2,
          background: 'rgba(31,31,31,0.06)',
        }}
      />

      {/* runner */}
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: `${GROUND}%`,
          transform: 'translate(-50%, -100%)',
          transition: `top ${JUMP_MS / 2}ms cubic-bezier(0.34, 1.4, 0.64, 1)`,
          ...(jumping ? { top: `${GROUND - 17}%` } : {}),
          filter: hit ? 'saturate(0.4)' : undefined,
        }}
      >
        <img
          src={pet ? portraitSrc(pet.id) : portraitSrc('gigi')}
          alt=""
          style={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            animation: hit ? 'dash-shake 0.35s' : undefined,
          }}
        />
      </div>
      <style>{`@keyframes dash-shake { 0%,100% { rotate: 0deg; } 30% { rotate: -8deg; } 60% { rotate: 6deg; } }`}</style>

      {/* bushes */}
      {bushes.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${GROUND + 7}%`,
            transform: 'translate(-50%, -100%)',
            width: 34,
            height: 24,
            borderRadius: '999px 999px 6px 6px',
            background: 'var(--meadow-dark)',
            boxShadow: 'inset 0 -4px 0 rgba(31,31,31,0.08)',
          }}
        />
      ))}

      <span
        className="muted"
        style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 11 }}
      >
        tap to hop
      </span>
    </div>
  )
}
