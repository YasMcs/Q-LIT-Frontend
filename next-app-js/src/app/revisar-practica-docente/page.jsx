"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./revisar-practica-docente.css";

import mockData from "@/app/api/mocks/teacher/revisar-practica.json";

// Adapter to keep the frontend working while we finish refactoring the UI
const mockStudents = mockData.entregas_alumnos.map(student => ({
  id: student.id,
  name: student.name,
  email: student.email,
  submitted: student.submitted,
  sqlQuery: student.entrega ? student.entrega.codigo_sql_alumno : ""
}));

const mockChecklist = mockData.lista_cotejo.map(c => ({
  id: c.id,
  text: c.criterio,
  maxPoints: c.puntos_maximos,
  iaPoints: c.puntos_maximos
}));

export default function RevisarPracticaDocentePage() {
  const router = useRouter();
  
  // Initialize editable checklist state from mock data
  const [checklist, setChecklist] = useState(
    mockChecklist.map((c) => ({ ...c, teacherPoints: c.iaPoints }))
  );


  const totalMaxScore = checklist.reduce((sum, item) => sum + item.maxPoints, 0);
  const totalIaScore = checklist.reduce((sum, item) => sum + item.iaPoints, 0);
  const totalTeacherScore = checklist.reduce((sum, item) => sum + item.teacherPoints, 0);

  // Synchronize overall grade with the sum of the checklist points
  const [grade, setGrade] = useState(totalTeacherScore);
  
  // Update grade whenever checklist changes
  React.useEffect(() => {
    setGrade(checklist.reduce((sum, item) => sum + item.teacherPoints, 0));
  }, [checklist]);

  const handlePointChange = (id, newPoints) => {
    let val = parseInt(newPoints);
    if (isNaN(val)) val = 0;
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, teacherPoints: val } : item)
    );
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEntregadosOpen, setIsEntregadosOpen] = useState(true);
  const [isNoEntregadosOpen, setIsNoEntregadosOpen] = useState(false);

  // Reset checklist to match IA suggestion whenever the selected student changes
  React.useEffect(() => {
    setChecklist(mockChecklist.map((c) => ({ ...c, teacherPoints: c.iaPoints })));
  }, [selectedStudent]);

  const filteredStudents = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const entregados = filteredStudents.filter(s => s.submitted);
  const noEntregados = filteredStudents.filter(s => !s.submitted);

  const handleConfirmGrade = () => {
    alert(`Calificación de ${grade}/100 confirmada con éxito.`);
    router.push("/class-feed-docente");
  };

  const handleSkipStudent = () => {
    alert("Cargando el siguiente estudiante asignado...");
    const currentIndex = mockStudents.findIndex((s) => s.id === selectedStudent.id);
    const nextIndex = (currentIndex + 1) % mockStudents.length;
    setSelectedStudent(mockStudents[nextIndex]);
  };

  const handleBack = () => {
    router.push("/class-feed-docente");
  };

  return (
    <div className="revisar-practica-wrapper animate-fade-in animate-scale-up relative">
      
      {/* Toggle Tab */}
      <button 
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        className={`absolute top-[100px] z-[200] group text-slate-400 hover:text-indigo-600 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'left-4' : 'left-[304px]'}`}
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
              <i className="fa-solid fa-magnifying-glass absolute left-3 text-slate-400 text-sm"></i>
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
                <span className="text-slate-700 font-bold">{selectedStudent.name}</span>
                <span className="text-slate-400">({selectedStudent.email})</span>
              </div>
            </div>
          </div>
          <div className="nav-right-revisar">
            <button className="btn-revisar btn-secondary-revisar" onClick={handleSkipStudent}>
              Siguiente Alumno
            </button>
            <button className="btn-revisar btn-primary-revisar" onClick={handleConfirmGrade}>
              Confirmar Calificación
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
                    <div className="table-wrapper-revisar overflow-auto border border-slate-200 rounded-xl mt-2 max-h-[400px]">
                      <table className="result-table-revisar w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr>
                            <th className="p-4 border-b border-slate-200">sku</th>
                            <th className="p-4 border-b border-slate-200">articulo</th>
                            <th className="p-4 border-b border-slate-200">precio</th>
                            <th className="p-4 border-b border-slate-200">stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono">104</td>
                            <td className="p-4">Monitor Gamer 27"</td>
                            <td className="p-4 font-mono">4500.00</td>
                            <td className="p-4 font-mono">85</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono">102</td>
                            <td className="p-4">Teclado Mecánico RGB</td>
                            <td className="p-4 font-mono">1250.00</td>
                            <td className="p-4 font-mono">42</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono">109</td>
                            <td className="p-4">Mouse Inalámbrico</td>
                            <td className="p-4 font-mono">680.00</td>
                            <td className="p-4 font-mono">15</td>
                          </tr>
                        </tbody>
                      </table>
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
