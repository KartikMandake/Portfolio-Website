import React from 'react'
import Hero from './components/Hero/Hero'
import MasonryGallery from './components/MasonryGallery/MasonryGallery'
import AdminAuthModal from './components/AdminAuthModal/AdminAuthModal'
import useAdminMode from './hooks/useAdminMode'



function App() {
  const { isAdmin, showModal, onAuthSuccess, onModalClose } = useAdminMode()

  return (
    <div className="scroll-container">
      <Hero />
      <MasonryGallery isAdmin={isAdmin} />

      {showModal && (
        <AdminAuthModal
          onSuccess={onAuthSuccess}
          onClose={onModalClose}
        />
      )}
    </div>
  )
}

export default App


