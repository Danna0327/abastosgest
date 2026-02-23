"use client"

import Link from "next/link"
import useSWR from "swr"
import { ShoppingCart, Package, Users, BarChart3, AlertTriangle, DollarSign, TrendingUp, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/use-session"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const modules = [
  { title: "Ventas", description: "Registrar y consultar ventas", href: "/ventas", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800", iconBg: "bg-blue-500", adminOnly: false },
  { title: "Inventario", description: "Gestión de productos y stock", href: "/inventario", icon: Package, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800", iconBg: "bg-emerald-500", adminOnly: false },
  { title: "Proveedores", description: "Directorio de proveedores", href: "/proveedores", icon: Users, color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800", iconBg: "bg-purple-500", adminOnly: true },
  { title: "Reportes", description: "Estadísticas y exportación", href: "/reportes", icon: BarChart3, color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800", iconBg: "bg-amber-500", adminOnly: true },
]

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, { refreshInterval: 30000 })
  const { isAdmin } = useSession()
  const visibleModules = modules.filter(m => !m.adminOnly || isAdmin)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión Nancy Market</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Ventas Hoy", value: isLoading ? "..." : `$${Number(data?.stats?.ventasHoy || 0).toFixed(2)}`, icon: DollarSign, sub: "Total facturado hoy", warn: false },
          { label: "Productos", value: isLoading ? "..." : String(data?.stats?.totalProductos ?? "..."), icon: Package, sub: "En inventario", warn: false },
          { label: "Proveedores", value: isLoading ? "..." : String(data?.stats?.totalProveedores ?? "..."), icon: Users, sub: "Registrados", warn: false },
          { label: "Stock Bajo", value: isLoading ? "..." : String(data?.stats?.productosBajoStock ?? 0), icon: AlertTriangle, sub: "Requieren reposición", warn: Number(data?.stats?.productosBajoStock) > 0 },
        ].map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`size-4 ${s.warn ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <div className={`text-2xl font-bold ${s.warn ? "text-destructive" : ""}`}>{s.value}</div>}
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botones grandes de módulos */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Módulos del Sistema</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleModules.map(mod => (
            <Link key={mod.href} href={mod.href}>
              <Card className={`border-2 hover:shadow-lg transition-all cursor-pointer group ${mod.color}`}>
                <CardContent className="pt-6 pb-5">
                  <div className={`w-12 h-12 rounded-xl ${mod.iconBg} flex items-center justify-center mb-4`}>
                    <mod.icon className="size-6 text-white" />
                  </div>
                  <div className="font-semibold text-lg">{mod.title}</div>
                  <div className="text-sm opacity-70 mt-1">{mod.description}</div>
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                    Abrir módulo <ArrowRight className="size-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerta stock bajo */}
      {!isLoading && Number(data?.stats?.productosBajoStock) > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
              <AlertTriangle className="size-4" />
              Alerta: {data?.stats?.productosBajoStock} productos con stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/inventario" className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver inventario <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Top productos + ventas recientes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="size-4" />Productos Más Vendidos</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32 w-full" /> : data?.topProductos?.length ? (
              <div className="space-y-3">
                {data.topProductos.map((p: {nombre: string; total_vendido: number}, i: number) => (
                  <div key={p.nombre} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Badge variant="outline">{i + 1}</Badge><span className="text-sm">{p.nombre}</span></div>
                    <span className="text-sm font-medium text-muted-foreground">{p.total_vendido} uds</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">Sin ventas aún</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ventas Recientes</CardTitle><CardDescription>Últimas 5 transacciones</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32 w-full" /> : data?.ventasRecientes?.length ? (
              <div className="space-y-3">
                {data.ventasRecientes.map((v: {id: number; cliente: string; total: number}) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <div><span className="font-medium">#{v.id}</span><span className="text-muted-foreground ml-2">{v.cliente}</span></div>
                    <span className="font-semibold">${Number(v.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">Sin ventas aún</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
