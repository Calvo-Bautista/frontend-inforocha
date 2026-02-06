"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  Truck,
  UserCog,
  LogOut,
  Printer,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const roleNavItems = {
  vendedor: [
    { href: "/dashboard/productos", label: "Productos", icon: Package },
    { href: "/dashboard/clientes", label: "Compradores & Llamadas", icon: Users },
    { href: "/dashboard/nueva-orden", label: "Nueva Orden", icon: ShoppingCart },
    { href: "/dashboard/mis-pedidos", label: "Mis Pedidos", icon: ClipboardList },
  ],
  logistica: [
    { href: "/dashboard/clientes", label: "Compradores & Llamadas", icon: Users },
    { href: "/dashboard/despachos", label: "Despachos", icon: Truck },
  ],
  admin: [
    { href: "/dashboard/usuarios", label: "Usuarios", icon: UserCog },
  ],
  owner: [
    // Vistas de Vendedor
    { href: "/dashboard/productos", label: "Productos", icon: Package },
    { href: "/dashboard/clientes", label: "Compradores & Llamadas", icon: Users },
    { href: "/dashboard/nueva-orden", label: "Nueva Orden", icon: ShoppingCart },
    { href: "/dashboard/mis-pedidos", label: "Mis Pedidos", icon: ClipboardList },
    // Vistas de Logística
    { href: "/dashboard/despachos", label: "Despachos", icon: Truck },
    // Vistas de Admin
    { href: "/dashboard/usuarios", label: "Usuarios", icon: UserCog },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = roleNavItems[user.role] || [];

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Printer className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sidebar-foreground truncate">
              Informática Rocha
            </h2>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.name}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            {user.role === "vendedor"
              ? "Vendedor"
              : user.role === "logistica"
                ? "Logística"
                : user.role === "owner"
                  ? "Owner"
                  : "Administrador"}
          </span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
        <div className="flex items-center gap-2 ml-3">
          <Printer className="w-5 h-5 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">
            Informática Rocha
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-sidebar z-50 flex flex-col transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-sidebar-foreground"
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Cerrar menú</span>
        </Button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:w-64 bg-sidebar border-r border-sidebar-border flex-col">
        <NavContent />
      </aside>
    </>
  );
}
