"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import PrivacyNoticeModal from "@/components/PrivacyNoticeModal";

export default function SidebarDocente() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const activeKey = pathname.includes("dashboard") ? "clases"
                  : pathname.includes("directorio") ? "directorio"
                  : pathname.includes("estadisticas") ? "estadisticas"
                  : pathname.includes("archivo") ? "archivo"
                  : pathname.includes("class-feed") ? "clases"
                  : "clases";

  useEffect(() => {
    const saved = localStorage.getItem("docente-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("docente-sidebar-collapsed", JSON.stringify(newState));
  };

  const menuItems = [
    { key: "clases", label: "Tus Laboratorios", icon: "fa-flask", route: "/dashboard-docente" },
    { key: "directorio", label: "Alumnos", icon: "fa-users", route: "/directorio-docente" },
    { key: "estadisticas", label: "Estadísticas", icon: "fa-chart-pie", route: "/estadisticas-docente" },
    { key: "archivo", label: "Archivados", icon: "fa-box-archive", route: "/archivo-docente" },
  ];

  return (
    <>
      <style>{`
        .docente-sidebar.collapsed { width: 88px; padding: 32px 16px; align-items: center; transition: width 0.3s ease, padding 0.3s ease; }
        .docente-sidebar { transition: width 0.3s ease, padding 0.3s ease; }
        .docente-nav-item { padding-top: 16px !important; padding-bottom: 16px !important; }
        .docente-sidebar.collapsed .hide-on-collapse { display: none !important; }
        .docente-sidebar.collapsed .docente-nav-item { justify-content: center; padding: 16px !important; margin-bottom: 12px; position: relative; }
        .docente-sidebar.collapsed .docente-side-logo { margin: 0; justify-content: center; }
        .docente-sidebar.collapsed .docente-user-profile { justify-content: center; padding-top: 24px; border-top: none; }
      `}</style>
      
      {isLoggingOut && <LoadingSpinner fullScreen={true} text="Cerrando sesión..." />}
      <div 
        className={`shrink-0 h-full relative ${isCollapsed ? "collapsed" : ""}`}
      >
      <aside className={`docente-sidebar relative ${isCollapsed ? "collapsed" : ""}`}>
        <div className="w-full">
          <div className="flex items-center mb-12 justify-between pr-4">
            <div className="docente-side-logo m-0 flex items-center gap-2">
              <span className="whitespace-nowrap">{isCollapsed ? "Q" : "Q-LIT"}</span>
              <div className="dot" style={isCollapsed ? { width: '8px', height: '8px', borderRadius: '50%' } : {}} />
            </div>
          </div>

          {/* Overlapping Toggle Button */}
          <button 
            onClick={toggleSidebar} 
            className="absolute -right-4 bottom-[110px] group text-muted hover:text-accent w-8 h-8 flex items-center justify-center rounded-full bg-panel border border-border shadow-md hover:shadow-lg transition-all duration-300 ease-in-out z-50"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <i className={`fa-solid ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-sm transition-transform duration-300 group-hover:scale-110`}></i>
          </button>

          {/* Navigation */}
          <nav className="docente-nav w-full flex flex-col gap-4 mt-4">
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.route}
                  className={`docente-nav-item group relative ${isActive ? "active" : ""} transition-all duration-300`}
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
        <div className="w-full flex flex-col gap-4 relative">
          <div className="docente-user-profile w-full items-center">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="docente-avatar shrink-0 cursor-pointer hover:scale-105 hover:opacity-85 transition-all duration-200" 
              style={{ overflow: 'hidden', padding: 0 }}
              title="Ver perfil"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                "Prof"
              )}
            </div>
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="docente-user-info hide-on-collapse ml-3 overflow-hidden cursor-pointer hover:text-indigo-400 transition-colors" 
              style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
              title="Ver perfil"
            >
              <span className="whitespace-nowrap font-bold text-sm truncate block">{session?.user?.name || "Panel Docente"}</span>
            </div>
          </div>

          <UserProfileDropdown 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={session?.user}
            onShowPrivacy={() => setIsPrivacyModalOpen(true)}
            positionClasses={isCollapsed ? "bottom-[-16px] left-[72px]" : "bottom-[64px] left-[12px]"}
          />
        </div>
      </aside>
      </div>

      <PrivacyNoticeModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </>
  );
}
