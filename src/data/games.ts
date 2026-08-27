export interface MiniGame {
  id: string
  name: string
  tagline: string
  image: string
  accent: string
}

export const GAMES: MiniGame[] = [
  {
    id: 'berry-bounce',
    name: 'Berry Bounce',
    tagline: 'Catch falling berries',
    image: '/haalm/games/berry-bounce.jpg',
    accent: 'var(--berry)',
  },
  {
    id: 'hill-dash',
    name: 'Hill Dash',
    tagline: 'Hop over the bushes',
    image: '/haalm/games/hill-dash.jpg',
    accent: 'var(--meadow)',
  },
  {
    id: 'leaf-match',
    name: 'Leaf Match',
    tagline: 'Find matching friends',
    image: '/haalm/games/leaf-match.jpg',
    accent: 'var(--meadow-dark)',
  },
  {
    id: 'cloud-hop',
    name: 'Cloud Hop',
    tagline: 'Time your jumps',
    image: '/haalm/games/cloud-hop.jpg',
    accent: 'var(--sky)',
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
