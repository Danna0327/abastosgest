import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const compras = await sql`
      SELECT c.*, pr.nombre as proveedor_nombre,
        json_agg(json_build_object(
          'id', dc.id,
          'producto_id', dc.producto_id,
          'producto', p.nombre,
          'cantidad', dc.cantidad,
          'precio_unitario', dc.precio_unitario,
          'subtotal', dc.subtotal
        )) as items
      FROM compras c
      LEFT JOIN proveedores pr ON pr.id = c.proveedor_id
      LEFT JOIN detalle_compra dc ON dc.compra_id = c.id
      LEFT JOIN productos p ON p.id = dc.producto_id
      GROUP BY c.id, pr.nombre
      ORDER BY c.fecha DESC
    `
    return NextResponse.json(compras)
  } catch (error) {
    console.error("Purchases GET error:", error)
    return NextResponse.json({ error: "Error al cargar compras" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proveedor_id, notas, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Debe incluir al menos un producto" }, { status: 400 })
    }

    // Calculate total
    let total = 0
    for (const item of items) {
      total += item.cantidad * item.precio_unitario
    }

    // Create purchase
    const compraResult = await sql`
      INSERT INTO compras (total, proveedor_id, notas)
      VALUES (${total}, ${proveedor_id || null}, ${notas || null})
      RETURNING *
    `

    const compra = compraResult[0]

    // Insert items and update stock
    for (const item of items) {
      const subtotal = item.cantidad * item.precio_unitario
      await sql`
        INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (${compra.id}, ${item.producto_id}, ${item.cantidad}, ${item.precio_unitario}, ${subtotal})
      `
      // Add stock
      await sql`
        UPDATE productos SET stock = stock + ${item.cantidad} WHERE id = ${item.producto_id}
      `
    }

    return NextResponse.json(compra, { status: 201 })
  } catch (error) {
    console.error("Purchases POST error:", error)
    return NextResponse.json({ error: "Error al registrar compra" }, { status: 500 })
  }
}
