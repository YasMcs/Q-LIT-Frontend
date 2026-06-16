"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import "./crear-practica-docente.css";

const datosPorDB = {
  punto_venta_db: {
    prompt: "Filtrar los productos que tengan un precio mayor a 500 pesos, ordenando los resultados de manera descendente por stock.",
    sql: "SELECT * FROM productos WHERE precio > 500 ORDER BY stock DESC;",
    tablasHTML: (
      <>
        <p className="schema-description">Diccionario de campos disponibles en punto_venta_db:</p>
        <h3 className="schema-table-title">Tabla: productos</h3>
        <table className="schema-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Tipo</th>
              <th>Restricción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono">sku</td>
              <td className="mono">INT</td>
              <td className="constraint-pk">PRIMARY KEY</td>
            </tr>
            <tr>
              <td className="mono">articulo</td>
              <td className="mono">VARCHAR(100)</td>
              <td>NOT NULL</td>
            </tr>
            <tr>
              <td className="mono">precio</td>
              <td className="mono">NUMERIC</td>
              <td>DEFAULT 0.0</td>
            </tr>
            <tr>
              <td className="mono">stock</td>
              <td className="mono">INT</td>
              <td>NOT NULL</td>
            </tr>
          </tbody>
        </table>
      </>
    )
  },
  control_escolar_db: {
    prompt: "Obtener la lista de alumnos inscritos en la materia de Matemáticas de forma alfabética y filtrando solo a los del grupo B.",
    sql: "SELECT * FROM alumnos WHERE materia = 'Matemáticas' AND grupo = 'B' ORDER BY nombre ASC;",
    tablasHTML: (
      <>
        <p className="schema-description">Diccionario de campos disponibles en control_escolar_db:</p>
        <h3 className="schema-table-title">Tabla: alumnos</h3>
        <table className="schema-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Tipo</th>
              <th>Restricción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono">id_alumno</td>
              <td className="mono">INT</td>
              <td className="constraint-pk">PRIMARY KEY</td>
            </tr>
            <tr>
              <td className="mono">nombre</td>
              <td className="mono">VARCHAR(150)</td>
              <td>NOT NULL</td>
            </tr>
            <tr>
              <td className="mono">materia</td>
              <td className="mono">VARCHAR(50)</td>
              <td>NOT NULL</td>
            </tr>
            <tr>
              <td className="mono">grupo</td>
              <td className="mono">CHAR(1)</td>
              <td>NOT NULL</td>
            </tr>
          </tbody>
        </table>
      </>
    )
  },
  hospital_central_db: {
    prompt: "Mostrar las citas médicas programadas para el día de hoy, ordenadas por la hora de atención y filtrando solo las de la especialidad Cardiología.",
    sql: "SELECT * FROM citas WHERE fecha = CURRENT_DATE AND especialidad = 'Cardiología' ORDER BY hora ASC;",
    tablasHTML: (
      <>
        <p className="schema-description">Diccionario de campos disponibles en hospital_central_db:</p>
        <h3 className="schema-table-title">Tabla: citas</h3>
        <table className="schema-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Tipo</th>
              <th>Restricción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono">id_cita</td>
              <td className="mono">INT</td>
              <td className="constraint-pk">PRIMARY KEY</td>
            </tr>
            <tr>
              <td className="mono">fecha</td>
              <td className="mono">DATE</td>
              <td>NOT NULL</td>
            </tr>
            <tr>
              <td className="mono">hora</td>
              <td className="mono">TIME</td>
              <td>NOT NULL</td>
            </tr>
            <tr>
              <td className="mono">especialidad</td>
              <td className="mono">VARCHAR(50)</td>
              <td>NOT NULL</td>
            </tr>
          </tbody>
        </table>
      </>
    )
  }
};

