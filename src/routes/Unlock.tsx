import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { SoftButton, softSpring } from '../components/ui'
import { ParticleBurst } from '../components/Particles'
import { characterById, spriteSrc, type CharacterId } from '../data/characters'
import { pickLine } from '../data/voice'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Unlock() {
  const { id } = useParams()
  const navigate = useNavigate()
  const unlockPet = useHaalm((s) => s.unlockPet)
  const char = characterById(id ?? 'gigi')
  const [ctaVisible, setCtaVisible] = useState(false)
  const { t, loc, lang } = useT()
  // the new friend introduces itself — a fresh line every time
  const [hello] = useState(() => pickLine(char.id, 'unlock', lang))

  useEffect(() => {
    const t = setTimeout(() => setCtaVisible(true), 900)
    return () => clearTimeout(t)
  }, [])

  const welcome = () => {
    unlockPet(char.id as CharacterId)
    navigate('/home')
  }

  return (
    <motion.div
      className="page page--bare px"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.img
        src="/haalm/ui/overlays/confetti.svg"
        alt=""
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.85, scale: 1.04 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          translate: '-50% 0',
          width: 'min(86vw, 360px)',
          pointerEvents: 'none',
        }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        style={{ fontSize: 32, lineHeight: 1.05 }}
      >
        {t('unlock.yay')}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 16 }}
      >
        {t('unlock.you', { name: char.name })}
      </motion.p>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="muted"
        style={{ fontSize: 13 }}
      >
        {loc(char.babySpecies)}
      </motion.span>

      {/* extra headroom so the greeting bubble clears the copy above */}
      <div style={{ position: 'relative', marginTop: 64, marginBottom: 26 }}>
        <ParticleBurst kind="sparkles" trigger={ctaVisible ? 2 : 1} count={12} />
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.88 }}
          animate={{ opacity: 1, y: [0, -3, 0], scale: 1 }}
          transition={{
            opacity: { delay: 1, duration: 0.35 },
            scale: { delay: 1, duration: 0.35 },
            y: { delay: 1.35, duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute',
            bottom: '99%',
            left: '50%',
            translate: '-50% 0',
            zIndex: 5,
            width: 'max-content',
            maxWidth: 'min(72vw, 260px)',
            background: 'var(--warm-white)',
            border: '1px solid var(--line)',
            borderRadius: '18px 18px 18px 5px',
            padding: '10px 14px',
            boxShadow: 'var(--shadow)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {hello}
        </motion.div>
        <motion.img
          src={spriteSrc(char.id as CharacterId, 'baby')}
          alt={char.name}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: [0.88, 1.03, 1], opacity: 1 }}
          transition={{ ...softSpring, duration: 0.55 }}
          style={{
            width: 'min(56vw, 230px)',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center bottom',
          }}
        />
        <motion.img
          src="/haalm/ui/overlays/hearts.svg"
          alt=""
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.4, 0], scale: 1.05 }}
          transition={{ delay: 0.6, duration: 1.3 }}
          style={{
            position: 'absolute',
            inset: '-12%',
            width: '124%',
            pointerEvents: 'none',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={ctaVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 320 }}
      >
        <SoftButton onClick={welcome}>{t('unlock.home')}</SoftButton>
      </motion.div>
    </motion.div>
  )
}
