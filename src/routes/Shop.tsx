import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BackButton, SoftButton } from '../components/ui'
import { ACCESSORIES } from '../data/accessories'
import { CHARACTERS, characterById, iconSrc } from '../data/characters'
import { ANIMAL_UNLOCK_PRICE, foodPriceFor, MEDICINE_PRICE } from '../data/economy'
import { useActivePet, useHaalm } from '../store/haalm'
import { useT } from '../i18n'

/** A deliberately quiet, child-safe shop surface: soft currency only. */
export function Shop() {
  const navigate = useNavigate()
  const { t, loc } = useT()
  const pet = useActivePet()
  const coins = useHaalm((s) => s.coins ?? 0)
  const treats = useHaalm((s) => s.treats)
  const medicine = useHaalm((s) => s.medicine ?? 0)
  const pets = useHaalm((s) => s.pets)
  const owned = useHaalm((s) => s.ownedAccessories ?? [])
  const equipped = useHaalm((s) => (pet ? s.equippedAccessories?.[pet.id] : undefined))
  const buyFood = useHaalm((s) => s.buyFood)
  const buyAccessory = useHaalm((s) => s.buyAccessory)
  const buyMedicine = useHaalm((s) => s.buyMedicine)
  const buyPet = useHaalm((s) => s.buyPet)
  const equipAccessory = useHaalm((s) => s.equipAccessory)
  const [note, setNote] = useState('')

  const feedback = (message: string) => {
    setNote(message)
    window.setTimeout(() => setNote(''), 2200)
  }

  const purchaseFood = () => {
    if (buyFood(1, pet?.id)) feedback(t('shop.foodbought'))
    else feedback(t('shop.notenough'))
  }

  return (
    <div className="page px">
      <div style={{ paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton to="/alm" />
        <span className="glass--chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '8px 13px', fontSize: 12 }}>
          <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={17} height={17} />
          {t('alm.coins', { n: coins })}
        </span>
      </div>

      <div style={{ paddingTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/haalm/ui/runtime/icons/shop.png" alt="" width={38} height={38} style={{ objectFit: 'contain' }} />
          <h1 style={{ fontSize: 26 }}>{t('shop.title')}</h1>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 5, lineHeight: 1.4 }}>{t('shop.sub')}</p>
      </div>

      <section className="glass" style={{ marginTop: 20, borderRadius: 22, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/haalm/ui/runtime/food/feeding-bowl.png" alt="" width={56} height={56} style={{ objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16 }}>{t('shop.food')}</h2>
            <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>
              {t('alm.food', { n: treats })}{pet ? ` · ${loc(characterById(pet.id).favoriteSnack)}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={purchaseFood}
            style={{ borderRadius: 999, padding: '9px 12px', background: 'var(--meadow)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
            {foodPriceFor(pet?.id)}
          </button>
        </div>
      </section>

      <section className="glass" style={{ marginTop: 12, borderRadius: 22, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/haalm/ui/runtime/care/medicine.png" alt="" width={56} height={56} style={{ objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16 }}>{t('shop.medicine')}</h2>
            <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>{t('shop.medicinecount', { n: medicine })}</p>
          </div>
          <button
            type="button"
            onClick={() => buyMedicine() ? feedback(t('shop.medicinebought')) : feedback(t('shop.notenough'))}
            style={{ borderRadius: 999, padding: '9px 12px', background: 'var(--meadow)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={14} height={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
            {MEDICINE_PRICE}
          </button>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>{t('shop.animals')}</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>{t('shop.animalsSub')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
          {CHARACTERS.filter((character) => !pets[character.id]).map((character, index) => (
            <motion.article
              key={character.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035, duration: 0.24 }}
              style={{ background: 'var(--warm-white)', borderRadius: 18, padding: '11px 10px 10px', boxShadow: 'var(--shadow)', textAlign: 'center' }}
            >
              <span style={{ width: 64, height: 64, borderRadius: 999, display: 'grid', placeItems: 'center', overflow: 'hidden', margin: '0 auto', background: character.accent, border: '2px solid rgba(255,255,255,0.8)' }}>
                <img src={iconSrc(character.id)} alt={character.name} width={54} height={54} style={{ objectFit: 'contain' }} />
              </span>
              <p style={{ fontSize: 13, fontWeight: 500, marginTop: 5 }}>{character.name}</p>
              <p className="muted" style={{ fontSize: 10, minHeight: 15 }}>{loc(character.babySpecies)}</p>
              <button
                type="button"
                onClick={() => {
                  if (buyPet(character.id)) feedback(t('shop.animalBought', { name: character.name }))
                  else feedback(t('shop.notenough'))
                }}
                style={{ marginTop: 8, borderRadius: 999, padding: '7px 10px', width: '100%', background: 'var(--meadow)', fontSize: 11, fontWeight: 500 }}
              >
                <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={13} height={13} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                {ANIMAL_UNLOCK_PRICE}
              </button>
            </motion.article>
          ))}
          {CHARACTERS.every((character) => pets[character.id]) && (
            <p className="muted" style={{ gridColumn: '1 / -1', fontSize: 12, padding: '12px 0' }}>
              {t('herd.unlocked', { a: CHARACTERS.length, b: CHARACTERS.length })}
            </p>
          )}
        </div>
        <SoftButton variant="ghost" onClick={() => navigate('/scan')}>
          {t('alm.scan')}
        </SoftButton>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>{t('shop.accessories')}</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          {pet ? t('shop.forpet', { name: characterById(pet.id).name }) : t('shop.choosepet')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
          {ACCESSORIES.filter((item) => !item.allowedFor || !pet || item.allowedFor.includes(pet.id)).map((item, index) => {
            const isOwned = owned.includes(item.id)
            const isEquipped = equipped === item.id
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.24 }}
                style={{ background: 'var(--warm-white)', borderRadius: 18, padding: '12px 10px', boxShadow: 'var(--shadow)', textAlign: 'center' }}
              >
                <img src={item.asset} alt={loc(item.name)} width={74} height={74} style={{ objectFit: 'contain' }} />
                <p style={{ fontSize: 12, fontWeight: 500, marginTop: 3 }}>{loc(item.name)}</p>
                <button
                  type="button"
                  disabled={!pet}
                  onClick={() => {
                    if (!pet) return
                    if (!isOwned && !buyAccessory(item.id)) {
                      feedback(t('shop.notenough'))
                      return
                    }
                    equipAccessory(pet.id, isEquipped ? null : item.id)
                    feedback(isEquipped ? t('shop.removed') : t('shop.equipped'))
                  }}
                  style={{ marginTop: 8, borderRadius: 999, padding: '7px 10px', width: '100%', background: isEquipped ? 'var(--meadow)' : 'var(--cream)', fontSize: 11, opacity: pet ? 1 : 0.45 }}
                >
                  {isEquipped ? t('shop.equipped') : isOwned ? t('shop.wear') : `${item.price} ${t('shop.coinsShort')}`}
                </button>
              </motion.article>
            )
          })}
        </div>
      </section>

      {note && <p role="status" style={{ position: 'fixed', left: 20, right: 20, bottom: 'calc(var(--nav-h) + var(--safe-bottom) + 18px)', zIndex: 90, borderRadius: 999, padding: '10px 14px', background: 'var(--warm-white)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)', textAlign: 'center', fontSize: 12 }}>{note}</p>}
      <div style={{ marginTop: 22 }}>
        <SoftButton variant="ghost" onClick={() => navigate('/parent')}>{t('shop.parent')}</SoftButton>
      </div>
    </div>
  )
}
