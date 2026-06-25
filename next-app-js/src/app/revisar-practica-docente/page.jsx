"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./revisar-practica-docente.css";

export default function RevisarPracticaDocentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId");
  
  const [students, setStudents] = useState([]);
  const [practiceInfo, setPracticeInfo] = useState({ title: '', description: '', deadline: null });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  // 'list' or 'review'
  const [viewMode, setViewMode] = useState('list');
  // 'ENTREGADOS' or 'ASIGNADOS'
  const [filterMode, setFilterMode] = useState('ENTREGADOS');

  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEntregadosOpen, setIsEntregadosOpen] = useState(true);
  const [isNoEntregadosOpen, setIsNoEntregadosOpen] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetch(`/api/proxy/practices/${challengeId}/submissions`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setPracticeInfo({
              title: data.data.practiceTitle || "Práctica",
              description: data.data.practiceDescription || "Sin descripción asignada.",
              deadline: data.data.deadline || null
            });
            const fetchedStudents = data.data.students.map(sub => ({
              id: sub.studentId,
              submissionId: sub.submissionId,
              name: sub.studentName,
              email: sub.studentEmail,
              status: sub.status,
              submitted: sub.status !== "NOT_STARTED",
              sqlQuery: sub.sqlQuery || "",
              executionResult: sub.executionResult,
              checklist: sub.checklist || []
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

  // Restaurar rúbrica sugerida al cambiar de alumno
  useEffect(() => {
    if (selectedStudent) {
      setChecklist(selectedStudent.checklist.map((c) => ({
        ...c,
        teacherPoints: c.teacherPoints // Inicializa con iaPoints o lo que ya tenia el profe
      })));
    } else {
      setChecklist([]);
    }
  }, [selectedStudent]);

  const totalMaxScore = checklist.reduce((sum, item) => sum + item.maxPoints, 0);
  const [grade, setGrade] = useState(0);
  
  useEffect(() => {
    setGrade(checklist.reduce((sum, item) => sum + item.teacherPoints, 0));
  }, [checklist]);

  const handlePointChange = (id, newPoints) => {
    let val = parseInt(newPoints);
    if (isNaN(val)) val = 0;
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, teacherPoints: val } : item)
    );
  };

  const isClosed = practiceInfo.deadline ? new Date(practiceInfo.deadline) < new Date() : false;
  
  const entregados = students.filter(s => s.submitted);
  const noEntregados = students.filter(s => !s.submitted);

  const displayedStudents = (filterMode === 'ENTREGADOS' ? entregados : noEntregados).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmGrade = async () => {
    if (!selectedStudent || !selectedStudent.submissionId) return;
    setIsSubmitting(true);
    try {
      const payload = {
        submissionId: selectedStudent.submissionId,
        evaluations: checklist.map(c => ({
          checklistItemId: c.id,
          teacherComplies: c.teacherPoints === c.maxPoints
        }))
      };

      const res = await fetch('/api/proxy/evaluations/teacher-grade', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert(`Calificación de ${grade}/${totalMaxScore} confirmada con éxito.`);
        setViewMode('list');
      } else {
        alert("Error al confirmar calificación");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStudent = () => {
    // Busca el siguiente alumno en la misma lista
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

  const handleBackToFeed = () => {
    router.back();
  };

  const openReview = (student) => {
    setSelectedStudent(student);
    setViewMode('review');
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-indigo-600 bg-main"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando entregas...</div>;
  }

  // --- MODO LISTA (GRID) ---
  if (viewMode === 'list') {
    return (
      <div className="animate-fade-in relative p-8 h-screen overflow-y-auto bg-main text-foreground flex flex-col">
        <header className="mb-8 flex items-center justify-between bg-panel p-6 rounded-2xl border border-border shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="btn-icon-back-revisar hover:bg-input p-3 rounded-full transition-colors"
              onClick={handleBackToFeed}
              title="Volver al feed del laboratorio"
            >
              <i className="fa-solid fa-arrow-left text-xl text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{practiceInfo.title}</h1>
              <p className="text-muted">Revisión de entregas de los estudiantes</p>
            </div>
          </div>
        </header>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer hover:-translate-y-1 ${filterMode === 'ENTREGADOS' ? 'border-accent bg-accent/5 ring-2 ring-accent shadow-md' : 'border-border bg-panel hover:border-accent/50'}`}
            onClick={() => setFilterMode('ENTREGADOS')}
          >
            <div className="text-left">
              <h3 className={`font-bold text-xl mb-1 ${filterMode === 'ENTREGADOS' ? 'text-accent' : 'text-foreground group-hover:text-accent/80'}`}>
                Entregados
              </h3>
              <p className="text-sm text-muted">Alumnos que han enviado su práctica</p>
            </div>
            <div className={`text-5xl font-black ${filterMode === 'ENTREGADOS' ? 'text-accent' : 'text-muted/50'}`}>
              {entregados.length}
            </div>
          </button>

          <button 
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer hover:-translate-y-1 ${filterMode === 'ASIGNADOS' ? 'border-[var(--danger-red)] bg-[var(--danger-red)]/5 ring-2 ring-[var(--danger-red)] shadow-md' : 'border-border bg-panel hover:border-[var(--danger-red)]/50'}`}
            onClick={() => setFilterMode('ASIGNADOS')}
          >
            <div className="text-left">
              <h3 className={`font-bold text-xl mb-1 ${filterMode === 'ASIGNADOS' ? 'text-[var(--danger-red)]' : 'text-foreground group-hover:text-[var(--danger-red)]/80'}`}>
                {isClosed ? 'Sin Entregar' : 'Asignados'}
              </h3>
              <p className="text-sm text-muted">
                {isClosed ? 'Alumnos que no enviaron a tiempo' : 'Alumnos que aún no han entregado'}
              </p>
            </div>
            <div className={`text-5xl font-black ${filterMode === 'ASIGNADOS' ? 'text-[var(--danger-red)]' : 'text-muted/50'}`}>
              {noEntregados.length}
            </div>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6 relative max-w-md mx-auto sm:mx-0">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-border rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12">
          {displayedStudents.map(student => (
            <div key={student.id} className="student-review-card bg-panel border border-border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent/20 to-accent/40 flex items-center justify-center text-accent text-2xl font-bold mb-4 shadow-inner">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-foreground mb-1 w-full truncate px-2" title={student.name}>{student.name}</h3>
              <p className="text-xs text-muted mb-4 truncate w-full px-2" title={student.email}>{student.email || "Sin correo"}</p>
              
              <div className="mb-6">
                {student.status === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <i className="fa-solid fa-check-double mr-1"></i> Calificado
                  </span>
                )}
                {student.status === 'PENDING' && (
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                    <i className="fa-solid fa-clock mr-1"></i> Entregado
                  </span>
                )}
                {student.status === 'NOT_STARTED' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isClosed ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    <i className={`fa-solid ${isClosed ? 'fa-xmark' : 'fa-hourglass-start'} mr-1`}></i> 
                    {isClosed ? 'Sin Entregar' : 'Pendiente'}
                  </span>
                )}
              </div>

              {student.status !== 'NOT_STARTED' ? (
                <button 
                  onClick={() => openReview(student)}
                  className="w-full mt-auto py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-regular fa-eye"></i> Ver entrega
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full mt-auto py-2.5 rounded-xl bg-input text-muted font-semibold cursor-not-allowed border border-border border-dashed"
                >
                  <i className="fa-solid fa-ban"></i> Sin contenido
                </button>
              )}
            </div>
          ))}

          {displayedStudents.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted bg-panel border border-border border-dashed rounded-3xl">
              <i className="fa-solid fa-user-slash text-5xl mb-4 opacity-50 text-indigo-500"></i>
              <p className="text-lg">No se encontraron alumnos en esta categoría.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MODO REVIEW ---
  return (
    <div className="revisar-practica-wrapper animate-fade-in animate-scale-up relative">
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        className={`absolute top-[100px] z-[200] group text-muted hover:text-indigo-600 w-8 h-8 flex items-center justify-center rounded-full bg-panel border border-border shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'left-4' : 'left-[304px]'}`}
        title={isSidebarCollapsed ? "Expandir lista" : "Contraer lista"}
      >
        <i className={`fa-solid ${isSidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"} text-sm transition-transform duration-300 group-hover:scale-110`}></i>
      </button>

      {/* Sidebar with student list */}
      <aside className={`students-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="students-sidebar-inner">
          <div className="sidebar-header">
            <h2>Lista de Laboratorio</h2>
            <div className="relative flex items-center w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3 text-muted text-sm"></i>
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sidebar-search w-full !pl-9"
              />
            </div>
          </div>
        
        {entregados.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 && (
          <div className="students-group-revisar">
            <button 
              className="group-title-revisar collapsible-title-revisar" 
              onClick={() => setIsEntregadosOpen(!isEntregadosOpen)}
            >
              <span>Entregaron</span>
              <i className={`fa-solid fa-chevron-down transition-transform ${!isEntregadosOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isEntregadosOpen && (
              <ul className="students-list">
                {entregados.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                  <li
                    key={student.id}
                    className={selectedStudent?.id === student.id ? "selected" : ""}
                    onClick={() => setSelectedStudent(student)}
                  >
                    {student.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {noEntregados.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 && (
          <div className="students-group-revisar">
            <button 
              className="group-title-revisar collapsible-title-revisar" 
              onClick={() => setIsNoEntregadosOpen(!isNoEntregadosOpen)}
            >
              <span>{isClosed ? 'Sin Entregar' : 'Asignados'}</span>
              <i className={`fa-solid fa-chevron-down transition-transform ${!isNoEntregadosOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isNoEntregadosOpen && (
              <ul className="students-list">
                {noEntregados.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                  <li
                    key={student.id}
                    className={selectedStudent?.id === student.id ? "selected" : ""}
                    onClick={() => setSelectedStudent(student)}
                  >
                    {student.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="revisar-practica-body">
        <header className="navbar-revisar">
          <div className="nav-left-revisar">
            <button
              className="btn-icon-back-revisar"
              onClick={() => setViewMode('list')}
              title="Volver a la cuadrícula de alumnos"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
            <div className="student-header-title-revisar">
              <h1 className="student-name-revisar">{practiceInfo.title}</h1>
              <div className="student-meta-revisar">
                <span className="font-semibold text-indigo-600 uppercase text-xs tracking-wider">Evaluando a:</span>
                <span className="text-foreground font-bold">{selectedStudent?.name}</span>
                <span className="text-muted">({selectedStudent?.email})</span>
              </div>
            </div>
          </div>
          <div className="nav-right-revisar">
            <button className="btn-revisar btn-secondary-revisar" onClick={handleSkipStudent}>
              Siguiente Alumno
            </button>
            <button 
              className={`btn-revisar btn-primary-revisar ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} 
              onClick={handleConfirmGrade}
              disabled={isSubmitting || !selectedStudent?.submitted}
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-circle-notch fa-spin mr-2" /> Guardando...</>
              ) : (
                "Confirmar Calificación"
              )}
            </button>
          </div>
        </header>

        <main className="main-container-revisar">
          {selectedStudent?.submitted ? (
            <>
              {/* Left Side: Results */}
              <div className="left-panel-revisar gap-6">
                <section className="panel-revisar">
                  <h2 className="section-title-revisar">Resultados de la Práctica</h2>

                  <div className="form-group-revisar">
                    <label>Reto asignado al alumno</label>
                    <div className="instruction-display-box">
                      <p>{practiceInfo.description}</p>
                    </div>
                  </div>

                  <div className="form-group-revisar">
                    <label>Código SQL entregado</label>
                    <div className="sql-box-revisar">
                      <pre className="sql-code-revisar"><code>{selectedStudent.sqlQuery || "-- No hay código SQL entregado"}</code></pre>
                    </div>
                  </div>
                </section>

                <section className="panel-revisar">
                  <div className="form-group-revisar">
                    <label>Tabla de resultados</label>
                    <div className="table-wrapper-revisar overflow-auto border border-border rounded-xl mt-2 max-h-[400px]">
                      {selectedStudent.executionResult && selectedStudent.executionResult.columns ? (
                        <table className="result-table-revisar w-full text-left">
                          <thead className="bg-main sticky top-0 z-10">
                            <tr>
                              {selectedStudent.executionResult.columns.map((col, idx) => (
                                <th key={idx} className="p-4 border-b border-border">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedStudent.executionResult.rows && selectedStudent.executionResult.rows.map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-main transition-colors">
                                {selectedStudent.executionResult.columns.map((col, colIdx) => (
                                  <td key={colIdx} className="p-4 font-mono">{row[col]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center text-muted">
                          <i className="fa-solid fa-table border border-border p-3 rounded-xl mb-3 text-2xl"></i>
                          <p>No hay resultados de ejecución para mostrar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right side: Grading Sidebar */}
              <aside className="grading-sidebar-revisar">
                <h2 className="sidebar-title-revisar">Calificación y Rúbrica</h2>

                {/* Grading box */}
                <div className="grade-box-container-revisar">
                  <div className="grade-input-wrapper-revisar">
                    <span className="grade-label-text-revisar">Total:</span>
                    <input
                      type="number"
                      className="input-grade-revisar"
                      value={grade}
                      readOnly
                      title="La calificación se calcula automáticamente desde la lista de cotejo"
                    />
                    <span className="grade-label-text-revisar">/ {totalMaxScore}</span>
                  </div>
                  <p className="ia-grade-note-revisar">
                    *Nota: Las casillas y la calificación por defecto son sugerencias de la IA.
                  </p>
                </div>

                {/* Checklist / Lista de Cotejo */}
                <div className="form-group-revisar">
                  <label>Criterios de Evaluación</label>
                  <div className="checklist-plain-list-revisar">
                    {checklist.map((item) => {
                      const isChecked = item.teacherPoints > 0;
                      return (
                        <div key={item.id} className="checklist-plain-row-revisar">
                          <div className="checklist-plain-text-revisar">
                            <span>{item.text}</span>
                            <span className="criterio-valor-badge">{item.maxPoints} pts</span>
                          </div>
                          <label className="checklist-switch">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handlePointChange(item.id, e.target.checked ? item.maxPoints : 0)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </>
          ) : (
            <div className="empty-state-not-submitted w-full h-full flex flex-col items-center justify-center bg-panel border border-border border-dashed rounded-3xl p-12 mt-4 max-w-4xl mx-auto shadow-sm">
              <div className="w-24 h-24 rounded-full bg-input flex items-center justify-center mb-6">
                <i className="fa-solid fa-file-excel text-5xl text-muted/50"></i>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-foreground">No Entregó</h2>
              <p className="text-muted text-center max-w-md mb-8 text-lg">El estudiante <strong className="text-foreground">{selectedStudent?.name}</strong> no ha enviado la práctica o no la entregó a tiempo.</p>
              <button className="btn-revisar btn-primary-revisar px-8 py-4 rounded-xl shadow-md text-lg transition-transform hover:-translate-y-1" onClick={() => alert("Se asignó 0. Pasando al siguiente...") || handleSkipStudent()}>
                <i className="fa-solid fa-forward-step mr-2"></i> Asignar 0 y Siguiente
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
