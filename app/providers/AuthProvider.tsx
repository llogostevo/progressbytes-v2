"use client"
// TODO: Check if this is needed, check it is secure
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

const AuthContext = createContext({
  isLoggedIn: false,
  userRole: null as string | null,
  refreshUser: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("userid", user.id)
        .single()

      setUserRole(profile?.role || null)
    } else {
      setUserRole(null)
    }
  }, [supabase])

  useEffect(() => {
    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
