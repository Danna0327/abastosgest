"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Proveedor {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  created_at: string
}

const emptyProveedor = {
  nombre: "",
  contacto: "",
  telefono: "",
  email: "",
  direccion: "",
}

export default function ProveedoresPage() {
  const { data: proveedores, isLoading, mutate } = useSWR<Proveedor[]>("/api/proveedores", fetcher)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [deletingProveedor, setDeletingProveedor] = useState<Proveedor | null>(null)
  const [formData, setFormData] = useState(emptyProveedor)
  const [saving, setSaving] = useState(false)

  const handleNew = () => {
    setEditingProveedor(null)
    setFormData(emptyProveedor)
    setDialogOpen(true)
  }

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || "",
      telefono: proveedor.telefono || "",
      email: proveedor.email || "",
      direccion: proveedor.direccion || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingProveedor) return
    try {
      await fetch(`/api/proveedores/${deletingProveedor.id}`, { method: "DELETE" })
      mutate()
      setDeleteDialogOpen(false)
      setDeletingProveedor(null)
    } catch (error) {
      console.error("Error deleting supplier:", error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre) return
    setSaving(true)
    try {
      if (editingProveedor) {
        await fetch(`/api/proveedores/${editingProveedor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/proveedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      mutate()
      setDialogOpen(false)
    } catch (error) {
      console.error("Error saving supplier:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Proveedores</h2>
          <p className="text-muted-foreground">Gestion de proveedores y contactos</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 size-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Proveedores</CardTitle>
          <CardDescription>
            {proveedores?.length || 0} proveedores registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Direccion</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proveedores?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{p.nombre}</TableCell>
                      <TableCell>{p.contacto || "—"}</TableCell>
                      <TableCell>
                        {p.telefono ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="size-3 text-muted-foreground" />
                            {p.telefono}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {p.email ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="size-3 text-muted-foreground" />
                            {p.email}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {p.direccion ? (
                          <span className="flex items-center gap-1 text-sm max-w-48 truncate">
                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                            {p.direccion}
                          </span>
                        ) : (
                          "—"
                        )}
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
                              setDeletingProveedor(p)
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
                  {(!proveedores || proveedores.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay proveedores registrados
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {editingProveedor
                ? "Modifica los datos del proveedor"
                : "Completa el formulario para agregar un proveedor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la Empresa *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="direccion">Direccion</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.nombre}>
              {saving
                ? "Guardando..."
                : editingProveedor
                  ? "Actualizar"
                  : "Crear"}
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
              {"Esta seguro de que desea eliminar al proveedor "}
              <strong>{deletingProveedor?.nombre}</strong>
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
