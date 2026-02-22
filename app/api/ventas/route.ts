import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const ventas = await sql`
      SELECT v.*,
        json_agg(json_build_object(
          'id', dv.id,
          'producto_id', dv.producto_id,
          'producto', p.nombre,
          'cantidad', dv.cantidad,
          'precio_unitario', dv.precio_unitario,
          'subtotal', dv.subtotal
        )) as items
      FROM ventas v
      LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
      LEFT JOIN productos p ON p.id = dv.producto_id
      GROUP BY v.id
      ORDER BY v.fecha DESC
    `
    return NextResponse.json(ventas)
  } catch (error) {
    console.error("Sales GET error:", error)
    return NextResponse.json({ error: "Error al cargar ventas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cliente, metodo_pago, notas, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Debe incluir al menos un producto" }, { status: 400 })
    }

    // Calculate total
    let total = 0
    for (const item of items) {
      total += item.cantidad * item.precio_unitario
    }

    // Create sale
    const ventaResult = await sql`
      INSERT INTO ventas (total, cliente, metodo_pago, notas)
      VALUES (${total}, ${cliente || 'Cliente General'}, ${metodo_pago || 'efectivo'}, ${notas || null})
      RETURNING *
    `

    const venta = ventaResult[0]

    // Insert items and update stock
    for (const item of items) {
      const subtotal = item.cantidad * item.precio_unitario
      await sql`
        INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (${venta.id}, ${item.producto_id}, ${item.cantidad}, ${item.precio_unitario}, ${subtotal})
      `
      // Deduct stock
      await sql`
        UPDATE productos SET stock = stock - ${item.cantidad} WHERE id = ${item.producto_id}
      `
    }

    return NextResponse.json(venta, { status: 201 })
  } catch (error) {
    console.error("Sales POST error:", error)
    return NextResponse.json({ error: "Error al registrar venta" }, { status: 500 })
  }
}
