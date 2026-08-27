import { NavLink, useLocation } from 'react-router-dom'
import { Icon } from './ui'
import { useT, type StringKey } from '../i18n'

const TABS: { to: string; labelKey: StringKey; icon: string }[] = [
  { to: '/home', labelKey: 'nav.home', icon: 'home' },
  { to: '/play', labelKey: 'nav.play', icon: 'play' },
  { to: '/alm', labelKey: 'nav.alm', icon: 'map' },
  { to: '/herd', labelKey: 'nav.herd', icon: 'herd' },
  { to: '/profile', labelKey: 'nav.profile', icon: 'profile' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useT()
  return (
    <nav
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(var(--nav-h) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        background: 'var(--warm-white)',
        borderTop: '1px solid var(--line)',
        display: 'flex',
        zIndex: 40,
      }}
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.to)
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? 'var(--graphite)' : 'var(--muted)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon name={tab.icon} size={22} faded={!active} />
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -7,
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--meadow-dark)',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 500 : 400, marginTop: 2 }}>
              {t(tab.labelKey)}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
