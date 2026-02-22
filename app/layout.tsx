import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AbastosGest - Sistema de Gestion de Abastos',
  description: 'Sistema integral para la gestion de inventario, ventas, compras y proveedores de un abasto o bodega.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
