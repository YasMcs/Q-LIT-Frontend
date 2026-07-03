"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import ConfirmLogoutModal from "./ConfirmLogoutModal";


export default function SidebarAlumno({ activeKey = "laboratorios" }) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("alumno-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("alumno-sidebar-collapsed", JSON.stringify(newState));
  };

  const menuItems = [
    { key: "laboratorios", label: "Mi Laboratorio", icon: "fa-flask", route: "/clase" },
    { key: "progreso", label: "Mi Progreso", icon: "fa-chart-pie", route: "#" },
    { key: "ajustes", label: "Ajustes", icon: "fa-sliders", route: "#" },
  ];

  return (
    <>
      <style>{`
        .alumno-sidebar.collapsed { width: 88px; padding: 32px 16px; align-items: center; transition: width 0.3s ease, padding 0.3s ease; }
        .alumno-sidebar { transition: width 0.3s ease, padding 0.3s ease; }
        .alumno-nav-item { padding-top: 16px !important; padding-bottom: 16px !important; }
        .alumno-sidebar.collapsed .hide-on-collapse { display: none !important; }
        .alumno-sidebar.collapsed .alumno-nav-item { justify-content: center; padding: 16px !important; margin-bottom: 12px; position: relative; }
        .alumno-sidebar.collapsed .alumno-side-logo { margin: 0; justify-content: center; }
        .alumno-sidebar.collapsed .alumno-user-profile { justify-content: center; padding-top: 24px; border-top: none; }
      `}</style>
      
      <aside className={`alumno-sidebar relative ${isCollapsed ? "collapsed" : ""}`}>
        <div className="w-full">
          <div className="flex items-center mb-12 justify-between pr-4">
            <div className="alumno-side-logo m-0 flex items-center gap-2">
              <span className="whitespace-nowrap">{isCollapsed ? "Q" : "Q-LIT"}</span>
              <div className="dot" style={isCollapsed ? { width: '8px', height: '8px', borderRadius: '50%' } : {}} />
            </div>
            {!isCollapsed && <ThemeToggle />}
          </div>

          {/* Overlapping Toggle Button */}
          <button 
            onClick={toggleSidebar} 
            className="absolute -right-4 top-[36px] group text-muted hover:text-accent w-8 h-8 flex items-center justify-center rounded-full bg-panel border border-border shadow-md hover:shadow-lg transition-all duration-300 ease-in-out z-50"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <i className={`fa-solid ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-sm transition-transform duration-300 group-hover:scale-110`}></i>
          </button>

          {/* Navigation */}
          <nav className="alumno-nav w-full flex flex-col gap-4 mt-4">
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.route}
                  className={`alumno-nav-item group relative ${isActive ? "active" : ""} transition-all duration-300`}
                >
                  <i className={`fa-solid ${item.icon} text-lg z-10 transition-transform duration-300 ${!isCollapsed ? 'group-hover:scale-110' : ''}`} />
                  <span className="hide-on-collapse z-10 whitespace-nowrap">{item.label}</span>
                  
                  {/* Expanding Unified Pill for Collapsed State */}
                  {isCollapsed && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 rounded-xl z-0 overflow-hidden transition-all duration-300 ease-in-out max-w-[56px] group-hover:max-w-[250px] bg-transparent group-hover:bg-input flex items-center shadow-none group-hover:shadow-md" 
                    >
                      {/* Spacer to align text after the icon */}
                      <div className="w-[56px] shrink-0 h-full"></div>
                      <span className="font-bold text-[13px] text-accent whitespace-nowrap pr-6">{item.label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile */}
        <div className="w-full flex flex-col gap-4">
          <div className="alumno-user-profile w-full items-center">
            {isCollapsed && (
              <div className="mb-4">
                <ThemeToggle />
              </div>
            )}
            <div className="alumno-avatar shrink-0" style={{ overflow: 'hidden', padding: 0 }}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                "YM"
              )}
            </div>
            <div className="alumno-user-info hide-on-collapse ml-3 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <span className="whitespace-nowrap font-bold text-sm truncate block">{session?.user?.name || "Panel Alumno"}</span>
              <small className="whitespace-nowrap opacity-80 truncate block mb-2">{session?.user?.email || "Estudiante"}</small>
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="text-xs font-bold text-[var(--danger-red)] hover:text-white bg-[var(--danger-red)]/10 hover:bg-[var(--danger-red)] px-2 py-1 rounded-md transition-colors self-start whitespace-nowrap"
              >
                <i className="fa-solid fa-arrow-right-from-bracket mr-1"></i> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>
      <ConfirmLogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
