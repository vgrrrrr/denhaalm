import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { BackButton, Icon } from '../components/ui'
import { PetSprite } from '../components/PetSprite'
import { useChatter } from '../components/useChatter'
import { ParticleBurst, type ParticleKind } from '../components/Particles'
import { characterById, type CharacterId } from '../data/characters'
import { stageOf, useHaalm } from '../store/haalm'
import { useT } from '../i18n'

type CareAnim = 'feed' | 'clean' | 'sleep' | 'cuddle' | null
type CareMode = 'idle' | 'feeding' | 'scrubbing' | 'tucking'

interface Floater {
  id: number
  text: string
  color: string
}

interface ScrubBubble {
  id: number
  x: number
  y: number
  size: number
}

const SCRUB_TARGET = 360 // px of rubbing needed for a full clean

export function Care() {
  const { id } = useParams()
  const petId = (id ?? 'gigi') as CharacterId
  const pet = useHaalm((s) => s.pets[petId])
  const treats = useHaalm((s) => s.treats)
  const feed = useHaalm((s) => s.feed)
  const clean = useHaalm((s) => s.clean)
  const cuddle = useHaalm((s) => s.cuddle)
  const toggleSleep = useHaalm((s) => s.toggleSleep)

  const [mode, setMode] = useState<CareMode>('idle')
  const [anim, setAnim] = useState<CareAnim>(null)
  const [chewing, setChewing] = useState(false)
  const [burst, setBurst] = useState<{ kind: ParticleKind; seq: number } | null>(null)
  const [note, setNote] = useState('')
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [dragKey, setDragKey] = useState(0)
  const [scrub, setScrub] = useState(0)
  const [bubbles, setBubbles] = useState<ScrubBubble[]>([])
  const [spongePos, setSpongePos] = useState<{ x: number; y: number } | null>(null)

  const petRef = useRef<HTMLDivElement>(null)
  const scrubLast = useRef<{ x: number; y: number } | null>(null)
  const scrubTotal = useRef(0)
  const seq = useRef(0)
  const { t, loc } = useT()
  // spoken reactions to care actions; no idle chatter while hands-on
  const { speech, say } = useChatter(pet ?? null, { idle: false })

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

  const playAnim = (a: CareAnim, message: string, ms = 1400) => {
    setAnim(a)
    setNote(message)
    setTimeout(() => setAnim(null), ms)
    setTimeout(() => setNote(''), ms + 1000)
  }

  const setNoteBriefly = (m: string) => {
    setNote(m)
    setTimeout(() => setNote(''), 2200)
  }

  /* ------------------------------------------------ feed: drag the snack */

  const startFeeding = () => {
    if (pet.sleeping) return setNoteBriefly(t('care.asleep', { name: char.name }))
    if (treats < 1) return setNoteBriefly(t('care.notreats'))
    setDragKey((k) => k + 1)
    setMode('feeding')
    setNote(t('care.dragfeed', { name: char.name }))
  }

  const onSnackDragEnd = (pointX: number, pointY: number) => {
    const rect = petRef.current?.getBoundingClientRect()
    const hit =
      rect &&
      pointX > rect.left - 14 &&
      pointX < rect.right + 14 &&
      pointY > rect.top - 14 &&
      pointY < rect.bottom + 14
    if (hit && feed(petId)) {
      setMode('idle')
      // eating: chewing squash loop, then hearts
      setChewing(true)
      setTimeout(() => {
        setChewing(false)
        fireBurst('hearts')
        addFloater('+16', 'var(--berry)')
        say('feed')
      }, 1100)
      playAnim('feed', t('care.munch', { name: char.name }), 1400)
    } else {
      // snap back — keep feeding mode so the user can retry
      setDragKey((k) => k + 1)
    }
  }

  /* ------------------------------------------------ clean: scrub the pet */

  const startScrubbing = () => {
    scrubTotal.current = 0
    setScrub(0)
    setBubbles([])
    setMode('scrubbing')
    setNote(t('care.scrubhint', { name: char.name }))
  }

  const onScrubMove = (e: React.PointerEvent) => {
    if (mode !== 'scrubbing' || e.buttons === 0) return
    const rect = petRef.current?.getBoundingClientRect()
    if (!rect) return
    const inside =
      e.clientX > rect.left - 20 &&
      e.clientX < rect.right + 20 &&
      e.clientY > rect.top - 20 &&
      e.clientY < rect.bottom + 20
    setSpongePos({ x: e.clientX, y: e.clientY })
    if (!inside) {
      scrubLast.current = null
      return
    }
    const last = scrubLast.current
    scrubLast.current = { x: e.clientX, y: e.clientY }
    if (!last) return
    const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y)
    scrubTotal.current = Math.min(SCRUB_TARGET, scrubTotal.current + dist)
    const progress = scrubTotal.current / SCRUB_TARGET
    setScrub(progress)

    // spawn a bubble every so often at the sponge
    if (Math.random() < Math.min(0.5, dist / 22)) {
      seq.current += 1
      const b = {
        id: seq.current,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: 8 + Math.random() * 12,
      }
      setBubbles((prev) => [...prev.slice(-14), b])
      setTimeout(() => setBubbles((prev) => prev.filter((x) => x.id !== b.id)), 900)
    }

    if (progress >= 1) {
      finishScrub()
    }
  }

  const finishScrub = () => {
    setMode('idle')
    setSpongePos(null)
    scrubLast.current = null
    clean(petId)
    fireBurst('sparkles')
    addFloater('+28', 'var(--sky)')
    say('clean')
    playAnim('clean', t('care.sparkling'), 1600)
  }

  /* --------------------------------------------------- sleep and cuddle */

  const onSleep = () => {
    if (mode !== 'idle') return
    if (pet.sleeping) {
      toggleSleep(petId)
      fireBurst('sparkles')
      say('wake')
      setNoteBriefly(t('care.woke', { name: char.name }))
      return
    }
    // tucking in: drag the blanket over the pet
    setDragKey((k) => k + 1)
    setMode('tucking')
    setNote(t('care.dragblanket', { name: char.name }))
  }

  const onBlanketDragEnd = (pointX: number, pointY: number) => {
    const rect = petRef.current?.getBoundingClientRect()
    const hit =
      rect &&
      pointX > rect.left - 20 &&
      pointX < rect.right + 20 &&
      pointY > rect.top - 20 &&
      pointY < rect.bottom + 20
    if (hit) {
      setMode('idle')
      say('tucked')
      toggleSleep(petId)
      fireBurst('stars')
      playAnim('sleep', t('care.tucked', { name: char.name }), 2000)
    } else {
      setDragKey((k) => k + 1)
    }
  }
  const onCuddle = () => {
    if (mode !== 'idle') return
    if (pet.sleeping) return setNoteBriefly(t('care.asleep', { name: char.name }))
    cuddle(petId)
    fireBurst('hearts')
    addFloater('+10', 'var(--meadow-dark)')
    say('cuddle')
    playAnim('cuddle', t('care.loves', { name: char.name }))
  }

  const petMotion = chewing
    ? { scaleY: [1, 0.955, 1, 0.955, 1, 0.965, 1], scaleX: [1, 1.02, 1, 1.02, 1, 1.015, 1], rotate: [0, -1, 0, 1, 0, -0.5, 0] }
    : anim === 'clean'
      ? { rotate: [0, -1, 1, 0] }
      : anim === 'cuddle'
        ? { scaleX: [1, 1.03, 1], scaleY: [1, 0.98, 1] }
        : mode === 'scrubbing'
          ? { rotate: [-0.8, 0.8, -0.8] }
          : {}

  return (
    <div
      className="page px"
      style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}
      onPointerMove={onScrubMove}
      onPointerUp={() => {
        scrubLast.current = null
        if (mode === 'scrubbing') setSpongePos(null)
      }}
    >
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
          className="glass--chip"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
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
          ref={petRef}
          animate={petMotion}
          transition={{ duration: chewing ? 1.05 : 0.55, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            transformOrigin: '50% 100%',
            touchAction: mode === 'scrubbing' ? 'none' : undefined,
          }}
        >
          <PetSprite
            id={petId}
            stage={stage}
            width="min(44vw, 185px)"
            sleeping={pet.sleeping}
            speech={speech}
            wander={false}
            onTap={() => mode === 'idle' && !pet.sleeping && say('tap')}
          />
          {burst && <ParticleBurst kind={burst.kind} trigger={burst.seq} count={9} />}

          {/* scrub bubbles at the sponge position */}
          {bubbles.map((b) => (
            <motion.span
              key={b.id}
              initial={{ opacity: 0.9, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.15, y: -22 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: b.x - b.size / 2,
                top: b.y - b.size / 2,
                width: b.size,
                height: b.size,
                borderRadius: 999,
                border: '1.5px solid rgba(169,203,232,0.95)',
                background: 'rgba(255,251,247,0.5)',
                pointerEvents: 'none',
                zIndex: 8,
              }}
            />
          ))}

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

      {/* scrub progress */}
      <AnimatePresence>
        {mode === 'scrubbing' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: 220, margin: '0 auto 6px' }}
          >
            <div style={{ height: 7, borderRadius: 999, background: 'rgba(31,31,31,0.07)' }}>
              <motion.div
                animate={{ width: `${Math.max(4, scrub * 100)}%` }}
                transition={{ duration: 0.15 }}
                style={{ height: '100%', borderRadius: 999, background: 'var(--sky)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* feedback line */}
      <div style={{ height: 22, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <AnimatePresence mode="wait">
          {note && (
            <motion.span
              key={note}
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

      {/* draggable snack */}
      <AnimatePresence>
        {mode === 'feeding' && (
          <motion.div
            key={dragKey}
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.15, rotate: -6 }}
            onDragEnd={(_e, info) => onSnackDragEnd(info.point.x, info.point.y)}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: [0.6, 1.1, 1] }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 120px)',
              marginLeft: -30,
              width: 60,
              height: 60,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              zIndex: 30,
              touchAction: 'none',
            }}
            className="glass--chip"
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex' }}
            >
              <img src="/haalm/ui/fx/berry.svg" alt="" style={{ width: 34, height: 38 }} />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* draggable blanket */}
      <AnimatePresence>
        {mode === 'tucking' && (
          <motion.div
            key={`blanket-${dragKey}`}
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.08, rotate: -3 }}
            onDragEnd={(_e, info) => onBlanketDragEnd(info.point.x, info.point.y)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 116px)',
              marginLeft: -55,
              cursor: 'grab',
              zIndex: 30,
              touchAction: 'none',
            }}
          >
            <motion.img
              src="/haalm/ui/fx/blanket.svg"
              alt=""
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 110,
                display: 'block',
                filter: 'drop-shadow(0 6px 14px rgba(31,31,31,0.18))',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* sponge follows the finger while scrubbing */}
      {mode === 'scrubbing' && spongePos && (
        <img
          src="/haalm/ui/fx/sponge.svg"
          alt=""
          style={{
            position: 'fixed',
            left: spongePos.x - 24,
            top: spongePos.y - 20,
            width: 48,
            pointerEvents: 'none',
            zIndex: 60,
            rotate: '-8deg',
          }}
        />
      )}

      {/* 2×2 care actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 12,
          position: 'relative',
          zIndex: 2,
          opacity: mode === 'idle' ? 1 : 0.35,
          pointerEvents: mode === 'idle' ? undefined : 'none',
          transition: 'opacity 0.25s',
        }}
      >
        <CareAction label={t('care.feed')} sub={t('care.feedsub', { n: treats })} icon="apple" bg="rgba(232,162,175,0.34)" onClick={startFeeding} />
        <CareAction label={t('care.cleanaction')} sub={t('care.cleansub')} icon="drop" bg="rgba(169,203,232,0.34)" onClick={startScrubbing} />
        <CareAction
          label={pet.sleeping ? t('care.wake') : t('care.sleep')}
          sub={pet.sleeping ? t('care.wakesub') : t('care.sleepsub')}
          icon="moon"
          bg="rgba(205,185,219,0.34)"
          onClick={onSleep}
        />
        <CareAction label={t('care.cuddle')} sub={t('care.cuddlesub')} icon="heart" bg="rgba(232,162,175,0.2)" onClick={onCuddle} />
      </div>

      {/* cancel interactive mode */}
      <AnimatePresence>
        {mode !== 'idle' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setMode('idle')
              setSpongePos(null)
              setNote('')
            }}
            className="glass--chip"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 54px)',
              borderRadius: 999,
              padding: '9px 22px',
              fontSize: 13,
              color: 'var(--muted)',
              zIndex: 25,
            }}
          >
            {t('care.cancel')}
          </motion.button>
        )}
      </AnimatePresence>
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
