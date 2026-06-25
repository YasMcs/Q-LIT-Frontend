"use client";
import React, { useState, useRef, useEffect } from "react";

export default function ClassCard({ title, group, inviteCode, studentsCount, pendingReviews, isArchived, onClick, onArchive, onEdit, onUnarchive }) {
  const cardClass = isArchived ? "docente-class-card archived animate-fade-in" : "docente-class-card animate-fade-in";
  
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
    <div className={`${cardClass} relative`} onClick={onClick}>
      {isArchived && (
        <div className="mb-2">
          <span className="docente-role-badge m-0">Archivado</span>
        </div>
      )}
      
      <div className="flex justify-between items-start gap-2">
        <h3 className="m-0 leading-tight truncate">{title}</h3>
        {((!isArchived && (onArchive || onEdit)) || (isArchived && onUnarchive)) && (
          <div className="relative -mt-1 -mr-2" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex items-center justify-center w-8 h-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] rounded-full transition-colors flex-shrink-0"
              title="Opciones"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-[var(--bg-panel)] rounded-lg shadow-lg border border-[var(--border-color)] py-1 z-10 animate-fade-in">
                {!isArchived && onEdit && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-input)] hover:text-[var(--accent-blue)] flex items-center gap-2 transition-colors"
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
                    className="w-full text-left px-4 py-2 text-sm text-[var(--danger-red)] hover:bg-[var(--bg-input)] flex items-center gap-2 transition-colors"
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
                    className="w-full text-left px-4 py-2 text-sm text-[var(--accent-blue)] hover:bg-[var(--bg-input)] flex items-center gap-2 transition-colors"
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
      
      <p className="mt-2 truncate">{group}</p>
      
      {inviteCode && (
        <div className="mt-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">
               <i className="fa-solid fa-key" /> Código de acceso
            </div>
            <div className="text-sm font-black text-[var(--accent-blue)] font-mono tracking-widest bg-[var(--bg-input)] px-2 py-1 rounded-md border border-[var(--border-color)] shadow-sm">
              {inviteCode}
            </div>
          </div>
        </div>
      )}
      
      <div className="docente-class-footer">
        <span>
          <i className="fa-solid fa-users" style={{ color: isArchived ? "#94a3b8" : "#4f46e5" }} /> {studentsCount} Alumnos
        </span>
        {!isArchived && <span>{pendingReviews} Por Revisar</span>}
      </div>
    </div>
  );
}
