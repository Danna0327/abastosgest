"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, Truck } from "lucide-react"
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

interface CompraItem {
  producto_id: string
  cantidad: number
  precio_unitario: number
}

interface Compra {
  id: number
  fecha: string
  total: number
  proveedor_id: number
  proveedor_nombre: string
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

interface Proveedor {
  id: number
  nombre: string
}

interface Producto {
  id: number
  nombre: string
  precio_compra: number
}

export default function ComprasPage() {
  const { data: compras, isLoading, mutate } = useSWR<Compra[]>("/api/compras", fetcher)
  const { data: proveedores } = useSWR<Proveedor[]>("/api/proveedores", fetcher)
  const { data: productosData } = useSWR("/api/productos", fetcher)
  const productos: Producto[] = productosData?.productos || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialog, setDetailDialog] = useState<Compra | null>(null)
  const [proveedorId, setProveedorId] = useState("")
  const [items, setItems] = useState<CompraItem[]>([])
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
        precio_unitario: prod ? prod.precio_compra : 0,
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
        proveedor_id: proveedorId ? Number(proveedorId) : null,
        items: items.map((i) => ({
          producto_id: Number(i.producto_id),
          cantidad: Number(i.cantidad),
          precio_unitario: Number(i.precio_unitario),
        })),
      }
      await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      mutate()
      setDialogOpen(false)
      setItems([])
      setProveedorId("")
    } catch (error) {
      console.error("Error creating purchase:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Compras</h2>
          <p className="text-muted-foreground">Registro de compras a proveedores</p>
        </div>
        <Button onClick={() => { setDialogOpen(true); setItems([]) }}>
          <Plus className="mr-2 size-4" />
          Nueva Compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Compras</CardTitle>
          <CardDescription>
            {compras?.length || 0} compras registradas
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
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">#{c.id}</TableCell>
                      <TableCell>
                        {new Date(c.fecha).toLocaleDateString("es-VE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{c.proveedor_nombre || "—"}</TableCell>
                      <TableCell>{c.items?.length || 0} items</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(c.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailDialog(c)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!compras || compras.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay compras registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="size-5" />
              Nueva Compra
            </DialogTitle>
            <DialogDescription>
              Registre una nueva compra a proveedor
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Proveedor</Label>
              <Select value={proveedorId} onValueChange={setProveedorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores?.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                            {p.nombre}
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
                  Agregue productos a la compra
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
              {saving ? "Registrando..." : "Registrar Compra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compra #{detailDialog?.id}</DialogTitle>
            <DialogDescription>
              {detailDialog &&
                new Date(detailDialog.fecha).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Proveedor:</span>
              <span className="text-foreground">
                {detailDialog?.proveedor_nombre || "—"}
              </span>
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
