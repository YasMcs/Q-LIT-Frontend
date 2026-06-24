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
              className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              title="Opciones"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-10 animate-fade-in">
                {!isArchived && onEdit && (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
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
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors"
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
        <div className="mt-3 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
          <span className="text-xs font-medium text-slate-500">Código de clase:</span>
          <span className="text-sm font-extrabold text-indigo-600 tracking-wider font-mono">{inviteCode}</span>
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
