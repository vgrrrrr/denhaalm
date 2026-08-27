import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Profile() {
  const navigate = useNavigate()
  const soundOn = useHaalm((s) => s.soundOn)
  const childSafe = useHaalm((s) => s.childSafe)
  const notificationsOn = useHaalm((s) => s.notificationsOn)
  const setSetting = useHaalm((s) => s.setSetting)
  const resetAll = useHaalm((s) => s.resetAll)
  const pets = useHaalm((s) => s.pets)
  const [confirmReset, setConfirmReset] = useState(false)
  const language = useHaalm((s) => s.language)
  const setLanguage = useHaalm((s) => s.setLanguage)
  const { t } = useT()

  return (
    <div className="page px">
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 26 }}>{t('prof.title')}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {t('prof.sub')}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <Row icon="profile" label={t('prof.account')} sub={t('prof.accountsub')} />
        <ToggleRow
          icon="sparkle"
          label={t('prof.notifications')}
          value={notificationsOn}
          onChange={(v) => setSetting('notificationsOn', v)}
        />
        <ToggleRow icon="play" label={t('prof.sound')} value={soundOn} onChange={(v) => setSetting('soundOn', v)} />
        <ToggleRow
          icon="lock"
          label={t('prof.childsafe')}
          value={childSafe}
          onChange={(v) => setSetting('childSafe', v)}
        />
        <LanguageRow label={t('prof.language')} language={language} setLanguage={setLanguage} />
        <Row icon="drop" label={t('prof.privacy')} sub={t('prof.privacysub')} />
        <Row
          icon="qr"
          label={t('prof.restore')}
          sub={t('prof.restoresub', { n: Object.keys(pets).length })}
          onClick={() => navigate('/scan')}
        />
        <Row icon="heart" label={t('prof.help')} sub="hello@denhaalm.com" />
        <Row icon="home" label={t('prof.about')} sub={t('prof.aboutsub')} />
      </div>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => {
                resetAll()
                setConfirmReset(false)
                navigate('/')
              }}
              style={{
                fontSize: 13,
                color: 'var(--warm-white)',
                background: 'var(--berry)',
                borderRadius: 999,
                padding: '10px 20px',
              }}
            >
              {t('prof.resetyes')}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                fontSize: 13,
                color: 'var(--muted)',
                border: '1px solid var(--line)',
                borderRadius: 999,
                padding: '10px 20px',
                background: 'var(--warm-white)',
              }}
            >
              {t('prof.resetno')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}
          >
            {t('prof.reset')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, opacity: 0.85 }}>
        <img src="/haalm/brand/den-haalm-wordmark.png" alt="den haalm" style={{ width: 110, height: 'auto' }} />
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: string
  label: string
  sub?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '15px 2px',
        borderBottom: '1px solid var(--line)',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Icon name={icon} size={18} style={{ opacity: 0.7 }} />
      <span style={{ flex: 1 }}>
        <span style={{ fontSize: 15, display: 'block' }}>{label}</span>
        {sub && (
          <span className="muted" style={{ fontSize: 11 }}>
            {sub}
          </span>
        )}
      </span>
      {onClick && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </motion.button>
  )
}

function LanguageRow({
  label,
  language,
  setLanguage,
}: {
  label: string
  language: 'de' | 'en'
  setLanguage: (l: 'de' | 'en') => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '15px 2px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <Icon name="map" size={18} style={{ opacity: 0.7 }} />
      <span style={{ flex: 1, fontSize: 15 }}>{label}</span>
      <div
        style={{
          display: 'flex',
          background: 'rgba(31,31,31,0.06)',
          borderRadius: 999,
          padding: 3,
          gap: 2,
        }}
      >
        {(['de', 'en'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLanguage(l)}
            style={{
              fontSize: 12,
              fontWeight: language === l ? 500 : 400,
              padding: '5px 14px',
              borderRadius: 999,
              background: language === l ? 'var(--warm-white)' : 'transparent',
              color: language === l ? 'var(--graphite)' : 'var(--muted)',
              boxShadow: language === l ? '0 1px 4px rgba(31,31,31,0.1)' : undefined,
              transition: 'background 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {l === 'de' ? 'Deutsch' : 'English'}
          </button>
        ))}
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '15px 2px',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <Icon name={icon} size={18} style={{ opacity: 0.7 }} />
      <span style={{ flex: 1, fontSize: 15 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          background: value ? 'var(--meadow)' : 'rgba(31,31,31,0.1)',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: 999,
            background: 'var(--warm-white)',
            boxShadow: '0 1px 4px rgba(31,31,31,0.15)',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  )
}
