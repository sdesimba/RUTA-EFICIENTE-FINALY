'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useItineraries } from '@/contexts/ItinerariesContext'
import AuthModal from './AuthModal'
import { MapPin, BookMarked, LogOut, User, ChevronDown, Compass, Trash2, Clock } from 'lucide-react'

export default function Navbar({ onLoadItinerary }) {
  const { user, logout } = useAuth()
  const { itineraries, remove } = useItineraries()
  const [showAuth, setShowAuth] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const menuRef = useRef(null)
  const savedRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
      if (savedRef.current && !savedRef.current.contains(e.target)) setShowSaved(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md shadow-rose-200">
              <Compass size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Ruta<span className="text-rose-500">Eficiente</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Saved itineraries */}
                <div className="relative" ref={savedRef}>
                  <button
                    onClick={() => { setShowSaved(!showSaved); setShowMenu(false) }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    <BookMarked size={16} />
                    <span className="hidden sm:inline">Mis viajes</span>
                    {itineraries.length > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {itineraries.length}
                      </span>
                    )}
                  </button>

                  {showSaved && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                         className="animate-drop-in">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Itinerarios guardados</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{itineraries.length} viaje{itineraries.length !== 1 ? 's' : ''}</p>
                      </div>
                      {itineraries.length === 0 ? (
                        <div className="p-6 text-center">
                          <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Aún no tienes itinerarios guardados</p>
                          <p className="text-xs text-gray-400 mt-1">Genera uno y guárdalo aquí</p>
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {itineraries.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0">
                              <div
                                className="flex-1 cursor-pointer min-w-0"
                                onClick={() => { onLoadItinerary(item); setShowSaved(false) }}
                              >
                                <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Clock size={11} className="text-gray-400" />
                                  <p className="text-xs text-gray-400">{formatDate(item.savedAt)} · {item.formData.days} días</p>
                                </div>
                              </div>
                              <button
                                onClick={() => remove(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => { setShowMenu(!showMenu); setShowSaved(false) }}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-2xl hover:bg-gray-100 transition-all"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover border-2 border-rose-100"
                    />
                    <span className="hidden sm:inline text-sm font-semibold text-gray-700 max-w-24 truncate">{user.name}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                         className="animate-drop-in">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => { logout(); setShowMenu(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                        >
                          <LogOut size={15} />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl shadow-md shadow-rose-200 hover:shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
