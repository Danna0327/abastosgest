"use client"

import useSWR from "swr"
import {
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface DashboardData {
  stats: {
    totalProductos: number
    totalProveedores: number
    ventasHoy: number
    productosBajoStock: number
    inventarioValor: number
  }
  ventasRecientes: Array<{
    id: number
    fecha: string
    total: number
    cliente: string
    metodo_pago: string
    items: Array<{ producto: string; cantidad: number; subtotal: number }>
  }>
  topProductos: Array<{ nombre: string; total_vendido: number }>
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}: {
  title: string
  value: string
  icon: React.ElementType
  description?: string
  variant?: "default" | "warning"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={`size-4 ${variant === "warning" ? "text-destructive" : "text-muted-foreground"}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardData>("/api/dashboard", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Resumen general del sistema</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={String(data.stats.totalProductos)}
          icon={Package}
          description="Productos registrados"
        />
        <StatCard
          title="Proveedores"
          value={String(data.stats.totalProveedores)}
          icon={Users}
          description="Proveedores activos"
        />
        <StatCard
          title="Ventas Hoy"
          value={`$${data.stats.ventasHoy.toFixed(2)}`}
          icon={DollarSign}
          description="Total facturado hoy"
        />
        <StatCard
          title="Stock Bajo"
          value={String(data.stats.productosBajoStock)}
          icon={AlertTriangle}
          description="Productos bajo minimo"
          variant={data.stats.productosBajoStock > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Valor del Inventario</CardTitle>
            <CardDescription>Valor total a precio de venta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${data.stats.inventarioValor.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="size-4" />
              Productos Mas Vendidos
            </CardTitle>
            <CardDescription>Por cantidad total vendida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-foreground">{i + 1}</Badge>
                    <span className="text-sm text-foreground">{p.nombre}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {p.total_vendido} uds
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Ventas Recientes</CardTitle>
          <CardDescription>Ultimas 5 ventas registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.ventasRecientes.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">#{v.id}</TableCell>
                  <TableCell>
                    {new Date(v.fecha).toLocaleDateString("es-VE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{v.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.metodo_pago}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(v.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
