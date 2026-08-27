import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, Icon, SoftButton, StatusBar } from '../components/ui'
import { PetSprite } from '../components/PetSprite'
import { characterById, type CharacterId } from '../data/characters'
import { locationById } from '../data/locations'
import {
  daysTogether,
  levelFromXp,
  moodOf,
  stageOf,
  useHaalm,
  GROWN_LEVEL,
} from '../store/haalm'
import { useT } from '../i18n'

export function PetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pet = useHaalm((s) => s.pets[(id ?? '') as CharacterId])
  const setActivePet = useHaalm((s) => s.setActivePet)
  const { t, loc } = useT()

  if (!pet) {
    return (
      <div className="page px" style={{ paddingTop: 20 }}>
        <BackButton to="/herd" />
        <p style={{ marginTop: 24 }}>{t('pet.notyet')}</p>
      </div>
    )
  }

  const char = characterById(pet.id)
  const { level, into, needed } = levelFromXp(pet.xp)
  const stage = stageOf(pet)
  const location = locationById(pet.location)

  return (
    <div className="page px">
      <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton />
        <button
          onClick={() => {
            setActivePet(pet.id)
            navigate('/home')
          }}
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            border: '1px solid var(--line)',
            background: 'var(--warm-white)',
            borderRadius: 999,
            padding: '8px 14px',
          }}
        >
          {t('pet.bringhome')}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <h1 style={{ fontSize: 26 }}>{char.name}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {loc(stage === 'baby' ? char.babySpecies : char.species)} · Lv. {level}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 8px' }}
      >
        <PetSprite id={pet.id} stage={stage} width="min(48vw, 200px)" sleeping={pet.sleeping} wander={false} />
      </motion.div>

      {/* level progress */}
      <div style={{ margin: '10px 0 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
          <span>
            {stage === 'baby'
              ? t('pet.growsat', { n: GROWN_LEVEL })
              : t('pet.grown')}
          </span>
          <span>
            {into} / {needed} xp
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: 'rgba(31,31,31,0.06)' }}>
          <div
            style={{
              width: `${Math.max(2, (into / needed) * 100)}%`,
              height: '100%',
              borderRadius: 999,
              background: 'var(--honey)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StatusBar label={t('pet.hunger')} value={pet.hunger} color="var(--berry)" />
        <StatusBar label={t('pet.happiness')} value={pet.happiness} color="var(--meadow)" />
        <StatusBar label={t('pet.energy')} value={pet.energy} color="var(--sky)" />
        <StatusBar label={t('pet.clean')} value={pet.cleanliness} color="var(--lavender)" />
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MetaRow icon={char.snackIcon} label={t('pet.snack')} value={loc(char.favoriteSnack)} />
        <MetaRow icon="sparkle" label={t('pet.personality')} value={loc(char.trait)} />
        <MetaRow icon="map" label={t('pet.location')} value={location ? loc(location.name) : '—'} />
        <MetaRow icon="heart" label={t('pet.together')} value={t('pet.days', { n: daysTogether(pet) })} />
        <MetaRow icon="moon" label={t('pet.mood')} value={t(moodOf(pet))} />
      </div>

      <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
        <SoftButton onClick={() => navigate(`/care/${pet.id}`)}>{t('pet.care')}</SoftButton>
        <SoftButton variant="cream" onClick={() => navigate('/play')}>
          {t('pet.play')}
        </SoftButton>
      </div>
    </div>
  )
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={18} style={{ opacity: 0.7 }} />
      <span className="muted" style={{ fontSize: 13, flex: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  )
}
