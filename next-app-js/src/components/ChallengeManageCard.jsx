"use client";
import React, { useState, useRef, useEffect } from "react";

export default function ChallengeManageCard({ 
  id, title, pendingCount, status, assignDate, deadline, closeLateSubmissions,
  onReview, onEdit, onChangeDate, onDelete, onClick
}) {
  const isPending = pendingCount > 0;
  const isClosed = status === "closed";
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      className={`feed-manage-card animate-fade-in`}
      style={{ position: "relative", zIndex: isMenuOpen ? 50 : 1, cursor: "pointer" }}
      onClick={() => onClick && onClick(id)}
    >
      <div className="feed-challenge-core">
        <h3>
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] uppercase tracking-wider font-bold text-muted">
          {assignDate && (
            <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar-plus" /> Asignada: {assignDate}</span>
          )}
          {deadline ? (
            <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar-clock" /> Vence: {new Date(deadline).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}</span>
          ) : (
            <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar-clock" /> Sin límite</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isPending ? (
          <span className="feed-badge-alert">{`${pendingCount} Por Revisar`}</span>
        ) : (
          <span className="feed-badge-alert closed">0 Pendientes</span>
        )}

        <div className="relative" ref={menuRef}>
          <button 
            className={`p-2 rounded-lg transition-colors ${
              isMenuOpen 
                ? "bg-[rgba(255,255,255,0.08)] text-foreground" 
                : "text-muted hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]"
            }`}
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
          >
            <i className="fa-solid fa-ellipsis-vertical px-1"></i>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-panel rounded-xl shadow-lg border border-border py-1 z-20 animate-fade-in">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-main flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit && onEdit(id); }}
              >
                <i className="fa-solid fa-pen fa-fw text-muted"></i> Editar
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-main flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onChangeDate && onChangeDate(id); }}
              >
                <i className="fa-regular fa-calendar fa-fw text-muted"></i> 
                Cambiar Fecha Límite
              </button>
              <div className="h-px bg-input my-1"></div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete && onDelete(id); }}
              >
                <i className="fa-solid fa-trash fa-fw text-red-400"></i> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
