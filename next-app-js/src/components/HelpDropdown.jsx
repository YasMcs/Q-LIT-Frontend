"use client";
import React from "react";

export default function HelpDropdown({ isOpen, onClose, positionClasses }) {
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
        className={`absolute z-50 bg-panel border border-border rounded-2xl shadow-2xl p-4 w-[280px] animate-scale-up ${positionClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-border mb-3">
          <i className="fa-solid fa-circle-question text-indigo-500 text-lg"></i>
          <div>
            <h4 className="text-sm font-extrabold text-foreground">Soporte y Ayuda</h4>
            <p className="text-[11px] text-muted">¿Necesitas ayuda con la plataforma?</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-1">
          <a 
            href="/Q-LIT%20Manual%20de%20Usuario%20-%20Estudiante.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full px-3 py-2 text-xs font-bold text-muted hover:text-foreground hover:bg-input rounded-lg flex items-center gap-2.5 transition-colors text-left"
          >
            <i className="fa-solid fa-file-pdf text-red-500 text-[14px]"></i>
            Ver manual de usuario
          </a>
          
          <div className="h-px bg-border my-2"></div>
          
          <div className="px-3 py-1">
            <h5 className="text-[11px] font-extrabold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-envelope text-indigo-500"></i> Contacto y Soporte
            </h5>
            <div className="flex flex-col gap-1.5">
              <a 
                href="mailto:q.lit.laboratorios@gmail.com"
                className="text-xs text-muted hover:text-indigo-400 break-all transition-colors block py-0.5"
              >
                q.lit.laboratorios@gmail.com
              </a>
              <a 
                href="mailto:y.macias1802@gmail.com"
                className="text-xs text-muted hover:text-indigo-400 break-all transition-colors block py-0.5"
              >
                y.macias1802@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