export default function CrearPracticaDocentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [activeDb, setActiveDb] = useState("punto_venta_db");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredFunctionsStr, setRequiredFunctionsStr] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [modalDb, setModalDb] = useState(null);
  
  const [isSaving, setIsSaving] = useState(false);

  // Obtener parámetros de la URL
  const selectedClassroomId = searchParams.get("classroomId");
  const editId = searchParams.get("editId");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [practiceToSave, setPracticeToSave] = useState(null);

  useEffect(() => {
    if (editId) {
      fetch(`/api/proxy/practices/classroom/all`) // Actually we don't have a getPracticeById endpoint easily accessible here if we don't know the classroom. 
      // Wait, we can just fetch the specific practice if we have an endpoint, or fetch from classroom if we pass it.
      // Let's create an endpoint or just fetch it. Actually, we might need a GET /api/practices/:id.
      // Let me just fetch the specific practice using a proxy endpoint.
      fetch(`/api/proxy/practices/${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setTitle(data.title || "");
            setDescription(data.description || "");
            setRequiredFunctionsStr(data.requiredFunctions?.keywords?.join(", ") || "");
            setMaxScore(data.totalPoints || 100);
            setActiveDb(data.requiredFunctions?.db || "punto_venta_db");
            if (data.deadline) {
              const dt = new Date(data.deadline);
              setDueDate(dt.toISOString().split("T")[0]);
              setDueTime(dt.toISOString().split("T")[1].substring(0, 5));
            }
          }
        })
        .catch(err => console.error("Error cargando práctica", err));
    }
  }, [editId]);

  // Rubric / checklist state (initially expanded and fully editable)
  const [criteria, setCriteria] = useState([
    { id: 1, text: "Uso correcto de la cláusula SELECT", points: 40 },
    { id: 2, text: "Filtrado preciso utilizando WHERE", points: 40 },
    { id: 3, text: "Ordenamiento adecuado mediante ORDER BY", points: 20 },
  ]);

  const criteriaSum = criteria.reduce((sum, item) => sum + item.points, 0);

  // Classroom-style due time defaulting to 23:59 when a date is selected
  const handleDateChange = (e) => {
    const val = e.target.value;
    setDueDate(val);
    if (val && !dueTime) {
      setDueTime("23:59");
    }
  };

  const handleSelectDb = (dbName) => {
    setActiveDb(dbName);
  };

  const handleOpenModal = (e, dbName) => {
    e.stopPropagation();
    setModalDb(dbName);
  };

  const handleCloseModal = () => {
    setModalDb(null);
  };

  const handleAddCriteria = () => {
    const nextId = criteria.length ? Math.max(...criteria.map(c => c.id)) + 1 : 1;
    setCriteria([...criteria, { id: nextId, text: "", points: 0 }]);
  };

  const handleCriteriaTextChange = (id, text) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, text } : c));
  };

  const handleCriteriaPointsChange = (id, pointsVal) => {
    const points = parseInt(pointsVal) || 0;
    setCriteria(criteria.map(c => c.id === id ? { ...c, points } : c));
  };

  const handleDeleteCriteria = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleDistributePoints = () => {
    if (!criteria.length) return;
    const count = criteria.length;
    const basePoints = Math.floor(maxScore / count);
    const remainder = maxScore % count;

    setCriteria(
      criteria.map((c, index) => ({
        ...c,
        points: basePoints + (index < remainder ? 1 : 0)
      }))
    );
  };

  const executeSave = async (forceRegenerate = false) => {
    setIsSaving(true);
    try {
      const url = editId ? `/api/proxy/practices/${editId}` : "/api/proxy/practices";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          requiredFunctionsStr,
          maxScore,
          dueDate,
          dueTime,
          activeDb,
          criteria,
          classroomId: selectedClassroomId,
          forceRegenerate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Error al guardar la práctica");
      }

      alert(editId ? "Práctica actualizada con éxito." : "Práctica SQL asignada con éxito al laboratorio.");
      if (selectedClassroomId) {
        router.push(`/class-feed-docente?classroomId=${selectedClassroomId}`);
      } else {
        router.push("/dashboard-docente");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Por favor, introduce el título de la práctica.");
      return;
    }
    // Only require classroomId for new practices
    if (!editId && !selectedClassroomId) {
      alert("Por favor, selecciona a qué laboratorio asignar esta práctica.");
      return;
    }
    if (criteriaSum !== maxScore) {
      if (!confirm(`La suma de los criterios de la lista de cotejo (${criteriaSum} pts) no coincide con el valor total de la práctica (${maxScore} pts). ¿Deseas guardar de todas formas?`)) {
        return;
      }
    }
    
    if (editId) {
      setShowConfirmModal(true);
    } else {
      executeSave(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="classroom-editor-body animate-fade-in animate-scale-up">
      {/* Top Navbar */}
      <header className="classroom-navbar">
        <div className="navbar-left-group">
          <button className="btn-close-classroom" onClick={handleCancel} title="Cancelar">
            <i className="fa-solid fa-xmark" />
          </button>
          <div className="classroom-header-title">
            <i className="fa-solid fa-file-invoice classroom-icon-logo" />
            <span>Tarea</span>
          </div>
        </div>
        <div className="navbar-right-group">
          <button className="btn-create-task" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : (editId ? "Guardar cambios" : "Crear tarea")} <i className="fa-solid fa-caret-down classroom-caret" />
          </button>
        </div>
      </header>

      {/* Editor Layout Grid */}
      <div className="classroom-layout-container">
        {/* Left Column (Forms & Attachments) */}
        <main className="classroom-main-column">
          <div className="classroom-card-panel">
            {/* Title */}
            <div className="classroom-input-wrapper">
              <input
                type="text"
                className="classroom-input-field title-field"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="classroom-required-tag">*Obligatorio</span>
            </div>

            {/* Description (IA Context & Objective) */}
            <div className="classroom-input-wrapper">
              <textarea
                className="classroom-textarea-field description-field"
                placeholder="Instrucciones u Objetivo — Escribe aquí el contexto de la práctica o el reto que esperas que el alumno resuelva."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="classroom-editor-formatting">
                <button type="button" title="Negrita"><i className="fa-solid fa-bold" /></button>
                <button type="button" title="Cursiva"><i className="fa-solid fa-italic" /></button>
                <button type="button" title="Subrayado"><i className="fa-solid fa-underline" /></button>
                <button type="button" title="Lista"><i className="fa-solid fa-list-ul" /></button>
                <button type="button" title="Limpiar"><i className="fa-solid fa-text-slash" /></button>
              </div>
            </div>

            {/* Required SQL Functions */}
            <div className="classroom-input-wrapper mt-4">
              <input
                type="text"
                className="classroom-input-field"
                placeholder="Funciones SQL Esperadas (Ej. SELECT, WHERE, ORDER BY)"
                value={requiredFunctionsStr}
                onChange={(e) => setRequiredFunctionsStr(e.target.value)}
              />
            </div>
          </div>

          {/* Attachments Section: Seed Theme Database selection */}
          <div className="classroom-card-panel attachments-panel">
            <h3 className="attachments-title">Adjuntar Base de Datos Temática</h3>
            <p className="attachments-subtitle">Elige el esquema de datos semilla que servirá de base interactiva para esta práctica.</p>

            <div className="attachments-grid">
              {/* Attachment Card: punto_venta_db */}
              <div
                className={`attachment-card ${activeDb === "punto_venta_db" ? "active" : ""}`}
                onClick={() => setActiveDb("punto_venta_db")}
              >
                <div className="attachment-icon-wrapper">
                  <i className="fa-solid fa-database database-file-icon" />
                </div>
                <div className="attachment-details">
                  <span className="attachment-name">punto_venta_db.sql</span>
                  <span className="attachment-type">Esquema • productos, categorias, ventas</span>
                </div>
                <button
                  type="button"
                  className="btn-inspect-attachment"
                  onClick={(e) => handleOpenModal(e, "punto_venta_db")}
                  title="Ver esquema"
                >
                  <i className="fa-solid fa-eye" />
                </button>
              </div>

              {/* Attachment Card: control_escolar_db */}
              <div
                className={`attachment-card ${activeDb === "control_escolar_db" ? "active" : ""}`}
                onClick={() => setActiveDb("control_escolar_db")}
              >
                <div className="attachment-icon-wrapper">
                  <i className="fa-solid fa-database database-file-icon" />
                </div>
                <div className="attachment-details">
                  <span className="attachment-name">control_escolar_db.sql</span>
                  <span className="attachment-type">Esquema • alumnos, materias, inscripciones</span>
                </div>
                <button
                  type="button"
                  className="btn-inspect-attachment"
                  onClick={(e) => handleOpenModal(e, "control_escolar_db")}
                  title="Ver esquema"
                >
                  <i className="fa-solid fa-eye" />
                </button>
              </div>

              {/* Attachment Card: hospital_central_db */}
              <div
                className={`attachment-card ${activeDb === "hospital_central_db" ? "active" : ""}`}
                onClick={() => setActiveDb("hospital_central_db")}
              >
                <div className="attachment-icon-wrapper">
                  <i className="fa-solid fa-database database-file-icon" />
                </div>
                <div className="attachment-details">
                  <span className="attachment-name">hospital_central_db.sql</span>
                  <span className="attachment-type">Esquema • pacientes, medicos, citas</span>
                </div>
                <button
                  type="button"
                  className="btn-inspect-attachment"
                  onClick={(e) => handleOpenModal(e, "hospital_central_db")}
                  title="Ver esquema"
                >
                  <i className="fa-solid fa-eye" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Settings & Dynamic Checklist) */}
        <aside className="classroom-sidebar">
          {/* Puntos (Puntuación Máxima) */}
          <div className="sidebar-control-group">
            <label className="sidebar-label">Valor total de la práctica</label>
            <div className="puntos-input-wrapper">
              <input
                type="number"
                className="sidebar-number-input"
                min="0"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Fecha y Hora de Entrega */}
          <div className="sidebar-control-group">
            <label className="sidebar-label">Fecha y hora de entrega</label>
            <div className="due-datetime-inputs">
              <input
                type="date"
                className="sidebar-date-input"
                value={dueDate}
                onChange={handleDateChange}
              />
              <input
                type="time"
                className="sidebar-time-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="23:59"
              />
            </div>
            <div className="checkbox-control-wrapper">
              <input type="checkbox" id="close-late-submissions" className="sidebar-checkbox" />
              <label htmlFor="close-late-submissions">Cerrar entregas después de la fecha límite</label>
            </div>
          </div>

          {/* Fully Expanded Rubric / Lista de Cotejo Section */}
          <div className="sidebar-control-group rubric-sidebar-section">
            <div className="rubric-drawer-header">
              <label className="sidebar-label">Lista de Cotejo</label>
              <button type="button" className="btn-add-criterio-drawer" onClick={handleAddCriteria}>
                + Añadir Criterio
              </button>
            </div>

            <div className="rubric-drawer-panel">
              <div className="rubric-drawer-subtitle">
                Asigna el puntaje a cada criterio. Total acumulado: <strong>{criteriaSum} / {maxScore}</strong> pts.
              </div>

              <div className="rubric-drawer-list">
                {criteria.map((item) => (
                  <div key={item.id} className="rubric-drawer-row">
                    <input
                      type="text"
                      className="rubric-drawer-input-text"
                      placeholder="Descripción del criterio..."
                      value={item.text}
                      onChange={(e) => handleCriteriaTextChange(item.id, e.target.value)}
                    />
                    <input
                      type="number"
                      className="rubric-drawer-input-points"
                      placeholder="Pts"
                      value={item.points}
                      onChange={(e) => handleCriteriaPointsChange(item.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-delete-criterio-drawer"
                      onClick={() => handleDeleteCriteria(item.id)}
                      title="Eliminar fila"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {criteriaSum !== maxScore && (
                <div className="rubric-drawer-unbalanced-alert">
                  <span>Los puntos no coinciden con {maxScore} pts.</span>
                  <button type="button" onClick={handleDistributePoints}>Distribuir</button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Schema Detail Modal */}
      {modalDb && (
        <div className="modal-overlay-crear" onClick={handleCloseModal}>
          <div className="modal-container-crear" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-crear">
              <span className="modal-title-crear">Esquema: {modalDb}</span>
              <button className="btn-close-modal-crear" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="modal-body-crear">
              {datosPorDB[modalDb]?.tablasHTML}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Edit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Actualizar Práctica</h2>
                <p className="text-sm text-slate-500">Hay estudiantes trabajando en esta asignación</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-slate-600 mb-6 leading-relaxed">
                ¿Deseas regenerar los enunciados de los alumnos que aún no terminan la práctica? <br/><br/>
                <strong>Si regeneras:</strong> La IA leerá el nuevo objetivo y les generará un problema nuevo (perderán el código que llevan).<br/>
                <strong>Si mantienes:</strong> Los alumnos actuales conservarán su problema original, y el nuevo objetivo solo aplicará para estudiantes nuevos.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                  onClick={() => executeSave(false)}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i> Mantener enunciados actuales
                </button>
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex justify-center items-center gap-2"
                  onClick={() => executeSave(true)}
                >
                  <i className="fa-solid fa-rotate-right"></i> Regenerar enunciados (Reiniciar progreso)
                </button>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 mt-2 transition-colors"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancelar edición
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
