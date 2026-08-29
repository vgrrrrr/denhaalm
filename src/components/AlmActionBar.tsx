import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { characterById, iconSrc, type CharacterId } from '../data/characters'
import { foodPriceFor } from '../data/economy'
import { moodOf, portraitStateOf, stageOf, useActivePet, useHaalm, type PetState } from '../store/haalm'
import { useT } from '../i18n'

export type AlmAction = 'feed' | 'clean' | 'sleep' | 'cuddle'

export interface AlmActionBarProps {
  /** Pass a pet when the Alm is showing a specific animal; otherwise the active pet is used. */
  pet?: PetState | null
  /** Disables every action while the surrounding Alm interaction is unavailable. */
  disabled?: boolean
  /** Optional state supplied by a future health system. Sick pets stay safely inactive. */
  sick?: boolean
  /** Optional copy for a disabled state (for example while a scene is loading). */
  disabledReason?: string
  /** Receives the same short feedback that is shown in the bar. */
  onFeedback?: (message: string) => void
  /** Lets the surrounding scene animate the selected pet during the action. */
  onActionAnimation?: (action: AlmAction | null) => void
  /** Use the tighter layout when the bar sits inside a scene sheet. */
  compact?: boolean
  style?: CSSProperties
}

interface ActionDefinition {
  key: AlmAction
  icon: string
  label: string
  sub: string
  background: string
}

const actionIcon = (key: AlmAction) =>
  key === 'feed'
    ? '/haalm/ui/runtime/food/feeding-bowl.png'
    : `/haalm/ui/runtime/care/${key === 'clean' ? 'wash-kit.png' : key === 'sleep' ? 'sleep-set.png' : 'cuddle-pillow.png'}`

/**
 * Small, Alm-native care controls. The component deliberately owns only the
 * immediate action and feedback layer; the existing Care route can remain the
 * more tactile, drag-based experience.
 */
