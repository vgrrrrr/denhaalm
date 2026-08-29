import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useT, type StringKey } from '../i18n'

const TABS: { to: string; labelKey: StringKey; icon: string }[] = [
  { to: '/alm', labelKey: 'nav.alm', icon: 'alm' },
  { to: '/play', labelKey: 'nav.play', icon: 'play' },
  { to: '/herd', labelKey: 'nav.herd', icon: 'herd' },
  { to: '/profile', labelKey: 'nav.profile', icon: 'profile' },
]

/**
 * Floating liquid-glass tab bar. `position: fixed` keeps it on screen on
 * scrolling pages (e.g. the tall Alm map).
 */
export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useT()
  return (
    <motion.nav
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        marginInline: 'auto',
        bottom: 'calc(14px + var(--safe-bottom))',
        width: 'min(calc(100% - 28px), 408px)',
        height: 66,
        borderRadius: 999,
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 6px',
        zIndex: 80,
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
              gap: 1,
              textDecoration: 'none',
              color: active ? 'var(--graphite)' : 'var(--muted)',
              position: 'relative',
            }}
          >
            {active && (
              <motion.span
                layoutId="nav-glass-bubble"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: '7px 2px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow:
                    '0 2px 10px rgba(31,31,31,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'flex' }}>
              <img
                src={`/haalm/ui/runtime/navigation/${tab.icon}.png`}
                alt=""
                width={33}
                height={33}
                style={{
                  display: 'block',
                  objectFit: 'contain',
                  opacity: active ? 1 : 0.42,
                }}
              />
            </span>
            <span
              style={{
                position: 'relative',
                fontSize: 10.5,
                lineHeight: 1,
                fontWeight: active ? 500 : 400,
                letterSpacing: '0.01em',
              }}
            >
              {t(tab.labelKey)}
            </span>
          </NavLink>
        )
      })}
    </motion.nav>
  )
}
