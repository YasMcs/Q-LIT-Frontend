"use client";
import React, { useState, useRef, useEffect } from "react";

export default function ClassCard({ title, group, inviteCode, studentsCount, pendingReviews, isArchived, onClick, onArchive, onEdit, onUnarchive }) {
  const baseCardClass = "border rounded-[24px] p-7 transition-all duration-300 cursor-pointer relative animate-fade-in";
  const activeCardClass = "bg-panel border-border hover:border-accent hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(88,101,242,0.15)]";
  const archivedCardClass = "bg-main border-border opacity-80 hover:border-[#cbd5e1] hover:-translate-y-1";
  
  const cardClass = isArchived ? `${baseCardClass} ${archivedCardClass}` : `${baseCardClass} ${activeCardClass}`;
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cardClass} onClick={onClick}>
      {isArchived && (
        <div className="mb-2">
          <span className="docente-role-badge m-0">Archivado</span>
        </div>
      )}
      
      <div className="flex justify-between items-start gap-2">
        <div>
           <h3 className="m-0 text-lg font-bold leading-tight truncate">{title}</h3>
           <p className="mt-1 text-sm text-muted">Grupo: <span className="text-foreground font-medium">{group}</span></p>
        </div>
        {((!isArchived && (onArchive || onEdit)) || (isArchived && onUnarchive)) && (
          <div className="relative -mt-1 -mr-2" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex items-center justify-center w-8 h-8 text-muted hover:text-foreground hover:bg-input rounded-full transition-colors flex-shrink-0"
              title="Opciones"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-panel rounded-lg shadow-lg border border-border py-1 z-10 animate-fade-in">
                {!isArchived && onEdit && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-input hover:text-accent flex items-center gap-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit();
                    }}
                  >
                    <i className="fa-solid fa-pen fa-fw"></i> Editar datos
                  </button>
                )}
                {!isArchived && onArchive && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-[var(--danger-red)] hover:bg-input flex items-center gap-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onArchive();
                    }}
                  >
                    <i className="fa-solid fa-box-archive fa-fw"></i> Archivar
                  </button>
                )}
                {isArchived && onUnarchive && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-input flex items-center gap-2 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onUnarchive();
                    }}
                  >
                    <i className="fa-solid fa-box-open fa-fw"></i> Desarchivar
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {inviteCode && (
        <div className="mt-4 flex items-center gap-3">
          <div className="text-xs text-muted uppercase tracking-wide font-semibold"><i className="fa-solid fa-key mr-1" /> Código:</div>
          <div className="bg-accent/10 text-accent px-2.5 py-1 rounded-md text-sm font-mono font-bold border border-accent/20 shadow-sm">
            {inviteCode}
          </div>
        </div>
      )}
      
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <i className="fa-solid fa-users text-muted" style={{ color: isArchived ? "#94a3b8" : "" }} /> 
          <span className="font-semibold">{studentsCount}</span> <span className="text-muted">Alumnos</span>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-2 text-foreground">
            <i className="fa-solid fa-clipboard-check text-muted" />
            <span className="font-semibold">{pendingReviews}</span> <span className="text-muted">Por Revisar</span>
          </div>
        )}
      </div>
    </div>
  );
}
