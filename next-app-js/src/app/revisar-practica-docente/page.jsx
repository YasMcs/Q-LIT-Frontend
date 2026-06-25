"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./revisar-practica-docente.css";

export default function RevisarPracticaDocentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId");
  
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

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
            const fetchedStudents = data.data.map(sub => ({
              id: sub.studentId,
              submissionId: sub.submissionId,
              name: sub.studentName,
              submitted: sub.status !== "IN_PROGRESS",
              sqlQuery: sub.sqlQuery || "",
              executionResult: sub.executionResult,
              checklist: sub.checklist || []
            }));
            setStudents(fetchedStudents);
            if (fetchedStudents.length > 0) {
              setSelectedStudent(fetchedStudents[0]);
            }
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
  const totalIaScore = checklist.reduce((sum, item) => sum + item.iaPoints, 0);
  const totalTeacherScore = checklist.reduce((sum, item) => sum + item.teacherPoints, 0);

  // Calificación general sincronizada con la rúbrica
  const [grade, setGrade] = useState(0);
  
  // Actualización automática de la calificación
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

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const entregados = filteredStudents.filter(s => s.submitted);
  const noEntregados = filteredStudents.filter(s => !s.submitted);

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
        router.push("/class-feed-docente");
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
    const currentIndex = students.findIndex((s) => s.id === selectedStudent?.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % students.length;
      setSelectedStudent(students[nextIndex]);
    }
  };

  const handleBack = () => {
    router.push("/class-feed-docente");
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-indigo-600 bg-main"><i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando entregas...</div>;
  }

  return (
    <div className="revisar-practica-wrapper animate-fade-in animate-scale-up relative">
      
      {/* Toggle Tab */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        className={`absolute top-[100px] z-[200] group text-muted hover:text-indigo-600 w-8 h-8 flex items-center justify-center rounded-full bg-panel border border-border shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'left-4' : 'left-[304px]'}`}
        title={isSidebarCollapsed ? "Expandir lista de alumnos" : "Contraer lista de alumnos"}
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
        
        {entregados.length > 0 && (
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
                {entregados.map((student) => (
                  <li
                    key={student.id}
                    className={selectedStudent.id === student.id ? "selected" : ""}
                    onClick={() => setSelectedStudent(student)}
                  >
                    {student.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {noEntregados.length > 0 && (
          <div className="students-group-revisar">
            <button 
              className="group-title-revisar collapsible-title-revisar" 
              onClick={() => setIsNoEntregadosOpen(!isNoEntregadosOpen)}
            >
              <span>No Entregaron</span>
              <i className={`fa-solid fa-chevron-down transition-transform ${!isNoEntregadosOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isNoEntregadosOpen && (
              <ul className="students-list">
                {noEntregados.map((student) => (
                  <li
                    key={student.id}
                    className={selectedStudent.id === student.id ? "selected" : ""}
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
              onClick={handleBack}
              title="Volver al feed del laboratorio"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
            <div className="student-header-title-revisar">
              <h1 className="student-name-revisar">Práctica 1: SELECT Básico</h1>
              <div className="student-meta-revisar">
                <span className="font-semibold text-indigo-600 uppercase text-xs tracking-wider">Evaluando a:</span>
                <span className="text-foreground font-bold">{selectedStudent.name}</span>
                <span className="text-muted">({selectedStudent.email})</span>
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
              disabled={isSubmitting}
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
          {selectedStudent.submitted ? (
            <>
              {/* Left Side: Results */}
              <div className="left-panel-revisar gap-6">
                <section className="panel-revisar">
                  <h2 className="section-title-revisar">Resultados de la Práctica</h2>

                  <div className="form-group-revisar">
                    <label>Reto asignado al alumno</label>
                    <div className="instruction-display-box">
                      <p>Muestra todos los campos de la tabla <strong>productos</strong> cuyo <strong>precio</strong> sea estrictamente superior a 150.00 pesos. El resultado debe presentarse ordenado de mayor a menor según el volumen de <strong>stock</strong> disponible, limitando el resultado a sus primeros 5 registros.</p>
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
            <div className="empty-state-not-submitted">
              <i className="fa-solid fa-file-excel"></i>
              <h2>No Entregó</h2>
              <p>El estudiante <strong>{selectedStudent.name}</strong> no envió la práctica a tiempo.</p>
              <button className="btn-revisar btn-primary-revisar" onClick={() => alert("Se asignó 0. Pasando al siguiente...") || handleSkipStudent()}>
                Asignar 0 y Siguiente
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
