"use client";
import React, { useState } from "react";
import { showAlert } from "@/utils/alerts";

export default function JoinClassModal({ isOpen, onClose, onJoin }) {
  const [classCode, setClassCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    // Sanitización alfanumérica y mayúsculas
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // Límite de longitud
    const limited = raw.slice(0, 6);
    
    // Formato visual en pares (XX XX XX)
    let formatted = "";
    for (let i = 0; i < limited.length; i += 2) {
      if (i > 0) formatted += " ";
      formatted += limited.substring(i, i + 2);
    }
    
    setClassCode(formatted);
  };

  const handleSubmit = async () => {
    const rawCode = classCode.replace(/\s/g, "");
    if (rawCode.length < 5 || rawCode.length > 6) {
      await showAlert("Código Inválido", "El código de laboratorio debe tener entre 5 y 6 caracteres", "warning");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onJoin(rawCode);
      setClassCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-panel border border-border rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-foreground mb-2">Unirse a un laboratorio</h2>
        <p className="text-muted mb-8">Introduce el código alfanumérico que te asignó tu docente.</p>
        
        <div className="flex flex-col gap-2 mb-8">
          <label className="text-sm font-semibold text-foreground">Código de acceso</label>
          <input
            type="text"
            className="border-2 border-border bg-[var(--bg-main)] text-foreground rounded-xl px-4 py-4 text-2xl font-mono tracking-widest text-center uppercase focus:border-accent focus:outline-none transition-colors"
            value={classCode}
            onChange={handleChange}
            placeholder="Ej: AB CD EF"
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button 
            className="px-6 py-3 rounded-xl font-bold text-foreground hover:bg-input border border-transparent transition-colors disabled:opacity-50" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button 
            className="px-6 py-3 bg-accent hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uniéndose..." : "Unirse"}
          </button>
        </div>
      </div>
    </div>
  );
}
