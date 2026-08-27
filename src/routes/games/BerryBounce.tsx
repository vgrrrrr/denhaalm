import { useEffect, useRef, useState } from 'react'
import { GameShell, useGameShell } from './GameShell'
import { useActivePet } from '../../store/haalm'
import { useT } from '../../i18n'
import { portraitSrc } from '../../data/characters'

const GAME_SECONDS = 30

interface Berry {
  id: number
  x: number // 0..100 %
  y: number // 0..100 %
  speed: number
  golden: boolean
}

export function BerryBounce() {
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)
  const { t } = useT()

  return (
    <GameShell
      gameId="berry-bounce"
      title="Berry Bounce"
      howTo={t('game.berry.howto')}
      score={score}
      playing={playing}
      onStart={() => {
        setScore(0)
        setPlaying(true)
      }}
    >
      {playing && <Field onScore={setScore} onEnd={() => setPlaying(false)} />}
      {!playing && <FieldBackdrop />}
    </GameShell>
  )
}

function FieldBackdrop() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        background: 'linear-gradient(to bottom, var(--sky) 0%, #DCEAF7 34%, var(--meadow) 34.5%, #A6BD92 100%)',
        opacity: 0.5,
      }}
    />
  )
}

function Field({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const pet = useActivePet()
  const fieldRef = useRef<HTMLDivElement>(null)
  const [berries, setBerries] = useState<Berry[]>([])
  const [basketX, setBasketX] = useState(50)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [pop, setPop] = useState<{ x: number; y: number; id: number } | null>(null)
  const scoreRef = useRef(0)
  const basketRef = useRef(50)
  const nextId = useRef(1)

  basketRef.current = basketX

  // game loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let spawnIn = 400

    const loop = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      spawnIn -= dt
      setBerries((prev) => {
        let next = prev.map((b) => ({ ...b, y: b.y + (b.speed * dt) / 1000 }))
        // catch check near basket line (y ~ 86%)
        const caught = next.filter(
          (b) => b.y >= 82 && b.y <= 94 && Math.abs(b.x - basketRef.current) < 11
        )
        if (caught.length) {
          for (const c of caught) {
            scoreRef.current += c.golden ? 3 : 1
            setPop({ x: c.x, y: 84, id: c.id })
          }
          onScore(scoreRef.current)
          const ids = new Set(caught.map((c) => c.id))
          next = next.filter((b) => !ids.has(b.id))
        }
        next = next.filter((b) => b.y < 105)
        if (spawnIn <= 0) {
          spawnIn = 520 + Math.random() * 420
          next.push({
            id: nextId.current++,
            x: 8 + Math.random() * 84,
            y: -4,
            speed: 26 + Math.random() * 16,
            golden: Math.random() < 0.14,
          })
        }
        return next
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [onScore])

  // timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t)
          onEnd()
          finish(scoreRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const movePointer = (clientX: number) => {
    const rect = fieldRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((clientX - rect.left) / rect.width) * 100
    setBasketX(Math.max(8, Math.min(92, x)))
  }

  return (
    <div
      ref={fieldRef}
      onPointerMove={(e) => movePointer(e.clientX)}
      onPointerDown={(e) => movePointer(e.clientX)}
      onTouchMove={(e) => movePointer(e.touches[0].clientX)}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, var(--sky) 0%, #DCEAF7 40%, var(--meadow) 40.5%, #A6BD92 100%)',
        touchAction: 'none',
        cursor: 'none',
      }}
    >
      {/* timer */}
      <span
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          fontWeight: 500,
          background: 'rgba(255,251,247,0.85)',
          borderRadius: 999,
          padding: '5px 12px',
          zIndex: 3,
        }}
      >
        {timeLeft}s
      </span>

      {berries.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: 'translate(-50%, -50%)',
            width: b.golden ? 22 : 18,
            height: b.golden ? 22 : 18,
            borderRadius: 999,
            background: b.golden ? 'var(--honey)' : 'var(--berry)',
            boxShadow: 'inset -2px -3px 0 rgba(31,31,31,0.08)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -4,
              left: '50%',
              transform: 'translateX(-50%) rotate(-16deg)',
              width: 6,
              height: 7,
              borderRadius: '999px 999px 2px 2px',
              background: 'var(--meadow-dark)',
            }}
          />
        </span>
      ))}

      {/* catch pop */}
      {pop && (
        <span
          key={pop.id}
          style={{
            position: 'absolute',
            left: `${pop.x}%`,
            top: `${pop.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: 15,
            animation: 'berry-pop 0.5s ease-out forwards',
            pointerEvents: 'none',
          }}
        >
          +1
        </span>
      )}
      <style>{`@keyframes berry-pop { from { opacity: 1; translate: 0 0; } to { opacity: 0; translate: 0 -18px; } }`}</style>

      {/* basket with the pet portrait riding it */}
      <div
        style={{
          position: 'absolute',
          left: `${basketX}%`,
          top: '86%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {pet && (
          <img
            src={portraitSrc(pet.id)}
            alt=""
            style={{ width: 40, height: 40, objectFit: 'contain', marginBottom: -6 }}
          />
        )}
        <div
          style={{
            width: 72,
            height: 26,
            borderRadius: '0 0 24px 24px',
            background: '#C9A97F',
            border: '2px solid #B29065',
            borderTop: '3px solid #B29065',
          }}
        />
      </div>
    </div>
  )
}
