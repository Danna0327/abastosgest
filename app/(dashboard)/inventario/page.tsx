"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Producto {
  id: number
  nombre: string
  descripcion: string
  categoria: string
  precio_compra: number
  precio_venta: number
  stock: number
  stock_minimo: number
  unidad: string
  proveedor_id: number
  proveedor_nombre: string
}

interface Proveedor {
  id: number
  nombre: string
}

const emptyProduct = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precio_compra: 0,
  precio_venta: 0,
  stock: 0,
  stock_minimo: 5,
  unidad: "unidad",
  proveedor_id: "",
}

function StockBadge({ stock, minimo }: { stock: number; minimo: number }) {
  if (stock === 0) {
    return <Badge variant="destructive">Sin Stock</Badge>
  }
  if (stock <= minimo) {
    return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Bajo</Badge>
  }
  return <Badge className="bg-accent text-accent-foreground">Normal</Badge>
}

export default function InventarioPage() {
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null)
  const [formData, setFormData] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  const searchQuery = new URLSearchParams()
  if (search) searchQuery.set("search", search)
  if (categoriaFilter && categoriaFilter !== "todas") searchQuery.set("categoria", categoriaFilter)

  const { data, isLoading, mutate } = useSWR(
    `/api/productos?${searchQuery.toString()}`,
    fetcher
  )
  const { data: proveedores } = useSWR<Proveedor[]>("/api/proveedores", fetcher)

  const handleNew = () => {
    setEditingProduct(null)
    setFormData(emptyProduct)
    setDialogOpen(true)
  }

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      categoria: producto.categoria || "",
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      unidad: producto.unidad || "unidad",
      proveedor_id: producto.proveedor_id ? String(producto.proveedor_id) : "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    try {
      await fetch(`/api/productos/${deletingProduct.id}`, { method: "DELETE" })
      mutate()
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const body = {
        ...formData,
        precio_compra: Number(formData.precio_compra),
        precio_venta: Number(formData.precio_venta),
        stock: Number(formData.stock),
        stock_minimo: Number(formData.stock_minimo),
        proveedor_id: formData.proveedor_id ? Number(formData.proveedor_id) : null,
      }

      if (editingProduct) {
        await fetch(`/api/productos/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
      mutate()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  const productos: Producto[] = data?.productos || []
  const categorias: string[] = data?.categorias || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventario</h2>
          <p className="text-muted-foreground">
            Gestion de productos y control de stock
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Productos</CardTitle>
          <CardDescription>{productos.length} productos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas las categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">P. Compra</TableHead>
                    <TableHead className="text-right">P. Venta</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{p.nombre}</div>
                          {p.descripcion && (
                            <div className="text-xs text-muted-foreground">{p.descripcion}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(p.precio_compra).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(p.precio_venta).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.stock} {p.unidad}
                      </TableCell>
                      <TableCell>
                        <StockBadge stock={p.stock} minimo={p.stock_minimo} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {p.proveedor_nombre || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(p)}
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingProduct(p)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {productos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto"
                : "Completa el formulario para agregar un nuevo producto"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unidad">Unidad</Label>
                <Select
                  value={formData.unidad}
                  onValueChange={(val) => setFormData({ ...formData, unidad: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="precio_compra">Precio Compra *</Label>
                <Input
                  id="precio_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio_venta">Precio Venta *</Label>
                <Input
                  id="precio_venta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock_minimo">Stock Minimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select
                value={formData.proveedor_id}
                onValueChange={(val) => setFormData({ ...formData, proveedor_id: val })}
              >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.nombre}>
              {saving ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminacion</DialogTitle>
            <DialogDescription>
              {"Esta seguro de que desea eliminar el producto "}
              <strong>{deletingProduct?.nombre}</strong>
              {"? Esta accion no se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
