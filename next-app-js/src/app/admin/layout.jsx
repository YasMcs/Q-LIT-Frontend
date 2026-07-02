"use client";
import React from "react";
import RoleGuard from "@/components/RoleGuard";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout-container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 30px', 
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/iconoQLIT.svg" alt="Q-LIT Admin" style={{ height: '35px' }} />
          <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold', color: '#fff' }}>Panel de Administración</h1>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })} 
          style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </header>
      
      <RoleGuard 
        allowedRole="admin"
        fallback={<main className="admin-main"></main>}
      >
        {children}
      </RoleGuard>
    </div>
  );
}
