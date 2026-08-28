import { useCallback, useEffect, useRef, useState } from 'react'
import { pickLine, timeContext, type VoiceContext } from '../data/voice'
import { moodOf, type PetState } from '../store/haalm'
import { useT } from '../i18n'

const MOOD_CONTEXT: Partial<Record<string, VoiceContext>> = {
  'mood.hungry': 'hungry',
  'mood.sleepy': 'sleepy',
  'mood.bath': 'bath',
  'mood.lonely': 'lonely',
  'mood.veryhappy': 'veryhappy',
}

const SPEECH_MS = 5200
const FIRST_DELAY_MS = 2200
const nextDelay = () => 14000 + Math.random() * 16000

/**
 * Gives a pet its voice: spontaneous chatter every so often (weighted by
 * mood and time of day) and a `say(context)` trigger for reactions to
 * taps, feeding, cuddling and friends. Speech pauses while sleeping.
 */
export const useChatter = (
  pet: PetState | null,
  { idle = true }: { idle?: boolean } = {}
) => {
  const { lang } = useT()
  const [speech, setSpeech] = useState<string | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const petRef = useRef(pet)
  useEffect(() => {
    petRef.current = pet
  }, [pet])

  const say = useCallback(
    (context: VoiceContext) => {
      const p = petRef.current
      if (!p) return
      clearTimeout(hideTimer.current)
      setSpeech(pickLine(p.id, context, lang))
      hideTimer.current = setTimeout(() => setSpeech(null), SPEECH_MS)
    },
    [lang]
  )

  const sayIdle = useCallback(() => {
    const p = petRef.current
    if (!p || p.sleeping) return
    const urgent = MOOD_CONTEXT[moodOf(p)]
    if (urgent && Math.random() < 0.6) return say(urgent)
    say(Math.random() < 0.45 ? timeContext() : 'content')
  }, [say])

  useEffect(() => {
    if (!idle || !pet || pet.sleeping) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        sayIdle()
        schedule(nextDelay())
      }, delay)
    }
    schedule(FIRST_DELAY_MS)
    return () => clearTimeout(timer)
  }, [idle, pet?.id, pet?.sleeping, sayIdle]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  return { speech, say }
}
