import { useEffect, useRef, useState } from 'react'
import { GameShell, useGameShell } from './GameShell'
import { stageOf, useActivePet } from '../../store/haalm'
import { useT } from '../../i18n'
import { spriteSrc } from '../../data/characters'

const GAME_SECONDS = 30

interface Berry {
  id: number
  x: number // 0..100 %
  y: number // 0..100 %
  speed: number
  golden: boolean
  spin: number
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
      <Backdrop dimmed={!playing} />
      {playing && <Field onScore={setScore} onEnd={() => setPlaying(false)} />}
    </GameShell>
  )
}

function Backdrop({ dimmed }: { dimmed: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden' }}>
      <img
        src="/haalm/games/berry-bounce.jpg"
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: dimmed
            ? 'rgba(255,244,236,0.55)'
            : 'linear-gradient(to bottom, rgba(255,251,247,0.16), rgba(255,251,247,0) 40%)',
        }}
      />
    </div>
  )
}

function Field({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const pet = useActivePet()
  const fieldRef = useRef<HTMLDivElement>(null)
  const [berries, setBerries] = useState<Berry[]>([])
  const [basketX, setBasketX] = useState(50)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [pop, setPop] = useState<{ x: number; id: number; golden: boolean } | null>(null)
  const scoreRef = useRef(0)
  const basketRef = useRef(50)
  const nextId = useRef(1)

  basketRef.current = basketX

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
        const caught = next.filter(
          (b) => b.y >= 80 && b.y <= 93 && Math.abs(b.x - basketRef.current) < 12
        )
        if (caught.length) {
          for (const c of caught) {
            scoreRef.current += c.golden ? 3 : 1
            setPop({ x: c.x, id: c.id, golden: c.golden })
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
            y: -6,
            speed: 26 + Math.random() * 16,
            golden: Math.random() < 0.14,
            spin: Math.random() < 0.5 ? -1 : 1,
          })
        }
        return next
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [onScore])

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
    setBasketX(Math.max(9, Math.min(91, x)))
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
        touchAction: 'none',
      }}
    >
      {/* timer */}
      <span
        className="glass--chip"
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontSize: 13,
          fontWeight: 500,
          borderRadius: 999,
          padding: '6px 13px',
          zIndex: 3,
        }}
      >
        {timeLeft}s
      </span>

      {berries.map((b) => (
        <img
          key={b.id}
          src={b.golden ? '/haalm/ui/fx/berry-golden.svg' : '/haalm/ui/fx/berry.svg'}
          alt=""
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.golden ? 34 : 28,
            transform: `translate(-50%, -50%) rotate(${b.y * 2.4 * b.spin}deg)`,
            filter: 'drop-shadow(0 3px 4px rgba(31,31,31,0.18))',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* catch pop */}
      {pop && (
        <span
          key={pop.id}
          style={{
            position: 'absolute',
            left: `${pop.x}%`,
            top: '80%',
            transform: 'translate(-50%, -50%)',
            fontSize: 15,
            fontWeight: 500,
            color: pop.golden ? 'var(--honey)' : 'var(--warm-white)',
            textShadow: '0 1px 4px rgba(31,31,31,0.35)',
            animation: 'berry-pop 0.55s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          +{pop.golden ? 3 : 1}
        </span>
      )}
      <style>{`@keyframes berry-pop { from { opacity: 1; translate: 0 0; } to { opacity: 0; translate: 0 -22px; } }`}</style>

      {/* basket with the pet riding along */}
      <div
        style={{
          position: 'absolute',
          left: `${basketX}%`,
          top: '87%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'left 0.05s linear',
        }}
      >
        {pet && (
          <img
            src={spriteSrc(pet.id, stageOf(pet))}
            alt=""
            style={{
              height: 52,
              objectFit: 'contain',
              marginBottom: -8,
              filter: 'drop-shadow(0 2px 3px rgba(31,31,31,0.2))',
            }}
          />
        )}
        <img
          src="/haalm/ui/fx/basket.svg"
          alt=""
          style={{ width: 86, filter: 'drop-shadow(0 4px 6px rgba(31,31,31,0.22))' }}
        />
        <div
          style={{
            width: 60,
            height: 8,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(31,31,31,0.28), rgba(31,31,31,0) 70%)',
            marginTop: 3,
          }}
        />
      </div>
    </div>
  )
}
