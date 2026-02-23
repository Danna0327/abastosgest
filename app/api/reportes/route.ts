import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const desde = searchParams.get("desde") || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]
  const hasta = searchParams.get("hasta") || new Date().toISOString().split("T")[0]
  const tipo  = searchParams.get("tipo") || "ventas_diarias"

  try {
    if (tipo === "ventas_diarias") {
      const rows = await sql`
        SELECT fecha::date as dia,
               COUNT(*) as num_ventas,
               SUM(total) as total
        FROM ventas
        WHERE fecha::date BETWEEN ${desde}::date AND ${hasta}::date
        GROUP BY fecha::date
        ORDER BY dia
      `
      const resumen = await sql`
        SELECT COUNT(*) as num_ventas, COALESCE(SUM(total),0) as total
        FROM ventas
        WHERE fecha::date BETWEEN ${desde}::date AND ${hasta}::date
      `
      return NextResponse.json({ tipo, desde, hasta, rows, resumen: resumen[0] })
    }

    if (tipo === "productos_mas_vendidos") {
      const rows = await sql`
        SELECT p.nombre, p.categoria,
               SUM(dv.cantidad) as total_vendido,
               SUM(dv.subtotal) as total_ingresos
        FROM detalle_venta dv
        JOIN productos p ON p.id = dv.producto_id
        JOIN ventas v ON v.id = dv.venta_id
        WHERE v.fecha::date BETWEEN ${desde}::date AND ${hasta}::date
        GROUP BY p.id, p.nombre, p.categoria
        ORDER BY total_vendido DESC
        LIMIT 20
      `
      return NextResponse.json({ tipo, desde, hasta, rows })
    }

    return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
  } catch (err) {
    console.error("Reportes error:", err)
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 })
  }
}
