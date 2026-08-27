import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell, useGameShell } from './GameShell'
import { CHARACTERS, portraitSrc, type CharacterId } from '../../data/characters'
import { useT } from '../../i18n'

interface Card {
  key: number
  charId: CharacterId
  flipped: boolean
  matched: boolean
}

const PAIRS = 6

const buildDeck = (): Card[] => {
  const chars = [...CHARACTERS].sort(() => Math.random() - 0.5).slice(0, PAIRS)
  const cards = chars.flatMap((c, i) => [
    { key: i * 2, charId: c.id, flipped: false, matched: false },
    { key: i * 2 + 1, charId: c.id, flipped: false, matched: false },
  ])
  return cards.sort(() => Math.random() - 0.5)
}

export function LeafMatch() {
  const [score, setScore] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0)
  const { t } = useT()

  return (
    <GameShell
      gameId="leaf-match"
      title="Leaf Match"
      howTo={t('game.leaf.howto')}
      score={score}
      playing={playing}
      onStart={() => {
        setScore(0)
        setRound((r) => r + 1)
        setPlaying(true)
      }}
    >
      {/* illustrated forest backdrop */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 26, overflow: 'hidden' }}>
        <img
          src="/haalm/games/leaf-match.jpg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: playing ? 'rgba(255,251,247,0.6)' : 'rgba(255,244,236,0.65)',
            backdropFilter: 'blur(2px)',
          }}
        />
      </div>
      {playing && <Board key={round} onScore={setScore} onEnd={() => setPlaying(false)} />}
    </GameShell>
  )
}

function Board({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const { t: t2 } = useT()
  const [deck, setDeck] = useState<Card[]>(buildDeck)
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const busy = useRef(false)

  const matchedCount = deck.filter((c) => c.matched).length

  useEffect(() => {
    if (matchedCount === PAIRS * 2) {
      const score = Math.max(4, 18 - Math.max(0, moves - PAIRS))
      onScore(score)
      const t = setTimeout(() => {
        onEnd()
        finish(score)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [matchedCount, moves, onEnd, onScore, finish])

  const flip = (key: number) => {
    if (busy.current) return
    const card = deck.find((c) => c.key === key)
    if (!card || card.flipped || card.matched) return

    const nowOpen = [...open, key]
    setDeck((d) => d.map((c) => (c.key === key ? { ...c, flipped: true } : c)))

    if (nowOpen.length < 2) {
      setOpen(nowOpen)
      return
    }

    setMoves((m) => m + 1)
    const first = deck.find((c) => c.key === nowOpen[0])!
    if (first.charId === card.charId) {
      setDeck((d) =>
        d.map((c) => (nowOpen.includes(c.key) ? { ...c, matched: true, flipped: true } : c))
      )
      setOpen([])
    } else {
      busy.current = true
      setOpen([])
      setTimeout(() => {
        setDeck((d) => d.map((c) => (c.matched ? c : { ...c, flipped: false })))
        busy.current = false
      }, 750)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span
        className="glass--chip"
        style={{
          fontSize: 12,
          textAlign: 'center',
          margin: '0 auto 14px',
          borderRadius: 999,
          padding: '6px 16px',
        }}
      >
        {t2('game.pairs', { a: matchedCount / 2, b: PAIRS, m: moves })}
      </span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          flex: 1,
          alignContent: 'center',
        }}
      >
        {deck.map((card) => {
          const shown = card.flipped || card.matched
          return (
            <motion.button
              key={card.key}
              onClick={() => flip(card.key)}
              whileTap={{ scale: 0.96 }}
              animate={{ opacity: card.matched ? 0.62 : 1 }}
              style={{
                aspectRatio: '3/3.4',
                perspective: 500,
                background: 'transparent',
              }}
            >
              <motion.div
                animate={{ rotateY: shown ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* back: leaf pattern */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(150deg, var(--meadow), #A6BD92)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 4px 14px rgba(31,31,31,0.12), inset 0 1px 0 rgba(255,255,255,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src="/haalm/ui/fx/leaf-fall.svg" alt="" style={{ width: 26, opacity: 0.8 }} />
                </div>
                {/* front: character */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'rgba(255,251,247,0.92)',
                    border: card.matched
                      ? '1.5px solid var(--honey)'
                      : '1px solid rgba(255,255,255,0.7)',
                    boxShadow: card.matched
                      ? '0 0 18px rgba(241,211,122,0.5)'
                      : '0 4px 14px rgba(31,31,31,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={portraitSrc(card.charId)}
                    alt=""
                    style={{ width: '70%', height: '70%', objectFit: 'contain' }}
                  />
                </div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
