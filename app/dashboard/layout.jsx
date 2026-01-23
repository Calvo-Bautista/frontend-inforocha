"use client";

import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/sidebar";
import { LoginForm } from "@/components/login-form";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
