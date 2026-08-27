import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BackButton, Icon, SoftButton, softEase } from '../components/ui'
import { CHARACTERS, characterByCode } from '../data/characters'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Scan() {
  const navigate = useNavigate()
  const pets = useHaalm((s) => s.pets)
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const { t } = useT()

  const nextLocked = CHARACTERS.find((c) => !pets[c.id]) ?? CHARACTERS[0]

  const simulateScan = () => {
    if (scanning) return
    setScanning(true)
    setTimeout(() => navigate(`/unlock/${nextLocked.id}`), 1900)
  }

  const submitCode = () => {
    const char = characterByCode(code)
    if (!char) {
      setError(t('scan.badcode'))
      return
    }
    navigate(`/unlock/${char.id}`)
  }

  return (
    <div className="page page--bare px" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ paddingTop: 20 }}>
        <BackButton to={Object.keys(pets).length ? '/home' : '/'} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <h1 style={{ fontSize: 26 }}>{t('scan.title')}</h1>
        <p className="muted" style={{ fontSize: 15, lineHeight: 1.45, marginTop: 8, maxWidth: 260, marginInline: 'auto' }}>
          {t('scan.copy')}
        </p>
      </div>

      {/* scanner viewport */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 0' }}>
        <motion.button
          onClick={simulateScan}
          whileTap={{ scale: 0.985 }}
          style={{
            position: 'relative',
            width: 'min(74vw, 290px)',
            aspectRatio: '1',
            borderRadius: 26,
            background: 'linear-gradient(160deg, #EFE3D6, #E5D5C4)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}
        >
          {/* faux qr */}
          <div
            style={{
              position: 'absolute',
              inset: '22%',
              borderRadius: 14,
              background: 'var(--warm-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="qr" size={72} style={{ opacity: 0.8 }} />
          </div>

          {/* corner brackets */}
          {(['0 0', '1 0', '0 1', '1 1'] as const).map((pos, i) => {
            const [x, y] = pos.split(' ').map(Number)
            return (
              <motion.span
                key={i}
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: 30,
                  height: 30,
                  left: x ? undefined : 16,
                  right: x ? 16 : undefined,
                  top: y ? undefined : 16,
                  bottom: y ? 16 : undefined,
                  borderLeft: x ? 'none' : '3px solid var(--warm-white)',
                  borderRight: x ? '3px solid var(--warm-white)' : 'none',
                  borderTop: y ? 'none' : '3px solid var(--warm-white)',
                  borderBottom: y ? '3px solid var(--warm-white)' : 'none',
                  borderRadius: 6,
                }}
              />
            )
          })}

          {/* scan line */}
          <motion.div
            animate={{ top: ['12%', '85%', '12%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              height: 2,
              borderRadius: 999,
              background: 'var(--meadow-dark)',
              opacity: 0.85,
            }}
          />

          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,251,247,0.82)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name="sparkle" size={30} />
              </motion.div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{t('scan.found')}</span>
            </motion.div>
          )}
        </motion.button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          paddingBottom: 'calc(28px + var(--safe-bottom))',
        }}
      >
        {manual ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: softEase }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="HAALM-GIGI"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitCode()}
              style={{
                border: '1px solid rgba(31,31,31,0.12)',
                borderRadius: 999,
                padding: '14px 22px',
                fontSize: 15,
                background: 'var(--warm-white)',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            />
            {error && (
              <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>{error}</span>
            )}
            <SoftButton onClick={submitCode}>{t('scan.unlock')}</SoftButton>
          </motion.div>
        ) : (
          <>
            <SoftButton onClick={simulateScan} disabled={scanning}>
              {scanning ? t('scan.scanning') : t('scan.tap')}
            </SoftButton>
            <SoftButton variant="ghost" onClick={() => setManual(true)}>
              {t('scan.manual')}
            </SoftButton>
          </>
        )}
      </div>
    </div>
  )
}
