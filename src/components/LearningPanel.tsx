import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { allLearningLessons, lessonsForLocation } from '../data/learning'
import { LEARNING_REWARD } from '../data/economy'
import { useHaalm } from '../store/haalm'
import { useT } from '../i18n'

export function LearningPanel({ locationId, compact = false }: { locationId: string; compact?: boolean }) {
  const { lang, loc } = useT()
  const completed = useHaalm((s) => s.learningProgress ?? [])
  const completeLesson = useHaalm((s) => s.completeLesson)
  const [rewardId, setRewardId] = useState<string | null>(null)
  const lessons = lessonsForLocation(locationId)

  return (
    <section aria-label={lang === 'de' ? 'Wissen entdecken' : 'Discover knowledge'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <p style={{ fontSize: 11, fontWeight: 500 }}>{lang === 'de' ? 'Wissen entdecken' : 'Discover knowledge'}</p>
        <span className="muted" style={{ fontSize: 10 }}>{completed.length}/{allLearningLessons.length}</span>
      </div>
      <div style={{ display: 'grid', gap: 7 }}>
        {lessons.map((lesson) => {
          const done = completed.includes(lesson.id)
          return (
            <motion.button
              type="button"
              key={lesson.id}
              aria-pressed={done}
              onClick={() => {
                if (!completeLesson(lesson.id)) return
                setRewardId(lesson.id)
                window.setTimeout(() => setRewardId(null), 1500)
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                borderRadius: 15,
                padding: compact ? '8px 9px' : '10px 11px',
                background: done ? 'rgba(184,204,166,0.32)' : 'rgba(255,251,247,0.58)',
                border: '1px solid rgba(31,31,31,0.08)',
              }}
            >
              <img src={lesson.asset} alt="" width={compact ? 34 : 42} height={compact ? 34 : 42} style={{ objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 500 }}>{loc(lesson.title)}</span>
                <span className="muted" style={{ display: 'block', marginTop: 2, fontSize: 10.5, lineHeight: 1.3 }}>{loc(lesson.copy)}</span>
              </span>
              <span aria-hidden="true" style={{ fontSize: 12, color: done ? 'var(--meadow-dark)' : 'var(--muted)', flexShrink: 0 }}>
                {done ? '✓' : `+${LEARNING_REWARD}`}
              </span>
              <AnimatePresence>
                {rewardId === lesson.id && (
                  <motion.img
                    src="/haalm/ui/runtime/overlays/coin-burst.png"
                    alt=""
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 0.72, scale: 1.15 }}
                    exit={{ opacity: 0, scale: 1.3 }}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
      {completed.length >= allLearningLessons.length && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 10.5 }}>
          <img src="/haalm/ui/runtime/learning/learning-badge.png" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span>{lang === 'de' ? 'Alm-Entdeckerabzeichen geschafft!' : 'Alm explorer badge complete!'}</span>
        </div>
      )}
    </section>
  )
}
