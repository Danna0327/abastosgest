import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, categoria, precio_compra, precio_venta, stock, stock_minimo, unidad, proveedor_id } = body

    if (!nombre || precio_compra == null || precio_venta == null) {
      return NextResponse.json({ error: "Nombre, precio de compra y precio de venta son requeridos" }, { status: 400 })
    }

    const result = await sql`
      UPDATE productos SET
        nombre = ${nombre},
        descripcion = ${descripcion || null},
        categoria = ${categoria || null},
        precio_compra = ${precio_compra},
        precio_venta = ${precio_venta},
        stock = ${stock || 0},
        stock_minimo = ${stock_minimo || 5},
        unidad = ${unidad || 'unidad'},
        proveedor_id = ${proveedor_id || null}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Product PUT error:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const result = await sql`DELETE FROM productos WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Producto eliminado" })
  } catch (error) {
    console.error("Product DELETE error:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