export function AlmActionBar({
  pet: petProp,
  disabled = false,
  sick = false,
  disabledReason,
  onFeedback,
  onActionAnimation,
  compact = false,
  style,
}: AlmActionBarProps) {
  const activePet = useActivePet()
  const pet = petProp === undefined ? activePet : petProp
  const treats = useHaalm((s) => s.treats)
  const coins = useHaalm((s) => s.coins ?? 0)
  const feed = useHaalm((s) => s.feed)
  const buyFood = useHaalm((s) => s.buyFood)
  const clean = useHaalm((s) => s.clean)
  const cuddle = useHaalm((s) => s.cuddle)
  const toggleSleep = useHaalm((s) => s.toggleSleep)
  const { t, lang } = useT()
  const [feedback, setFeedback] = useState('')
  const [interaction, setInteraction] = useState<Extract<AlmAction, 'feed' | 'clean'> | null>(null)
  const [interactionKey, setInteractionKey] = useState(0)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      if (animationTimer.current) clearTimeout(animationTimer.current)
    }
  }, [])

  const say = (message: string) => {
    setFeedback(message)
    onFeedback?.(message)
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    feedbackTimer.current = setTimeout(() => setFeedback(''), 2500)
  }

  const unavailable = () => {
    if (!pet) return lang === 'de' ? 'Noch kein Haalm ausgewählt.' : 'No Haalm selected yet.'
    if (disabledReason) return disabledReason
    if (sick || (pet && pet.health !== 'healthy')) return lang === 'de' ? 'Heute braucht dein Haalm erst Medizin und Ruhe.' : 'Your Haalm needs medicine and rest today.'
    if (disabled) return lang === 'de' ? 'Gerade nicht möglich.' : 'Not available right now.'
    return null
  }

  const blockedFor = (key: AlmAction) => {
    const general = unavailable()
    if (general) return general
    if (!pet) return lang === 'de' ? 'Noch kein Haalm ausgewählt.' : 'No Haalm selected yet.'
    if (pet.sleeping && key !== 'sleep') return t('care.asleep', { name: characterById(pet.id).name })
    if (key === 'feed' && treats < 1 && coins < foodPriceFor(pet.id)) return t('care.notreats')
    return null
  }

  const animatePet = (key: AlmAction) => {
    onActionAnimation?.(key)
    if (animationTimer.current) clearTimeout(animationTimer.current)
    animationTimer.current = setTimeout(() => {
      animationTimer.current = null
      onActionAnimation?.(null)
    }, key === 'clean' ? 1450 : key === 'sleep' ? 1100 : 1150)
  }

  const applyAction = (key: AlmAction) => {
    const blocked = blockedFor(key)
    if (blocked) {
      say(blocked)
      return
    }
    if (!pet) return
    const name = characterById(pet.id).name
    if (key === 'feed') {
      // Empty food never causes a hidden spend. The button explicitly changes
      // to a purchase action and feeding requires a second, intentional tap.
      if (treats < 1) {
        if (buyFood(1, pet.id)) say(t('care.foodbought', { n: foodPriceFor(pet.id) }))
        return
      }
      if (feed(pet.id)) {
        animatePet('feed')
        say(t('care.munch', { name }))
      }
      else say(treats < 1 ? t('care.notreats') : t('care.asleep', { name }))
      return
    }
    if (key === 'clean') {
      clean(pet.id)
      animatePet('clean')
      say(t('care.sparkling'))
      return
    }
    if (key === 'cuddle') {
      cuddle(pet.id)
      animatePet('cuddle')
      say(t('care.loves', { name }))
      return
    }
    const waking = pet.sleeping
    toggleSleep(pet.id)
    if (!waking) animatePet('sleep')
    say(waking ? t('care.woke', { name }) : t('care.dozing', { name }))
  }

  const startAction = (key: AlmAction) => {
    if (interaction) return
    const blocked = blockedFor(key)
    if (blocked) {
      say(blocked)
      return
    }
    if (key === 'feed' || key === 'clean') {
      setInteraction(key)
      setInteractionKey((value) => value + 1)
      return
    }
    applyAction(key)
  }

  const finishInteraction = (key: Extract<AlmAction, 'feed' | 'clean'>, offsetY: number) => {
    if (offsetY < -44) {
      setInteraction(null)
      applyAction(key)
      return
    }
    setInteractionKey((value) => value + 1)
    say(key === 'feed' ? t('care.dragfeed', { name: pet ? characterById(pet.id).name : '' }) : t('care.dragwash', { name: pet ? characterById(pet.id).name : '' }))
  }

  const definitions: ActionDefinition[] = [
    {
      key: 'feed',
      icon: actionIcon('feed'),
      label: treats < 1 ? t('care.buyfood') : t('care.feed'),
      sub: treats < 1 ? t('care.foodprice', { n: pet ? foodPriceFor(pet.id) : 2 }) : t('care.feedsub', { n: treats }),
      background: 'rgba(232,162,175,0.36)',
    },
    {
      key: 'clean',
      icon: actionIcon('clean'),
      label: t('care.cleanaction'),
      sub: t('care.cleansub'),
      background: 'rgba(169,203,232,0.36)',
    },
    {
      key: 'sleep',
      icon: actionIcon('sleep'),
      label: pet?.sleeping ? t('care.wake') : t('care.sleep'),
      sub: pet?.sleeping ? t('care.wakesub') : t('care.sleepsub'),
      background: 'rgba(205,185,219,0.38)',
    },
    {
      key: 'cuddle',
      icon: actionIcon('cuddle'),
      label: t('care.cuddle'),
      sub: t('care.cuddlesub'),
      background: 'rgba(232,162,175,0.22)',
    },
  ]

  const petCharacter = pet ? characterById(pet.id) : null
  const size = compact ? 30 : 35

  return (
    <section
      aria-label={lang === 'de' ? 'Haalm versorgen' : 'Care for your Haalm'}
      className="glass"
      style={{
        position: 'relative',
        borderRadius: compact ? 20 : 24,
        padding: compact ? '11px 10px 10px' : '14px 12px 12px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 30, marginBottom: compact ? 8 : 10 }}>
        {petCharacter ? (
          <img
            src={iconSrc(petCharacter.id as CharacterId, pet ? stageOf(pet) : 'young', pet ? portraitStateOf(pet) : 'neutral')}
            alt=""
            width={size}
            height={size}
            style={{ objectFit: 'contain', borderRadius: 999, flex: '0 0 auto' }}
          />
        ) : (
          <span aria-hidden="true" style={{ width: size, height: size, borderRadius: 999, background: 'rgba(31,31,31,0.08)', flex: '0 0 auto' }} />
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: compact ? 12 : 13, fontWeight: 500, lineHeight: 1.1 }}>
            {petCharacter?.name ?? (lang === 'de' ? 'Dein Haalm' : 'Your Haalm')}
          </p>
          {pet && (
            <p className="muted" style={{ fontSize: 11, marginTop: 3 }}>
              {t('care.treats', { n: treats })} · {t('alm.coins', { n: coins })} · {t(moodOf(pet))}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: compact ? 6 : 8 }}>
        {definitions.map((action) => {
          const blocked = Boolean(blockedFor(action.key))
          return (
            <motion.button
              key={action.key}
              type="button"
              aria-label={`${action.label}${blocked ? ` · ${blockedFor(action.key)}` : ''}`}
              aria-disabled={blocked || Boolean(interaction)}
              onClick={() => startAction(action.key)}
              whileTap={{ scale: 0.94 }}
              style={{
                minWidth: 0,
                borderRadius: compact ? 15 : 18,
                padding: compact ? '7px 3px 8px' : '8px 4px 9px',
                background: action.background,
                opacity: blocked ? 0.42 : interaction ? 0.34 : 1,
                transition: 'opacity 0.2s ease, filter 0.2s ease',
                filter: blocked ? 'grayscale(0.22)' : undefined,
                cursor: blocked || interaction ? 'not-allowed' : 'pointer',
              }}
            >
              <img
                src={action.icon}
                alt=""
                width={compact ? 30 : 36}
                height={compact ? 30 : 36}
                style={{ display: 'block', width: compact ? 30 : 36, height: compact ? 30 : 36, objectFit: 'contain', margin: '0 auto 3px' }}
              />
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: compact ? 10 : 10.5, fontWeight: 500 }}>{action.label}</span>
              {!compact && <span className="muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 9.5, marginTop: 2 }}>{action.sub}</span>}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {interaction && (
          <motion.div
            key={`${interaction}-${interactionKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ position: 'absolute', left: 8, right: 8, top: compact ? 46 : 76, zIndex: 4 }}
          >
            <div
              style={{
                minHeight: compact ? 67 : 78,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                borderRadius: compact ? 15 : 18,
                padding: compact ? '7px 9px' : '9px 11px',
                background: 'rgba(255,251,247,0.58)',
                border: '1px solid rgba(31,31,31,0.08)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: compact ? 10.5 : 11.5, fontWeight: 500 }}>
                  {interaction === 'feed' ? t('care.dragfeed', { name: pet ? characterById(pet.id).name : '' }) : t('care.dragwash', { name: pet ? characterById(pet.id).name : '' })}
                </p>
                <p className="muted" style={{ fontSize: compact ? 9.5 : 10, marginTop: 3 }}>
                  {lang === 'de' ? 'Nach oben ziehen' : 'Drag upward'}
                </p>
              </div>
              <motion.div
                key={interactionKey}
                drag="y"
                dragConstraints={{ top: -92, bottom: 0 }}
                dragElastic={0.16}
                dragMomentum={false}
                onDragEnd={(_event, info) => finishInteraction(interaction, info.offset.y)}
                whileDrag={{ scale: 1.12, rotate: interaction === 'feed' ? -7 : 8 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: compact ? 42 : 50, height: compact ? 42 : 50, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'rgba(255,255,255,0.75)', cursor: 'grab', touchAction: 'none', flex: '0 0 auto' }}
              >
                <img
                  src={actionIcon(interaction)}
                  alt=""
                  width={compact ? 34 : 41}
                  height={compact ? 34 : 41}
                  style={{ objectFit: 'contain', pointerEvents: 'none' }}
                />
              </motion.div>
              <button
                type="button"
                aria-label={t('care.cancel')}
                onClick={() => setInteraction(null)}
                style={{ width: 25, height: 25, borderRadius: 999, color: 'var(--muted)', fontSize: 16, lineHeight: 1, flex: '0 0 auto' }}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.p
            key={feedback}
            role="status"
            initial={{ opacity: 0, y: 5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 'calc(100% + 8px)',
              padding: '8px 12px',
              borderRadius: 999,
              background: 'rgba(255,251,247,0.94)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              textAlign: 'center',
              fontSize: 12,
              lineHeight: 1.25,
              pointerEvents: 'none',
            }}
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}
