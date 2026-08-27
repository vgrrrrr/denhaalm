import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HaalmWordmark, SoftButton, softEase } from '../components/ui'
import { PetSprite } from '../components/PetSprite'
import { WorldScene } from '../components/WorldScene'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useHaalm((s) => s.completeOnboarding)
  const hasPets = useHaalm((s) => Object.keys(s.pets).length > 0)
  const { t } = useT()

  return (
    <div className="page page--bare" style={{ display: 'flex', flexDirection: 'column' }}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: softEase }}
        style={{
          paddingTop: 76,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 15, color: 'var(--muted)' }}>{t('onb.welcome')}</span>
        <HaalmWordmark width={168} />
        <p
          className="muted"
          style={{ fontSize: 15, lineHeight: 1.45, textAlign: 'center', maxWidth: 240, marginTop: 2 }}
        >
          {t('onb.tagline')}
        </p>
      </motion.div>

      {/* the world, with Gigi living inside it */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          marginTop: 24,
          minHeight: 340,
          overflow: 'hidden',
        }}
      >
        <WorldScene>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '15%',
              transform: 'translateX(-46%)',
              zIndex: 2,
            }}
          >
            <PetSprite id="gigi" stage="baby" width="38vw" maxWidth={168} wander={false} />
          </div>
        </WorldScene>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, var(--cream) 0%, rgba(255,244,236,0) 18%, rgba(255,244,236,0) 72%, rgba(255,244,236,0.9) 100%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="px"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingBottom: 'calc(28px + var(--safe-bottom))',
          paddingTop: 8,
        }}
      >
        <SoftButton
          onClick={() => {
            completeOnboarding()
            navigate('/scan')
          }}
        >
          {t('onb.start')}
        </SoftButton>
        <SoftButton
          variant="ghost"
          onClick={() => {
            completeOnboarding()
            navigate(hasPets ? '/home' : '/scan')
          }}
        >
          {t('onb.already')}
        </SoftButton>
      </motion.div>
    </div>
  )
}
