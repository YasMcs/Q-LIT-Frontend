"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { showAlert, showConfirm } from "@/utils/alerts";
import "./practica_sql.css";

const DB_SCHEMAS = {
  punto_venta_db: {
    productos: [
      { name: "sku", type: "int", pk: true },
      { name: "articulo", type: "varchar(100)" },
      { name: "precio", type: "numeric" },
      { name: "stock", type: "int" }
    ],
    categorias: [
      { name: "id_categoria", type: "int", pk: true },
      { name: "nombre_categoria", type: "varchar(50)" }
    ],
    inventario: [
      { name: "id_registro", type: "int", pk: true },
      { name: "sku", type: "int" },
      { name: "stock_disponible", type: "int" }
    ]
  },
  control_escolar_db: {
    alumnos: [
      { name: "id_alumno", type: "int", pk: true },
      { name: "nombre", type: "varchar(150)" },
      { name: "materia", type: "varchar(50)" },
      { name: "grupo", type: "char(1)" }
    ],
    materias: [
      { name: "id_materia", type: "int", pk: true },
      { name: "nombre_materia", type: "varchar(100)" },
      { name: "creditos", type: "int" }
    ]
  },
  hospital_central_db: {
    citas: [
      { name: "id_cita", type: "int", pk: true },
      { name: "fecha", type: "date" },
      { name: "hora", type: "time" },
      { name: "especialidad", type: "varchar(50)" }
    ],
    pacientes: [
      { name: "id_paciente", type: "int", pk: true },
      { name: "nombre", type: "varchar(150)" },
      { name: "fecha_nacimiento", type: "date" }
    ]
  }
};

