"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import "./crear-practica-docente.css";

// Los datosPorDB hardcodeados han sido eliminados.
// Ahora se usarán los catálogos obtenidos dinámicamente desde el backend.

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
  const [activeModalTable, setActiveModalTable] = useState(null);
  
  const [catalogs, setCatalogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Obtener parámetros de la URL
  const selectedClassroomId = searchParams.get("classroomId");
  const editId = searchParams.get("editId");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [practiceToSave, setPracticeToSave] = useState(null);

  useEffect(() => {
    // Cargar catálogos dinámicamente
    fetch('/api/proxy/catalogs')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setCatalogs(res.data);
          if (res.data.length > 0) {
            setActiveDb(res.data[0].name);
          }
        }
      })
      .catch(err => console.error("Error cargando catálogos", err));

    if (editId) {
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
    const dbData = catalogs.find(c => c.name === dbName);
    if (dbData && dbData.tables && dbData.tables.length > 0) {
      setActiveModalTable(dbData.tables[0].name);
    }
  };

  const handleCloseModal = () => {
    setModalDb(null);
    setActiveModalTable(null);
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
              {catalogs.length === 0 ? (
                <p>Cargando bases de datos reales...</p>
              ) : (
                catalogs.map(catalog => (
                  <div
                    key={catalog.name}
                    className={`attachment-card ${activeDb === catalog.name ? "active" : ""}`}
                    onClick={() => setActiveDb(catalog.name)}
                  >
                    <div className="attachment-icon-wrapper">
                      <i className="fa-solid fa-database database-file-icon" />
                    </div>
                    <div className="attachment-details">
                      <span className="attachment-name">{catalog.name}.sql</span>
                      <span className="attachment-type">Esquema dinámico • {catalog.tables.length} tablas</span>
                    </div>
                    <button
                      type="button"
                      className="btn-inspect-attachment"
                      onClick={(e) => handleOpenModal(e, catalog.name)}
                      title="Ver esquema"
                    >
                      <i className="fa-solid fa-eye" />
                    </button>
                  </div>
                ))
              )}
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
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-panel rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[85vh] border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border bg-[var(--bg-main)] flex justify-between items-center shrink-0">
              <span className="text-xl font-bold text-foreground">Esquema: {modalDb}</span>
              <button className="text-muted hover:text-foreground transition-colors text-2xl" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="flex flex-1 min-h-0">
              {/* Sidebar: Table List */}
              <div className="w-64 border-r border-border bg-[var(--bg-main)] overflow-y-auto p-4 shrink-0">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 px-3">Tablas ({catalogs.find(c => c.name === modalDb)?.tables?.length || 0})</p>
                <div className="flex flex-col gap-1">
                  {catalogs.find(c => c.name === modalDb)?.tables?.map(table => (
                    <button
                      key={table.name}
                      onClick={() => setActiveModalTable(table.name)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeModalTable === table.name ? 'bg-accent text-white' : 'text-muted hover:bg-input'}`}
                    >
                      <i className="fa-solid fa-table mr-2 opacity-70"></i>
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Main Content: Table Columns */}
              <div className="flex-1 overflow-y-auto p-8 bg-panel">
                {activeModalTable ? (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-table text-accent"></i> Tabla: {activeModalTable}
                    </h3>
                    <table className="w-full text-sm text-left border border-border rounded-lg overflow-hidden shadow-sm">
                      <thead className="bg-input text-muted">
                        <tr>
                          <th className="px-4 py-3 font-semibold border-b border-border">Campo</th>
                          <th className="px-4 py-3 font-semibold border-b border-border">Tipo</th>
                          <th className="px-4 py-3 font-semibold border-b border-border">Restricción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {catalogs.find(c => c.name === modalDb)?.tables?.find(t => t.name === activeModalTable)?.columns?.map(col => (
                          <tr key={col.field} className="hover:bg-[var(--bg-main)] transition-colors">
                            <td className="px-4 py-3 font-mono text-foreground font-medium">{col.field}</td>
                            <td className="px-4 py-3 font-mono text-muted">{col.type}</td>
                            <td className={`px-4 py-3 font-medium ${col.key === 'PRI' ? 'text-accent' : 'text-muted'}`}>
                              {col.key === 'PRI' ? (
                                <span className="inline-flex items-center gap-1"><i className="fa-solid fa-key text-xs"></i> PRIMARY KEY</span>
                              ) : col.null === 'NO' ? 'NOT NULL' : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted">
                    Selecciona una tabla para ver sus columnas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Edit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-panel border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-[var(--bg-main)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Actualizar Práctica</h2>
                <p className="text-sm text-muted">Hay estudiantes trabajando en esta asignación</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-muted mb-6 leading-relaxed">
                ¿Deseas regenerar los enunciados de los alumnos que aún no terminan la práctica? <br/><br/>
                <strong>Si regeneras:</strong> La IA leerá el nuevo objetivo y les generará un problema nuevo (perderán el código que llevan).<br/>
                <strong>Si mantienes:</strong> Los alumnos actuales conservarán su problema original, y el nuevo objetivo solo aplicará para estudiantes nuevos.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-accent hover:bg-[var(--accent-blue-hover)] transition-colors flex justify-center items-center gap-2"
                  onClick={() => executeSave(false)}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i> Mantener enunciados actuales
                </button>
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-[var(--danger-red)] bg-red-500/10 hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2"
                  onClick={() => executeSave(true)}
                >
                  <i className="fa-solid fa-rotate-right"></i> Regenerar enunciados (Reiniciar progreso)
                </button>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold text-muted bg-[var(--bg-main)] hover:bg-input border border-border mt-2 transition-colors"
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
