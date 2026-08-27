import { AnimatePresence, motion } from 'framer-motion'

export type OverlayKind = 'hearts' | 'bubbles' | 'sleep' | 'confetti' | null

/**
 * Soft asset overlays (hearts / bubbles / sleep / confetti) that
 * fade in above the character and drift out again.
 */
export function CareOverlay({ kind }: { kind: OverlayKind }) {
  return (
    <AnimatePresence>
      {kind && (
        <motion.img
          key={kind}
          src={`/haalm/ui/overlays/${kind}.svg`}
          alt=""
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{
            opacity: kind === 'hearts' ? 0.55 : 0.75,
            y: kind === 'bubbles' ? -18 : -8,
            scale: 1,
          }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}
    </AnimatePresence>
  )
}
