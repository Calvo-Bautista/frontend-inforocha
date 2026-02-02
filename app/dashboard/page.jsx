"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      switch (user.role) {
        case "vendedor":
          router.replace("/dashboard/productos");
          break;
        case "logistica":
          router.replace("/dashboard/despachos");
          break;
        case "admin":
          router.replace("/dashboard/usuarios");
          break;
        case "owner":
          router.replace("/dashboard/productos");
          break;
        default:
          break;
      }
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Redirigiendo...
        </h2>
        <p className="text-muted-foreground">
          Cargando su panel de control
        </p>
      </div>
    </div>
  );
}
