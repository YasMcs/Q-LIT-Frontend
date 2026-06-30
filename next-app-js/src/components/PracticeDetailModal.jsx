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
                      Entregas cerradas después de la fecha límite
                    </span>
                  )}
                </>
              )}
              {isStudent && (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                  practice.status === "solved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  practice.status === "overdue" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {practice.status === "solved" ? "Entregada" :
                   practice.status === "overdue" ? "Sin entregar" :
                   "Asignada"}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground hover:bg-input p-2 rounded-full transition-colors flex-shrink-0"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            {isSolved && (
              <div className="text-right mt-1">
                <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">
                  Calificación
                </span>
                <span className={`text-2xl font-black ${submission.reviewStatus === "calificada" ? "text-emerald-400" : "text-amber-400"}`}>
                  {submission.reviewStatus === "calificada" ? `${submission.score !== undefined ? submission.score : 0} / ${practice.totalPoints || 100}` : `- / ${practice.totalPoints || 100}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          {isSolved ? (
            <div className="space-y-6 animate-fade-in">
              {/* Objective */}
              <div>
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
                  Objetivo
                </h3>
                <p className="text-foreground leading-relaxed">
                  {practice.description || "No hay un objetivo definido para esta práctica."}
                </p>
              </div>

              {/* Database */}
              {practice.requiredFunctions?.db && (
                <div>
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
                    Base de Datos a Utilizar
                  </h3>
                  <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-main)] border border-border rounded-xl w-fit">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-database"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{practice.requiredFunctions.db}</p>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Database */}
              {practice.requiredFunctions?.db && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
                    Base de Datos a Utilizar
                  </h3>
                  <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-main)] border border-border rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">
                      <i className="fa-solid fa-database"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{practice.requiredFunctions.db}</p>
                      <p className="text-xs text-muted">Esquema donde se ejecutará tu consulta</p>
                    </div>
                  </div>
                </div>
              )}
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
              </>
            )}
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
          ) : isStudent && practice.status === "overdue" && practice.closeLateSubmissions ? (
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
