import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { hasSupabaseEnv, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(Boolean(hasSupabaseEnv && supabase))

  const refreshProfile = useCallback(async (userId) => {
    const nextProfile = await fetchProfile(userId)
    setProfile(nextProfile)
    return nextProfile
  }, [])

  useEffect(() => {
    if (!supabase || !hasSupabaseEnv) {
      return undefined
    }

    let isMounted = true

    const bootstrap = async () => {
      const {
        data: { session: nextSession },
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      setSession(nextSession)

      if (nextSession?.user) {
        await refreshProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)

      if (nextSession?.user) {
        void refreshProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Сначала подключите Supabase в файле .env.')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }, [])

  const signUp = useCallback(async ({ displayName, email, password, username }) => {
    if (!supabase) {
      throw new Error('Сначала подключите Supabase в файле .env.')
    }

    const normalizedUsername = username.trim().toLowerCase()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: normalizedUsername,
        },
      },
    })

    if (error) {
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) {
      return
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  }, [])

  const value = useMemo(
    () => ({
      hasSupabaseEnv,
      isAdmin: profile?.role === 'admin',
      loading,
      profile,
      refreshProfile,
      session,
      signIn,
      signOut,
      signUp,
      user: session?.user ?? null,
    }),
    [loading, profile, refreshProfile, session, signIn, signOut, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider.')
  }

  return context
}
