"use client"

import { useState } from "react"
import { BarChart3, Download, Printer, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ReporteRow {
  dia?: string
  num_ventas?: number
  total?: number
  nombre?: string
  categoria?: string
  total_vendido?: number
  total_ingresos?: number
}

interface ReporteData {
  tipo: string
  desde: string
  hasta: string
  rows: ReporteRow[]
  resumen?: { num_ventas: number; total: number }
}

const hoy = new Date().toISOString().split("T")[0]
const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]

export default function ReportesPage() {
  const [desde, setDesde] = useState(hace30)
  const [hasta, setHasta] = useState(hoy)
  const [tipo, setTipo] = useState("ventas_diarias")
  const [data, setData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(false)

  async function generarReporte() {
    setLoading(true)
    try {
      const res = await fetch(`/api/reportes?desde=${desde}&hasta=${hasta}&tipo=${tipo}`)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleExportCSV() {
    if (!data?.rows.length) return
    const headers = tipo === "ventas_diarias"
      ? ["Fecha", "Num Ventas", "Total ($)"]
      : ["Producto", "Categoría", "Unidades Vendidas", "Ingresos ($)"]

    const rows = data.rows.map(r =>
      tipo === "ventas_diarias"
        ? [r.dia, r.num_ventas, Number(r.total).toFixed(2)]
        : [r.nombre, r.categoria, r.total_vendido, Number(r.total_ingresos).toFixed(2)]
    )

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `reporte-${tipo}-${desde}-${hasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reportes y Estadísticas</h2>
        <p className="text-muted-foreground">Genera reportes por período y tipo de análisis</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" /> Configurar Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1.5">
              <Label>Desde</Label>
              <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hasta</Label>
              <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Reporte</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas_diarias">Ventas Diarias</SelectItem>
                  <SelectItem value="productos_mas_vendidos">Productos Más Vendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generarReporte} disabled={loading} className="gap-2">
              <Search className="size-4" />
              {loading ? "Generando..." : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {data && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  {tipo === "ventas_diarias" ? "Ventas Diarias" : "Productos Más Vendidos"}
                </CardTitle>
                <CardDescription>
                  Del {data.desde} al {data.hasta} · {data.rows.length} registros
                </CardDescription>
              </div>
              {/* Botones exportar */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                  <Download className="size-4" /> Exportar CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                  <Printer className="size-4" /> Imprimir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Resumen si es ventas diarias */}
            {data.resumen && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-lg bg-muted/40 p-4 text-center">
                    <div className="text-2xl font-bold">{data.resumen.num_ventas}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total de ventas</div>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <div className="text-2xl font-bold text-primary">${Number(data.resumen.total).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Ingresos totales</div>
                  </div>
                </div>
                <Separator className="mb-4" />
              </>
            )}

            <div className="overflow-x-auto">
              {tipo === "ventas_diarias" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-center">Nº Ventas</TableHead>
                      <TableHead className="text-right">Total del Día</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.length ? data.rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.dia ? new Date(r.dia).toLocaleDateString("es-EC", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—"}</TableCell>
                        <TableCell className="text-center"><Badge variant="secondary">{r.num_ventas}</Badge></TableCell>
                        <TableCell className="text-right font-semibold">${Number(r.total).toFixed(2)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No hay ventas en ese período</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Unidades Vendidas</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.length ? data.rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{r.nombre}</TableCell>
                        <TableCell><Badge variant="outline">{r.categoria || "—"}</Badge></TableCell>
                        <TableCell className="text-center font-semibold">{r.total_vendido}</TableCell>
                        <TableCell className="text-right">${Number(r.total_ingresos).toFixed(2)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay datos en ese período</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!data && !loading && (
        <div className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          <BarChart3 className="size-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Configura los filtros y haz clic en <strong>Generar Reporte</strong></p>
          <p className="text-sm mt-1">Puedes filtrar por fecha y tipo de reporte</p>
        </div>
      )}
    </div>
  )
}
