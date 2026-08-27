import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { spriteSrc, type CharacterId } from '../data/characters'

/**
 * A canonical transparent character asset, gently breathing.
 * Never distorts the bitmap — intrinsic aspect ratio, contain, bottom anchored.
 */
export function CharacterSprite({
  id,
  stage,
  width,
  sleeping = false,
  onTap,
  style,
}: {
  id: CharacterId
  stage: 'baby' | 'grown'
  width: string | number
  sleeping?: boolean
  onTap?: () => void
  style?: CSSProperties
}) {
  return (
    <motion.div
      onTap={onTap}
      whileTap={
        onTap
          ? { scale: 1.035, rotate: 1 }
          : undefined
      }
      animate={{
        y: sleeping ? [0, 3, 0] : [0, -2, 0],
        scale: sleeping ? [1, 1.004, 1] : [1, 1.008, 1],
      }}
      transition={{
        duration: sleeping ? 5.5 : 4.2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ width, cursor: onTap ? 'pointer' : undefined, ...style }}
    >
      <img
        src={spriteSrc(id, stage)}
        alt={id}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          filter: sleeping ? 'brightness(0.94)' : undefined,
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </motion.div>
  )
}
