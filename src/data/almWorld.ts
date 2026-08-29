import { ALM_LOCATIONS, type AlmLocation } from './locations'

export type WorldPhase = 'day' | 'evening' | 'night'

export interface AlmWorldLocation extends AlmLocation {
  focus: { x: number; y: number }
  mapRect: { x: number; y: number; w: number; h: number }
  detailRect: { x: number; y: number; w: number; h: number }
  landmarkAnchors: string[]
  scenes: Record<WorldPhase, string>
}

const scene = (id: string, phase: WorldPhase) =>
  `/haalm/environments/redesign/map-v2/scenes/${id}-${phase}.jpg`

const worldMeta: Record<
  string,
  Pick<AlmWorldLocation, 'focus' | 'mapRect' | 'detailRect' | 'landmarkAnchors'>
> = {
  'cloud-peak': {
    focus: { x: 49, y: 13 },
    mapRect: { x: 0.02, y: 0, w: 0.55, h: 0.31 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['snow-cloud-peak', 'summit-path', 'lower-meadow'],
  },
  'mountain-trail': {
    focus: { x: 52, y: 29 },
    mapRect: { x: 0.13, y: 0.12, w: 0.72, h: 0.34 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['switchback-path', 'stone-terrace', 'ridge-trees'],
  },
  'berry-forest': {
    focus: { x: 28, y: 44 },
    mapRect: { x: 0, y: 0.27, w: 0.53, h: 0.36 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['berry-grove', 'pine-cluster', 'forest-clearing'],
  },
  'flower-hill': {
    focus: { x: 67, y: 53 },
    mapRect: { x: 0.46, y: 0.34, w: 0.54, h: 0.36 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['flower-meadow', 'hill-path', 'east-pines'],
  },
  'cozy-cabin': {
    focus: { x: 37, y: 69 },
    mapRect: { x: 0.08, y: 0.54, w: 0.48, h: 0.32 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['cabin-roof', 'front-door', 'fence-and-path'],
  },
  pond: {
    focus: { x: 62, y: 79 },
    mapRect: { x: 0.4, y: 0.64, w: 0.58, h: 0.35 },
    detailRect: { x: 0, y: 0, w: 1, h: 1 },
    landmarkAnchors: ['pond-contour', 'lily-pads', 'stream-bridge'],
  },
}

export const ALM_WORLD_LOCATIONS: AlmWorldLocation[] = ALM_LOCATIONS.map((location) => {
  const meta = worldMeta[location.id]
  if (!meta) throw new Error(`Missing map-v2 metadata for ${location.id}`)
  return {
    ...location,
    ...meta,
    scenes: {
      day: scene(location.id, 'day'),
      evening: scene(location.id, 'evening'),
      night: scene(location.id, 'night'),
    },
  }
})

export const worldLocationById = (id?: string) => ALM_WORLD_LOCATIONS.find((location) => location.id === id)

export const mapPhase = (phase: 'dawn' | 'day' | 'evening' | 'night'): WorldPhase =>
  phase === 'dawn' ? 'day' : phase

export const MAP_SCENE: Record<WorldPhase, string> = {
  day: '/haalm/environments/redesign/map-v2/alm-map-v2-day.jpg',
  evening: '/haalm/environments/redesign/map-v2/alm-map-v2-evening.jpg',
  night: '/haalm/environments/redesign/map-v2/alm-map-v2-night.jpg',
}
