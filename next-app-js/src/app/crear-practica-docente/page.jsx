"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { showAlert, showConfirm } from "@/utils/alerts";
import "./crear-practica-docente.css";

// Los datosPorDB hardcodeados han sido eliminados.
// Ahora se usarán los catálogos obtenidos dinámicamente desde el backend.

export default function CrearPracticaDocentePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center flex items-center justify-center h-screen">Cargando...</div>}>
      <CrearPracticaDocenteContent />
    </Suspense>
  );
}

function CrearPracticaDocenteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [activeDb, setActiveDb] = useState("punto_venta_db");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const [maxScore, setMaxScore] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [closeLateSubmissions, setCloseLateSubmissions] = useState(false);
  const [modalDb, setModalDb] = useState(null);
  const [activeModalTable, setActiveModalTable] = useState(null);
  const [isFunctionsModalOpen, setIsFunctionsModalOpen] = useState(false);
  
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
          // Only set activeDb if editing, otherwise leave it empty so user chooses manually
          if (!editId) {
            setActiveDb("");
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
            setSelectedFunctions(data.requiredFunctions?.keywords || []);
            setMaxScore(data.totalPoints || 100);
            setActiveDb(data.requiredFunctions?.db || "punto_venta_db");
            setCloseLateSubmissions(data.closeLateSubmissions || false);
            if (data.deadline) {
              const dt = new Date(data.deadline);
              const year = dt.getFullYear();
              const month = String(dt.getMonth() + 1).padStart(2, '0');
              const day = String(dt.getDate()).padStart(2, '0');
              const hours = String(dt.getHours()).padStart(2, '0');
              const minutes = String(dt.getMinutes()).padStart(2, '0');
              setDueDate(`${year}-${month}-${day}`);
              setDueTime(`${hours}:${minutes}`);
            }
            if (data.checklistItems && data.checklistItems.length > 0) {
              setCriteria(data.checklistItems.map((item, index) => ({
                id: item.id || index + 1,
                text: item.criterion,
                points: item.maxPoints
              })));
            }
          }
        })
        .catch(err => console.error("Error cargando práctica", err));
    }
  }, [editId]);

  // Rubric / checklist state (initially empty with one blank item)
  const [criteria, setCriteria] = useState([
    { id: 1, text: "", points: 100 }
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
          requiredFunctionsStr: selectedFunctions.join(","),
          maxScore,
          dueDate,
          dueTime,
          deadlineIso: new Date(`${dueDate}T${dueTime}`).toISOString(),
          activeDb,
          criteria,
          classroomId: selectedClassroomId,
          forceRegenerate,
          closeLateSubmissions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Error al guardar la práctica");
      }

      await showAlert("Éxito", editId ? "Práctica actualizada con éxito." : "Práctica SQL asignada con éxito al laboratorio.", "success");
      if (selectedClassroomId) {
        router.push(`/class-feed-docente?classroomId=${selectedClassroomId}`);
      } else {
        router.push("/dashboard-docente");
      }
    } catch (error) {
      await showAlert("Error", error.message, "error");
    } finally {
      setIsSaving(false);
      setShowConfirmModal(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      await showAlert("Falta Título", "Por favor, introduce el título de la práctica.", "warning");
      return;
    }
    if (!description.trim()) {
      await showAlert("Falta Instrucciones", "Por favor, introduce las instrucciones u objetivo de la práctica.", "warning");
      return;
    }
    if (selectedFunctions.length === 0) {
      await showAlert("Falta Requisitos", "Por favor, selecciona al menos una función o cláusula SQL esperada.", "warning");
      return;
    }
    if (!activeDb) {
      await showAlert("Falta Base de Datos", "Por favor, selecciona una base de datos temática para la práctica.", "warning");
      return;
    }
    if (!maxScore || maxScore <= 0) {
      await showAlert("Valor Inválido", "Por favor, asigna un valor total válido mayor a 0 para la práctica.", "warning");
      return;
    }
    if (!dueDate || !dueTime) {
      await showAlert("Falta Fecha", "Por favor, establece la fecha y hora de entrega.", "warning");
      return;
    }
    
    const [y, m, d] = dueDate.split('-');
    const parsedDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    if (
      parsedDate.getFullYear() !== parseInt(y, 10) ||
      parsedDate.getMonth() !== parseInt(m, 10) - 1 ||
      parsedDate.getDate() !== parseInt(d, 10)
    ) {
      await showAlert("Fecha Inválida", "La fecha ingresada no existe en el calendario (ej. un 31 en un mes de 30 días o año bisiesto).", "warning");
      return;
    }

    const selectedDateObj = new Date(`${dueDate}T${dueTime}:00`);
    if (isNaN(selectedDateObj.getTime())) {
      await showAlert("Fecha Inválida", "La fecha ingresada no es válida.", "warning");
      return;
    }
    
    if (selectedDateObj < new Date()) {
      await showAlert("Fecha en el pasado", "La fecha y hora de entrega ya pasaron. Por favor selecciona una fecha futura.", "warning");
      return;
    }
    
    // Only require classroomId for new practices
    if (!editId && !selectedClassroomId) {
      await showAlert("Falta Laboratorio", "Por favor, selecciona a qué laboratorio asignar esta práctica.", "warning");
      return;
    }
    
    if (isSaving) return;
    
    // Validar que no haya criterios vacíos
    const hasEmptyCriteria = criteria.some(item => !item.text.trim());
    if (hasEmptyCriteria) {
      await showAlert("Criterios Incompletos", "Hay campos vacíos en los criterios de la lista de cotejo. Por favor, completa o elimina los criterios vacíos.", "warning");
      return;
    }

    if (criteriaSum !== maxScore) {
      const confirmed = await showConfirm(
        "Ajuste de Criterios",
        `La suma de los criterios de la lista de cotejo (${criteriaSum} pts) no coincide con el valor total de la práctica (${maxScore} pts). ¿Deseas guardar de todas formas?`
      );
      if (!confirmed) {
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
      {/* Barra de Navegación Superior */}
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

      {/* Cuadrícula de Diseño del Editor */}
      <div className="classroom-layout-container">
        {/* Columna Izquierda (Formularios y Adjuntos) */}
        <main className="classroom-main-column">
          <div className="classroom-card-panel">
            {/* Título */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground px-1 flex items-center gap-2">
                Título de la práctica
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="Nombre corto para identificar esta tarea dentro de tu laboratorio."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              <div className="classroom-input-wrapper">
                <input
                  id="field-title"
                  type="text"
                  className="classroom-input-field title-field"
                  placeholder="Ej: Análisis de Ventas Mensuales"
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTitle(val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('field-description')?.focus();
                    }
                  }}
                />
              </div>
            </div>

            {/* Descripción (Contexto de IA y Objetivo) */}
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-bold text-foreground px-1 flex items-center gap-2">
                Objetivo de la práctica
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="Describe el objetivo pedagógico de la práctica. La IA utilizará esto para generar el enunciado interactivo (historia) que verá el estudiante."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              <div className="classroom-input-wrapper">
                <textarea
                  id="field-description"
                  className="classroom-textarea-field description-field"
                  placeholder="Ej: Que el estudiante comprenda la lógica de selectivas y condicionales (WHERE) al momento de buscar datos."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      document.getElementById('field-maxscore')?.focus();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted mt-1 px-1">Tip: Ctrl + Enter para avanzar al siguiente campo.</p>
            </div>

            {/* Funciones SQL Requeridas (Píldoras y Botón) */}
            <div className="mt-6 flex flex-col gap-3">
              <label className="text-sm font-bold text-foreground px-1 flex items-center gap-2">
                Funciones y Cláusulas SQL Esperadas
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="Selecciona qué comandos SQL el alumno TIENE que usar para que la plataforma dé por buena su respuesta."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsFunctionsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent text-white hover:opacity-90 shadow-lg border border-transparent transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-list-check"></i> Seleccionar Funciones
                </button>

                
                {selectedFunctions.length === 0 ? (
                  <span className="text-muted text-sm italic px-2">Ninguna función seleccionada</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedFunctions.map(func => (
                      <span key={func} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/20 text-white border border-accent/50 flex items-center gap-2 shadow-sm">
                        {func}
                        <i 
                          className="fa-solid fa-xmark cursor-pointer hover:text-[var(--danger-red)] transition-colors p-1" 
                          onClick={() => setSelectedFunctions(prev => prev.filter(f => f !== func))}
                        ></i>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Adjuntos: Selección de Base de Datos */}
          <div className="classroom-card-panel attachments-panel mt-4">
            <h3 className="attachments-title flex items-center gap-2">
              Adjuntar Base de Datos Temática
              <i className="fa-solid fa-circle-info text-muted cursor-help text-sm custom-tooltip" data-tooltip="Elige el esquema de datos semilla que servirá de base interactiva para esta práctica."></i>
              <span className="text-[var(--danger-red)] text-sm">*</span>
            </h3>

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

        {/* Barra Lateral Derecha (Configuración y Rúbrica) */}
        <aside className="classroom-sidebar">
          {/* Panel de Configuración General */}
          <div className="classroom-card-panel flex flex-col gap-6">
            {/* Puntos (Puntuación Máxima) */}
            <div>
              <label className="sidebar-label flex items-center gap-2 mb-2">
                Valor total de la práctica
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="Los puntos totales que vale esta tarea."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              <div className="puntos-input-wrapper">
                <input
                  id="field-maxscore"
                  type="number"
                  className="sidebar-number-input"
                  min="1"
                  value={maxScore === '' ? '' : maxScore}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                      e.preventDefault();
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('field-duedate')?.focus();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setMaxScore('');
                    } else {
                      const num = parseInt(val, 10);
                      setMaxScore(num > 0 ? num : '');
                    }
                  }}
                  onBlur={() => {
                    if (maxScore === '') setMaxScore(100);
                  }}
                />
              </div>
            </div>

            {/* Fecha y Hora de Entrega */}
            <div>
              <label className="sidebar-label flex items-center gap-2 mb-2">
                Fecha y hora de entrega
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="El límite de tiempo para que los alumnos entreguen sus consultas SQL."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              <div className="due-datetime-inputs">
                <input
                  id="field-duedate"
                  type="date"
                  className="sidebar-date-input"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={dueDate}
                  onChange={handleDateChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('field-duetime')?.focus();
                    }
                  }}
                />
                <input
                  id="field-duetime"
                  type="time"
                  className="sidebar-time-input"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('field-criteria-0')?.focus();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted mt-1.5 flex items-center gap-1.5">
                <i className="fa-regular fa-clock text-[11px]"></i>
                El formato de hora es de 12 hrs (AM/PM). Ejemplo: 11:59 PM = hora limite del dia.
              </p>
              <div className="checkbox-control-wrapper mt-3">
                <input 
                  type="checkbox" 
                  id="close-late-submissions" 
                  className="sidebar-checkbox" 
                  checked={closeLateSubmissions}
                  onChange={(e) => setCloseLateSubmissions(e.target.checked)}
                />
                <label htmlFor="close-late-submissions" className="text-sm">Cerrar entregas después de la fecha límite</label>
              </div>
            </div>
          </div>

          {/* Panel de Rúbrica / Lista de Cotejo */}
          <div className="classroom-card-panel flex flex-col flex-grow">
            <div className="rubric-drawer-header mb-4">
              <label className="sidebar-label flex items-center gap-2">
                Lista de Cotejo
                <i className="fa-solid fa-circle-info text-muted cursor-help custom-tooltip" data-tooltip="Desglosa el valor total de la práctica en criterios específicos para que la IA sepa qué buscar en la respuesta del alumno."></i>
                <span className="text-[var(--danger-red)]">*</span>
              </label>
              <button type="button" className="btn-add-criterio-drawer" onClick={handleAddCriteria}>
                + Añadir Criterio
              </button>
            </div>

            <div className="rubric-drawer-panel">
              <div className="rubric-drawer-subtitle">
                Asigna el puntaje a cada criterio. Total acumulado: <strong>{criteriaSum} / {maxScore}</strong> pts.
              </div>

              <div className="rubric-drawer-list">
                {criteria.map((item, index) => (
                  <div key={item.id} className="rubric-drawer-row">
                    <input
                      id={`field-criteria-${index}`}
                      type="text"
                      className="rubric-drawer-input-text"
                      placeholder="Descripción del criterio..."
                      value={item.text}
                      onChange={(e) => handleCriteriaTextChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById(`field-criteria-pts-${index}`)?.focus();
                        }
                      }}
                    />
                    <input
                      id={`field-criteria-pts-${index}`}
                      type="number"
                      className="rubric-drawer-input-points"
                      placeholder="Pts"
                      value={item.points}
                      onChange={(e) => handleCriteriaPointsChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const nextIndex = index + 1;
                          const nextEl = document.getElementById(`field-criteria-${nextIndex}`);
                          if (nextEl) {
                            nextEl.focus();
                          } else {
                            handleAddCriteria();
                            setTimeout(() => {
                              document.getElementById(`field-criteria-${nextIndex}`)?.focus();
                            }, 50);
                          }
                        }
                      }}
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

      {/* Modal de Detalle de Esquema */}
      {modalDb && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-panel rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[75vh] border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border bg-[var(--bg-main)] flex justify-between items-center shrink-0">
              <span className="text-xl font-bold text-foreground">Esquema: {modalDb}</span>
              <button className="text-muted hover:text-foreground transition-colors text-2xl" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="flex flex-1 min-h-0">
              {/* Barra Lateral: Lista de Tablas */}
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

      {/* SQL Functions Modal */}
      {isFunctionsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in p-4" onClick={() => setIsFunctionsModalOpen(false)}>
          <div className="bg-[var(--bg-panel)] rounded-2xl w-full max-w-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Seleccionar Funciones SQL</h2>
              <button onClick={() => setIsFunctionsModalOpen(false)} className="text-muted hover:text-foreground">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex flex-col gap-6">
                {[
                  { category: "DML (Manipulación)", options: ["SELECT", "INSERT", "UPDATE", "DELETE"] },
                  { category: "Cláusulas Básicas", options: ["WHERE", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "DISTINCT"] },
                  { category: "Joins (Relaciones)", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN"] },
                  { category: "Operadores y Filtros", options: ["IN", "LIKE", "BETWEEN", "AND", "OR", "NOT", "IS NULL"] },
                  { category: "Agregación", options: ["COUNT", "SUM", "AVG", "MAX", "MIN"] }
                ].map(group => (
                  <div key={group.category}>
                    <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">{group.category}</h4>
                    <div className="flex flex-wrap gap-3">
                      {group.options.map(opt => {
                        const isSelected = selectedFunctions.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedFunctions(prev => prev.filter(f => f !== opt));
                              } else {
                                setSelectedFunctions(prev => [...prev, opt]);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                              isSelected 
                                ? 'bg-accent text-white border-accent shadow-md scale-105' 
                                : 'bg-[var(--bg-main)] border-[var(--border-color)] text-muted hover:border-accent/50 hover:text-foreground'
                            }`}
                          >
                            {opt} {isSelected && <i className="fa-solid fa-check ml-1"></i>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex justify-end">
              <button
                className="px-6 py-2.5 rounded-xl font-bold bg-accent text-white hover:opacity-90 shadow-md transition-all"
                onClick={() => setIsFunctionsModalOpen(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Edit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
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
                <strong>Si regeneras:</strong> La IA leerá el nuevo objetivo y les generará un problema nuevo a los alumnos que aún no entregan (perderán su progreso actual). Las entregas ya realizadas <strong>no se verán afectadas</strong>.<br/>
                <strong>Si mantienes:</strong> Todos los alumnos actuales conservarán su problema original, y el nuevo objetivo solo aplicará para estudiantes nuevos.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-accent hover:bg-[var(--accent-blue-hover)] transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => executeSave(false)}
                  disabled={isSaving}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i> {isSaving ? "Procesando..." : "Mantener enunciados actuales"}
                </button>
                <button 
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-[var(--danger-red)] bg-red-500/10 hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => executeSave(true)}
                  disabled={isSaving}
                >
                  <i className="fa-solid fa-rotate-right"></i> {isSaving ? "Procesando..." : "Regenerar enunciados (Reiniciar progreso)"}
                </button>
                <button 
                  className="w-full py-3 px-4 rounded-xl font-bold text-muted bg-[var(--bg-main)] hover:bg-input border border-border mt-2 transition-colors disabled:opacity-50"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSaving}
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
