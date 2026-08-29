import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui'
import { GAMES } from '../data/games'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function Play() {
  const navigate = useNavigate()
  const records = useHaalm((s) => s.games)
  const coins = useHaalm((s) => s.coins ?? 0)
  const hearts = useHaalm((s) => s.hearts)
  const { t } = useT()

  return (
    <div className="page px">
      <div style={{ paddingTop: 28, textAlign: 'center' }}>
        <h1 style={{ fontSize: 26 }}>{t('play.title')}</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 8, lineHeight: 1.45 }}>
          {t('play.sub1')}
          <br />
          {t('play.sub2')}
        </p>
        <div
          style={{
            display: 'inline-flex',
            gap: 16,
            marginTop: 14,
            background: 'var(--warm-white)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: '8px 18px',
            fontSize: 12,
          }}
        >
          <span aria-label={`${hearts} Herzen`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="heart" size={14} /> {hearts}
          </span>
          <span aria-label={t('alm.coins', { n: coins })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/haalm/ui/runtime/icons/coin.png" alt="" width={16} height={16} /> {coins}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
        {GAMES.map((game, i) => {
          const record = records[game.id]
          return (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.28 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate(`/play/${game.id}`)}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: 'var(--warm-white)',
                boxShadow: 'var(--shadow)',
                textAlign: 'left',
              }}
            >
              <img
                src={game.image}
                alt=""
                style={{ width: '100%', height: 118, objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{game.name}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                    {t(game.tagKey)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    background: 'var(--cream)',
                    borderRadius: 999,
                    padding: '5px 12px',
                    color: 'var(--muted)',
                  }}
                >
                  {record ? t('play.best', { n: record.best }) : t('play.new')}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
