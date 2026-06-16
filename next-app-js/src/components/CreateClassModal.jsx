"use client";
import React, { useState } from "react";

export default function CreateClassModal({ isOpen, onClose, onCreate }) {
  const [className, setClassName] = useState("");
  const [classGroup, setClassGroup] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!className || !classGroup) {
      alert("Completa los parámetros del laboratorio");
      return;
    }
    onCreate({ title: className, group: classGroup });
    setClassName("");
    setClassGroup("");
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
          <input
            type="text"
            value={classGroup}
            onChange={(e) => setClassGroup(e.target.value.toUpperCase())}
            placeholder="Ej: Grupo B"
          />
        </div>
        
        <div className="docente-modal-actions">
          <button className="docente-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="docente-btn-submit" onClick={handleSubmit}>
            Inicializar
          </button>
        </div>
      </div>
    </div>
  );
}
