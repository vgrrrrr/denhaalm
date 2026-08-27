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

export function PetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pet = useHaalm((s) => s.pets[(id ?? '') as CharacterId])
  const setActivePet = useHaalm((s) => s.setActivePet)

  if (!pet) {
    return (
      <div className="page px" style={{ paddingTop: 20 }}>
        <BackButton to="/herd" />
        <p style={{ marginTop: 24 }}>This friend hasn’t moved in yet.</p>
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
          Bring home
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <h1 style={{ fontSize: 26 }}>{char.name}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {stage === 'baby' ? char.babySpecies : char.species} · Lv. {level}
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
              ? `Grows up at Lv. ${GROWN_LEVEL}`
              : 'All grown up'}
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
        <StatusBar label="Hunger" value={pet.hunger} color="var(--berry)" />
        <StatusBar label="Happiness" value={pet.happiness} color="var(--meadow)" />
        <StatusBar label="Energy" value={pet.energy} color="var(--sky)" />
        <StatusBar label="Cleanliness" value={pet.cleanliness} color="var(--lavender)" />
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MetaRow icon={char.snackIcon} label="Favorite snack" value={char.favoriteSnack} />
        <MetaRow icon="sparkle" label="Personality" value={char.trait} />
        <MetaRow icon="map" label="Currently at" value={location?.name ?? char.home} />
        <MetaRow icon="heart" label="Together" value={`${daysTogether(pet)} days`} />
        <MetaRow icon="moon" label="Mood" value={moodOf(pet)} />
      </div>

      <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
        <SoftButton onClick={() => navigate(`/care/${pet.id}`)}>Care</SoftButton>
        <SoftButton variant="cream" onClick={() => navigate('/play')}>
          Play
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
