import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "abastosgest-secret-key-2024"
)

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  if (!token) return NextResponse.json(null, { status: 401 })

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return NextResponse.json({
      id:     payload.id,
      nombre: payload.nombre,
      email:  payload.email,
      rol:    payload.rol,
    })
  } catch {
    return NextResponse.json(null, { status: 401 })
  }
}
