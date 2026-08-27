import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HaalmWordmark, SoftButton, softEase } from '../components/ui'
import { CharacterSprite } from '../components/CharacterSprite'
import { useHaalm } from '../store/haalm'

export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useHaalm((s) => s.completeOnboarding)
  const hasPets = useHaalm((s) => Object.keys(s.pets).length > 0)

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
        <span style={{ fontSize: 15, color: 'var(--muted)' }}>welcome to</span>
        <HaalmWordmark width={168} />
        <p
          className="muted"
          style={{ fontSize: 15, lineHeight: 1.45, textAlign: 'center', maxWidth: 240, marginTop: 2 }}
        >
          A cozy alpine home for your Haalm animals.
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
        <img
          src="/haalm/environments/home-meadow-390x844@3x.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 62%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, var(--cream) 0%, rgba(255,244,236,0) 18%, rgba(255,244,236,0) 70%, rgba(255,244,236,0.9) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '16%',
            transform: 'translateX(-42%)',
          }}
        >
          <CharacterSprite id="gigi" stage="baby" width="38vw" style={{ maxWidth: 168 }} />
        </div>
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
          Start your adventure
        </SoftButton>
        <SoftButton
          variant="ghost"
          onClick={() => {
            completeOnboarding()
            navigate(hasPets ? '/home' : '/scan')
          }}
        >
          I already have a Haalm
        </SoftButton>
      </motion.div>
    </div>
  )
}
