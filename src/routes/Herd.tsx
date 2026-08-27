import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui'
import { CHARACTERS, portraitSrc, ROSTER_SIZE } from '../data/characters'
import { levelFromXp, useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Herd() {
  const navigate = useNavigate()
  const pets = useHaalm((s) => s.pets)
  const unlockedCount = Object.keys(pets).length
  const { t, loc } = useT()
  const lockedPlaceholders = Math.max(0, 9 - CHARACTERS.length) + 4

  return (
    <div className="page px">
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>{t('herd.title')}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {t('herd.unlocked', { a: unlockedCount, b: ROSTER_SIZE })}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 20,
        }}
      >
        {CHARACTERS.map((char, i) => {
          const pet = pets[char.id]
          const unlocked = Boolean(pet)
          return (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.26 }}
              whileTap={unlocked ? { scale: 0.97 } : undefined}
              onClick={
                unlocked ? () => navigate(`/pet/${char.id}`) : () => navigate('/scan')
              }
              style={{
                background: 'var(--warm-white)',
                borderRadius: 20,
                padding: '16px 8px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow)',
                opacity: unlocked ? 1 : 0.55,
              }}
            >
              <motion.img
                src={portraitSrc(char.id)}
                alt={char.name}
                animate={unlocked ? { y: [0, -2, 0], rotate: [0, 1.2, 0, -1.2, 0] } : {}}
                transition={{ duration: 4.6 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 62,
                  height: 62,
                  objectFit: 'contain',
                  filter: unlocked ? undefined : 'grayscale(1) opacity(0.25)',
                }}
              />
              {unlocked ? (
                <>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{char.name}</span>
                  <span className="muted" style={{ fontSize: 10 }}>
                    {loc(char.species)} · Lv. {levelFromXp(pet!.xp).level}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.6 }}>{char.name}</span>
                  <span className="muted" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="lock" size={10} faded /> {t('herd.scantounlock')}
                  </span>
                </>
              )}
            </motion.button>
          )
        })}

        {/* future friends */}
        {Array.from({ length: lockedPlaceholders }).map((_, i) => (
          <div
            key={`locked-${i}`}
            style={{
              background: 'var(--warm-white)',
              borderRadius: 20,
              padding: '16px 8px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: 0.14,
              minHeight: 118,
            }}
          >
            <Icon name="lock" size={20} />
            <span style={{ fontSize: 10 }}>{t('herd.soon')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
