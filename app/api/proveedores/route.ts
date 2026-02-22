import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const proveedores = await sql`SELECT * FROM proveedores ORDER BY nombre`
    return NextResponse.json(proveedores)
  } catch (error) {
    console.error("Suppliers GET error:", error)
    return NextResponse.json({ error: "Error al cargar proveedores" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, contacto, telefono, email, direccion } = body

    if (!nombre) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
      VALUES (${nombre}, ${contacto || null}, ${telefono || null}, ${email || null}, ${direccion || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Suppliers POST error:", error)
    return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 })
  }
}
