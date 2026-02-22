import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "abastosgest-secret-key-2024"
)

// Rutas que NO requieren autenticación
const PUBLIC_PATHS = ["/login", "/api/auth/login"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Dejar pasar rutas públicas y assets
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    // Sin token → redirigir al login
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    // Verificar que el JWT sea válido y no haya expirado
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    // Token inválido o expirado → redirigir al login
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("auth_token")
    return response
  }
}

export const config = {
  // Aplicar middleware a todas las rutas excepto assets estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}
