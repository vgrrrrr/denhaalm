import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, Icon } from '../components/ui'
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
      <div style={{ paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <button
            type="button"
            onClick={() => navigate('/play')}
            style={{
              fontSize: 11.5,
              color: 'var(--ink)',
              border: '1px solid rgba(229,188,94,0.38)',
              background: 'rgba(247,217,148,0.4)',
              borderRadius: 999,
              padding: '8px 11px',
              whiteSpace: 'nowrap',
            }}
          >
            {t('pet.play')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePet(pet.id)
              navigate('/alm')
            }}
            style={{
              fontSize: 11.5,
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              background: 'var(--warm-white)',
              borderRadius: 999,
              padding: '8px 11px',
              whiteSpace: 'nowrap',
            }}
          >
            {t('pet.bringhome')}
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <h1 style={{ fontSize: 25 }}>{char.name}</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          {loc(stage === 'young' ? char.babySpecies : char.species)} · Lv. {level} · {t(`pet.age.${stage}`)}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 2px' }}
      >
        <div style={{ position: 'relative', width: 'min(52vw, 210px)' }}>
          <PetSprite id={pet.id} stage={stage} width="100%" sleeping={pet.sleeping} wander={false} />
          {pet.health === 'sick' && (
            <img src="/haalm/ui/runtime/overlays/sickness-soft.png" alt="" style={{ position: 'absolute', inset: '-12%', width: '124%', height: '124%', objectFit: 'contain', pointerEvents: 'none', opacity: 0.48, zIndex: 3 }} />
          )}
          {equippedAccessory && (!equippedAccessory.allowedFor || equippedAccessory.allowedFor.includes(pet.id)) && (
            <AccessoryOverlay asset={equippedAccessory.asset} anchor={equippedAccessory.anchor} />
          )}
        </div>
      </motion.div>

      <AlmActionBar
        pet={pet}
        compact
        onActionRequest={() => navigate(`/care/${pet.id}`)}
        style={{ marginTop: 2 }}
      />

      <CompactStats
        stats={[
          { icon: 'apple', value: pet.hunger, color: 'var(--berry-dark)', label: t('stat.hunger') },
          { icon: 'heart', value: pet.happiness, color: 'var(--honey-dark)', label: t('stat.happiness') },
          { icon: 'moon', value: pet.energy, color: 'var(--lavender-dark)', label: t('stat.energy') },
          { icon: 'drop', value: pet.cleanliness, color: 'var(--sky-dark)', label: t('stat.clean') },
        ]}
      />

      {/* level progress */}
      <div style={{ margin: '10px 2px 16px' }}>
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

      <div className="glass" style={{ padding: '12px 14px', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <MetaRow icon={char.snackIcon} label={t('pet.snack')} value={loc(char.favoriteSnack)} />
        <MetaRow icon="sparkle" label={t('pet.personality')} value={loc(char.trait)} />
        <MetaRow icon="map" label={t('pet.location')} value={location ? loc(location.name) : '—'} />
        <MetaRow icon="heart" label={t('pet.together')} value={t('pet.days', { n: daysTogether(pet) })} />
        <MetaRow icon="moon" label={t('pet.mood')} value={t(moodOf(pet))} />
      </div>

      {pet.health !== 'healthy' && (
        <div style={{ marginTop: 12 }}>
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
      )}
    </div>
  )
}

const STAT_RING_RADIUS = 20
const STAT_RING_LENGTH = 2 * Math.PI * STAT_RING_RADIUS

function CompactStats({ stats }: { stats: Array<{ icon: string; value: number; color: string; label: string }> }) {
  return (
    <div
      className="glass"
      aria-label="Tierstatus"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 3, marginTop: 8, padding: '8px 7px', borderRadius: 20 }}
    >
      {stats.map((stat) => (
        <CompactStat key={stat.icon} {...stat} />
      ))}
    </div>
  )
}

function CompactStat({ icon, value, color, label }: { icon: string; value: number; color: string; label: string }) {
  const low = value < 35
  const percent = Math.max(0, Math.min(100, value))
  const offset = STAT_RING_LENGTH * (1 - percent / 100)

  return (
    <div title={`${label}: ${Math.round(value)}`} style={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <span style={{ position: 'relative', width: 34, height: 34, flex: '0 0 auto' }}>
        <svg width={34} height={34} viewBox="0 0 48 48" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
          <circle cx={24} cy={24} r={STAT_RING_RADIUS} fill="none" stroke="rgba(31,31,31,0.09)" strokeWidth={5} />
          <motion.circle
            cx={24}
            cy={24}
            r={STAT_RING_RADIUS}
            fill="none"
            stroke={low ? 'var(--berry)' : color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={STAT_RING_LENGTH}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color }}>
          <Icon name={icon} size={15} />
        </span>
      </span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: low ? 'var(--berry)' : undefined }}>{Math.round(value)}</span>
        <span style={{ maxWidth: 39, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 7.5, fontWeight: 600, letterSpacing: '0.035em', textTransform: 'uppercase', color: 'rgba(31,31,31,0.48)' }}>
          {label}
        </span>
      </span>
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
