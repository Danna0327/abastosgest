"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Store, LogOut, BarChart3 } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useSession } from "@/hooks/use-session"

const allNavItems = [
  { title: "Dashboard",   href: "/",           icon: LayoutDashboard, adminOnly: false },
  { title: "Inventario",  href: "/inventario", icon: Package,         adminOnly: false },
  { title: "Ventas",      href: "/ventas",      icon: ShoppingCart,   adminOnly: false },
  { title: "Compras",     href: "/compras",     icon: Truck,          adminOnly: false },
  { title: "Proveedores", href: "/proveedores", icon: Users,          adminOnly: true  },
  { title: "Reportes",    href: "/reportes",    icon: BarChart3,      adminOnly: true  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAdmin } = useSession()

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex items-center justify-center rounded-lg bg-sidebar-primary size-8">
                  <Store className="size-4 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-sm">AbastosGest</span>
                  <span className="text-xs text-sidebar-foreground/60">Nancy Market</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} tooltip={item.title}>
                    <Link href={item.href}><item.icon /><span>{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="cursor-default">
                <div className="flex items-center justify-center rounded-full bg-primary size-7 text-primary-foreground text-xs font-bold flex-shrink-0">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-medium">{user.nombre}</span>
                  <span className="text-xs text-sidebar-foreground/60 capitalize">{user.rol}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
              <LogOut /><span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
