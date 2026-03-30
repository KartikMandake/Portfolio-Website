import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'

// Components
import Layout from './components/Layout/Layout'
import LandingPage from './components/LandingPage/LandingPage'
import MasonryGallery from './components/MasonryGallery/MasonryGallery'
import Films from './components/Films/Films'
import Journal from './components/Journal/Journal'
import AboutPage from './components/About/AboutPage'
import { useSecretLogin } from './hooks/useSecretLogin'
import LoginModal from './components/LoginModal'

function RequireAuth({ isAdmin }) {
  return isAdmin ? <Outlet /> : <div>Access Denied</div>
}

function Dashboard() {
  return (
    <div style={{ padding: '4rem 2rem', color: '#fff' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the secret area.</p>
    </div>
  )
}

function App() {
  const { showLogin, setShowLogin, handleSecretTap } = useSecretLogin()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      setIsAdmin(!!session?.user?.email && !!adminEmail && session.user.email === adminEmail);
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      setIsAdmin(!!session?.user?.email && !!adminEmail && session.user.email === adminEmail);
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        {/* Landing Page Route with transparent navbar initially */}
        <Route path="/" element={<Layout handleSecretTap={handleSecretTap} isLanding={true} />}>
          <Route index element={<LandingPage isAdmin={isAdmin} />} />
        </Route>

        {/* Global Routes with solid dark navbar immediately */}
        <Route element={<Layout handleSecretTap={handleSecretTap} isLanding={false} />}>
          <Route path="/films" element={<Films isAdmin={isAdmin} />} />
          <Route path="/stills" element={<MasonryGallery isAdmin={isAdmin} id="stills" />} />
          <Route path="/journal" element={<Journal isAdmin={isAdmin} />} />
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAuth isAdmin={isAdmin} />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
    </Router>
  )
}

export default App
