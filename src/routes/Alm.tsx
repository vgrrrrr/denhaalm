import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, SoftButton, softEase } from '../components/ui'
import { AlmActionBar } from '../components/AlmActionBar'
import { HealthCarePanel } from '../components/HealthCarePanel'
import { LearningPanel } from '../components/LearningPanel'
import { PetSprite, type PetCareAction } from '../components/PetSprite'
import { dayPhase } from '../components/WorldScene'
import {
  ALM_WORLD_LOCATIONS,
  MAP_SCENE,
  mapPhase,
  type AlmWorldLocation,
  type WorldPhase,
  worldLocationById,
} from '../data/almWorld'
import { characterById, iconSrc } from '../data/characters'
import { MEDICINE_PRICE } from '../data/economy'
import { portraitStateOf, stageOf, useActivePet, useHaalm, type PetState } from '../store/haalm'
import { useT } from '../i18n'

const MAP_TRANSITION = { duration: 0.52, ease: [0.22, 0.8, 0.24, 1] as const }

export function Alm() {
  const navigate = useNavigate()
  const { area } = useParams<{ area?: string }>()
  const [phase, setPhase] = useState<WorldPhase>(() => mapPhase(dayPhase()))
  const [focused, setFocused] = useState<AlmWorldLocation | null>(null)
  const [zooming, setZooming] = useState(false)
  const [toast, setToast] = useState('')
  const zoomTimer = useRef<number | null>(null)
  const pet = useActivePet()
  const petStates = useHaalm((s) => s.pets)
  const pets = Object.values(petStates) as PetState[]
  const coins = useHaalm((s) => s.coins ?? 0)
  const setActivePet = useHaalm((s) => s.setActivePet)
  const visit = useHaalm((s) => s.visit)
  const arrivalPetId = useHaalm((s) => s.arrivalPet)
  const acknowledgeArrival = useHaalm((s) => s.acknowledgeArrival)
  const { t, loc: loc2 } = useT()
  const detail = worldLocationById(area)

  useEffect(() => {
    const updatePhase = () => setPhase(mapPhase(dayPhase()))
    const timer = window.setInterval(updatePhase, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => () => {
    if (zoomTimer.current) window.clearTimeout(zoomTimer.current)
  }, [])

  useEffect(() => {
    if (area && !detail) navigate('/alm', { replace: true })
  }, [area, detail, navigate])

  const openArea = (location: AlmWorldLocation) => {
    if (zoomTimer.current) window.clearTimeout(zoomTimer.current)
    setFocused(location)
    setZooming(true)
    zoomTimer.current = window.setTimeout(() => {
      zoomTimer.current = null
      setFocused(null)
      setZooming(false)
      navigate(`/alm/${location.id}`)
    }, MAP_TRANSITION.duration * 1000)
  }

  const onVisit = (location: AlmWorldLocation, petId: PetState['id']) => {
    visit(petId, location.id, location.boost)
    setActivePet(petId)
    const char = characterById(petId)
    setToast(t('alm.offto', { name: char.name, place: loc2(location.name) }))
    window.setTimeout(() => setToast(''), 2600)
  }

  return (
    <div className="page page--bare" style={{ position: 'relative' }}>
      <AnimatePresence mode="wait" initial={false}>
        {detail ? (
          <DetailScene
            key={`detail-${detail.id}`}
            location={detail}
            phase={phase}
            activePet={pet}
            pets={pets}
            onSelectPet={setActivePet}
            onBack={() => {
              if (zoomTimer.current) window.clearTimeout(zoomTimer.current)
              setFocused(null)
              setZooming(false)
              navigate('/alm')
            }}
            onVisit={(petId) => onVisit(detail, petId)}
            t={t}
            loc={loc2}
          />
        ) : (
          <MapScene
            key="map"
            phase={phase}
            focused={focused}
            zooming={zooming}
            pet={pet}
            pets={pets}
            coins={coins}
            onOpen={openArea}
            onOpenPet={(selected) => {
              setActivePet(selected.id)
              navigate(`/pet/${selected.id}`)
            }}
            onScan={() => navigate('/scan')}
            onShop={() => navigate('/shop')}
            t={t}
            loc={loc2}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {arrivalPetId && petStates[arrivalPetId] && (
          <ArrivalOverlay pet={petStates[arrivalPetId]!} onDismiss={acknowledgeArrival} />
        )}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 20px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 90,
              background: 'var(--warm-white)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 13,
              boxShadow: 'var(--shadow)',
              whiteSpace: 'nowrap',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MapScene({
  phase,
  focused,
  zooming,
  pet,
  pets,
  coins,
  onOpen,
  onOpenPet,
  onScan,
  onShop,
  t,
  loc,
}: {
  phase: WorldPhase
  focused: AlmWorldLocation | null
  zooming: boolean
  pet: ReturnType<typeof useActivePet>
  pets: PetState[]
  coins: number
  onOpen: (location: AlmWorldLocation) => void
  onOpenPet: (pet: PetState) => void
  onScan: () => void
  onShop: () => void
  t: ReturnType<typeof useT>['t']
  loc: ReturnType<typeof useT>['loc']
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      style={{ position: 'relative', height: '100dvh', minHeight: 620, overflow: 'hidden', background: 'var(--cream)' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 'calc(14px + env(safe-area-inset-top, 0px))',
          right: 14,
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <span className="glass--chip" aria-label={phase} style={{ width: 36, height: 36, padding: 6, borderRadius: 999, display: 'grid', placeItems: 'center' }}>
          <img src="/haalm/ui/runtime/overlays/time-of-day.png" alt="" width={22} height={22} style={{ objectFit: 'contain' }} />
        </span>
        <button
          type="button"
          onClick={onShop}
          aria-label={t('shop.title')}
          className="glass--chip"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 36, borderRadius: 999, padding: '7px 11px', fontSize: 11, fontWeight: 500 }}
        >
          <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={17} height={17} />
          {coins}
        </button>
        <motion.button
          type="button"
          onClick={onScan}
          whileTap={{ scale: 0.92 }}
          aria-label={t('alm.scan')}
          className="glass--chip"
          style={{ width: 36, height: 36, padding: 7, borderRadius: 999, display: 'grid', placeItems: 'center' }}
        >
          <img src="/haalm/ui/runtime/icons/scan.png" alt="" width={20} height={20} />
        </motion.button>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 'max(100%, calc(100dvh * 0.5628))',
            transform: 'translateX(-50%)',
          }}
        >
          <motion.div
            animate={{ scale: zooming ? 2.6 : 1 }}
            transition={MAP_TRANSITION}
            style={{ position: 'absolute', inset: 0, transformOrigin: focused ? `${focused.focus.x}% ${focused.focus.y}%` : '50% 50%' }}
          >
            <img
              src={MAP_SCENE[phase]}
              alt=""
              width={941}
              height={1672}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

          {pets.map((worldPet, index) => {
            const location = petLocation(worldPet.location) ?? ALM_WORLD_LOCATIONS[index % ALM_WORLD_LOCATIONS.length]
            const char = characterById(worldPet.id)
            const active = pet?.id === worldPet.id
            const markerTint = ['var(--honey)', 'var(--lavender)', 'var(--berry)', 'var(--sky)'][index % 4]
            return (
              <motion.button
                key={worldPet.id}
                type="button"
                onClick={() => onOpenPet(worldPet)}
                whileTap={{ scale: 0.9 }}
                aria-label={t('alm.petmarker', { name: char.name, place: loc(location.name) })}
                style={{
                  position: 'absolute',
                  left: `${location.focus.x + (index % 2 === 0 ? -3 : 3)}%`,
                  top: `${location.focus.y + (index % 3 === 0 ? 1 : -2)}%`,
                  width: 62,
                  height: 68,
                  translate: '-50% -68%',
                  padding: 0,
                  background: 'transparent',
                  border: 0,
                  display: 'block',
                  overflow: 'visible',
                  zIndex: 6,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 2,
                    translate: '-50% 0',
                    width: active ? 53 : 49,
                    height: active ? 53 : 49,
                    borderRadius: '50%',
                    background: `linear-gradient(145deg, color-mix(in srgb, white 86%, ${markerTint} 14%), color-mix(in srgb, #fffaf5 91%, ${markerTint} 9%))`,
                    border: active ? '2px solid rgba(255,255,255,0.98)' : '1px solid rgba(255,255,255,0.94)',
                    boxShadow: `0 4px 12px rgba(31,31,31,0.16), 0 0 0 2px color-mix(in srgb, ${markerTint} 18%, transparent)`,
                  }}
                />
                <motion.img
                  src={iconSrc(worldPet.id, stageOf(worldPet), portraitStateOf(worldPet))}
                  alt=""
                  animate={{ y: [0, -3, 0], rotate: [0, index % 2 === 0 ? -2 : 2, 0], scale: [1, 1.03, 1] }}
                  transition={{ duration: 3.2 + index * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ position: 'absolute', left: '50%', bottom: active ? 3 : 4, translate: '-50% 0', width: active ? 54 : 50, height: active ? 54 : 50, objectFit: 'contain', zIndex: 2, filter: 'drop-shadow(0 3px 3px rgba(31,31,31,0.2))' }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: 2,
                    translate: '-50% 0',
                    width: active ? 53 : 49,
                    height: 9,
                    borderRadius: '0 0 50% 50%',
                    background: 'linear-gradient(to bottom, rgba(255,250,245,0.78), rgba(255,250,245,0.97))',
                    borderBottom: active ? '2px solid rgba(255,255,255,0.98)' : '1px solid rgba(255,255,255,0.94)',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                />
              </motion.button>
            )
          })}

            {ALM_WORLD_LOCATIONS.map((location) => (
            <motion.button
              key={location.id}
              type="button"
              aria-label={loc(location.name)}
              onClick={() => onOpen(location)}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: focused?.id === location.id ? 1.18 : [1, 1.04, 1] }}
              transition={{ duration: 3.5, repeat: focused?.id === location.id ? 0 : Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                left: `${location.focus.x}%`,
                top: `${location.focus.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 30,
                height: 30,
                borderRadius: 999,
                padding: 0,
                background: focused?.id === location.id ? 'rgba(255,251,247,0.98)' : 'rgba(255,251,247,0.78)',
                border: '1px solid rgba(31,31,31,0.14)',
                boxShadow: '0 3px 14px rgba(31,31,31,0.16)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 4,
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--meadow-dark)' }} />
            </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function DetailScene({
  location,
  phase,
  activePet,
  pets,
  onSelectPet,
  onBack,
  onVisit,
  t,
  loc,
}: {
  location: AlmWorldLocation
  phase: WorldPhase
  activePet: ReturnType<typeof useActivePet>
  pets: PetState[]
  onSelectPet: (id: PetState['id']) => void
  onBack: () => void
  onVisit: (id: PetState['id']) => void
  t: ReturnType<typeof useT>['t']
  loc: ReturnType<typeof useT>['loc']
}) {
  const petsHere = pets.filter((candidate) => candidate.location === location.id)
  const initialPet = petsHere.find((candidate) => candidate.id === activePet?.id) ?? petsHere[0] ?? null
  const [selectedPetId, setSelectedPetId] = useState<PetState['id'] | null>(initialPet?.id ?? null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [learningOpen, setLearningOpen] = useState(false)
  const [careAction, setCareAction] = useState<PetCareAction>(null)
  const careTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const coins = useHaalm((s) => s.coins ?? 0)
  const medicine = useHaalm((s) => s.medicine ?? 0)
  const buyMedicine = useHaalm((s) => s.buyMedicine)
  const healPet = useHaalm((s) => s.healPet)
  const language = useHaalm((s) => s.language)
  const habitatAsset = habitatAssetFor(location.id)
  const selectedPet = petsHere.find((candidate) => candidate.id === selectedPetId) ?? petsHere[0] ?? null

  useEffect(() => () => {
    if (careTimer.current) clearTimeout(careTimer.current)
  }, [])

  const playCareAction = (action: PetCareAction) => {
    if (!action) {
      setCareAction(null)
      return
    }
    setCareAction(action)
    if (careTimer.current) clearTimeout(careTimer.current)
    careTimer.current = setTimeout(() => {
      careTimer.current = null
      setCareAction(null)
    }, action === 'clean' ? 1450 : action === 'sleep' ? 1100 : 1150)
  }

  const selectPet = (candidate: PetState) => {
    setSelectedPetId(candidate.id)
    onSelectPet(candidate.id)
  }

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ minHeight: '100dvh' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--cream)' }}>
        <motion.img
          key={location.scenes[phase]}
          initial={{ opacity: 0.2, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.36, ease: softEase }}
          src={location.scenes[phase]}
          alt=""
          width={941}
          height={1672}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(31,31,31,0.18), transparent 28%, rgba(31,31,31,0.2))', pointerEvents: 'none' }} />
        {habitatAsset && (
          <img src={habitatAsset} alt="" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', maxHeight: '46%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', opacity: 0.72 }} />
        )}
      </div>

      {selectedPet && (
        <div
          style={{
            position: 'absolute',
            left: `${detailPetAnchor(location.id).x}%`,
            top: `${(panelOpen ? detailPetAnchor(location.id).expandedY : detailPetAnchor(location.id).y)}%`,
            translate: '-50% 0',
            zIndex: 3,
            transition: 'top 280ms ease',
          }}
        >
          <PetSprite id={selectedPet.id} stage={stageOf(selectedPet)} sleeping={selectedPet.sleeping} bedtimeReady={selectedPet.sleeping || careAction === 'sleep'} careAction={careAction} width="38vw" maxWidth={172} wander={false} withGrass />
          {selectedPet.health === 'sick' && <img src="/haalm/ui/runtime/overlays/sickness-soft.png" alt="" style={{ position: 'absolute', inset: '-16%', width: '132%', height: '132%', objectFit: 'contain', opacity: 0.5, pointerEvents: 'none' }} />}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        aria-label="Zurück zur Almkarte"
        style={{
          position: 'absolute',
          top: 'calc(16px + env(safe-area-inset-top, 0px))',
          left: 18,
          zIndex: 5,
          width: 42,
          height: 42,
          borderRadius: 999,
          background: 'rgba(255,251,247,0.9)',
          border: '1px solid rgba(31,31,31,0.12)',
          boxShadow: 'var(--shadow)',
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        ←
      </button>

      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 8px)', zIndex: 5 }}>
        <motion.div
          className="glass"
          layout
          transition={{ duration: 0.26, ease: softEase }}
          style={{ borderRadius: 24, overflow: 'hidden', maxHeight: panelOpen ? '47dvh' : 78 }}
        >
          <button
            type="button"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((open) => !open)}
            style={{ width: '100%', minHeight: 78, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 19, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc(location.name)}</h1>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
                {petsHere.length > 0
                  ? (language === 'de' ? `${petsHere.map((candidate) => characterById(candidate.id).name).join(', ')} ${petsHere.length === 1 ? 'ist' : 'sind'} hier` : `${petsHere.map((candidate) => characterById(candidate.id).name).join(', ')} ${petsHere.length === 1 ? 'is' : 'are'} here`)
                  : (language === 'de' ? 'Gerade ist kein Tier hier' : 'No animal is here right now')}
              </p>
            </div>
            <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.5)', fontSize: 18 }}>
              {panelOpen ? '⌄' : '⌃'}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflowY: 'auto', padding: '0 16px 16px' }}
              >
                <p style={{ fontSize: 12.5, lineHeight: 1.42, color: 'var(--muted)', marginBottom: 11 }}>{loc(location.description)}</p>

                {petsHere.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 11 }}>
                    {petsHere.map((candidate) => {
                      const selected = candidate.id === selectedPet?.id
                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          aria-label={characterById(candidate.id).name}
                          aria-pressed={selected}
                          onClick={() => selectPet(candidate)}
                          style={{ width: 46, height: 46, borderRadius: 999, display: 'grid', placeItems: 'center', overflow: 'hidden', background: selected ? 'var(--meadow)' : 'rgba(255,255,255,0.48)', border: selected ? '2px solid var(--meadow-dark)' : '1px solid rgba(31,31,31,0.08)' }}
                        >
                          <img src={iconSrc(candidate.id, stageOf(candidate), portraitStateOf(candidate))} alt="" width={38} height={38} style={{ objectFit: 'contain' }} />
                        </button>
                      )
                    })}
                  </div>
                )}

                <button
                  type="button"
                  aria-expanded={learningOpen}
                  onClick={() => setLearningOpen((open) => !open)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', borderRadius: 14, padding: '8px 10px', background: 'rgba(255,251,247,0.52)', border: '1px solid rgba(31,31,31,0.08)', marginBottom: learningOpen ? 8 : 11 }}
                >
                  <img src="/haalm/ui/runtime/learning/learning-badge.png" alt="" width={26} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{t('alm.learn')}</span>
                  <span aria-hidden="true" style={{ fontSize: 16, color: 'var(--muted)' }}>{learningOpen ? '−' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {learningOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 11 }}>
                      <LearningPanel locationId={location.id} compact />
                    </motion.div>
                  )}
                </AnimatePresence>

                <p style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 11 }}>
                  <Icon name="sparkle" size={13} />
                  {t(`alm.lifts.${location.boost}`)}
                </p>

                {selectedPet ? (
                  <>
                    <AlmActionBar pet={selectedPet} compact onActionAnimation={playCareAction} style={{ marginBottom: 11 }} />
                    {selectedPet.health !== 'healthy' && (
                      <HealthCarePanel
                        health={selectedPet.health}
                        medicineCount={medicine}
                        medicinePrice={MEDICINE_PRICE}
                        canAfford={coins >= MEDICINE_PRICE}
                        onBuyMedicine={buyMedicine}
                        onHeal={() => healPet(selectedPet.id)}
                        language={language}
                        compact
                      />
                    )}
                  </>
                ) : activePet ? (
                  <SoftButton onClick={() => onVisit(activePet.id)}>
                    {language === 'de' ? `${characterById(activePet.id).name} hierher rufen` : `Call ${characterById(activePet.id).name} here`}
                  </SoftButton>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  )
}

function habitatAssetFor(locationId: string) {
  if (locationId === 'pond') return '/haalm/ui/runtime/habitats/pond-edge.png'
  if (locationId === 'berry-forest' || locationId === 'flower-hill') return '/haalm/ui/runtime/habitats/tree-branch.png'
  return null
}

/**
 * The detail crops have a deliberately open foreground. Placing every pet at
 * a fixed top offset made them float in the sky/waterline; these anchors keep
 * each species in the usable ground/water area and lift it slightly when the
 * care sheet expands.
 */
function detailPetAnchor(locationId: string) {
  const anchors: Record<string, { x: number; y: number; expandedY: number }> = {
    'cloud-peak': { x: 50, y: 60, expandedY: 36 },
    'mountain-trail': { x: 52, y: 57, expandedY: 38 },
    'berry-forest': { x: 49, y: 63, expandedY: 40 },
    'flower-hill': { x: 53, y: 62, expandedY: 40 },
    'cozy-cabin': { x: 50, y: 58, expandedY: 29 },
    pond: { x: 51, y: 39, expandedY: 28 },
  }
  return anchors[locationId] ?? { x: 50, y: 58, expandedY: 22 }
}

function ArrivalOverlay({ pet, onDismiss }: { pet: PetState; onDismiss: () => void }) {
  const { lang } = useT()
  const char = characterById(pet.id)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={lang === 'de' ? `${char.name} kommt auf der Alm an` : `${char.name} arrives at the Alm`} style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(255,244,236,0.94)', textAlign: 'center' }}>
      <motion.img src="/haalm/ui/runtime/overlays/unlock-arrival.png" alt="" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.05, opacity: 0.72 }} style={{ position: 'absolute', width: 'min(92vw, 440px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 2, width: 'min(100%, 330px)' }}>
        <PetSprite id={pet.id} stage={stageOf(pet)} sleeping={false} width="56vw" maxWidth={220} wander={false} withGrass={false} />
        <h1 style={{ fontSize: 28, marginTop: 14 }}>{lang === 'de' ? `${char.name} ist angekommen!` : `${char.name} has arrived!`}</h1>
        <p className="muted" style={{ fontSize: 13, margin: '7px 0 18px' }}>{lang === 'de' ? 'Dein neuer Freund wartet schon in seinem Lieblingsbereich.' : 'Your new friend is waiting in their favourite area.'}</p>
        <SoftButton onClick={onDismiss}>{lang === 'de' ? 'Willkommen auf der Alm' : 'Welcome to the Alm'}</SoftButton>
      </div>
    </motion.div>
  )
}

function petLocation(id: string) {
  return ALM_WORLD_LOCATIONS.find((location) => location.id === id)
}
