import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [
      totalProductos,
      totalProveedores,
      ventasHoy,
      productosBajoStock,
      ventasRecientes,
      topProductos,
      ventasPorDia,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM productos`,
      sql`SELECT COUNT(*) as count FROM proveedores`,
      sql`SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE fecha::date = CURRENT_DATE`,
      sql`SELECT COUNT(*) as count FROM productos WHERE stock <= stock_minimo`,
      sql`
        SELECT v.id, v.fecha, v.total, v.cliente, v.metodo_pago,
          json_agg(json_build_object(
            'producto', p.nombre,
            'cantidad', dv.cantidad,
            'subtotal', dv.subtotal
          )) as items
        FROM ventas v
        LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
        LEFT JOIN productos p ON p.id = dv.producto_id
        GROUP BY v.id
        ORDER BY v.fecha DESC
        LIMIT 5
      `,
      sql`
        SELECT p.nombre, SUM(dv.cantidad) as total_vendido
        FROM detalle_venta dv
        JOIN productos p ON p.id = dv.producto_id
        GROUP BY p.nombre
        ORDER BY total_vendido DESC
        LIMIT 5
      `,
      sql`
        SELECT fecha::date as dia, SUM(total) as total
        FROM ventas
        WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY fecha::date
        ORDER BY dia
      `,
    ])

    const inventarioValor = await sql`SELECT COALESCE(SUM(precio_venta * stock), 0) as valor FROM productos`

    return NextResponse.json({
      stats: {
        totalProductos: Number(totalProductos[0].count),
        totalProveedores: Number(totalProveedores[0].count),
        ventasHoy: Number(ventasHoy[0].total),
        productosBajoStock: Number(productosBajoStock[0].count),
        inventarioValor: Number(inventarioValor[0].valor),
      },
      ventasRecientes,
      topProductos,
      ventasPorDia,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Error al cargar dashboard" }, { status: 500 })
  }
}
