import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { BackButton, Icon } from '../components/ui'
import { CareOverlay, type OverlayKind } from '../components/Overlays'
import { characterById, spriteSrc, type CharacterId } from '../data/characters'
import { stageOf, useHaalm } from '../store/haalm'

type CareAnim = 'feed' | 'clean' | 'sleep' | 'cuddle' | null

export function Care() {
  const { id } = useParams()
  const petId = (id ?? 'gigi') as CharacterId
  const pet = useHaalm((s) => s.pets[petId])
  const treats = useHaalm((s) => s.treats)
  const feed = useHaalm((s) => s.feed)
  const clean = useHaalm((s) => s.clean)
  const cuddle = useHaalm((s) => s.cuddle)
  const toggleSleep = useHaalm((s) => s.toggleSleep)

  const [overlay, setOverlay] = useState<OverlayKind>(null)
  const [anim, setAnim] = useState<CareAnim>(null)
  const [note, setNote] = useState('')

  if (!pet) return null
  const char = characterById(petId)
  const stage = stageOf(pet)

  const show = (o: OverlayKind, a: CareAnim, message: string, ms = 1500) => {
    setOverlay(o)
    setAnim(a)
    setNote(message)
    setTimeout(() => {
      setOverlay(null)
      setAnim(null)
    }, ms)
    setTimeout(() => setNote(''), ms + 900)
  }

  const onFeed = () => {
    if (pet.sleeping) return setNoteBriefly(`${char.name} is fast asleep…`)
    if (treats < 1) return setNoteBriefly('No treats left — play a game to earn more!')
    if (feed(petId)) show('hearts', 'feed', `${char.name} munches happily · +hunger`)
  }
  const onClean = () => {
    clean(petId)
    show('bubbles', 'clean', 'Splish splash · all clean')
  }
  const onSleep = () => {
    toggleSleep(petId)
    if (!pet.sleeping) show('sleep', 'sleep', `Shh… ${char.name} is dozing off`, 1800)
    else setNoteBriefly(`${char.name} woke up refreshed!`)
  }
  const onCuddle = () => {
    if (pet.sleeping) return setNoteBriefly(`${char.name} is fast asleep…`)
    cuddle(petId)
    show('hearts', 'cuddle', `${char.name} loves you · +happiness`)
  }

  const setNoteBriefly = (m: string) => {
    setNote(m)
    setTimeout(() => setNote(''), 2200)
  }

  const characterMotion =
    anim === 'feed'
      ? { scale: [1, 1.025, 1] }
      : anim === 'clean'
        ? { rotate: [0, -0.5, 0.5, 0] }
        : anim === 'sleep'
          ? { y: [0, 3] }
          : anim === 'cuddle'
            ? { scaleX: [1, 1.02, 1], scaleY: [1, 0.985, 1] }
            : { y: [0, -2, 0] }

  return (
    <div className="page px" style={{ position: 'relative', minHeight: '100dvh' }}>
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
          <Icon name="apple" size={14} /> {treats} treats
        </span>
      </div>

      <h1 style={{ fontSize: 26, textAlign: 'center', marginTop: 12 }}>How can we take care?</h1>
      <p className="muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 6 }}>
        {char.name} · {stage === 'baby' ? char.babySpecies : char.species}
      </p>

      {/* character */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', margin: '20px 0 8px', zIndex: 2 }}>
        <div style={{ position: 'relative' }}>
          <motion.img
            src={spriteSrc(petId, stage)}
            alt={char.name}
            animate={characterMotion}
            transition={
              anim
                ? { duration: 0.5, ease: 'easeInOut' }
                : { duration: pet.sleeping ? 5.5 : 4.2, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{
              width: 'min(44vw, 185px)',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              filter: pet.sleeping ? 'brightness(0.94)' : undefined,
            }}
          />
          <CareOverlay kind={overlay} />
          {pet.sleeping && !overlay && (
            <motion.img
              src="/haalm/ui/overlays/sleep.svg"
              alt=""
              animate={{ opacity: [0.5, 0.8, 0.5], y: [0, -4, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '-16%', right: '-12%', width: '44%', pointerEvents: 'none' }}
            />
          )}
        </div>
      </div>

      {/* feedback line */}
      <div style={{ height: 22, textAlign: 'center' }}>
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
        <CareAction label="Feed" sub={`${treats} treats left`} icon="apple" bg="rgba(232,162,175,0.34)" onClick={onFeed} />
        <CareAction label="Clean" sub="Bubble bath" icon="drop" bg="rgba(169,203,232,0.34)" onClick={onClean} />
        <CareAction
          label={pet.sleeping ? 'Wake up' : 'Sleep'}
          sub={pet.sleeping ? 'Rise & shine' : 'Recover energy'}
          icon="moon"
          bg="rgba(205,185,219,0.34)"
          onClick={onSleep}
        />
        <CareAction label="Cuddle" sub="Show some love" icon="heart" bg="rgba(232,162,175,0.2)" onClick={onCuddle} />
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
      <span
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
      </span>
      <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
      <span className="muted" style={{ fontSize: 11 }}>
        {sub}
      </span>
    </motion.button>
  )
}
