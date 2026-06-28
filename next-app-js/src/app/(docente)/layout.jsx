import React from "react";
import SidebarDocente from "@/components/SidebarDocente";
import RoleGuard from "@/components/RoleGuard";
import "../(docente)/dashboard-docente/dashboard-docente.css";

export default function DocenteLayout({ children }) {
  return (
    <div className="docente-dashboard-container animate-fade-in" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <SidebarDocente />
      <RoleGuard 
        allowedRole="teacher"
        fallback={<main className="docente-main"></main>}
      >
        {children}
      </RoleGuard>
    </div>
  );
}
