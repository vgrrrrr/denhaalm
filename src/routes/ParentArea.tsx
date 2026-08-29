import { useEffect, useMemo, useState } from 'react'
import { BackButton, SoftButton } from '../components/ui'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

const GATE_SECONDS = 60

export function ParentArea() {
  const { lang } = useT()
  const unlockedUntil = useHaalm((s) => s.parentUnlockedUntil ?? 0)
  const unlockParent = useHaalm((s) => s.unlockParent)
  const childSafe = useHaalm((s) => s.childSafe)
  const notificationsOn = useHaalm((s) => s.notificationsOn)
  const setSetting = useHaalm((s) => s.setSetting)
  const coins = useHaalm((s) => s.coins ?? 0)
  const treats = useHaalm((s) => s.treats)
  const medicine = useHaalm((s) => s.medicine ?? 0)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const de = lang === 'de'
  const open = unlockedUntil > now
  const remaining = Math.max(0, GATE_SECONDS - Math.floor((now - startedAt) / 1000))
  const challenge = useMemo(() => ({ left: 7, right: 5 }), [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const resetChallenge = () => {
    setStartedAt(Date.now())
    setAnswer('')
    setError('')
  }

  if (!open) {
    return (
      <div className="page px" style={{ paddingTop: 20 }}>
        <BackButton to="/profile" />
        <section className="glass" style={{ marginTop: 28, borderRadius: 26, padding: '22px 20px', textAlign: 'center' }}>
          <img src="/haalm/ui/runtime/icons/parent-gate.png" alt="" width={108} height={108} style={{ objectFit: 'contain' }} />
          <h1 style={{ fontSize: 24, marginTop: 8 }}>{de ? 'Nur für Erwachsene' : 'Adults only'}</h1>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.45, marginTop: 7 }}>
            {de ? 'Bitte löse die kurze Aufgabe. Der Elternbereich bleibt danach zehn Minuten geöffnet.' : 'Please solve the short task. The parent area stays open for ten minutes.'}
          </p>
          {remaining > 0 ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (Number(answer) !== challenge.left + challenge.right) {
                  setError(de ? 'Das stimmt noch nicht.' : 'That is not correct yet.')
                  return
                }
                unlockParent()
                setNow(Date.now())
                setError('')
              }}
              style={{ marginTop: 20 }}
            >
              <label htmlFor="parent-answer" style={{ display: 'block', fontSize: 17, fontWeight: 500 }}>
                {challenge.left} + {challenge.right} = ?
              </label>
              <input
                id="parent-answer"
                inputMode="numeric"
                autoComplete="off"
                value={answer}
                onChange={(event) => setAnswer(event.target.value.replace(/\D/g, '').slice(0, 3))}
                style={{ width: 120, margin: '14px auto', display: 'block', padding: '12px 14px', textAlign: 'center', fontSize: 20, borderRadius: 14, border: '1px solid var(--line)', background: 'var(--warm-white)' }}
              />
              <p className="muted" style={{ minHeight: 18, fontSize: 11 }}>{error || `${remaining} s`}</p>
              <SoftButton onClick={undefined}>{de ? 'Elternbereich öffnen' : 'Open parent area'}</SoftButton>
            </form>
          ) : (
            <div style={{ marginTop: 18 }}>
              <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>{de ? 'Die Aufgabe ist abgelaufen.' : 'The task has expired.'}</p>
              <SoftButton onClick={resetChallenge}>{de ? 'Neue Aufgabe' : 'New task'}</SoftButton>
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="page px" style={{ paddingTop: 20 }}>
      <BackButton to="/profile" />
      <div style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: 26 }}>{de ? 'Elternbereich' : 'Parent area'}</h1>
        <p className="muted" style={{ fontSize: 12, marginTop: 5 }}>{de ? 'Lokal geschützt · keine Zahlungsdaten gespeichert' : 'Protected locally · no payment data stored'}</p>
      </div>
      <section className="glass" style={{ marginTop: 20, borderRadius: 22, padding: 16 }}>
        <h2 style={{ fontSize: 16 }}>{de ? 'Spielstand' : 'Game state'}</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{coins} {de ? 'Münzen' : 'coins'} · {treats} {de ? 'Futter' : 'food'} · {medicine} {de ? 'Medizin' : 'medicine'}</p>
      </section>
      <section style={{ marginTop: 20 }}>
        <ParentToggle label={de ? 'Kindersicherer Modus' : 'Child-safe mode'} value={childSafe} onChange={(value) => setSetting('childSafe', value)} />
        <ParentToggle label={de ? 'Benachrichtigungen' : 'Notifications'} value={notificationsOn} onChange={(value) => setSetting('notificationsOn', value)} />
      </section>
      <section className="glass" style={{ marginTop: 20, borderRadius: 22, padding: 16 }}>
        <h2 style={{ fontSize: 16 }}>{de ? 'Käufe' : 'Purchases'}</h2>
        <p className="muted" style={{ fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>
          {de ? 'Echte Käufe bleiben deaktiviert, bis ein geprüfter Zahlungsanbieter und eine serverseitige Kaufprüfung angebunden sind.' : 'Real purchases stay disabled until a verified payment provider and server-side purchase validation are connected.'}
        </p>
      </section>
    </div>
  )
}

function ParentToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 2px', borderBottom: '1px solid var(--line)' }}>
      <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
      <button type="button" aria-pressed={value} onClick={() => onChange(!value)} style={{ width: 46, height: 28, borderRadius: 999, padding: 3, background: value ? 'var(--meadow)' : 'rgba(31,31,31,0.1)', textAlign: value ? 'right' : 'left' }}>
        <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 999, background: 'var(--warm-white)', boxShadow: '0 1px 4px rgba(31,31,31,0.15)' }} />
      </button>
    </div>
  )
}
