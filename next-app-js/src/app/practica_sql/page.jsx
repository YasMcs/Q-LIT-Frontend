"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
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

// Componente interno que usa useSearchParams
function PracticaSQLContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceId = searchParams.get("id");

  // Accordion open states
  const [accordions, setAccordions] = useState({});

  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState(null);
  const [generatedStatement, setGeneratedStatement] = useState("");
  const [requiredFunctions, setRequiredFunctions] = useState([]);

  // Query editor state
  const [sqlQuery, setSqlQuery] = useState("");
  // Terminal output mode: 'placeholder', 'empty', 'executing', 'success', 'error'
  const [terminalState, setTerminalState] = useState("placeholder");
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);

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
      alert("El editor de consultas SQL está vacío.");
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
        throw new Error(data.error?.message || "Error al ejecutar la consulta.");
      }

      setExecutionResult(data.data);
      setTerminalState("success");
    } catch (err) {
      setExecutionError(err.message);
      setTerminalState("error");
    }
  };

  const handleSubmit = () => {
    alert("¡Felicidades! Tu entrega ha sido registrada con éxito.");
    router.push("/class-feed-alumno");
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
    if (practiceId) {
      fetch(`/api/proxy/practices/${practiceId}/start`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setPracticeData(data.data.practice);
            setGeneratedStatement(data.data.submission.generatedStatement);
            setRequiredFunctions(data.data.practice.requiredFunctions?.keywords || []);
            
            // Auto-open the first table matching the DB
            const dbName = data.data.practice.requiredFunctions?.db || "punto_venta_db";
            const firstTable = Object.keys(DB_SCHEMAS[dbName] || {})[0];
            if (firstTable) {
              setAccordions({ [firstTable]: true });
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
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-indigo-600">
        <i className="fa-solid fa-wand-magic-sparkles fa-bounce text-4xl mb-4"></i>
        <h2 className="font-bold text-lg text-slate-700">La IA está generando tu reto único...</h2>
        <p className="text-sm text-slate-500 mt-2">Personalizando variables y conectando esquema</p>
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
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <i className="fa-solid fa-wand-magic-sparkles text-sm" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {practiceData?.title || "Enunciado asignado"}
                </h4>
              </div>
              
              <div className="text-slate-600 text-[13px] leading-relaxed mb-5 whitespace-pre-wrap">
                {generatedStatement || "Cargando enunciado generado por IA..."}
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i className="fa-solid fa-code text-slate-300" /> Funciones requeridas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {requiredFunctions.length > 0 ? requiredFunctions.map((func, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-600 shadow-sm">
                      {func}
                    </span>
                  )) : (
                    <span className="text-xs text-slate-400 italic">No hay funciones específicas requeridas.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="schema-container-sql">
            <h3>Diccionario de Entidades</h3>

            {Object.entries(DB_SCHEMAS[practiceData?.requiredFunctions?.db || "punto_venta_db"] || {}).map(([tableName, fields]) => (
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
                      <span className={`field-name-sql ${field.pk ? "pk-sql" : ""}`}>{field.name}</span>
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
              <button className="btn-sql btn-success-sql" onClick={handleSubmit}>
                <i className="fa-solid fa-paper-plane" /> Entregar Práctica
              </button>
          </div>

          <div className="workspace-upper-body-sql !p-0 border-b border-slate-100 flex flex-col">
            {/* Editor Toolbar */}
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center z-10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-code" /> Editor SQL
              </span>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-1.5" 
                  onClick={handleClear}
                >
                  <i className="fa-solid fa-eraser" /> Limpiar
                </button>
                <button 
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5" 
                  onClick={handleExecute}
                >
                  <i className="fa-solid fa-play" /> Ejecutar Consulta
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
            <Editor
              height="100%"
              language="sql"
              theme="light"
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value || "")}
              options={{
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
              loading={<div className="flex items-center justify-center h-full text-slate-400 font-mono text-sm"><i className="fa-solid fa-spinner fa-spin mr-2" /> Cargando entorno SQL...</div>}
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

              {terminalState === "error" && (
                <div className="terminal-placeholder-sql text-red-500">
                  <div className="font-bold mb-2"><i className="fa-solid fa-triangle-exclamation" /> Error de Ejecución:</div>
                  <div className="text-sm opacity-90">{executionError}</div>
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
