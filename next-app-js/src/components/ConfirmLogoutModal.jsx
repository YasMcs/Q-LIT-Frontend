"use client";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmLogoutModal({ isOpen, onClose }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-panel border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoggingOut && (
            <div className="absolute inset-0 bg-panel/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <LoadingSpinner fullScreen={false} text="Cerrando sesión..." />
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-arrow-right-from-bracket text-red-500 text-2xl"></i>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              ¿Cerrar sesión?
            </h3>
            
            <p className="text-muted text-sm mb-6">
              Estás a punto de salir de tu cuenta. Tendrás que volver a iniciar sesión para acceder a tu contenido.
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground font-bold hover:bg-input transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? "Saliendo..." : "Sí, salir"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
