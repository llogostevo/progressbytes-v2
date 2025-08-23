"use client"
// TODO: Check if this is needed, check it is secure
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

const AuthContext = createContext({
  isLoggedIn: false,
  userRole: null as string | null,
  userType: null as string | null,
  refreshUser: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  
  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsLoggedIn(!!user)

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, user_type")
        .eq("userid", user.id)
        .single()

      setUserRole(profile?.role || null)
      setUserType(profile?.user_type || null)
    } else {
      setUserRole(null)
      setUserType(null)
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
  }, [fetchUser, supabase.auth])

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userType, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
