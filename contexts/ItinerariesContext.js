'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const ItinerariesContext = createContext(null)

export function ItinerariesProvider({ children }) {
  const { user } = useAuth()
  const [itineraries, setItineraries] = useState([])

  const storageKey = user ? `ri_itineraries_${user.id}` : null

  const load = useCallback(() => {
    if (!storageKey) { setItineraries([]); return }
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
      setItineraries(stored)
    } catch {
      setItineraries([])
    }
  }, [storageKey])

  useEffect(() => { load() }, [load])

  const save = (itinerary, formData) => {
    if (!storageKey) return null
    const entry = {
      id: crypto.randomUUID(),
      itinerary,
      formData,
      savedAt: new Date().toISOString(),
      title: itinerary.destination || itinerary.city,
    }
    const updated = [entry, ...itineraries]
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setItineraries(updated)
    return entry.id
  }

  const remove = (id) => {
    const updated = itineraries.filter(i => i.id !== id)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setItineraries(updated)
  }

  const get = (id) => itineraries.find(i => i.id === id)

  return (
    <ItinerariesContext.Provider value={{ itineraries, save, remove, get, reload: load }}>
      {children}
    </ItinerariesContext.Provider>
  )
}

export const useItineraries = () => {
  const ctx = useContext(ItinerariesContext)
  if (!ctx) throw new Error('useItineraries must be used within ItinerariesProvider')
  return ctx
}
