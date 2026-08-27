import { useEffect } from 'react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './components/BottomNav'
import { CelebrationLayer } from './components/CelebrationLayer'
import { pageMotion } from './components/ui'
import { useHaalm } from './store/haalm'
import { Onboarding } from './routes/Onboarding'
import { Scan } from './routes/Scan'
import { Unlock } from './routes/Unlock'
import { Home } from './routes/Home'
import { PetDetail } from './routes/PetDetail'
import { Care } from './routes/Care'
import { Play } from './routes/Play'
import { Herd } from './routes/Herd'
import { Alm } from './routes/Alm'
import { Profile } from './routes/Profile'
import { BerryBounce } from './routes/games/BerryBounce'
import { HillDash } from './routes/games/HillDash'
import { LeafMatch } from './routes/games/LeafMatch'
import { CloudHop } from './routes/games/CloudHop'

const NAV_TABS = ['/home', '/play', '/alm', '/herd', '/profile']

function GameRoute() {
  const { gameId } = useParams()
  switch (gameId) {
    case 'berry-bounce':
      return <BerryBounce />
    case 'hill-dash':
      return <HillDash />
    case 'leaf-match':
      return <LeafMatch />
    case 'cloud-hop':
      return <CloudHop />
    default:
      return <Navigate to="/play" replace />
  }
}

function Shell() {
  const location = useLocation()
  const onboarded = useHaalm((s) => s.onboarded)
  const tick = useHaalm((s) => s.tick)

  // stat drift keeps running while the app is open
  useEffect(() => {
    const t = setInterval(tick, 30000)
    return () => clearInterval(t)
  }, [tick])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // exact tab routes and pet detail keep the nav; minigames go full screen
  const showNav =
    NAV_TABS.includes(location.pathname) || location.pathname.startsWith('/pet/')

  return (
    <div className="app-frame">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...pageMotion}>
          <Routes location={location}>
            <Route path="/" element={onboarded ? <Navigate to="/home" replace /> : <Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/unlock/:id" element={<Unlock />} />
            <Route path="/home" element={<Home />} />
            <Route path="/pet/:id" element={<PetDetail />} />
            <Route path="/care/:id" element={<Care />} />
            <Route path="/play" element={<Play />} />
            <Route path="/play/:gameId" element={<GameRoute />} />
            <Route path="/herd" element={<Herd />} />
            <Route path="/alm" element={<Alm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
      <CelebrationLayer />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
