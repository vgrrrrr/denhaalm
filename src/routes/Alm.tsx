import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, SoftButton, softEase } from '../components/ui'
import { ALM_LOCATIONS, locationById, type AlmLocation } from '../data/locations'
import { characterById } from '../data/characters'
import { useActivePet, useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Alm() {
  const [selected, setSelected] = useState<AlmLocation | null>(null)
  const [toast, setToast] = useState('')
  const pet = useActivePet()
  const visit = useHaalm((s) => s.visit)
  const { t, loc: loc2 } = useT()

  const onVisit = (target: AlmLocation) => {
    if (pet) {
      visit(pet.id, target.id, target.boost)
      const char = characterById(pet.id)
      setToast(t('alm.offto', { name: char.name, place: loc2(target.name) }))
      setTimeout(() => setToast(''), 2600)
    }
    setSelected(null)
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* floating heading */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '20px 20px 12px',
          background: 'linear-gradient(to bottom, var(--cream) 55%, rgba(255,244,236,0))',
        }}
      >
        <h1 style={{ fontSize: 26 }}>{t('alm.title')}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {t('alm.sub')}
        </p>
      </div>

      {/* full scrollable map */}
      <div style={{ position: 'relative', marginTop: -8 }}>
        <img
          src="/haalm/environments/alm-map-full.jpg"
          alt="The Haalm map"
          width={941}
          height={1672}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* slow cloud drift across the map */}
        {[
          { top: '4%', dur: 110, scale: 1 },
          { top: '48%', dur: 150, scale: 0.75 },
        ].map((c, i) => (
          <motion.img
            key={`cloud-${i}`}
            src="/haalm/ui/fx/cloud-soft.svg"
            alt=""
            initial={{ left: '-32%' }}
            animate={{ left: ['-32%', '115%'] }}
            transition={{ duration: c.dur, delay: i * -55, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: c.top,
              width: `${38 * c.scale}%`,
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* the active pet lives on the map at its current place */}
        {pet && (
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{
              position: 'absolute',
              left: `${(locationById(pet.location)?.x ?? 50) - 7}%`,
              top: `${(locationById(pet.location)?.y ?? 50) + 4}%`,
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <motion.img
              src={`/haalm/characters/${pet.id}/portrait.png`}
              alt=""
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
          </motion.div>
        )}

        {ALM_LOCATIONS.map((loc) => {
          const isHere = pet?.location === loc.id
          return (
            <motion.button
              key={loc.id}
              onClick={() => setSelected(loc)}
              animate={{ scale: [1, 1.025, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: 0.95 }}
              style={{
                position: 'absolute',
                left: `${loc.x}%`,
                top: `${loc.y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255,251,247,0.92)',
                border: '1px solid rgba(31,31,31,0.12)',
                borderRadius: 999,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 500,
                boxShadow: 'var(--shadow)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {isHere && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--meadow-dark)',
                  }}
                />
              )}
              {loc2(loc.name)}
            </motion.button>
          )
        })}
      </div>

      {/* visit toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 20px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 13,
              boxShadow: 'var(--shadow)',
              whiteSpace: 'nowrap',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(31,31,31,0.18)',
                zIndex: 50,
              }}
            />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: softEase }}
              style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 0,
                width: '100%',
                maxWidth: 444,
                zIndex: 51,
                background: 'var(--warm-white)',
                borderRadius: '26px 26px 0 0',
                padding: '22px 20px calc(26px + var(--safe-bottom))',
                boxShadow: '0 -8px 40px rgba(31,31,31,0.1)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  background: 'rgba(31,31,31,0.12)',
                  margin: '0 auto 16px',
                }}
              />
              <h2 style={{ fontSize: 18 }}>{loc2(selected.name)}</h2>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.45, margin: '8px 0 6px' }}>
                {loc2(selected.description)}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                <Icon name="sparkle" size={13} />
                {t(`alm.lifts.${selected.boost}`)}
              </p>
              <SoftButton onClick={() => onVisit(selected)}>
                {pet ? t('alm.visitwith', { name: characterById(pet.id).name }) : t('alm.visit')}
              </SoftButton>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
