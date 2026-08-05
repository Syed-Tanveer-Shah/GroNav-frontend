import { useState, useEffect } from 'react'

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const checkAuth = () => {
      const t = localStorage.getItem('token')
      const userType = localStorage.getItem('user_type')
      // Only buyer token counts here — not seller token
      const isBuyer = t && userType !== 'seller'
      setIsLoggedIn(!!isBuyer)
      setToken(isBuyer ? t : null)
    }

    checkAuth()

    // Listen for storage changes — logout in one tab affects all
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  return { isLoggedIn, token }
}
