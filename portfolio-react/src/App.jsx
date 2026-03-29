import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Hero from './components/Hero/Hero'
import MasonryGallery from './components/MasonryGallery/MasonryGallery'
import { useSecretLogin } from './hooks/useSecretLogin'
import LoginModal from './components/LoginModal'

function Portfolio({ handleSecretTap, isAdmin }) {
  return (
    <div className="scroll-container">
      <Hero />
      <MasonryGallery isAdmin={isAdmin} />
      
      {/* Invisible mobile tap target */}
      <footer style={{ padding: '20px', textAlign: 'center', opacity: 0.1 }}>
        <span onTouchStart={handleSecretTap} style={{ userSelect: 'none' }}>
          © 2024
        </span>
      </footer>
    </div>
  )
}

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
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      setIsAdmin(!!session?.user?.email && !!adminEmail && session.user.email === adminEmail);
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      setIsAdmin(!!session?.user?.email && !!adminEmail && session.user.email === adminEmail);
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Portfolio handleSecretTap={handleSecretTap} isAdmin={isAdmin} />} />

          <Route path="/admin" element={<RequireAuth isAdmin={isAdmin} />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>

        {/* Login modal MUST live inside Router so useNavigate() works */}
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} />
        )}
      </Router>
    </>
  )
}

export default App
