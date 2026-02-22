import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const categoria = searchParams.get("categoria") || ""

    let productos
    if (search && categoria) {
      productos = await sql`
        SELECT p.*, pr.nombre as proveedor_nombre
        FROM productos p
        LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
        WHERE (p.nombre ILIKE ${'%' + search + '%'} OR p.descripcion ILIKE ${'%' + search + '%'})
          AND p.categoria = ${categoria}
        ORDER BY p.nombre
      `
    } else if (search) {
      productos = await sql`
        SELECT p.*, pr.nombre as proveedor_nombre
        FROM productos p
        LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
        WHERE p.nombre ILIKE ${'%' + search + '%'} OR p.descripcion ILIKE ${'%' + search + '%'}
        ORDER BY p.nombre
      `
    } else if (categoria) {
      productos = await sql`
        SELECT p.*, pr.nombre as proveedor_nombre
        FROM productos p
        LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
        WHERE p.categoria = ${categoria}
        ORDER BY p.nombre
      `
    } else {
      productos = await sql`
        SELECT p.*, pr.nombre as proveedor_nombre
        FROM productos p
        LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
        ORDER BY p.nombre
      `
    }

    const categorias = await sql`SELECT DISTINCT categoria FROM productos ORDER BY categoria`

    return NextResponse.json({ productos, categorias: categorias.map((c: { categoria: string }) => c.categoria) })
  } catch (error) {
    console.error("Products GET error:", error)
    return NextResponse.json({ error: "Error al cargar productos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, categoria, precio_compra, precio_venta, stock, stock_minimo, unidad, proveedor_id } = body

    if (!nombre || precio_compra == null || precio_venta == null) {
      return NextResponse.json({ error: "Nombre, precio de compra y precio de venta son requeridos" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO productos (nombre, descripcion, categoria, precio_compra, precio_venta, stock, stock_minimo, unidad, proveedor_id)
      VALUES (${nombre}, ${descripcion || null}, ${categoria || null}, ${precio_compra}, ${precio_venta}, ${stock || 0}, ${stock_minimo || 5}, ${unidad || 'unidad'}, ${proveedor_id || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Products POST error:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
