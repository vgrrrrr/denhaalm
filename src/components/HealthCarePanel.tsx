import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type HealthState = 'healthy' | 'sick' | 'recovering'

export interface HealthCarePanelProps {
  health: HealthState
  medicineCount: number
  medicinePrice: number
  canAfford: boolean
  onBuyMedicine: () => void
  onHeal: () => void
  /** Optional language override; the app currently defaults to German. */
  language?: 'de' | 'en'
  /** Keep the card narrow when it is rendered inside an Alm scene sheet. */
  compact?: boolean
}

const MEDICINE_SRC = '/haalm/ui/runtime/care/medicine.png'
const SICKNESS_SRC = '/haalm/ui/runtime/overlays/sickness-soft.png'
const SPARKLE_SRC = '/haalm/ui/runtime/overlays/health-sparkle.png'

/**
 * Small, store-agnostic health card for the Alm. Inventory and economy stay
 * with the caller; this component only renders state and invokes the two
 * explicit callbacks supplied by the caller.
 */
export function HealthCarePanel({
  health,
  medicineCount,
  medicinePrice,
  canAfford,
  onBuyMedicine,
  onHeal,
  language = 'de',
  compact = false,
}: HealthCarePanelProps) {
  const [notice, setNotice] = useState('')
  const noticeId = useId()

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  const de = language === 'de'
  const sick = health === 'sick'
  const recovering = health === 'recovering'
  const canHeal = sick && medicineCount > 0
  const status = sick
    ? de
      ? 'Braucht Medizin'
      : 'Needs medicine'
    : recovering
      ? de
        ? 'Erholt sich'
        : 'Recovering'
      : de
        ? 'Gesund'
        : 'Healthy'

  const reason = !canAfford
    ? de
      ? 'Nicht genug Münzen für neue Medizin.'
      : 'Not enough coins for new medicine.'
    : medicineCount < 1
      ? de
        ? 'Keine Medizin vorrätig.'
        : 'No medicine in stock.'
      : health === 'healthy'
        ? de
          ? 'Dein Haalm ist gesund.'
          : 'Your Haalm is healthy.'
        : ''

  const buy = () => {
    if (!canAfford) {
      setNotice(de ? 'Dafür fehlen noch Münzen.' : 'You need more coins for that.')
      return
    }
    onBuyMedicine()
    setNotice(de ? 'Medizin ist jetzt im Beutel.' : 'Medicine added to your bag.')
  }

  const heal = () => {
    if (!canHeal) {
      setNotice(reason)
      return
    }
    onHeal()
    setNotice(de ? 'Dein Haalm bekommt Medizin.' : 'Your Haalm is getting medicine.')
  }

  return (
    <section
      aria-label={de ? 'Gesundheit und Medizin' : 'Health and medicine'}
      className="glass"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: compact ? 20 : 24,
        padding: compact ? '11px 12px 12px' : '15px 16px 16px',
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={health}
          src={sick ? SICKNESS_SRC : SPARKLE_SRC}
          alt=""
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: sick ? 0.42 : recovering ? 0.28 : 0.22, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            width: compact ? 96 : 122,
            height: compact ? 96 : 122,
            right: compact ? -13 : -16,
            top: compact ? -25 : -31,
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: compact ? 44 : 52,
            height: compact ? 44 : 52,
            flex: '0 0 auto',
            borderRadius: 16,
            background: sick ? 'rgba(232,162,175,0.30)' : 'rgba(184,204,166,0.30)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <img
            src={MEDICINE_SRC}
            alt=""
            aria-hidden="true"
            width={compact ? 39 : 46}
            height={compact ? 39 : 46}
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: compact ? 12.5 : 14, fontWeight: 500 }}>{status}</p>
          <p className="muted" style={{ fontSize: compact ? 10.5 : 11.5, marginTop: 3 }}>
            {medicineCount} {de ? (medicineCount === 1 ? 'Medizin' : 'Medikamente') : 'medicines'} · {medicinePrice} {de ? 'Münzen' : 'coins'}
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: compact ? 7 : 9, marginTop: compact ? 10 : 13 }}>
        <PanelButton
          type="button"
          onClick={buy}
          disabled={!canAfford}
          describedBy={!canAfford ? noticeId : undefined}
          label={de ? 'Medizin kaufen' : 'Buy medicine'}
          sublabel={`${medicinePrice} ${de ? 'Münzen' : 'coins'}`}
          compact={compact}
        />
        <PanelButton
          type="button"
          onClick={heal}
          disabled={!canHeal}
          describedBy={!canHeal ? noticeId : undefined}
          label={de ? 'Medizin geben' : 'Give medicine'}
          sublabel={sick || recovering ? (de ? 'Haalm helfen' : 'Help your Haalm') : status}
          compact={compact}
          accent
        />
      </div>

      <p id={noticeId} className="muted" style={{ position: 'relative', zIndex: 1, minHeight: 15, marginTop: 8, fontSize: 10.5, lineHeight: 1.3 }} aria-live="polite">
        {reason}
      </p>

      <AnimatePresence>
        {notice && (
          <motion.p
            key={notice}
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 11,
              zIndex: 3,
              borderRadius: 999,
              padding: '7px 10px',
              textAlign: 'center',
              fontSize: 11,
              background: 'rgba(255,251,247,0.95)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              pointerEvents: 'none',
            }}
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}

function PanelButton({
  label,
  sublabel,
  compact,
  accent = false,
  onClick,
  disabled = false,
  type = 'button',
  describedBy,
}: {
  label: string
  sublabel: string
  compact: boolean
  accent?: boolean
  onClick: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  describedBy?: string
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-describedby={describedBy}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      style={{
        minWidth: 0,
        minHeight: compact ? 44 : 50,
        borderRadius: compact ? 14 : 16,
        padding: compact ? '7px 8px' : '8px 10px',
        textAlign: 'left',
        background: accent ? 'rgba(184,204,166,0.44)' : 'rgba(255,251,247,0.68)',
        border: '1px solid rgba(31,31,31,0.08)',
        opacity: disabled ? 0.46 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s ease',
      }}
    >
      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: compact ? 10.5 : 11.5, fontWeight: 500 }}>{label}</span>
      <span className="muted" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, fontSize: compact ? 9.5 : 10 }}>{sublabel}</span>
    </motion.button>
  )
}
