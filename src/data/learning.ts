import { type CharacterId } from './characters'
import { type Localized } from '../i18n'

export type LearningTopic = 'habitat' | 'food' | 'behavior' | 'alphabet' | 'colors' | 'sounds' | 'tracks'

export interface LearningLesson {
  id: string
  locationId: string
  topic: LearningTopic
  title: Localized
  copy: Localized
  asset: string
}

const lessons: LearningLesson[] = [
  {
    id: 'cloud-peak-sounds',
    locationId: 'cloud-peak',
    topic: 'sounds',
    title: { de: 'Lauschen am Gipfel', en: 'Listen at the peak' },
    copy: { de: 'Auf hohen Bergen trägt der Wind Tierlaute besonders weit.', en: 'High in the mountains, the wind carries animal calls a long way.' },
    asset: '/haalm/ui/runtime/learning/sound-token.png',
  },
  {
    id: 'mountain-trail-tracks',
    locationId: 'mountain-trail',
    topic: 'tracks',
    title: { de: 'Spuren am Weg', en: 'Tracks on the trail' },
    copy: { de: 'Hufe und Pfoten hinterlassen auf weichem Boden unterschiedliche Spuren.', en: 'Hooves and paws leave different tracks in soft ground.' },
    asset: '/haalm/ui/runtime/learning/tracks-token.png',
  },
  {
    id: 'berry-forest-food',
    locationId: 'berry-forest',
    topic: 'food',
    title: { de: 'Futter entdecken', en: 'Discover food' },
    copy: { de: 'Beeren sind für manche Tiere ein Snack, aber jedes Tier braucht passendes Futter.', en: 'Berries are a snack for some animals, but every animal needs suitable food.' },
    asset: '/haalm/ui/runtime/learning/alphabet-card.png',
  },
  {
    id: 'flower-hill-colors',
    locationId: 'flower-hill',
    topic: 'colors',
    title: { de: 'Farben auf der Wiese', en: 'Meadow colours' },
    copy: { de: 'Viele Blütenfarben helfen Insekten dabei, ihre Nahrung zu finden.', en: 'Many flower colours help insects find their food.' },
    asset: '/haalm/ui/runtime/learning/color-wheel.png',
  },
  {
    id: 'cozy-cabin-behavior',
    locationId: 'cozy-cabin',
    topic: 'behavior',
    title: { de: 'Ein sicherer Rückzugsort', en: 'A safe retreat' },
    copy: { de: 'Tiere brauchen einen ruhigen Ort zum Schlafen und Erholen.', en: 'Animals need a quiet place to sleep and recover.' },
    asset: '/haalm/ui/runtime/learning/learning-badge.png',
  },
  {
    id: 'pond-habitat',
    locationId: 'pond',
    topic: 'habitat',
    title: { de: 'Leben am Wasser', en: 'Life by the water' },
    copy: { de: 'Am Teich finden Tiere Wasser, Schutz und viele kleine Nachbarn.', en: 'At the pond, animals find water, shelter and many tiny neighbours.' },
    asset: '/haalm/ui/runtime/learning/tracks-token.png',
  },
]

export const lessonsForLocation = (locationId: string) =>
  lessons.filter((lesson) => lesson.locationId === locationId)

export const allLearningLessons = lessons

export const petLearningFact = (petId: CharacterId, locationId: string): string =>
  `${petId}:${locationId}`
