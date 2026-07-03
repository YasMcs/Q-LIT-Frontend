"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SidebarDocente from "@/components/SidebarDocente";
import RevisarPracticaSkeleton from "@/components/skeletons/RevisarPracticaSkeleton";
import { showAlert, showConfirm } from "@/utils/alerts";
import { decodeId } from "@/utils/crypto";
import "@/app/(docente)/laboratorios/dashboard-docente.css";
import "./revisar-practica-docente.css";

export default function RevisarPracticaDocentePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background overflow-hidden relative">
        <SidebarDocente />
        <RevisarPracticaSkeleton />
      </div>
    }>
      <RevisarPracticaDocenteContent />
    </Suspense>
  );
}

function RevisarPracticaDocenteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = decodeId(searchParams.get("challengeId"));
  
  const [students, setStudents] = useState([]);
  const [practiceInfo, setPracticeInfo] = useState({ title: 'Cargando...', description: '', deadline: null, totalPoints: 100, practiceRequiredFunctions: { keywords: [] } });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manualGrade, setManualGrade] = useState("");
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('list');
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetch(`/api/proxy/practices/${challengeId}/submissions`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setPracticeInfo({
              title: data.data.practiceTitle || "Práctica",
              description: data.data.practiceDescription || "Sin descripción asignada.",
              totalPoints: data.data.totalPoints || 100,
              practiceRequiredFunctions: data.data.practiceRequiredFunctions || { keywords: [] },
              deadline: data.data.deadline || null
            });
            const fetchedStudents = data.data.students.map(sub => ({
              id: sub.studentId,
              submissionId: sub.submissionId,
              name: sub.studentName,
              email: sub.studentEmail,
              studentImage: sub.studentImage,
              status: sub.status,
              score: sub.score || 0,
              submitted: sub.status !== "NOT_STARTED",
              sqlQuery: sub.sqlQuery || "",
              steps: sub.steps || [],
              generatedStatement: sub.generatedStatement,
              executionResult: sub.executionResult
            }));
            setStudents(fetchedStudents);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [challengeId]);

  useEffect(() => {
    if (selectedStudent) {
      setManualGrade(selectedStudent.score !== undefined && selectedStudent.score !== null ? selectedStudent.score : "");
    }
  }, [selectedStudent]);

  const isClosed = practiceInfo.deadline ? new Date(practiceInfo.deadline) < new Date() : false;
  const entregados = students.filter(s => s.submitted);
  const noEntregados = students.filter(s => !s.submitted);

  const displayedStudents = (filterMode === 'ALL' ? students : filterMode === 'ENTREGADOS' ? entregados : noEntregados)
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
      return a.name.localeCompare(b.name);
    });

  const handleConfirmGrade = async () => {
    if (!selectedStudent || !selectedStudent.submissionId) return;
    
    const parsedGrade = parseInt(manualGrade);
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > practiceInfo.totalPoints) {
      await showAlert("Error", `Ingresa una calificación válida desde 0 y hasta ${practiceInfo.totalPoints}.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        submissionId: selectedStudent.submissionId,
        manualGrade: parsedGrade
      };

      const res = await fetch('/api/proxy/evaluations/teacher-grade', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await showAlert("Éxito", `Calificación de ${parsedGrade}/${practiceInfo.totalPoints} guardada con éxito.`, "success");
        // Update local state to reflect the graded status without refetching all
        setStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? { ...s, status: 'COMPLETED', score: parsedGrade } : s
        ));
        setViewMode('list');
      } else {
        await showAlert("Error", "Error al confirmar calificación", "error");
      }
    } catch (error) {
      await showAlert("Error", "Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStudent = () => {
    const currentIndex = displayedStudents.findIndex((s) => s.id === selectedStudent?.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % displayedStudents.length;
      setSelectedStudent(displayedStudents[nextIndex]);
    } else if (displayedStudents.length > 0) {
      setSelectedStudent(displayedStudents[0]);
    } else {
      setViewMode('list');
    }
  };

  const openReview = (student) => {
    setSelectedStudent(student);
    setViewMode('review');
  };

  const handleGradeChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setManualGrade('');
      return;
    }
    let numVal = parseInt(val, 10);
    if (isNaN(numVal)) return;
    if (numVal < 0) numVal = 0;
    if (numVal > practiceInfo.totalPoints) numVal = practiceInfo.totalPoints;
    setManualGrade(numVal.toString());
  };

  const handleAssignZero = async (student) => {
    const confirmed = await showConfirm("¿Estás seguro?", `¿Deseas asignar 0 puntos a ${student.name}?`);
    if (!confirmed) return;
    try {
      const res = await fetch('/api/proxy/evaluations/assign-zero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceId: challengeId, studentId: student.id })
      });
      if (res.ok) {
        setStudents(prev => prev.map(s => 
          s.id === student.id ? { ...s, status: 'COMPLETED', score: 0 } : s
        ));
      } else {
        await showAlert("Error", "Error al asignar 0", "error");
      }
    } catch (error) {
      await showAlert("Error", "Error de conexión", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden relative">
        <SidebarDocente />
        <RevisarPracticaSkeleton />
      </div>
    );
  }

  // --- MODO LISTA ---
  if (viewMode === 'list') {
    return (
      <div className="flex h-screen bg-background overflow-hidden relative">
        <SidebarDocente />
        <div className="flex-1 overflow-y-auto bg-main animate-fade-in relative p-6 md:p-10">
          
          <header className="mb-8">

            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-input text-foreground hover:bg-indigo-500 hover:text-white transition-all shadow-sm shrink-0"
                title="Volver al laboratorio"
              >
                <i className="fa-solid fa-arrow-left text-lg"></i>
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{practiceInfo.title}</h1>
                <p className="text-muted mt-2 text-lg">Revisión de entregas de los estudiantes</p>
              </div>
            </div>
          </header>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="relative w-full max-w-md">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-panel border-2 border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-semibold text-foreground focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center bg-panel border-2 border-border rounded-2xl overflow-hidden shadow-sm">
               <button 
                 onClick={() => setFilterMode(filterMode === 'ENTREGADOS' ? 'ALL' : 'ENTREGADOS')} 
                 className={`flex flex-col items-center justify-center px-8 py-3 transition-all cursor-pointer outline-none ${filterMode === 'ENTREGADOS' ? 'bg-indigo-500/10' : 'hover:bg-input'}`}
               >
                 <span className={`text-3xl font-black ${filterMode === 'ENTREGADOS' ? 'text-indigo-500' : 'text-foreground'}`}>{entregados.length}</span>
                 <span className={`text-xs uppercase font-bold tracking-wider ${filterMode === 'ENTREGADOS' ? 'text-indigo-500' : 'text-muted'}`}>Entregados</span>
               </button>
               
               <div className="w-px h-16 bg-border"></div>
               
               <button 
                 onClick={() => setFilterMode(filterMode === 'ASIGNADOS' ? 'ALL' : 'ASIGNADOS')} 
                 className={`flex flex-col items-center justify-center px-8 py-3 transition-all cursor-pointer outline-none ${filterMode === 'ASIGNADOS' ? 'bg-rose-500/10' : 'hover:bg-input'}`}
               >
                 <span className={`text-3xl font-black ${filterMode === 'ASIGNADOS' ? 'text-rose-500' : 'text-foreground'}`}>{noEntregados.length}</span>
                 <span className={`text-xs uppercase font-bold tracking-wider ${filterMode === 'ASIGNADOS' ? 'text-rose-500' : 'text-muted'}`}>
                   {isClosed ? 'No Entregadas' : 'Asignadas'}
                 </span>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {displayedStudents.map(student => (
              <div key={student.id} className="bg-panel border-2 border-border rounded-3xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-5">
                  {student.studentImage ? (
                    <img src={student.studentImage} alt={student.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-xl font-bold shadow-sm border border-indigo-500/20">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground truncate text-lg">{student.name}</h3>
                    <p className="text-xs text-muted truncate">{student.email || "Sin correo"}</p>
                  </div>
                </div>
                
                <div className="mb-6 flex gap-2 flex-wrap">
                  {student.status === 'COMPLETED' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/30">
                      Calificado ({student.score})
                    </span>
                  )}
                  {student.status === 'PENDING' && (
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-500 text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                      Entregado
                    </span>
                  )}
                  {student.status === 'NOT_STARTED' && (
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${isClosed ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}>
                      {isClosed ? 'Sin Entregar' : 'Pendiente'}
                    </span>
                  )}
                </div>

                {student.status !== 'NOT_STARTED' ? (
                  <button 
                    onClick={() => openReview(student)}
                    className="w-full mt-auto py-3 rounded-2xl border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                    {student.status === 'COMPLETED' ? (
                      <><i className="fa-solid fa-pen-to-square"></i> Modificar Evaluación</>
                    ) : (
                      <><i className="fa-regular fa-eye"></i> Revisar Entrega</>
                    )}
                  </button>
                ) : (
                  isClosed ? (
                    <button 
                      onClick={() => handleAssignZero(student)}
                      className="w-full mt-auto py-3 rounded-2xl border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      <i className="fa-solid fa-star-half-stroke"></i> Asignar 0
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full mt-auto py-3 rounded-2xl bg-input text-muted font-bold cursor-not-allowed border-2 border-border border-dashed"
                    >
                      Sin Contenido
                    </button>
                  )
                )}
              </div>
            ))}

            {displayedStudents.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted bg-panel border-2 border-border border-dashed rounded-3xl flex flex-col items-center justify-center">
                <i className="fa-solid fa-user-slash text-6xl mb-6 opacity-40 text-indigo-500"></i>
                <p className="text-xl font-bold text-foreground">No se encontraron alumnos</p>
                <p>Prueba buscando con otro término o cambia de categoría.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MODO REVIEW (FOCUS) ---
  return (
    <div className="flex flex-col h-screen bg-main overflow-hidden animate-fade-in relative z-50">
      <header className="bg-panel border-b-2 border-border px-6 py-4 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-6">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-input text-foreground hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
            onClick={() => setViewMode('list')}
            title="Volver a la vista de revisión"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </button>
          <div>
            <h1 className="text-xl font-black text-foreground">{practiceInfo.title}</h1>
            <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
              Evaluando a: <span className="text-foreground">{selectedStudent?.name}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {selectedStudent?.submitted ? (
          <>
            {/* Left Column (Code & Results) - Flex */}
            <div className="w-full lg:flex-1 flex flex-col h-full overflow-y-auto border-r-2 border-border bg-main p-6 lg:p-8 space-y-8">
              
              <section className="bg-panel rounded-3xl border-2 border-border p-8 shadow-sm">
                <h2 className="text-xl font-black text-foreground flex items-center gap-3 mb-6">
                  <i className="fa-solid fa-bars-progress text-indigo-500"></i> Desglose de Pasos
                </h2>
                
                <div className="space-y-6">
                  {selectedStudent.steps && selectedStudent.steps.length > 0 ? (
                    selectedStudent.steps.map((step, idx) => {
                      let instruction = `Paso ${step.stepIndex + 1}`;
                      try {
                        const parsed = JSON.parse(selectedStudent.generatedStatement);
                        const paso = parsed.pasos?.find(p => p.step === step.stepIndex + 1);
                        if (paso) instruction = paso.instruction;
                      } catch (e) {}

                      let errorLogsArray = [];
                      if (Array.isArray(step.errorLogs)) {
                        errorLogsArray = step.errorLogs;
                      } else if (typeof step.errorLogs === 'string') {
                        try {
                          errorLogsArray = JSON.parse(step.errorLogs);
                        } catch (e) {}
                      }
                      
                      const fallos = step.attemptsCount > 0 ? step.attemptsCount - 1 : 0;
                      const hasErrors = errorLogsArray.length > 0;

                      return (
                        <details key={idx} className="group bg-input rounded-2xl border-2 border-border mb-4 overflow-hidden">
                          <summary className="cursor-pointer p-5 flex items-center justify-between font-bold text-foreground list-none hover:bg-input/80 transition-colors select-none">
                            <div className="flex items-center gap-4">
                              <i className="fa-solid fa-chevron-right transition-transform group-open:rotate-90 text-indigo-500 shrink-0"></i>
                              <span className="leading-relaxed text-sm md:text-base pr-4">{instruction}</span>
                            </div>
                            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full shrink-0 border border-indigo-500/20 whitespace-nowrap">
                              Ver proceso
                            </span>
                          </summary>
                          
                          <div className="p-5 border-t-2 border-border/50 bg-main/30">
                            <div className="mb-4">
                              {fallos === 0 ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                                  <i className="fa-solid fa-circle-check"></i> Resuelto al primer intento
                                </span>
                              ) : (
                                <div className="flex flex-col items-start gap-2">
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                                    <i className="fa-solid fa-triangle-exclamation"></i> Logrado después de {fallos} intento(s) fallido(s)
                                  </span>
                                  {hasErrors && (
                                    <div className="w-full mt-4">
                                      <p className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                                        <i className="fa-solid fa-clock-rotate-left"></i> Historial de Errores ({errorLogsArray.length})
                                      </p>
                                      <div className="space-y-3 pl-4 border-l-2 border-indigo-500/30">
                                        {errorLogsArray.map((log, lIdx) => (
                                          <div key={lIdx} className="bg-main/50 rounded-xl p-4 border border-border/50 shadow-sm relative">
                                            <div className="absolute top-2 right-3 text-xs text-muted/50 font-mono">
                                              Intento {lIdx + 1}
                                            </div>
                                            <p className="font-mono text-indigo-400 text-xs mb-2 uppercase tracking-wider font-bold">Intentó correr:</p>
                                            <pre className="text-xs text-foreground bg-black/30 p-3 rounded-lg mb-3 overflow-x-auto border border-border/30">
                                              {log.query}
                                            </pre>
                                            <p className="font-mono text-rose-400 text-xs mb-1 uppercase tracking-wider font-bold">Error devuelto:</p>
                                            <p className="text-xs text-rose-300/80 whitespace-pre-wrap">{log.errorMessage}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="bg-[#0f111a] rounded-xl p-4 overflow-x-auto border border-border/50 shadow-inner mt-4">
                              <p className="text-xs text-muted font-mono mb-2">Consulta final exitosa:</p>
                              <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
                                <code>{step.finalSqlCode || "-- Sin código guardado"}</code>
                              </pre>
                            </div>
                          </div>
                        </details>
                      );
                    })
                  ) : (
                    <div className="text-muted italic bg-input p-6 rounded-2xl text-center border-2 border-dashed border-border">
                      El estudiante no tiene pasos registrados individuales. Su código final se muestra a continuación.
                    </div>
                  )}

                  {(!selectedStudent.steps || selectedStudent.steps.length === 0) && (
                    <div className="bg-[#0f111a] rounded-2xl p-6 overflow-x-auto border border-border/50 shadow-inner mt-4">
                      <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
                        <code>{selectedStudent.sqlQuery || "-- No hay código SQL entregado"}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Right Column (Grading) - 30% */}
            <div className="w-full lg:w-[30%] lg:min-w-[350px] bg-panel h-full overflow-hidden flex flex-col border-l-2 border-border shadow-xl">
              
              <div className="p-5 flex flex-col h-full overflow-hidden">
                <div className="mb-6 text-center shrink-0">
                  <h2 className="text-2xl font-black text-foreground">Evaluación</h2>
                  <p className="text-muted mt-1 text-sm">Revisión manual</p>
                </div>

                <div className="bg-input p-5 rounded-2xl border-2 border-border shadow-sm flex flex-col items-center shrink-0 mb-6">
                  <label className="flex items-center gap-3 text-xs font-bold text-foreground uppercase tracking-widest mb-4 text-center w-full justify-center">
                    <i className="fa-solid fa-star text-amber-500"></i> Calificación Final
                  </label>
                  
                  <div className="flex items-end justify-center gap-4 bg-main p-4 rounded-2xl border-2 border-border shadow-inner w-full">
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0" 
                        max={practiceInfo.totalPoints} 
                        value={manualGrade} 
                        onChange={handleGradeChange}
                        className="w-24 bg-transparent border-b-4 border-indigo-500 pb-1 text-5xl font-black text-indigo-500 focus:outline-none transition-all text-center placeholder-indigo-500/30"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-xl font-black text-muted mb-3 opacity-50">/ {practiceInfo.totalPoints}</span>
                  </div>
                  <p className="text-xs text-muted mt-4 text-center leading-relaxed">
                    Basado en las reincidencias y el uso de las funciones requeridas, asigna la nota final.
                  </p>
                </div>

                <div className="bg-input p-5 rounded-2xl border-2 border-border shadow-sm flex flex-col flex-1 overflow-hidden">
                  <label className="flex items-center gap-3 text-xs font-bold text-foreground uppercase tracking-widest mb-4 shrink-0">
                    <i className="fa-solid fa-list-check text-indigo-500"></i> Cláusulas Requeridas
                  </label>
                  
                  <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
                    {practiceInfo.practiceRequiredFunctions?.keywords?.length > 0 ? (
                      practiceInfo.practiceRequiredFunctions.keywords.map((kw, idx) => {
                        const used = selectedStudent.sqlQuery?.toUpperCase().includes(kw);
                        return (
                          <div key={idx} className="flex items-center gap-3 py-1">
                            <i className={`fa-solid ${used ? 'fa-check text-emerald-500' : 'fa-xmark text-rose-500'} w-4 text-center text-sm`}></i>
                            <span className={`font-mono text-sm font-semibold ${used ? 'text-foreground' : 'text-muted'}`}>{kw}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-4 bg-main rounded-xl border-2 border-dashed border-border">
                        <p className="text-muted text-xs font-medium">Esta práctica no tiene cláusulas obligatorias.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-5 border-t-2 border-border bg-panel shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <button 
                  className={`w-full py-4 rounded-xl font-black text-white text-base tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3 ${isSubmitting ? 'bg-muted cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                  onClick={handleConfirmGrade}
                  disabled={isSubmitting || !selectedStudent?.submitted}
                >
                  {isSubmitting ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Guardando...</>
                  ) : (
                    selectedStudent.status === 'COMPLETED' ? (
                      <><i className="fa-solid fa-pen-to-square"></i> Actualizar</>
                    ) : (
                      <><i className="fa-solid fa-check-double"></i> Confirmar Evaluación</>
                    )
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-main p-12">
            <div className="w-32 h-32 rounded-full bg-input flex items-center justify-center mb-8 shadow-inner border border-border">
              <i className="fa-solid fa-file-excel text-6xl text-muted/50"></i>
            </div>
            <h2 className="text-4xl font-black mb-4 text-foreground">Sin Entrega</h2>
            <p className="text-muted text-center max-w-lg mb-10 text-xl font-medium">El estudiante <strong className="text-foreground">{selectedStudent?.name}</strong> no ha enviado su código SQL o el tiempo se agotó.</p>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 text-lg transition-transform hover:-translate-y-1" onClick={handleSkipStudent}>
              Siguiente Alumno <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
