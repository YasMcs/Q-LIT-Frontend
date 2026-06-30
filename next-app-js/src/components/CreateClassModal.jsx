"use client";
import React, { useState } from "react";
import { showAlert } from "@/utils/alerts";

export default function CreateClassModal({ isOpen, onClose, onCreate }) {
  const [className, setClassName] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;  const handleSubmit = async () => {
    if (!className || !classGroup) {
      await showAlert("Datos Incompletos", "Completa los parámetros del laboratorio", "warning");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreate({ title: className, group: classGroup });
      setClassName("");
      setClassGroup("");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="docente-overlay animate-fade-in">
      <div className="docente-modal">
        <h2>Crear espacio de laboratorio</h2>
        <p>Configura las credenciales iniciales para tu nuevo grupo.</p>
        
        <div className="docente-input-group">
          <label>Nombre del Laboratorio</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Ej: Modelado de Datos Avanzado"
          />
        </div>
        
        <div className="docente-input-group">
          <label>Grupo / Sección</label>
          <div className="flex flex-wrap gap-3 mt-3">
            {["Grupo A", "Grupo B", "Grupo C", "Grupo D"].map((groupName) => {
              const isSelected = classGroup === groupName;
              return (
                <button
                  key={groupName}
                  type="button"
                  onClick={() => setClassGroup(groupName)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-accent text-white border-accent shadow-md scale-105' 
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] text-muted hover:border-accent/50 hover:text-foreground'
                  }`}
                >
                  {groupName}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="docente-modal-actions">
          <button className="docente-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="docente-btn-submit" onClick={handleSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            {isSubmitting ? "Inicializando..." : "Inicializar"}
          </button>
        </div>
      </div>
    </div>
  );
}
