import useSWR from "swr"

export interface SessionUser {
  id: number
  nombre: string
  email: string
  rol: "admin" | "vendedor"
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSession() {
  const { data, isLoading } = useSWR<SessionUser>("/api/auth/session", fetcher)
  return {
    user:     data ?? null,
    isAdmin:  data?.rol === "admin",
    loading:  isLoading,
  }
}
