import { useEffect, useRef, useState } from 'react'
import { GameShell, useGameShell } from './GameShell'
import { stageOf, useActivePet } from '../../store/haalm'
import { useT } from '../../i18n'
import { spriteSrc } from '../../data/characters'

interface Bush {
  id: number
  x: number // % from left
}

export function HillDash() {
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)
  const { t } = useT()

  return (
    <GameShell
      gameId="hill-dash"
      title="Hill Dash"
      howTo={t('game.hill.howto')}
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
        <div style={{ position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden' }}>
          <img
            src="/haalm/games/hill-dash.jpg"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,244,236,0.55)' }} />
        </div>
      )}
    </GameShell>
  )
}

const GROUND = 68 // % from top where the runner stands
const JUMP_MS = 620

function Track({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const { t: t2 } = useT()
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
        next = next.filter((b) => b.x > -12)
        if (spawnIn <= 0) {
          spawnIn = 1050 + Math.random() * 900 - Math.min(500, scoreRef.current * 18)
          next.push({ id: nextId.current++, x: 108 })
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
        touchAction: 'none',
        background: 'var(--meadow)',
      }}
    >
      {/* scrolling illustrated scenery */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: `${GROUND + 8}%`,
          width: '200%',
          display: 'flex',
          animation: 'dash-scroll 16s linear infinite',
        }}
      >
        <img src="/haalm/games/hill-dash.jpg" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover' }} />
        <img src="/haalm/games/hill-dash.jpg" alt="" style={{ width: '50%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      </div>
      <style>{`
        @keyframes dash-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes dash-shake { 0%,100% { rotate: 0deg; } 30% { rotate: -8deg; } 60% { rotate: 6deg; } }
      `}</style>

      {/* meadow ground */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${GROUND + 8}%`,
          bottom: 0,
          background: 'linear-gradient(to bottom, #A6BD92, var(--meadow-dark))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${GROUND + 8}%`,
          height: 3,
          background: 'rgba(31,31,31,0.1)',
        }}
      />

      {/* lives */}
      <span
        className="glass--chip"
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          borderRadius: 999,
          padding: '6px 13px',
          zIndex: 3,
          color: 'var(--berry)',
        }}
      >
        {'♥'.repeat(lives)}
        <span style={{ opacity: 0.25 }}>{'♥'.repeat(3 - lives)}</span>
      </span>

      {/* runner */}
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: `${GROUND + 8.5}%`,
          transform: 'translate(-50%, 0)',
          width: 56,
          height: 10,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(31,31,31,0.3), rgba(31,31,31,0) 70%)',
          transition: `opacity ${JUMP_MS / 2}ms, scale ${JUMP_MS / 2}ms`,
          opacity: jumping ? 0.4 : 0.85,
          scale: jumping ? '0.7' : '1',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: `${GROUND + 8}%`,
          transform: 'translate(-50%, -100%)',
          transition: `top ${JUMP_MS / 2}ms cubic-bezier(0.34, 1.4, 0.64, 1)`,
          ...(jumping ? { top: `${GROUND - 12}%` } : {}),
          filter: hit ? 'saturate(0.4)' : undefined,
          zIndex: 2,
        }}
      >
        <img
          src={pet ? spriteSrc(pet.id, stageOf(pet)) : spriteSrc('gigi', 'young')}
          alt=""
          style={{
            height: 68,
            objectFit: 'contain',
            filter: 'drop-shadow(0 3px 4px rgba(31,31,31,0.2))',
            animation: hit ? 'dash-shake 0.35s' : undefined,
            transition: `transform 200ms`,
            transform: jumping ? 'scaleY(1.06) scaleX(0.96)' : 'scaleY(1)',
          }}
        />
      </div>

      {/* bushes */}
      {bushes.map((b) => (
        <img
          key={b.id}
          src="/haalm/ui/fx/bush.svg"
          alt=""
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${GROUND + 9}%`,
            transform: 'translate(-50%, -100%)',
            width: 54,
            filter: 'drop-shadow(0 3px 4px rgba(31,31,31,0.16))',
            zIndex: 1,
          }}
        />
      ))}

      <span
        className="glass--chip"
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11,
          color: 'var(--muted)',
          borderRadius: 999,
          padding: '5px 14px',
        }}
      >
        {t2('game.taptohop')}
      </span>
    </div>
  )
}
