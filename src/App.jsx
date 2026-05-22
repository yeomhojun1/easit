import { useState, useEffect } from 'react'
import { st, CARS } from './constants'
import OnboardingScreen from './components/OnboardingScreen'
import LoginScreen from './components/LoginScreen'
import SignupScreen from './components/SignupScreen'
import MainScreen from './components/MainScreen'
import ZoneScreen from './components/ZoneScreen'
import RewardFlowScreen from './components/RewardFlowScreen'
import RewardsScreen from './components/RewardsScreen'
import BottomNav from './components/BottomNav'

const AUTH_SCREENS = ['onboarding', 'login', 'signup']

export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [selectedCar, setSelectedCar] = useState(CARS[2])
  const [selectedLine, setSelectedLine] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedDirection, setSelectedDirection] = useState(null)
  const [points, setPoints] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = (s) => setScreen(s)

  const handleLogin = (userData) => {
    setUser(userData)
    if (userData?.points != null) setPoints(userData.points)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setPoints(0)
    navigate('onboarding')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      window.history.replaceState({}, '', window.location.pathname)
      setScreen('main')
    } else if (localStorage.getItem('token')) {
      setScreen('main')
    }
  }, [])

  return (
    <div style={st.wrap}>
      {screen === 'onboarding'   && <OnboardingScreen navigate={navigate} />}
      {screen === 'login'        && <LoginScreen navigate={navigate} onLogin={handleLogin} />}
      {screen === 'signup'       && <SignupScreen navigate={navigate} onLogin={handleLogin} />}
      {screen === 'main'         && <MainScreen navigate={navigate} setSelectedCar={setSelectedCar} onSelectLine={(line) => { setSelectedLine(line); setSelectedDirection(null) }} onSelectStation={(station) => { setSelectedStation(station); setSelectedDirection(null) }} onSelectDirection={setSelectedDirection} user={user} onLogout={handleLogout} />}
      {screen === 'zone'         && <ZoneScreen selectedCar={selectedCar} selectedLine={selectedLine} selectedStation={selectedStation} selectedDirection={selectedDirection} navigate={navigate} isPremium={isPremium} setIsPremium={setIsPremium} />}
      {screen === 'reward-flow'  && <RewardFlowScreen navigate={navigate} points={points} setPoints={setPoints} selectedLine={selectedLine} selectedStation={selectedStation} selectedDirection={selectedDirection} />}
      {screen === 'rewards'      && <RewardsScreen points={points} isPremium={isPremium} setIsPremium={setIsPremium} />}
      {!AUTH_SCREENS.includes(screen) && <BottomNav screen={screen} navigate={navigate} />}
    </div>
  )
}
