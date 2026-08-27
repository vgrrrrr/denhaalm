import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

/* ------------------------------------------------------------- Icon */

export function Icon({
  name,
  size = 22,
  faded = false,
  style,
}: {
  name: string
  size?: number
  faded?: boolean
  style?: CSSProperties
}) {
  return (
    <img
      src={`/haalm/ui/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      style={{ opacity: faded ? 0.42 : 1, display: 'block', ...style }}
    />
  )
}

/* ------------------------------------------------------- HaalmWordmark */

export function HaalmWordmark({ width = 180 }: { width?: number }) {
  return (
    <img
      src="/haalm/brand/haalm-wordmark.png"
      alt="haalm"
      style={{ width, height: 'auto', display: 'block' }}
    />
  )
}

/* ---------------------------------------------------------- SoftButton */

export function SoftButton({
  children,
  onClick,
  variant = 'meadow',
  disabled = false,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'meadow' | 'cream' | 'ghost'
  disabled?: boolean
  style?: CSSProperties
}) {
  const base: CSSProperties = {
    borderRadius: 999,
    padding: '15px 28px',
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: '0.01em',
    width: '100%',
    opacity: disabled ? 0.45 : 1,
  }
  const variants: Record<string, CSSProperties> = {
    meadow: { background: 'var(--meadow)', color: 'var(--graphite)' },
    cream: {
      background: 'var(--warm-white)',
      color: 'var(--graphite)',
      border: '1px solid rgba(31,31,31,0.12)',
    },
    ghost: { background: 'transparent', color: 'var(--muted)', fontWeight: 400 },
  }
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.975 }}
      transition={{ duration: 0.1 }}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </motion.button>
  )
}

/* ---------------------------------------------------------- BackButton */

export function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate()
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      aria-label="Back"
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        background: 'var(--warm-white)',
        border: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </motion.button>
  )
}

/* ----------------------------------------------------------- StatusBar */

export function StatusBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span className="muted">{Math.round(value)}</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'rgba(31,31,31,0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${Math.max(3, value)}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', borderRadius: 999, background: color }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------- motion tokens */

export const softSpring = { type: 'spring', stiffness: 220, damping: 22, mass: 0.8 } as const
export const softEase = [0.22, 1, 0.36, 1] as const

export const pageMotion = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.22, ease: softEase },
}
