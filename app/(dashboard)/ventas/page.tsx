"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface VentaItem {
  producto_id: string
  producto?: string
  cantidad: number
  precio_unitario: number
}

interface Venta {
  id: number
  fecha: string
  total: number
  cliente: string
  metodo_pago: string
  notas: string
  items: Array<{
    id: number
    producto_id: number
    producto: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
}

interface Producto {
  id: number
  nombre: string
  precio_venta: number
  stock: number
}

export default function VentasPage() {
  const { data: ventas, isLoading, mutate } = useSWR<Venta[]>("/api/ventas", fetcher)
  const { data: productosData } = useSWR("/api/productos", fetcher)
  const productos: Producto[] = productosData?.productos || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialog, setDetailDialog] = useState<Venta | null>(null)
  const [cliente, setCliente] = useState("Cliente General")
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [items, setItems] = useState<VentaItem[]>([])
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    setItems([...items, { producto_id: "", cantidad: 1, precio_unitario: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items]
    if (field === "producto_id") {
      const prod = productos.find((p) => String(p.id) === value)
      updated[index] = {
        ...updated[index],
        producto_id: value as string,
        precio_unitario: prod ? prod.precio_venta : 0,
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setItems(updated)
  }

  const total = items.reduce(
    (sum, item) => sum + item.cantidad * item.precio_unitario,
    0
  )

  const handleSubmit = async () => {
    if (items.length === 0 || items.some((i) => !i.producto_id)) return
    setSaving(true)
    try {
      const body = {
        cliente,
        metodo_pago: metodoPago,
        items: items.map((i) => ({
          producto_id: Number(i.producto_id),
          cantidad: Number(i.cantidad),
          precio_unitario: Number(i.precio_unitario),
        })),
      }
      await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      mutate()
      setDialogOpen(false)
      setItems([])
      setCliente("Cliente General")
      setMetodoPago("efectivo")
    } catch (error) {
      console.error("Error creating sale:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ventas</h2>
          <p className="text-muted-foreground">Registro y consulta de ventas</p>
        </div>
        <Button onClick={() => { setDialogOpen(true); setItems([]) }}>
          <Plus className="mr-2 size-4" />
          Nueva Venta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Ventas</CardTitle>
          <CardDescription>
            {ventas?.length || 0} ventas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Metodo</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas?.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">#{v.id}</TableCell>
                      <TableCell>
                        {new Date(v.fecha).toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{v.cliente || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{v.metodo_pago}</Badge>
                      </TableCell>
                      <TableCell>{v.items?.length || 0} items</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(v.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailDialog(v)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!ventas || ventas.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No hay ventas registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Nueva Venta
            </DialogTitle>
            <DialogDescription>
              Registre una nueva venta seleccionando los productos
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cliente</Label>
                <Input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Metodo de Pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Productos</Label>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 size-3" />
                  Agregar
                </Button>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Select
                      value={item.producto_id}
                      onValueChange={(val) => updateItem(index, "producto_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.nombre} (Stock: {p.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      value={item.cantidad}
                      onChange={(e) => updateItem(index, "cantidad", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Precio"
                      value={item.precio_unitario}
                      onChange={(e) => updateItem(index, "precio_unitario", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium leading-9">
                    ${(item.cantidad * item.precio_unitario).toFixed(2)}
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Agregue productos a la venta
                </p>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving || items.length === 0}>
              {saving ? "Registrando..." : "Registrar Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venta #{detailDialog?.id}</DialogTitle>
            <DialogDescription>
              {detailDialog &&
                new Date(detailDialog.fecha).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="text-foreground">{detailDialog?.cliente || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Metodo de Pago:</span>
              <Badge variant="secondary">{detailDialog?.metodo_pago}</Badge>
            </div>
            <Separator />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-right">P. Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailDialog?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.producto}</TableCell>
                    <TableCell className="text-center">{item.cantidad}</TableCell>
                    <TableCell className="text-right">
                      ${Number(item.precio_unitario).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(item.subtotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">
                  ${detailDialog ? Number(detailDialog.total).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
