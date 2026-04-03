'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ri_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const register = ({ name, email, password }) => {
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]')
    if (users.find(u => u.email === email)) {
      return { error: 'Este email ya está registrado' }
    }
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=FF385C`,
      createdAt: new Date().toISOString(),
      // Simple hash (for demo - in prod use bcrypt)
      passwordHash: btoa(password)
    }
    users.push(newUser)
    localStorage.setItem('ri_users', JSON.stringify(users))
    const { passwordHash: _, ...safeUser } = newUser
    localStorage.setItem('ri_user', JSON.stringify(safeUser))
    setUser(safeUser)
    return { success: true }
  }

  const login = ({ email, password }) => {
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]')
    const found = users.find(u => u.email === email && u.passwordHash === btoa(password))
    if (!found) return { error: 'Email o contraseña incorrectos' }
    const { passwordHash: _, ...safeUser } = found
    localStorage.setItem('ri_user', JSON.stringify(safeUser))
    setUser(safeUser)
    return { success: true }
  }

  const loginWithGoogle = () => {
    // Demo mock - in prod connect real Google OAuth
    const mockName = 'Usuario Google'
    const mockEmail = `google_${Date.now()}@demo.com`
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]')
    let found = users.find(u => u.email.startsWith('google_'))
    if (!found) {
      found = {
        id: crypto.randomUUID(),
        name: mockName,
        email: mockEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=G&backgroundColor=4285F4`,
        provider: 'google',
        createdAt: new Date().toISOString(),
        passwordHash: ''
      }
      users.push(found)
      localStorage.setItem('ri_users', JSON.stringify(users))
    }
    const { passwordHash: _, ...safeUser } = found
    localStorage.setItem('ri_user', JSON.stringify(safeUser))
    setUser(safeUser)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('ri_user')
    setUser(null)
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('ri_user', JSON.stringify(updated))
    // Also update in users list
    const users = JSON.parse(localStorage.getItem('ri_users') || '[]')
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates }
      localStorage.setItem('ri_users', JSON.stringify(users))
    }
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
