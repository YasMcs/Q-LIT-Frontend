"use client";
import React, { useState } from "react";
import { showAlert } from "@/utils/alerts";

export default function CreateClassModal({ isOpen, onClose, onCreate }) {
  const [className, setClassName] = useState("");
  const [classGroup, setClassGroup] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!className || !classGroup) {
      await showAlert("Datos Incompletos", "Completa los parámetros del laboratorio", "warning");
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
          <select
            value={classGroup}
            onChange={(e) => setClassGroup(e.target.value)}
          >
            <option value="" disabled>Selecciona un grupo</option>
            <option value="Grupo A">Grupo A</option>
            <option value="Grupo B">Grupo B</option>
            <option value="Grupo C">Grupo C</option>
            <option value="Grupo D">Grupo D</option>
          </select>
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
