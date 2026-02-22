"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas")
        setLoading(false)
        return
      }

      // Login exitoso → redirigir al dashboard
      router.push("/")
      router.refresh()
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4"
         style={{ backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
      <div className="w-full max-w-sm">

        {/* Logo / Banner */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-content-center mx-auto mb-4 text-3xl leading-none flex items-center justify-center">
            ▦
          </div>
          <h1 className="text-xl font-semibold tracking-tight">AbastosGest</h1>
          <p className="text-sm text-muted-foreground mt-1">Nancy Market — Sistema de Gestión</p>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <h2 className="text-base font-semibold mb-6 pb-4 border-b">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@correo.com"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? "Ingresando..." : "Ingresar al Sistema"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center text-xs text-muted-foreground">
            Acceso por defecto:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">admin@abastosgest.com</code>
            {" / "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">admin123</code>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          AbastosGest v1.0 — Proyecto Final Ingeniería en Sistemas
        </p>
      </div>
    </div>
  )
}
