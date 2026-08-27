import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell, useGameShell } from './GameShell'
import { CHARACTERS, portraitSrc, type CharacterId } from '../../data/characters'
import { Icon } from '../../components/ui'

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

  return (
    <GameShell
      gameId="leaf-match"
      title="Leaf Match"
      howTo="Flip the leaves and find each pair of Haalm friends. Fewer tries means a better score!"
      score={score}
      playing={playing}
      onStart={() => {
        setScore(0)
        setRound((r) => r + 1)
        setPlaying(true)
      }}
    >
      {playing && (
        <Board key={round} onScore={setScore} onEnd={() => setPlaying(false)} />
      )}
      {!playing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            background: 'rgba(184,204,166,0.28)',
          }}
        />
      )}
    </GameShell>
  )
}

function Board({ onScore, onEnd }: { onScore: (s: number) => void; onEnd: () => void }) {
  const { finish } = useGameShell()
  const [deck, setDeck] = useState<Card[]>(buildDeck)
  const [open, setOpen] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const busy = useRef(false)

  const matchedCount = deck.filter((c) => c.matched).length

  useEffect(() => {
    if (matchedCount === PAIRS * 2) {
      // score: perfect play (6 moves) = 18, each extra move costs 1
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
    const [a, b] = nowOpen.map((k) => deck.find((c) => c.key === k)!)
    const bCard = deck.find((c) => c.key === key)!
    if (a.charId === bCard.charId) {
      setDeck((d) =>
        d.map((c) => (nowOpen.includes(c.key) || c.key === key ? { ...c, matched: true, flipped: true } : c))
      )
      setOpen([])
    } else {
      busy.current = true
      setOpen([])
      setTimeout(() => {
        setDeck((d) => (d.map((c) => (c.matched ? c : { ...c, flipped: false }))))
        busy.current = false
      }, 750)
    }
    void b
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 26,
        background: 'rgba(184,204,166,0.28)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span className="muted" style={{ fontSize: 12, textAlign: 'center', marginBottom: 12 }}>
        {matchedCount / 2} / {PAIRS} pairs · {moves} tries
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
        {deck.map((card) => (
          <motion.button
            key={card.key}
            onClick={() => flip(card.key)}
            whileTap={{ scale: 0.96 }}
            animate={{ opacity: card.matched ? 0.55 : 1 }}
            style={{
              aspectRatio: '3/3.4',
              borderRadius: 16,
              background: card.flipped ? 'var(--warm-white)' : 'var(--meadow)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow)',
              perspective: 400,
            }}
          >
            {card.flipped ? (
              <motion.img
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.22 }}
                src={portraitSrc(card.charId)}
                alt=""
                style={{ width: '68%', height: '68%', objectFit: 'contain' }}
              />
            ) : (
              <Icon name="leaf" size={22} style={{ opacity: 0.55 }} />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
