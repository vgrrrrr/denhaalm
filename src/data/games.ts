import type { StringKey } from '../i18n'

export interface MiniGame {
  id: string
  name: string
  tagKey: StringKey
  howToKey: StringKey
  image: string
  accent: string
}

export const GAMES: MiniGame[] = [
  {
    id: 'berry-bounce',
    name: 'Berry Bounce',
    tagKey: 'game.berry.tag',
    howToKey: 'game.berry.howto',
    image: '/haalm/games/berry-bounce.jpg',
    accent: 'var(--berry)',
  },
  {
    id: 'hill-dash',
    name: 'Hill Dash',
    tagKey: 'game.hill.tag',
    howToKey: 'game.hill.howto',
    image: '/haalm/games/hill-dash.jpg',
    accent: 'var(--meadow)',
  },
  {
    id: 'leaf-match',
    name: 'Leaf Match',
    tagKey: 'game.leaf.tag',
    howToKey: 'game.leaf.howto',
    image: '/haalm/games/leaf-match.jpg',
    accent: 'var(--meadow-dark)',
  },
  {
    id: 'cloud-hop',
    name: 'Cloud Hop',
    tagKey: 'game.cloud.tag',
    howToKey: 'game.cloud.howto',
    image: '/haalm/games/cloud-hop.jpg',
    accent: 'var(--sky)',
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
