"use client";
import React from "react";

export default function PracticeDetailModal({
  isOpen,
  onClose,
  practice,
  role, // "student" or "teacher"
  onAction,
  onEdit,
  onChangeDate,
  onDelete
}) {
  if (!isOpen || !practice) return null;

  const isStudent = role === "student";

  // Overlay con desenfoque para el modal
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] animate-fade-in p-4 bg-black/40 backdrop-blur-sm">
      
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-panel border border-border w-full max-w-2xl rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-start bg-[var(--bg-main)] rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-input text-accent flex items-center justify-center">
                <i className="fa-solid fa-database text-sm"></i>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                Detalle de Práctica
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground leading-tight">
              {practice.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-muted">
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-calendar-plus" /> Publicado: {practice.assignDate || (practice.fecha_asignacion ? new Date(practice.fecha_asignacion).toLocaleDateString() : (practice.createdAt ? new Date(practice.createdAt).toLocaleDateString() : "N/A"))}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-regular fa-calendar-clock" /> Vence: {practice.dueDate || (practice.deadline ? new Date(practice.deadline).toLocaleDateString() : "Sin límite")}
              </span>
              {isStudent && (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                  practice.status === "solved" ? "bg-emerald-100 text-emerald-700" :
                  practice.status === "overdue" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {practice.status === "solved" ? "Entregada" :
                   practice.status === "overdue" ? "Sin entregar" :
                   "Asignada"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-input p-2 rounded-full transition-colors flex-shrink-0"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          {/* Objective */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
              Objetivo
            </h3>
            <p className="text-foreground leading-relaxed">
              {practice.description || "No hay un objetivo definido para esta práctica."}
            </p>
          </div>

          {/* Expected Functions */}
          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
              Funciones Esperadas
            </h3>
            {practice.requiredFunctions && practice.requiredFunctions.keywords && practice.requiredFunctions.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {practice.requiredFunctions.keywords.map((func, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-input border border-border rounded-lg text-sm font-mono font-bold text-foreground"
                  >
                    {func}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted italic text-sm">No se especificaron funciones.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border bg-panel flex justify-between items-center rounded-b-3xl">
          
          <div className="flex items-center gap-2">
            {!isStudent && (
              <>
                <button
                  className="p-2.5 rounded-xl text-muted hover:bg-input hover:text-accent transition-colors"
                  title="Editar práctica"
                  onClick={onEdit}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  className="p-2.5 rounded-xl text-muted hover:bg-input hover:text-accent transition-colors"
                  title="Cambiar fecha límite"
                  onClick={onChangeDate}
                >
                  <i className="fa-regular fa-calendar"></i>
                </button>
                <button
                  className="p-2.5 rounded-xl text-muted hover:bg-input hover:text-[var(--danger-red)] transition-colors"
                  title="Eliminar práctica"
                  onClick={onDelete}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
                <div className="w-px h-6 bg-[var(--border-color)] mx-2"></div>
              </>
            )}
            
            <button
              className="px-5 py-2.5 rounded-xl font-bold text-foreground hover:bg-input hover:text-foreground transition-all"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
          
          <button
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[var(--accent-blue)] hover:opacity-90 hover:shadow-lg transition-all flex items-center gap-2"
            onClick={() => {
              onClose();
              if (onAction) onAction(practice.id);
            }}
          >
            {isStudent ? (
              <>
                <i className="fa-solid fa-terminal"></i> Ingresar al laboratorio
              </>
            ) : (
              <>
                <i className="fa-solid fa-list-check"></i> Revisar Entregas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
