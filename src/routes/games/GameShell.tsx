import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BackButton, Icon, SoftButton, softSpring } from '../../components/ui'
import { ParticleBurst } from '../../components/Particles'
import { characterById, iconSrc, portraitSrc } from '../../data/characters'
import { portraitStateOf, stageOf, useActivePet, useHaalm, type GameReward, type PetState } from '../../store/haalm'
import { useT } from '../../i18n'

export type GamePhase = 'ready' | 'playing' | 'done'

/**
 * Shared wrapper for every minigame: intro card, live score header,
 * and the reward summary that pays out universal coins / hearts / xp.
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
  const petStates = useHaalm((s) => s.pets)
  const availablePets = (Object.values(petStates) as PetState[]).filter((candidate) => candidate.health === 'healthy')
  const selectedPet = availablePets.find((candidate) => candidate.id === pet?.id) ?? availablePets[0] ?? null
  const setActivePet = useHaalm((s) => s.setActivePet)
  const finishGame = useHaalm((s) => s.finishGame)
  const [reward, setReward] = useState<GameReward | null>(null)
  const [phase, setPhase] = useState<GamePhase>('ready')
  const { t } = useT()

  const start = () => {
    if (!selectedPet) return
    setReward(null)
    setPhase('playing')
    onStart()
  }

  const finish = (finalScore: number) => {
    setReward(finishGame(gameId, finalScore, selectedPet?.id ?? null))
    setPhase('done')
  }

  return (
    <GameShellContext.Provider value={{ finish }}>
      <div className="page page--bare px" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton to="/play" />
          <span
            className="glass--chip"
            style={{
              fontSize: 14,
              fontWeight: 500,
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
                {availablePets.length > 1 && (
                  <div style={{ marginBottom: 16 }}>
                    <img src="/haalm/ui/runtime/games/pet-selector.png" alt="" width={58} height={58} style={{ display: 'block', margin: '0 auto 5px', objectFit: 'contain' }} />
                    <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginBottom: 9 }}>
                      {t('game.choosepet')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      {availablePets.map((candidate) => {
                        const selected = candidate.id === selectedPet?.id
                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            aria-label={characterById(candidate.id).name}
                            aria-pressed={selected}
                            onClick={() => setActivePet(candidate.id)}
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: 999,
                              display: 'grid',
                              placeItems: 'center',
                              background: selected ? 'var(--meadow)' : 'rgba(31,31,31,0.06)',
                              border: selected ? '2px solid var(--meadow-dark)' : '1px solid transparent',
                              transition: 'background 0.2s, border-color 0.2s',
                            }}
                          >
                            <img src={iconSrc(candidate.id, stageOf(candidate), portraitStateOf(candidate))} alt="" width={36} height={36} style={{ objectFit: 'contain' }} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                {availablePets.length === 0 && (
                  <p style={{ textAlign: 'center', fontSize: 12, marginBottom: 14 }}>{t('game.nohealthypet')}</p>
                )}
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.45, textAlign: 'center', marginBottom: 18 }}>
                  {howTo}
                </p>
                <SoftButton disabled={!selectedPet} onClick={start}>{t('game.letsplay')}</SoftButton>
              </Sheet>
            )}

            {/* results */}
            {phase === 'done' && reward && (
              <Sheet key="done">
                <img src="/haalm/ui/runtime/games/game-reward.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.18, pointerEvents: 'none' }} />
                {selectedPet && (
                  <motion.img
                    src={portraitSrc(selectedPet.id, stageOf(selectedPet), portraitStateOf(selectedPet))}
                    alt=""
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    transition={softSpring}
                    style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 8px', display: 'block' }}
                  />
                )}
                <p style={{ textAlign: 'center', fontSize: 17, fontWeight: 500, position: 'relative' }}>
                  {reward.newBest ? t('game.newbest') : t('game.wellplayed')}
                  {reward.newBest && <ParticleBurst kind="sparkles" trigger={score + 1} count={10} />}
                </p>
                <p className="muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 4 }}>
                  {t('game.score', { n: score })}
                  {selectedPet ? ` · ${t('game.hadfun', { name: characterById(selectedPet.id).name })}` : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '16px 0 20px' }}>
                  <RewardChip icon="coin" label={`+${reward.coins}`} raster />
                  <RewardChip icon="heart" label={`+${reward.hearts}`} />
                  <RewardChip icon="sparkle" label={`+${reward.xp} xp`} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SoftButton onClick={start}>{t('game.again')}</SoftButton>
                  <SoftButton variant="cream" onClick={() => navigate('/play')}>
                    {t('game.done')}
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
      className="glass"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 'calc(12px + var(--safe-bottom))',
        borderRadius: 24,
        padding: '22px 20px',
        zIndex: 20,
      }}
    >
      {children}
    </motion.div>
  )
}

function RewardChip({ icon, label, raster = false }: { icon: string; label: string; raster?: boolean }) {
  return (
    <span
      aria-label={label}
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
      {raster ? (
        <img src={`/haalm/ui/runtime/icons/${icon}.png`} alt="" width={16} height={16} />
      ) : (
        <Icon name={icon} size={14} />
      )}{' '}
      {label}
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
