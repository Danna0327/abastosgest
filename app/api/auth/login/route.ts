import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { SignJWT } from "jose"
import { createHash } from "crypto"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "abastosgest-secret-key-2024"
)

// Verificar password con SHA256 (compatible con bcrypt via comparación simple)
// Para producción real usar bcryptjs, pero en Railway sin native addons usamos esto
function hashPassword(password: string): string {
  return createHash("sha256").update(password + "abastosgest_salt").digest("hex")
}

// Crear tabla e insertar admin por defecto si no existe
async function ensureUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id         SERIAL PRIMARY KEY,
      nombre     VARCHAR(100) NOT NULL,
      email      VARCHAR(200) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      rol        VARCHAR(50)  NOT NULL DEFAULT 'vendedor',
      activo     BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP    DEFAULT NOW()
    )
  `

  // Insertar admin por defecto si no hay ningún usuario
  const count = await sql`SELECT COUNT(*) as total FROM usuarios`
  if (Number(count[0].total) === 0) {
    await sql`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES (
        'Administrador',
        'admin@abastosgest.com',
        ${hashPassword("admin123")},
        'admin'
      )
    `
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    // Asegurar que la tabla existe
    await ensureUsersTable()

    // Buscar usuario
    const usuarios = await sql`
      SELECT * FROM usuarios WHERE email = ${email} AND activo = TRUE
    `

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    const usuario = usuarios[0]

    // Verificar contraseña
    if (usuario.password !== hashPassword(password)) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Crear JWT con los datos del usuario
    const token = await new SignJWT({
      id:     usuario.id,
      nombre: usuario.nombre,
      email:  usuario.email,
      rol:    usuario.rol,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(JWT_SECRET)

    // Responder con cookie httpOnly
    const response = NextResponse.json({ ok: true, nombre: usuario.nombre, rol: usuario.rol })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 8, // 8 horas
      path:     "/",
    })

    return response
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
