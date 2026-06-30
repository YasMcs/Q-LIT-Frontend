"use client";
import React from "react";
import { signOut } from "next-auth/react";

export default function UserProfileDropdown({ isOpen, onClose, user, onShowPrivacy, onLeaveClass, positionClasses }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for click-outside close */}
      <div 
        className="fixed inset-0 z-40 cursor-default" 
        onClick={onClose} 
      />
      
      {/* Floating Dropdown Panel */}
      <div 
        className={`absolute z-50 bg-panel border border-border rounded-2xl shadow-2xl p-4 w-[260px] animate-scale-up ${positionClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* User Profile Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-sm font-extrabold overflow-hidden shrink-0">
            {user?.image ? (
              <img src={user.image} alt={user.name || "Perfil"} className="w-full h-full object-cover" />
            ) : (
              (user?.name || "U").substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-extrabold text-foreground truncate">{user?.name || "Usuario"}</h4>
            <p className="text-xs text-muted truncate">{user?.email || "Correo no disponible"}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => {
              onClose();
              onShowPrivacy();
            }}
            className="w-full px-3 py-2 text-xs font-bold text-muted hover:text-foreground hover:bg-input rounded-lg flex items-center gap-2.5 transition-colors text-left"
          >
            <i className="fa-solid fa-file-shield text-indigo-500 text-[14px]"></i>
            Aviso de Privacidad
          </button>
          
          {onLeaveClass && (
            <>
              <button 
                onClick={() => {
                  onClose();
                  onLeaveClass();
                }}
                className="w-full px-3 py-2 text-xs font-bold text-amber-500 hover:text-white hover:bg-amber-500 rounded-lg flex items-center gap-2.5 transition-all text-left animate-pulse"
              >
                <i className="fa-solid fa-right-from-bracket text-[14px]"></i>
                Abandonar Laboratorio
              </button>
            </>
          )}
          
          <div className="h-px bg-border my-2"></div>
          
          <button 
            onClick={() => {
              onClose();
              signOut({ callbackUrl: "/" });
            }}
            className="w-full px-3 py-2 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 rounded-lg flex items-center gap-2.5 transition-all text-left"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-[14px]"></i>
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
