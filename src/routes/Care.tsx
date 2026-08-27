import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { BackButton, Icon } from '../components/ui'
import { PetSprite } from '../components/PetSprite'
import { ParticleBurst, type ParticleKind } from '../components/Particles'
import { characterById, type CharacterId } from '../data/characters'
import { stageOf, useHaalm } from '../store/haalm'
import { useT } from '../i18n'

type CareAnim = 'feed' | 'clean' | 'sleep' | 'cuddle' | null

interface Floater {
  id: number
  text: string
  color: string
}

export function Care() {
  const { id } = useParams()
  const petId = (id ?? 'gigi') as CharacterId
  const pet = useHaalm((s) => s.pets[petId])
  const treats = useHaalm((s) => s.treats)
  const feed = useHaalm((s) => s.feed)
  const clean = useHaalm((s) => s.clean)
  const cuddle = useHaalm((s) => s.cuddle)
  const toggleSleep = useHaalm((s) => s.toggleSleep)

  const [anim, setAnim] = useState<CareAnim>(null)
  const [burst, setBurst] = useState<{ kind: ParticleKind; seq: number } | null>(null)
  const [snackFly, setSnackFly] = useState(0)
  const [note, setNote] = useState('')
  const [floaters, setFloaters] = useState<Floater[]>([])
  const seq = useRef(0)
  const { t, loc } = useT()

  if (!pet) return null
  const char = characterById(petId)
  const stage = stageOf(pet)

  const fireBurst = (kind: ParticleKind) => {
    seq.current += 1
    setBurst({ kind, seq: seq.current })
  }

  const addFloater = (text: string, color: string) => {
    seq.current += 1
    const f = { id: seq.current, text, color }
    setFloaters((prev) => [...prev, f])
    setTimeout(() => setFloaters((prev) => prev.filter((x) => x.id !== f.id)), 1400)
  }

  const play = (a: CareAnim, message: string, ms = 1400) => {
    setAnim(a)
    setNote(message)
    setTimeout(() => setAnim(null), ms)
    setTimeout(() => setNote(''), ms + 1000)
  }

  const setNoteBriefly = (m: string) => {
    setNote(m)
    setTimeout(() => setNote(''), 2200)
  }

  const onFeed = () => {
    if (pet.sleeping) return setNoteBriefly(t('care.asleep', { name: char.name }))
    if (treats < 1) return setNoteBriefly(t('care.notreats'))
    if (feed(petId)) {
      seq.current += 1
      setSnackFly(seq.current)
      setTimeout(() => {
        fireBurst('hearts')
        addFloater('+16', 'var(--berry)')
      }, 620)
      play('feed', t('care.munch', { name: char.name }))
    }
  }
  const onClean = () => {
    clean(petId)
    fireBurst('bubbles')
    setTimeout(() => fireBurst('sparkles'), 900)
    addFloater('+28', 'var(--sky)')
    play('clean', t('care.splish'), 1800)
  }
  const onSleep = () => {
    toggleSleep(petId)
    if (!pet.sleeping) {
      fireBurst('stars')
      play('sleep', t('care.dozing', { name: char.name }), 1800)
    } else {
      fireBurst('sparkles')
      setNoteBriefly(t('care.woke', { name: char.name }))
    }
  }
  const onCuddle = () => {
    if (pet.sleeping) return setNoteBriefly(t('care.asleep', { name: char.name }))
    cuddle(petId)
    fireBurst('hearts')
    addFloater('+10', 'var(--meadow-dark)')
    play('cuddle', t('care.loves', { name: char.name }))
  }

  const petMotion =
    anim === 'feed'
      ? { scale: [1, 1.025, 1] }
      : anim === 'clean'
        ? { rotate: [0, -1, 1, 0] }
        : anim === 'cuddle'
          ? { scaleX: [1, 1.03, 1], scaleY: [1, 0.98, 1] }
          : {}

  return (
    <div className="page px" style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}>
      {pet.sleeping && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--lavender)',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BackButton />
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            background: 'var(--warm-white)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '8px 14px',
          }}
        >
          <Icon name="apple" size={14} /> {t('care.treats', { n: treats })}
        </span>
      </div>

      <h1 style={{ fontSize: 26, textAlign: 'center', marginTop: 12 }}>{t('care.title')}</h1>
      <p className="muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 6 }}>
        {char.name} · {loc(stage === 'baby' ? char.babySpecies : char.species)}
      </p>

      {/* character on its little meadow patch */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '20px 0 8px', zIndex: 2 }}>
        <motion.div
          animate={petMotion}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{ position: 'relative', transformOrigin: '50% 100%' }}
        >
          <PetSprite
            id={petId}
            stage={stage}
            width="min(44vw, 185px)"
            sleeping={pet.sleeping}
            wander={false}
          />
          {burst && <ParticleBurst kind={burst.kind} trigger={burst.seq} count={burst.kind === 'bubbles' ? 12 : 9} />}

          {/* flying snack */}
          <AnimatePresence>
            {snackFly > 0 && (
              <motion.span
                key={snackFly}
                initial={{ opacity: 0, x: 110, y: 130, scale: 0.7, rotate: 20 }}
                animate={{ opacity: [0, 1, 1, 0], x: 30, y: 40, scale: [0.7, 1, 0.5], rotate: -8 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setSnackFly(0)}
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 9 }}
              >
                <Icon name="apple" size={26} />
              </motion.span>
            )}
          </AnimatePresence>

          {/* stat floaters */}
          {floaters.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -34 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '18%',
                right: '-12%',
                fontSize: 15,
                fontWeight: 500,
                color: f.color,
                zIndex: 9,
                pointerEvents: 'none',
              }}
            >
              {f.text}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* feedback line */}
      <div style={{ height: 22, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <AnimatePresence>
          {note && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="muted"
              style={{ fontSize: 13 }}
            >
              {note}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 2×2 care actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 12,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <CareAction label={t('care.feed')} sub={t('care.feedsub', { n: treats })} icon="apple" bg="rgba(232,162,175,0.34)" onClick={onFeed} />
        <CareAction label={t('care.cleanaction')} sub={t('care.cleansub')} icon="drop" bg="rgba(169,203,232,0.34)" onClick={onClean} />
        <CareAction
          label={pet.sleeping ? t('care.wake') : t('care.sleep')}
          sub={pet.sleeping ? t('care.wakesub') : t('care.sleepsub')}
          icon="moon"
          bg="rgba(205,185,219,0.34)"
          onClick={onSleep}
        />
        <CareAction label={t('care.cuddle')} sub={t('care.cuddlesub')} icon="heart" bg="rgba(232,162,175,0.2)" onClick={onCuddle} />
      </div>
    </div>
  )
}

function CareAction({
  label,
  sub,
  icon,
  bg,
  onClick,
}: {
  label: string
  sub: string
  icon: string
  bg: string
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      style={{
        background: bg,
        borderRadius: 22,
        padding: '22px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <motion.span
        whileTap={{ rotate: [0, -8, 8, 0] }}
        style={{
          width: 46,
          height: 46,
          borderRadius: 999,
          background: 'var(--warm-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} />
      </motion.span>
      <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
      <span className="muted" style={{ fontSize: 11 }}>
        {sub}
      </span>
    </motion.button>
  )
}
