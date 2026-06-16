"use client";
import React, { useState } from "react";

export default function JoinClassModal({ isOpen, onClose, onJoin }) {
  const [classCode, setClassCode] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    // Solo permitir letras y números, y convertir a mayúsculas
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // Limitar a 6 caracteres
    const limited = raw.slice(0, 6);
    
    // Formatear separados de 2 en 2
    let formatted = "";
    for (let i = 0; i < limited.length; i += 2) {
      if (i > 0) formatted += " ";
      formatted += limited.substring(i, i + 2);
    }
    
    setClassCode(formatted);
  };

  const handleSubmit = () => {
    const rawCode = classCode.replace(/\s/g, "");
    if (rawCode.length < 5 || rawCode.length > 6) {
      alert("El código de laboratorio debe tener entre 5 y 6 caracteres");
      return;
    }
    onJoin(rawCode);
    setClassCode("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Unirse a un laboratorio</h2>
        <p className="text-slate-500 mb-8">Introduce el código alfanumérico que te asignó tu docente.</p>
        
        <div className="flex flex-col gap-2 mb-8">
          <label className="text-sm font-semibold text-slate-700">Código de acceso</label>
          <input
            type="text"
            className="border-2 border-slate-200 rounded-xl px-4 py-4 text-2xl font-mono tracking-widest text-center uppercase focus:border-indigo-500 focus:outline-none transition-colors"
            value={classCode}
            onChange={handleChange}
            placeholder="Ej: AB CD EF"
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button 
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20" 
            onClick={handleSubmit}
          >
            Inscribirse
          </button>
        </div>
      </div>
    </div>
  );
}
