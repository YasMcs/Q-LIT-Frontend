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
  
  // Obtener la entrega del estudiante si existe
  const submission = practice.submissions?.[0];
  const isSolved = isStudent && practice.status === "solved" && submission;

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
                <i className="fa-regular fa-calendar-clock" /> Vence: {practice.dueDate || (practice.deadline ? new Date(practice.deadline).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "Sin límite")}
              </span>
              
              {!isStudent && (
                <>
                  {practice.closeLateSubmissions && (
                    <span className="flex items-center gap-1.5 text-muted">
                      <i className="fa-solid fa-lock text-[var(--danger-red)]" />
                      Cierre estricto
                    </span>
                  )}
                  {practice.requiredFunctions?.db && (
                    <span className="flex items-center gap-1.5 text-muted">
                      <i className="fa-solid fa-database text-accent" /> BD: {practice.requiredFunctions.db}
                    </span>
                  )}
                </>
              )}
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
          {isSolved ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Estado de la Entrega
                </h3>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${submission.reviewStatus === "calificada" ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`}></span>
                  {submission.reviewStatus === "calificada" ? `Calificada: ${submission.score !== undefined ? submission.score : 0} / ${practice.totalPoints || 100}` : "Entregada (En espera de revisión)"}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Fecha y Hora de Entrega
                </h3>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(submission.submittedAt).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" })}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Consulta SQL Enviada
                </h3>
                <pre className="p-4 bg-[var(--bg-main)] border border-border rounded-2xl text-sm font-mono text-indigo-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {submission.studentSqlCode || "-- Sin código registrado --"}
                </pre>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
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
                <div className="w-px h-6 bg-border mx-2"></div>
              </>
            )}
            
            <button
              className="px-5 py-2.5 rounded-xl font-bold text-foreground hover:bg-input hover:text-foreground transition-all"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
          
          {isStudent && practice.status === "solved" ? (
            <button
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-2"
              onClick={() => {
                onClose();
                if (onAction) onAction(practice.id);
              }}
            >
              <i className="fa-solid fa-eye"></i> Ver mi entrega
            </button>
          ) : isStudent && practice.status === "overdue" ? (
            <button
              className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-500/10 border border-red-500/20 cursor-not-allowed flex items-center gap-2"
              disabled
            >
              <i className="fa-solid fa-ban"></i> Práctica Vencida
            </button>
          ) : (
            <button
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-accent hover:opacity-90 hover:shadow-lg transition-all flex items-center gap-2"
              onClick={() => {
                onClose();
                if (onAction) onAction(practice.id);
              }}
            >
              {isStudent ? (
                <>
                  <i className="fa-solid fa-code"></i> Ingresar al laboratorio
                </>
              ) : (
                <>
                  <i className="fa-solid fa-list-check"></i> Revisar Entregas
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
