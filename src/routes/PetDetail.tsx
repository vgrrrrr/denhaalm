import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, Icon, SoftButton, StatusBar } from '../components/ui'
import { PetSprite } from '../components/PetSprite'
import { AlmActionBar } from '../components/AlmActionBar'
import { HealthCarePanel } from '../components/HealthCarePanel'
import { characterById, type CharacterId } from '../data/characters'
import { accessoryById } from '../data/accessories'
import { MEDICINE_PRICE } from '../data/economy'
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
  const equippedAccessoryId = useHaalm((s) => s.equippedAccessories?.[pet?.id ?? (id as CharacterId)])
  const medicine = useHaalm((s) => s.medicine ?? 0)
  const coins = useHaalm((s) => s.coins ?? 0)
  const buyMedicine = useHaalm((s) => s.buyMedicine)
  const healPet = useHaalm((s) => s.healPet)
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
  const equippedAccessory = accessoryById(equippedAccessoryId ?? '')

  return (
    <div className="page px">
      <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton />
        <button
          onClick={() => {
            setActivePet(pet.id)
            navigate('/alm')
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
          {loc(stage === 'young' ? char.babySpecies : char.species)} · Lv. {level} · {t(`pet.age.${stage}`)}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 8px' }}
      >
        <div style={{ position: 'relative', width: 'min(60vw, 240px)' }}>
          <PetSprite id={pet.id} stage={stage} width="100%" sleeping={pet.sleeping} wander={false} />
          {pet.health === 'sick' && (
            <img src="/haalm/ui/runtime/overlays/sickness-soft.png" alt="" style={{ position: 'absolute', inset: '-12%', width: '124%', height: '124%', objectFit: 'contain', pointerEvents: 'none', opacity: 0.48, zIndex: 3 }} />
          )}
          {equippedAccessory && (!equippedAccessory.allowedFor || equippedAccessory.allowedFor.includes(pet.id)) && (
            <AccessoryOverlay asset={equippedAccessory.asset} anchor={equippedAccessory.anchor} />
          )}
        </div>
      </motion.div>

      {/* level progress */}
      <div style={{ margin: '10px 0 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
          <span>
            {stage !== 'adult'
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
        <AlmActionBar pet={pet} style={{ flex: 1 }} />
      </div>

      <div style={{ marginTop: 14 }}>
        <HealthCarePanel
          health={pet.health}
          medicineCount={medicine}
          medicinePrice={MEDICINE_PRICE}
          canAfford={coins >= MEDICINE_PRICE}
          onBuyMedicine={buyMedicine}
          onHeal={() => healPet(pet.id)}
          language={useHaalm.getState().language}
        />
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
        <SoftButton disabled={pet.health !== 'healthy'} onClick={() => navigate(`/care/${pet.id}`)}>{t('pet.care')}</SoftButton>
        <SoftButton disabled={pet.health !== 'healthy'} variant="cream" onClick={() => navigate('/play')}>
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

function AccessoryOverlay({ asset, anchor }: { asset: string; anchor: 'head' | 'neck' | 'back' }) {
  const placement =
    anchor === 'neck'
      ? { left: '27%', top: '35%', width: '46%' }
      : anchor === 'back'
        ? { right: '-3%', top: '42%', width: '42%' }
        : { left: '27%', top: '-2%', width: '46%' }
  return (
    <motion.img
      src={asset}
      alt=""
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'absolute', height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 4, ...placement }}
    />
  )
}
