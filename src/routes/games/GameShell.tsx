import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BackButton, Icon, SoftButton, softSpring } from '../../components/ui'
import { characterById, portraitSrc } from '../../data/characters'
import { useActivePet, useHaalm, type GameReward } from '../../store/haalm'

export type GamePhase = 'ready' | 'playing' | 'done'

/**
 * Shared wrapper for every minigame: intro card, live score header,
 * and the reward summary that pays out treats / hearts / xp.
 */
export function GameShell({
  gameId,
  title,
  howTo,
  score,
  playing,
  onStart,
  children,
}: {
  gameId: string
  title: string
  howTo: string
  score: number
  playing: boolean
  onStart: () => void
  children: ReactNode
}) {
  const navigate = useNavigate()
  const pet = useActivePet()
  const finishGame = useHaalm((s) => s.finishGame)
  const [reward, setReward] = useState<GameReward | null>(null)
  const [phase, setPhase] = useState<GamePhase>('ready')

  const start = () => {
    setReward(null)
    setPhase('playing')
    onStart()
  }

  const finish = (finalScore: number) => {
    setReward(finishGame(gameId, finalScore, pet?.id ?? null))
    setPhase('done')
  }

  return (
    <GameShellContext.Provider value={{ finish }}>
      <div className="page page--bare px" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton to="/play" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '8px 16px',
            }}
          >
            {score}
          </span>
        </div>

        <h1 style={{ fontSize: 22, textAlign: 'center', marginTop: 10 }}>{title}</h1>

        <div style={{ flex: 1, position: 'relative', marginTop: 12, paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
          {children}

          {/* intro */}
          <AnimatePresence>
            {phase === 'ready' && !playing && (
              <Sheet key="ready">
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.45, textAlign: 'center', marginBottom: 18 }}>
                  {howTo}
                </p>
                <SoftButton onClick={start}>Let’s play</SoftButton>
              </Sheet>
            )}

            {/* results */}
            {phase === 'done' && reward && (
              <Sheet key="done">
                {pet && (
                  <motion.img
                    src={portraitSrc(pet.id)}
                    alt=""
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={softSpring}
                    style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 8px', display: 'block' }}
                  />
                )}
                <p style={{ textAlign: 'center', fontSize: 17, fontWeight: 500 }}>
                  {reward.newBest ? 'New best!' : 'Well played!'}
                </p>
                <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 4 }}>
                  Score {score}
                  {pet ? ` · ${characterById(pet.id).name} had fun` : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '16px 0 20px' }}>
                  <RewardChip icon="apple" label={`+${reward.treats}`} />
                  <RewardChip icon="heart" label={`+${reward.hearts}`} />
                  <RewardChip icon="sparkle" label={`+${reward.xp} xp`} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SoftButton onClick={start}>Play again</SoftButton>
                  <SoftButton variant="cream" onClick={() => navigate('/play')}>
                    Done
                  </SoftButton>
                </div>
              </Sheet>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameShellContext.Provider>
  )
}

function Sheet({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26 }}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'calc(12px + var(--safe-bottom))',
        background: 'var(--warm-white)',
        borderRadius: 24,
        border: '1px solid var(--line)',
        padding: '22px 20px',
        boxShadow: '0 -8px 40px rgba(31,31,31,0.08)',
        zIndex: 20,
      }}
    >
      {children}
    </motion.div>
  )
}

function RewardChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        background: 'var(--cream)',
        borderRadius: 999,
        padding: '7px 14px',
      }}
    >
      <Icon name={icon} size={14} /> {label}
    </span>
  )
}

/* small context so games can end themselves */
import { createContext, useContext } from 'react'

const GameShellContext = createContext<{ finish: (score: number) => void } | null>(null)

export const useGameShell = () => {
  const ctx = useContext(GameShellContext)
  if (!ctx) throw new Error('useGameShell must be used inside GameShell')
  return ctx
}
