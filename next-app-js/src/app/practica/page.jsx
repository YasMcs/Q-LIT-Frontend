"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { showAlert, showConfirm } from "@/utils/alerts";
import { decodeId } from "@/utils/crypto";
import "./practica_sql.css";

// Componente principal del entorno SQL
function PracticaSQLContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceId = decodeId(searchParams.get("id"));

  // Accordion open states
  const [accordions, setAccordions] = useState({});

  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState(null);
  const [dbSchemas, setDbSchemas] = useState({});
  const [generatedStatement, setGeneratedStatement] = useState("");
  const [parsedStatement, setParsedStatement] = useState(null);
  const [requiredFunctions, setRequiredFunctions] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  // Estados de Pasos Unificados
  const [currentStep, setCurrentStep] = useState(0); 
  const [activeStep, setActiveStep] = useState(0);
  const [stepsStatus, setStepsStatus] = useState([]); 
  const [aiFeedback, setAiFeedback] = useState(null);
  const [stepHistory, setStepHistory] = useState([]);

  // Query editor state
  const [sqlQuery, setSqlQuery] = useState("");
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
    setAiFeedback(null);
  };

  const submitFinalPractice = async (finalExecResult) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        studentSqlCode: sqlQuery,
        practiceObjective: practiceData?.description || "Objetivo general",
        checklist: practiceData?.checklistItems || [],
        practiceId: practiceId,
        submissionId: submissionId,
        executionResult: finalExecResult
      };

      const res = await fetch('/api/proxy/evaluations', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        await showAlert("¡Práctica Completada!", "Has superado todos los objetivos y tu práctica ha sido enviada con éxito.", "success");
        router.push("/clase");
      } else {
        const errorMsg = data.error?.details ? `${data.error.message}:\n${data.error.details.join(', ')}` : (data.error?.message || "Hubo un error al guardar tu práctica.");
        await showAlert("Error de Evaluación", errorMsg, "error");
      }
    } catch (err) {
      await showAlert("Error de Conexión", "Error de conexión al enviar la evaluación.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecute = async () => {
    if (!sqlQuery.trim()) {
      await showAlert("Editor Vacío", "El editor de consultas SQL está vacío.", "warning");
      return;
    }
    
    setTerminalState("executing");
    setExecutionResult(null);
    setExecutionError(null);
    setAiFeedback(null);
    
    // Poner el paso actual en modo de evaluación (solo si no ha sido evaluado antes)
    if (activeStep >= currentStep) {
      setStepsStatus(prev => {
        const newStatus = [...prev];
        if (!newStatus[activeStep]) {
          newStatus[activeStep] = 'evaluating';
        }
        return newStatus;
      });
    }

    try {
      // 1. Ejecutar Consulta
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
        
        // Sólo marcamos el paso como incorrecto si es el paso actual evaluándose.
        // Si es un paso anterior (ya superado), no editamos su calificación.
        if (activeStep >= currentStep) {
          setStepsStatus(prev => {
            const newStatus = [...prev];
            if (!newStatus[activeStep] || newStatus[activeStep] === 'evaluating') {
              newStatus[activeStep] = 'incorrect';
            }
            return newStatus;
          });
        }
        return;
      }

      setExecutionResult(data.data);
      setTerminalState("success");

      // 2. Si no hay parse, simplemente retornamos éxito local (por si falla JSON).
      if (!parsedStatement || !parsedStatement.pasos) return;

      const currentStepObj = parsedStatement.pasos[activeStep];
      if (!currentStepObj) return;
      
      // 3. Prevenir re-evaluación si el objetivo ya fue superado previamente
      // Si el activeStep es menor al currentStep, significa que el alumno regresó 
      // solo para ejecutar consultas exploratorias (ej. recordar datos).
      if (activeStep < currentStep) {
        // No modificamos stepsStatus, conservamos el color (verde o rojo) original.
        return; // Detener flujo, no enviamos a la IA.
      }

      // 4. Evaluar con IA Automáticamente (sólo el objetivo actual)
      const evalRes = await fetch(`/api/proxy/evaluations/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId,
          stepIndex: activeStep,
          studentSqlCode: sqlQuery,
          activeDb: practiceData?.requiredFunctions?.db || "punto_venta_db"
        })
      });

      const evalData = await evalRes.json();
      
      if (!evalRes.ok) {
         setAiFeedback({ type: 'error', text: evalData.error?.message || "Error evaluando objetivo." });
         setStepsStatus(prev => {
           const newStatus = [...prev];
           if (!newStatus[activeStep] || newStatus[activeStep] === 'evaluating') {
             newStatus[activeStep] = 'incorrect';
           }
           return newStatus;
         });
         return;
      }

      if (evalData.data.isCorrect) {
         setAiFeedback({ type: 'success', text: evalData.data.feedback || "¡Excelente, objetivo logrado!" });
         setStepsStatus(prev => {
           const newStatus = [...prev];
           if (!newStatus[activeStep] || newStatus[activeStep] === 'evaluating') {
             newStatus[activeStep] = 'correct';
           }
           return newStatus;
         });

         if (activeStep === currentStep) {
           if (currentStep < parsedStatement.pasos.length - 1) {
             setCurrentStep(prev => prev + 1);
             setActiveStep(prev => prev + 1);
           } else {
             // Terminado: Habilitar modo "Entregar"
             setCurrentStep(parsedStatement.pasos.length);
           }
         }
      } else {
         setAiFeedback({ type: 'error', text: evalData.data.feedback });
         setStepsStatus(prev => {
           const newStatus = [...prev];
           if (!newStatus[activeStep] || newStatus[activeStep] === 'evaluating') {
             newStatus[activeStep] = 'incorrect';
           }
           return newStatus;
         });
      }
    } catch (err) {
      setExecutionError({ message: err.message || "Error de red al ejecutar la consulta." });
      setTerminalState("error");
    }
  };

  const handleBack = () => {
    router.push("/clase");
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

  // Hidratación del enunciado JSON y progreso guardado
  useEffect(() => {
    if (generatedStatement) {
      try {
        const parsed = JSON.parse(generatedStatement);
        setParsedStatement(parsed);
        if (parsed.pasos) {
           const initialStatus = new Array(parsed.pasos.length).fill(null);
           
           // Restaurar progreso visual (checks y taches) si existen steps guardados
           if (practiceData && practiceData.submission && practiceData.submission.steps) {
               practiceData.submission.steps.forEach(step => {
                  if (step.passedAtFirstTry === false) {
                     initialStatus[step.stepIndex] = 'incorrect';
                  } else if (step.passedAtFirstTry === true) {
                     initialStatus[step.stepIndex] = 'correct';
                  }
               });
           }
           
           setStepsStatus(initialStatus);
        }
      } catch (e) {
        console.error("Error parseando enunciado generado por IA:", e);
      }
    }
  }, [generatedStatement, practiceData]);

  useEffect(() => {
    if (practiceId) {
      fetch(`/api/proxy/practices/${practiceId}/start`, { method: "POST" })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            await showAlert("Aviso", data.error?.message || "Error al ingresar a la práctica", "info");
            router.push("/clase");
            return;
          }
          if (data.data) {
            setPracticeData({ ...data.data.practice, submission: data.data.submission });
            setGeneratedStatement(data.data.submission.generatedStatement);
            setRequiredFunctions(data.data.practice.requiredFunctions?.keywords || []);
            setSubmissionId(data.data.submission.id);
            
            // Reanudar el paso en el que se quedó
            if (data.data.submission.currentStep > 0) {
              setCurrentStep(data.data.submission.currentStep);
              setActiveStep(data.data.submission.currentStep);
            }
            
            if (data.data.submission.isReadOnly) {
              setIsReadOnly(true);
              
              // Si está resuelta, permitir clickear todos los pasos
              if (data.data.submission.generatedStatement) {
                 try {
                   const tempParsed = JSON.parse(data.data.submission.generatedStatement);
                   if (tempParsed.pasos) {
                     setCurrentStep(tempParsed.pasos.length);
                   }
                 } catch (e) {}
              }
              
              // Cargar por defecto la consulta del primer paso (índice 0)
              const firstStep = data.data.submission.steps?.find(s => s.stepIndex === 0);
              setSqlQuery(firstStep?.finalSqlCode || data.data.submission.studentSqlCode || "");
              setStepHistory(firstStep?.errorLogs || []);
              setActiveStep(0);
              
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
  }, [practiceId, router]);

  // Control Anti-Plagio: Bloquear Ctrl+V/Cmd+V, Pegado y Clic Derecho
  useEffect(() => {
    const handlePaste = (e) => {
      e.preventDefault();
      showAlert("Pegado Deshabilitado", "El pegado de texto externo está deshabilitado en esta práctica para garantizar un aprendizaje genuino.", "warning");
    };

    const handleKeyDown = (e) => {
      // Bloquear Ctrl+V o Cmd+V (keyCode 86 para la tecla 'V')
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V" || e.keyCode === 86)) {
        e.preventDefault();
        showAlert("Pegado Deshabilitado", "El pegado de texto (Ctrl+V) está deshabilitado para evitar la copia externa.", "warning");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      showAlert("Menú Deshabilitado", "El clic derecho está deshabilitado en este entorno para asegurar tu esfuerzo individual.", "warning");
    };

    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-main text-indigo-600">
        <i className="fa-solid fa-wand-magic-sparkles fa-bounce text-4xl mb-4"></i>
        <h2 className="font-bold text-lg text-foreground">Lumi (IA) está configurando tu entorno...</h2>
        <p className="text-sm text-muted mt-2">Cargando dependencias de SQL</p>
      </div>
    );
  }

  return (
    <div className="sql-page-body">
      {/* NAVBAR SUPERIOR */}
      <header className="w-full h-14 bg-panel flex items-center px-4 justify-between shrink-0 mb-4 rounded-b-3xl shadow-sm mx-4" style={{ width: 'calc(100% - 32px)' }}>
        <div className="flex items-center gap-4">
          <button className="text-muted hover:text-foreground transition-colors text-sm font-medium flex items-center gap-2" onClick={handleBack}>
            <i className="fa-solid fa-arrow-left" /> Volver al laboratorio
          </button>
        </div>
        <div className="font-bold text-foreground text-sm flex items-center gap-2">
           <i className="fa-solid fa-database text-indigo-500" />
           {practiceData?.title || "Práctica SQL"}
        </div>
        <div className="w-[150px]"></div> {/* Spacer flex */}
      </header>

      <div className="workspace-layout-sql">
        
        {/* PANEL IZQUIERDO: Diccionario */}
        <aside className="panel-sidebar-sql">
          <div className="schema-container-sql !mt-0">
            <div className="px-4 pt-5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                Diccionario de Entidades
              </h3>
            </div>

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
                        {field.pk && <i className="fa-solid fa-key text-indigo-400 ml-1.5 text-[10px]" title="Primary Key" />}
                      </span>
                      <span 
                        className="custom-tooltip custom-tooltip-left cursor-help" 
                        data-tooltip={field.type}
                      >
                        <span className="field-type-sql">{field.type}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* PANEL CENTRAL: Editor y Consola */}
        <main className="center-workspace-sql flex flex-col">
          <div className="workspace-upper-body-sql !p-0 flex flex-col flex-1">
            <div className="bg-main px-4 py-2 flex justify-between items-center z-10 shrink-0">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-code" /> Editor SQL
              </span>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <div className="flex items-center gap-2 mr-2">
                    <i 
                      className="fa-solid fa-circle-info text-muted/60 hover:text-muted cursor-help custom-tooltip custom-tooltip-bottom text-sm mr-1" 
                      data-tooltip="El sistema evalúa automáticamente si tu consulta cumple con el objetivo seleccionado."
                    ></i>
                    <button
                      onClick={handleExecute}
                      disabled={terminalState === "executing" || isSubmitting}
                      className="px-4 py-1.5 rounded-md font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-play" /> {terminalState === "executing" ? "Ejecutando..." : "Ejecutar"}
                    </button>
                  </div>
                )}
                {!isReadOnly && (
                  <button 
                    className="px-3 py-1.5 text-xs font-bold text-muted bg-panel border border-border/40 rounded-md shadow-sm hover:bg-input hover:text-foreground transition-colors flex items-center gap-1.5" 
                    onClick={handleClear}
                  >
                    <i className="fa-solid fa-eraser" /> Limpiar
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="sql"
                theme="qlit-theme"
                value={sqlQuery}
                onChange={(value) => {
                  setSqlQuery(value || "");
                  // Reset estado local
                  if (!isReadOnly && (terminalState === "success" || terminalState === "error")) {
                    setTerminalState("placeholder");
                    setExecutionResult(null);
                    setExecutionError(null);
                    setAiFeedback(null);
                  }
                }}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme('qlit-theme', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                      'editor.background': '#18181b', // zinc-900
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
                  contextmenu: false,
                }}
                loading={<div className="flex items-center justify-center h-full text-muted font-mono text-sm bg-[#18181b]"><i className="fa-solid fa-spinner fa-spin mr-2" /> Cargando entorno SQL...</div>}
              />
            </div>
          </div>

          {/* Consola Inferior */}
          <div className="terminal-zone-sql" style={{ height: `${terminalHeight}px` }}>
            <div className="terminal-resizer-sql" onMouseDown={startResizing} />
            <div className="terminal-header-sql">
              <span><i className="fa-solid fa-table-list" /> Result Grid & Output</span>
              <span className="drag-indicator-sql"><i className="fa-solid fa-arrows-up-down" /> Arrastra para ajustar</span>
            </div>

            <div className="terminal-body-sql overflow-y-auto">
              {terminalState === "placeholder" && !isReadOnly && (
                <div className="terminal-placeholder-sql">Escribe tu consulta arriba y presiona &quot;Ejecutar Consulta&quot;.</div>
              )}
              {isReadOnly && stepHistory.length === 0 && (
                <div className="terminal-placeholder-sql"><i className="fa-solid fa-check-circle text-emerald-500 mr-2"/> Superaste este objetivo al primer intento sin errores.</div>
              )}
              {isReadOnly && stepHistory.length > 0 && (
                <div className="p-4 space-y-4">
                  <div className="font-bold text-indigo-400 mb-2 border-b border-indigo-500/30 pb-2 flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left" /> Historial de Intentos y Retroalimentación
                  </div>
                  {stepHistory.map((log, i) => (
                    <div key={i} className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                       <div className="text-[11px] text-muted mb-3 font-mono bg-[#121212] p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">{log.query}</div>
                       <div className="p-3 bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-200 text-[13px] rounded-r-lg">
                           <strong className="block text-[10px] uppercase tracking-widest text-indigo-400 mb-1.5">
                             <i className="fa-solid fa-triangle-exclamation mr-1.5" /> Retroalimentación de Lumi (IA)
                           </strong>
                           <div className="leading-relaxed whitespace-pre-wrap">{log.errorMessage}</div>
                       </div>
                    </div>
                  ))}
                  <div className="text-emerald-500 text-[13px] font-bold mt-3 pt-3 border-t border-emerald-500/20 flex items-center gap-2">
                    <i className="fa-solid fa-check-double" /> Eventualmente superaste este objetivo con el código mostrado arriba.
                  </div>
                </div>
              )}
              {!isReadOnly && terminalState === "empty" && (
                <div className="terminal-placeholder-sql"><i className="fa-solid fa-info-circle" /> Consola limpia. Esperando ejecución...</div>
              )}
              {terminalState === "executing" && (
                <div className="terminal-placeholder-sql text-indigo-400"><i className="fa-solid fa-circle-notch fa-spin" /> Ejecutando consulta...</div>
              )}
              {terminalState === "error" && executionError && (
                <div className="terminal-placeholder-sql text-red-500 flex flex-col items-start gap-2">
                  <div className="font-bold mb-1"><i className="fa-solid fa-triangle-exclamation mr-1.5" /> Error de Ejecución:</div>
                  <div className="text-sm opacity-90 font-medium">
                    {executionError.mensaje || (typeof executionError === 'string' ? executionError : (executionError.message || "Error desconocido"))}
                  </div>
                  {executionError.suggestion && (
                    <div className="mt-4 p-5 bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 text-[14px] rounded-r-xl flex items-start gap-4 w-full text-left shadow-sm">
                      <div className="bg-amber-500/20 p-2.5 rounded-lg text-amber-400 flex items-center justify-center shrink-0">
                        <i className="fa-regular fa-lightbulb text-lg" />
                      </div>
                      <div className="flex-1 pt-1">
                        <strong className="block mb-1.5 text-amber-400 text-[11px] tracking-widest uppercase">
                          {executionError.isAiGenerated ? "Sugerencia de Lumi (IA)" : "Sugerencia Pedagógica"}
                        </strong>
                        <p className="text-amber-100/90 leading-relaxed font-medium">{executionError.suggestion}</p>
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
                  
                  {aiFeedback && aiFeedback.type === 'error' && (
                     <div className="mt-4 p-5 bg-gradient-to-r from-red-500/10 to-transparent border-l-4 border-red-500 text-[14px] rounded-r-xl flex items-start gap-4 w-full text-left shadow-sm mb-5">
                       <div className="bg-red-500/20 p-2.5 rounded-lg text-red-400 flex items-center justify-center shrink-0">
                         <i className="fa-solid fa-robot text-lg" />
                       </div>
                       <div className="flex-1 pt-1">
                         <strong className="block mb-1.5 text-red-400 text-[11px] tracking-widest uppercase">
                           Retroalimentación de Lumi (IA)
                         </strong>
                         <p className="text-red-200/90 leading-relaxed font-medium">{aiFeedback.text}</p>
                       </div>
                     </div>
                  )}
                  
                  {executionResult.columns && executionResult.columns.length > 0 && (
                    <div className="mt-2">
                      <table className="w-full text-left text-[13px] border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead>
                          <tr>{executionResult.columns.map((col, idx) => (<th key={idx} className="px-4 py-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">{col}</th>))}</tr>
                        </thead>
                        <tbody>
                          {executionResult.rows && executionResult.rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="bg-[#121212] hover:bg-[#18181b] transition-colors shadow-sm">
                              {executionResult.columns.map((col, colIdx) => (
                                <td key={colIdx} className={`px-4 py-3 text-muted-foreground ${colIdx === 0 ? 'rounded-l-xl' : ''} ${colIdx === executionResult.columns.length - 1 ? 'rounded-r-xl' : ''}`}>
                                  {row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* PANEL DERECHO: Acciones y Asignación */}
        <aside className="panel-sidebar-sql bg-panel">
          <div className="sidebar-section-sql !pt-5 px-4">
            
            {/* Controles de ejecución reubicados al header del editor */}

            <div className="mb-2">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  Objetivos de la práctica
                </h3>
              </div>
              
              <div className="text-muted text-[13px] leading-relaxed mb-5">
                {parsedStatement ? (
                  <div className="space-y-3">
                    <details className="group bg-[#121212] rounded-xl overflow-hidden shadow-sm transition-all">
                      <summary className="py-2.5 px-3 cursor-pointer font-bold text-[11px] flex items-center justify-between text-muted hover:text-foreground hover:bg-white/5 transition-colors">
                        <span className="flex items-center gap-2"><i className="fa-regular fa-file-lines text-indigo-400/70" /> VER ENUNCIADO</span>
                        <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-open:rotate-180"></i>
                      </summary>
                      <div className="py-2 text-muted text-xs leading-relaxed bg-main/50 rounded-b-lg px-2 mt-1">
                        {parsedStatement.historia}
                      </div>
                    </details>
                    
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="text-[10px] text-muted/70 mb-1 leading-tight flex items-start gap-1.5 py-1 px-1 relative z-10">
                        <i className="fa-regular fa-lightbulb text-amber-500/70 mt-0.5"></i>
                        <span>Selecciona un objetivo previo si necesitas ejecutar su consulta para recordar un dato.</span>
                      </div>
                      
                      {parsedStatement.pasos && parsedStatement.pasos.map((paso, idx) => {
                        const status = stepsStatus[idx] || (idx < currentStep ? 'correct' : 'neutral');
                        const isActive = activeStep === idx;
                        
                        let iconClass = "fa-circle text-transparent";
                        let ringClass = "border-border bg-main";
                        
                        if (status === 'correct') {
                          iconClass = "fa-check text-emerald-500";
                          ringClass = "border-emerald-500/30 bg-emerald-500/10";
                        } else if (status === 'incorrect') {
                          iconClass = "fa-xmark text-red-500";
                          ringClass = "border-red-500/30 bg-red-500/10";
                        } else if (status === 'evaluating') {
                          iconClass = "fa-circle-notch fa-spin text-indigo-400";
                          ringClass = "border-indigo-400/50 bg-indigo-500/10 ring-2 ring-indigo-500/20";
                        } else if (isActive) {
                          iconClass = "fa-circle text-indigo-400 text-[6px]";
                          ringClass = "border-indigo-400 bg-indigo-500/10 ring-2 ring-indigo-500/20";
                        }
                        
                        let bgClass = "hover:bg-white/5";
                        if (isActive) bgClass = "bg-indigo-500/5";
                        else if (idx > currentStep) bgClass = "opacity-40 cursor-not-allowed";
                        
                        return (
                          <div 
                            key={idx} 
                            className={`p-2.5 rounded-xl transition-all cursor-pointer relative z-10 flex items-start gap-3 ${bgClass}`}
                            onClick={() => {
                              if (idx <= currentStep) {
                                setActiveStep(idx);
                                if (isReadOnly && practiceData?.submission?.steps) {
                                  const savedStep = practiceData.submission.steps.find(s => s.stepIndex === idx);
                                  setSqlQuery(savedStep?.finalSqlCode || "-- Sin código registrado para este objetivo --");
                                  setStepHistory(savedStep?.errorLogs || []);
                                }
                              }
                            }}
                          >
                            <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center mt-1 transition-all ${ringClass}`}>
                              <i className={`fa-solid ${iconClass} text-[10px]`}></i>
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold text-[10px] uppercase tracking-wider mb-0.5 ${isActive ? 'text-indigo-400' : 'text-muted'}`}>
                                Objetivo {idx + 1}
                              </div>
                              <p className={`text-[13px] leading-snug ${isActive ? 'text-foreground' : 'text-muted/80'}`}>
                                {paso.instruction}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{generatedStatement || "Cargando..."}</div>
                )}
              </div>
              
              <div className="pt-4 mt-6">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                  Funciones y Cláusulas Esperadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {requiredFunctions.length > 0 ? requiredFunctions.map((func, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-main rounded text-xs font-mono font-bold text-muted">
                      {func}
                    </span>
                  )) : (
                    <span className="text-xs text-muted italic">No hay funciones específicas requeridas.</span>
                  )}
                </div>
              </div>

              {/* Botón de Entrega Final */}
              {parsedStatement && parsedStatement.pasos && currentStep >= parsedStatement.pasos.length && !isReadOnly && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={() => submitFinalPractice(executionResult)}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><i className="fa-solid fa-circle-notch fa-spin"></i> Entregando...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> Entregar Práctica</>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-muted mt-3">Has completado todos los objetivos. Ya puedes entregar.</p>
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function PracticaSQLPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-main text-foreground"><i className="fa-solid fa-spinner fa-spin mr-2" /> Cargando interfaz...</div>}>
      <PracticaSQLContent />
    </Suspense>
  );
}