// Componente principal del entorno SQL
function PracticaSQLContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceId = searchParams.get("id");

  // Accordion open states
  const [accordions, setAccordions] = useState({});

  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState(null);
  const [dbSchemas, setDbSchemas] = useState(DB_SCHEMAS);
  const [generatedStatement, setGeneratedStatement] = useState("");
  const [requiredFunctions, setRequiredFunctions] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Query editor state
  const [sqlQuery, setSqlQuery] = useState("");
  // Terminal output mode: 'placeholder', 'empty', 'executing', 'success', 'error'
  const [terminalState, setTerminalState] = useState("placeholder");
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resizable terminal height state
  const [terminalHeight, setTerminalHeight] = useState(300);
  const isResizing = useRef(false);

  const toggleAccordion = (table) => {
    setAccordions((prev) => ({
      ...prev,
      [table]: !prev[table],
    }));
  };

  const handleClear = () => {
    setSqlQuery("");
    setTerminalState("empty");
  };

  const handleExecute = async () => {
    if (!sqlQuery.trim()) {
      await showAlert("Editor Vacío", "El editor de consultas SQL está vacío.", "warning");
      return;
    }
    
    setTerminalState("executing");
    setExecutionResult(null);
    setExecutionError(null);

    try {
      const res = await fetch(`/api/proxy/practices/${practiceId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sqlQuery,
          activeDb: practiceData?.requiredFunctions?.db || "punto_venta_db"
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setExecutionError(data.error || { message: "Error al ejecutar la consulta." });
        setTerminalState("error");
        return;
      }

      setExecutionResult(data.data);
      setTerminalState("success");
    } catch (err) {
      setExecutionError({ message: err.message || "Error de red al ejecutar la consulta." });
      setTerminalState("error");
    }
  };

  const handleSubmit = async () => {
    if (!sqlQuery.trim()) {
      await showAlert("Falta Consulta", "No has escrito ninguna consulta SQL.", "warning");
      return;
    }

    if (terminalState !== "success" || !executionResult) {
      await showAlert("Falta Ejecución", "Debes ejecutar tu consulta y asegurarte de que no tenga errores de sintaxis antes de poder entregarla.", "warning");
      return;
    }

    const isConfirmed = await showConfirm(
      "¿Entregar práctica?",
      "Una vez entregada, tu consulta será evaluada y ya no podrás modificarla.",
      "Sí, entregar",
      "Cancelar"
    );
    
    if (!isConfirmed) return;
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        studentSqlCode: sqlQuery,
        practiceObjective: practiceData?.description || "Objetivo general",
        checklist: practiceData?.checklistItems || [],
        practiceId: practiceId,
        submissionId: practiceData?.submissionId,
        executionResult: executionResult
      };

      const res = await fetch('/api/proxy/evaluations', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.data?.aiFailed) {
          await showAlert("Práctica Entregada", data.data.feedback || "La IA no pudo evaluar tu entrega, pero ha sido enviada con éxito a tu maestro para que la califique.", "info");
        } else {
          await showAlert("¡Excelente!", "Tu código ha sido evaluado y la calificación se ha guardado exitosamente.", "success");
        }
        router.push("/class-feed-alumno");
      } else {
        await showAlert("Error de Evaluación", data.error?.message || "Hubo un error al evaluar tu práctica.", "error");
      }
    } catch (err) {
      await showAlert("Error de Conexión", "Error de conexión al enviar la evaluación.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/class-feed-alumno");
  };

  // Resize handler mouse events
  const startResizing = (e) => {
    isResizing.current = true;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 140 && newHeight <= window.innerHeight * 0.8) {
        setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    fetch('/api/proxy/catalogs')
      .then(res => res.json())
      .then(resData => {
        if (resData.data) {
          const schemas = {};
          resData.data.forEach(db => {
            schemas[db.name] = {};
            db.tables.forEach(table => {
              schemas[db.name][table.name] = table.columns.map(col => ({
                name: col.field,
                type: col.type,
                pk: col.key === "PRI"
              }));
            });
          });
          setDbSchemas(schemas);
        }
      })
      .catch(err => console.error("Error cargando catálogos dinámicos:", err));
  }, []);

  useEffect(() => {
    if (practiceData) {
      const dbName = practiceData.requiredFunctions?.db || "punto_venta_db";
      const firstTable = Object.keys(dbSchemas[dbName] || {})[0];
      if (firstTable) {
        setAccordions({ [firstTable]: true });
      }
    }
  }, [practiceData, dbSchemas]);

  useEffect(() => {
    if (practiceId) {
      fetch(`/api/proxy/practices/${practiceId}/start`, { method: "POST" })
        .then(async (res) => {
          const data = await res.json();
          // Si el servidor retorna un error (como el 403 de práctica ya entregada)
          if (!res.ok) {
            await showAlert("Aviso", data.error?.message || "Error al ingresar a la práctica", "info");
            router.push("/class-feed-alumno"); // Redirecciona de vuelta al muro
            return;
          }
          if (data.data) {
            setPracticeData(data.data.practice);
            setGeneratedStatement(data.data.submission.generatedStatement);
            setRequiredFunctions(data.data.practice.requiredFunctions?.keywords || []);
            
            if (data.data.submission.isReadOnly) {
              setIsReadOnly(true);
              setSqlQuery(data.data.submission.studentSqlCode || "");
              if (data.data.submission.executionResult) {
                setExecutionResult(data.data.submission.executionResult);
                setTerminalState("success");
              }
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al iniciar práctica:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [practiceId]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-main text-indigo-600">
        <i className="fa-solid fa-wand-magic-sparkles fa-bounce text-4xl mb-4"></i>
        <h2 className="font-bold text-lg text-foreground">La IA está generando tu reto único...</h2>
        <p className="text-sm text-muted mt-2">Personalizando variables y conectando esquema</p>
      </div>
    );
  }

  return (
    <div className="sql-page-body">
      <div className="workspace-layout-sql">
        {/* Left Sidebar */}
        <aside className="panel-sidebar-sql">
          <div className="sidebar-section-sql">
            <h3>Asignación Activa</h3>
            <div className="bg-panel rounded-2xl border border-border shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <i className="fa-solid fa-wand-magic-sparkles text-sm" />
                </div>
                <h4 className="font-bold text-foreground text-sm">
                  {practiceData?.title || "Enunciado asignado"}
                </h4>
              </div>
              
              <div className="text-muted text-[13px] leading-relaxed mb-5 whitespace-pre-wrap">
                {generatedStatement || "Cargando enunciado generado por IA..."}
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="fa-solid fa-code text-muted" /> Funciones requeridas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {requiredFunctions.length > 0 ? requiredFunctions.map((func, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-main border border-border rounded text-xs font-mono font-bold text-muted shadow-sm">
                      {func}
                    </span>
                  )) : (
                    <span className="text-xs text-muted italic">No hay funciones específicas requeridas.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="schema-container-sql">
            <h3>Diccionario de Entidades</h3>

            {Object.entries(dbSchemas[practiceData?.requiredFunctions?.db || "punto_venta_db"] || {}).map(([tableName, fields]) => (
              <div key={tableName} className={`accordion-table-item-sql ${accordions[tableName] ? "open" : ""}`}>
                <div className="table-toggle-header-sql" onClick={() => toggleAccordion(tableName)}>
                  <div className="table-name-sql">
                    <i className="fa-solid fa-table" /> {tableName}
                  </div>
                  <i className="fa-solid fa-chevron-right chevron-icon-sql" />
                </div>
                <ul className="fields-list-sql">
                  {fields.map((field, idx) => (
                    <li key={idx} className="field-row-sql">
                      <span className={`field-name-sql ${field.pk ? "pk-sql" : ""}`}>
                        {field.name}
                        {field.pk && <i className="fa-solid fa-key" style={{ color: '#fbbf24', marginLeft: '6px', fontSize: '10px' }} />}
                      </span>
                      <span className="field-type-sql">{field.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Right workspace interactive area */}
        <main className="center-workspace-sql">
          <div className="editor-top-bar-sql">
            <button className="back-btn-sql" onClick={handleBack}>
              <i className="fa-solid fa-arrow-left" /> Volver al laboratorio
            </button>
              {!isReadOnly && (
                <button 
                  className={`btn-sql btn-success-sql ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><i className="fa-solid fa-circle-notch fa-spin" /> Evaluando...</>
                  ) : (
                    <><i className="fa-solid fa-paper-plane" /> Entregar Práctica</>
                  )}
                </button>
              )}
          </div>

          <div className="workspace-upper-body-sql !p-0 border-b border-border flex flex-col">
            {/* Editor Toolbar */}
            <div className="bg-main px-4 py-2 border-b border-border flex justify-between items-center z-10">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-code" /> Editor SQL
              </span>
              {!isReadOnly && (
                <div className="flex gap-2">
                  <button 
                    className="px-3 py-1.5 text-xs font-bold text-muted bg-panel border border-border rounded-md shadow-sm hover:bg-input hover:text-foreground transition-colors flex items-center gap-1.5" 
                    onClick={handleClear}
                  >
                    <i className="fa-solid fa-eraser" /> Limpiar
                  </button>
                  <button 
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleExecute}
                    disabled={terminalState === "executing" || isSubmitting}
                  >
                    <i className="fa-solid fa-play" /> {terminalState === "executing" ? "Ejecutando..." : "Ejecutar Consulta"}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
            <Editor
              height="100%"
              language="sql"
              theme="qlit-theme"
              value={sqlQuery}
              onChange={(value) => {
                setSqlQuery(value || "");
                // Forzar a re-ejecutar si el estudiante modifica la consulta
                if (!isReadOnly && (terminalState === "success" || terminalState === "error")) {
                  setTerminalState("placeholder");
                  setExecutionResult(null);
                  setExecutionError(null);
                }
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme('qlit-theme', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#18181b', // Gris suave premium (zinc-900)
                    'editor.lineHighlightBackground': '#222226',
                    'editorCursor.foreground': '#6767ea',
                  }
                });
              }}
              options={{
                readOnly: isReadOnly,
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                wordWrap: "on",
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                roundedSelection: true,
                padding: { top: 24, bottom: 24 },
                cursorStyle: "line",
                automaticLayout: true,
              }}
              loading={<div className="flex items-center justify-center h-full text-muted font-mono text-sm bg-[#18181b]"><i className="fa-solid fa-spinner fa-spin mr-2" /> Cargando entorno SQL...</div>}
            />
            </div>
          </div>

          {/* Resizable Terminal Panel */}
          <div
            className="terminal-zone-sql"
            style={{ height: `${terminalHeight}px` }}
          >
            <div className="terminal-resizer-sql" onMouseDown={startResizing} />

            <div className="terminal-header-sql">
              <span>
                <i className="fa-solid fa-table-list" /> Result Grid & Output
              </span>
              <span className="drag-indicator-sql">
                <i className="fa-solid fa-arrows-up-down" /> Arrastra para ajustar
              </span>
            </div>

            <div className="terminal-body-sql">
              {terminalState === "placeholder" && (
                <div className="terminal-placeholder-sql">
                  Escribe tu consulta arriba y presiona &quot;Ejecutar Consulta&quot;.
                </div>
              )}

              {terminalState === "empty" && (
                <div className="terminal-placeholder-sql">
                  <i className="fa-solid fa-info-circle" /> Consola limpia. Esperando ejecución...
                </div>
              )}

              {terminalState === "executing" && (
                <div className="terminal-placeholder-sql text-indigo-400">
                  <i className="fa-solid fa-circle-notch fa-spin" /> Ejecutando consulta en el sandbox...
                </div>
              )}

              {terminalState === "error" && executionError && (
                <div className="terminal-placeholder-sql text-red-500 flex flex-col items-start gap-2">
                  <div className="font-bold mb-1">
                    <i className="fa-solid fa-triangle-exclamation mr-1.5" /> Error de Ejecución:
                  </div>
                  <div className="text-sm opacity-90 font-medium">
                    {executionError.mensaje || (typeof executionError === 'string' ? executionError : (executionError.message || "Error desconocido"))}
                  </div>
                  
                  {executionError.suggestion && (
                    <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[13px] rounded-xl flex items-start gap-2.5 max-w-xl text-left font-medium shadow-sm">
                      <i className="fa-regular fa-lightbulb text-base mt-0.5" />
                      <div>
                        <strong className="block mb-1 text-amber-400">
                          {executionError.isAiGenerated ? "Sugerencia de Lumi:" : "Sugerencia pedagógica:"}
                        </strong>
                        {executionError.suggestion}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {terminalState === "success" && executionResult && (
                <div className="terminal-success-view-sql">
                  <div className={`workbench-status-sql ${executionResult.type === "DML" ? "text-amber-600" : "text-emerald-600"}`}>
                    <i className="fa-solid fa-circle-check" /> {executionResult.message}
                  </div>
                  
                  {executionResult.columns && executionResult.columns.length > 0 && (
                    <table className="workbench-grid-sql">
                      <thead>
                        <tr>
                          {executionResult.columns.map((col, idx) => (
                            <th key={idx}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {executionResult.rows && executionResult.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {executionResult.columns.map((col, colIdx) => (
                              <td key={colIdx}>{row[col]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PracticaSQLPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando...</div>}>
      <PracticaSQLContent />
    </Suspense>
  );
}
