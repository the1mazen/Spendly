"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { AuthUser, CurrencyCode, Account, UserFinancialData } from "../types"
import { hashString, encryptPayload, decryptPayload } from "./crypto"
import { toast } from "sonner"

interface RegisterParams {
  username: string
  email: string
  password: string
  fullName: string
  avatar?: string
  baseCurrency?: CurrencyCode
  initialAccounts: Account[]
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (params: RegisterParams) => Promise<boolean>
  login: (usernameOrEmail: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<AuthUser>) => void
  getUserStorageKey: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const REGISTRY_STORAGE_KEY = "spendly_users_registry"
const ACTIVE_SESSION_KEY = "spendly_active_session"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Initialize session on mount
  useEffect(() => {
    try {
      const activeSessionStr = localStorage.getItem(ACTIVE_SESSION_KEY)
      if (activeSessionStr) {
        const session = JSON.parse(activeSessionStr)
        const registry = getUsersRegistry()
        const found = registry.find((u) => u.id === session.userId)
        if (found) {
          setUser(found)
        } else {
          localStorage.removeItem(ACTIVE_SESSION_KEY)
        }
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e)
      localStorage.removeItem(ACTIVE_SESSION_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  function getUsersRegistry(): AuthUser[] {
    try {
      const raw = localStorage.getItem(REGISTRY_STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as AuthUser[]
    } catch {
      return []
    }
  }

  function saveUsersRegistry(users: AuthUser[]) {
    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
      console.error("Failed to write users registry:", e)
    }
  }

  const register = async (params: RegisterParams): Promise<boolean> => {
    try {
      setIsLoading(true)
      const registry = getUsersRegistry()
      const normalizedEmail = params.email.trim().toLowerCase()
      const normalizedUsername = params.username.trim().toLowerCase()

      // Check if user already exists
      const existing = registry.find(
        (u) => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === normalizedUsername
      )
      if (existing) {
        toast.error("An account with this username or email already exists. Please log in.")
        setIsLoading(false)
        return false
      }

      const passwordHash = await hashString(params.password)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      const newUser: AuthUser = {
        id: userId,
        username: normalizedUsername,
        email: normalizedEmail,
        fullName: params.fullName.trim() || params.username,
        avatar:
          params.avatar ||
          "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
        baseCurrency: params.baseCurrency || "EGP",
        passwordHash,
        createdAt: new Date().toISOString(),
      }

      // Initialize isolated user data payload
      const initialFinancialData: UserFinancialData = {
        accounts: params.initialAccounts.map((a, i) => ({
          ...a,
          id: a.id || `acc_${Date.now()}_${i}`,
          order: i,
        })),
        transactions: [],
        custodialEntries: [],
        plannedPayments: [],
        shortcuts: [
          {
            id: `sc_init_1`,
            label: "Coffee & Breakfast",
            amount: 75,
            currency: params.baseCurrency || "EGP",
            category: "food",
            accountId: params.initialAccounts[0]?.id || "acc_default",
            type: "expense",
          },
          {
            id: `sc_init_2`,
            label: "Transportation",
            amount: 50,
            currency: params.baseCurrency || "EGP",
            category: "transport",
            accountId: params.initialAccounts[0]?.id || "acc_default",
            type: "expense",
          },
        ],
        weeklyBudget: {
          enabled: true,
          amount: 4000,
          currency: params.baseCurrency || "EGP",
          resetMode: "rolling_7_days",
          scopedAccountIds: params.initialAccounts.map((a) => a.id),
          alertThreshold: 80,
        },
        categoryCaps: [
          { category: "food", monthlyCap: 6000, currency: params.baseCurrency || "EGP" },
          { category: "transport", monthlyCap: 2000, currency: params.baseCurrency || "EGP" },
          { category: "shopping", monthlyCap: 3500, currency: params.baseCurrency || "EGP" },
        ],
        savingsTargets: [
          {
            id: `sav_init_1`,
            title: "Emergency Savings Pool",
            targetAmount: 50000,
            currentAmount: 15000,
            currency: params.baseCurrency || "EGP",
            deadline: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
            category: "Security",
          },
        ],
        baseCurrency: params.baseCurrency || "EGP",
        activeAccountId: params.initialAccounts[0]?.id,
      }

      // Save encrypted initial financial data under user key
      const userSecret = `${userId}_${passwordHash.substring(0, 12)}`
      const encryptedData = encryptPayload(initialFinancialData, userSecret)
      localStorage.setItem(`spendly_data_${userId}`, encryptedData)

      // Save to registry and active session
      const updatedRegistry = [...registry, newUser]
      saveUsersRegistry(updatedRegistry)
      localStorage.setItem(
        ACTIVE_SESSION_KEY,
        JSON.stringify({
          userId: newUser.id,
          username: newUser.username,
          email: newUser.email,
          loginAt: new Date().toISOString(),
        })
      )

      setUser(newUser)
      toast.success(`Account registered successfully! Welcome, ${newUser.fullName}.`)
      return true
    } catch (e) {
      console.error("Registration error:", e)
      toast.error("Registration failed. Please try again.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const registry = getUsersRegistry()
      const query = usernameOrEmail.trim().toLowerCase()
      const passwordHash = await hashString(password)

      const target = registry.find(
        (u) => (u.email.toLowerCase() === query || u.username.toLowerCase() === query)
      )

      if (!target) {
        toast.error("No account found with this username or email.")
        return false
      }

      if (target.passwordHash !== passwordHash) {
        toast.error("Incorrect password. Please verify your credentials.")
        return false
      }

      // Set active session
      localStorage.setItem(
        ACTIVE_SESSION_KEY,
        JSON.stringify({
          userId: target.id,
          username: target.username,
          email: target.email,
          loginAt: new Date().toISOString(),
        })
      )

      setUser(target)
      toast.success(`Welcome back, ${target.fullName}!`)
      return true
    } catch (e) {
      console.error("Login error:", e)
      toast.error("Login encountered an error.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
      setUser(null)
      toast.info("Logged out of your Spendly session.")
    } catch (e) {
      console.error("Logout error:", e)
    }
  }

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (!user) return
    const updated: AuthUser = { ...user, ...updates }
    setUser(updated)

    const registry = getUsersRegistry()
    const updatedRegistry = registry.map((u) => (u.id === user.id ? updated : u))
    saveUsersRegistry(updatedRegistry)
    toast.success("Profile updated successfully")
  }

  const getUserStorageKey = (): string | null => {
    if (!user) return null
    return `spendly_data_${user.id}`
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        register,
        login,
        logout,
        updateProfile,
        getUserStorageKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
