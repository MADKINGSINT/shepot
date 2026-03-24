import { AnimatePresence, motion as Motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { LoadingScreen } from './components/LoadingScreen'
import { SetupBanner } from './components/SetupBanner'
import { AuthProvider, useAuth } from './context/AuthContext'

const FeedPage = lazy(() =>
  import('./pages/FeedPage').then((module) => ({ default: module.FeedPage })),
)
const CreatePage = lazy(() =>
  import('./pages/CreatePage').then((module) => ({ default: module.CreatePage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
)

function AppShell() {
  const location = useLocation()
  const { hasSupabaseEnv, isAdmin, loading, profile } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -4, 0] }}
          transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY }}
          className="absolute left-[-5rem] top-[-4rem] h-56 w-56 rounded-full bg-cyan-400/18 blur-3xl"
        />
        <Motion.div
          animate={{ scale: [1, 1.12, 1], x: [0, -20, 10, 0] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY }}
          className="absolute right-[-3rem] top-32 h-64 w-64 rounded-full bg-fuchsia-400/18 blur-3xl"
        />
        <Motion.div
          animate={{ y: [0, 18, 0], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY }}
          className="absolute bottom-8 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[30rem] flex-col px-4 pb-28 pt-4 sm:max-w-[34rem]">
        <header className="glass sticky top-4 z-20 rounded-[2rem] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                <Sparkles className="h-3.5 w-3.5" />
                
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                Шепот ЦО2
              </h1>
              <p className="mt-1 max-w-xs text-sm text-slate-300">
                Подслушка для Кудровского ЦО2 с публикацией через модерацию.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right shadow-lg shadow-slate-950/30">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">
                Статус
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {profile?.role === 'admin' ? 'Админ' : 'Юзер'}
              </p>
            </div>
          </div>
        </header>

        {!hasSupabaseEnv ? <SetupBanner /> : null}

        <main className="relative z-10 flex-1 pt-5">
          {loading ? (
            <LoadingScreen />
          ) : (
            <AnimatePresence mode="wait">
              <Motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/compose" element={<CreatePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={<FeedPage />} />
                  </Routes>
                </Suspense>
              </Motion.div>
            </AnimatePresence>
          )}
        </main>

        <BottomNav isAdmin={isAdmin} />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
