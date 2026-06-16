"use client";
import React, { useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import "./directorio-docente.css";

import mockData from "@/app/api/mocks/teacher/directorio.json";

const mockStudents = mockData.students;

export default function DirectorioDocentePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filterOptions = [
    { value: "all", label: "Todos los laboratorios" },
    { value: "A", label: "Grupo A" },
    { value: "B", label: "Grupo B" }
  ];

  const filteredStudents = mockStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.group.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === "all" || s.group === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <>
      <main className="directorio-main animate-fade-in">
        <header className="directorio-header">
          <div>
            <h1>Alumnos</h1>
            <p>Busca alumnos y consulta su rendimiento específico.</p>
          </div>
          <div className="directorio-filters">
            <CustomSelect 
              options={filterOptions} 
              value={filterClass} 
              onChange={setFilterClass} 
              icon="fa-filter"
            />
            <div className="directorio-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Buscar alumno..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <section className="directorio-content">
          {/* Panel Central de Detalle */}
          <div className="directorio-detail-panel">
            {!selectedStudent ? (
              <div className="detail-empty-state">
                <i className="fa-regular fa-hand-pointer"></i>
                <p>Selecciona un alumno de la lista derecha para ver su perfil completo.</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="detail-header">
                  <div className="detail-header-avatar">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="detail-header-info">
                    <h2>{selectedStudent.name}</h2>
                    <p>Grupo {selectedStudent.group}</p>
                    <span className="text-sm text-slate-500 mt-1">{selectedStudent.email}</span>
                  </div>
                </div>

                <div className="detail-body">
                  <div className="practices-list">
                    <h3 className="practices-list-title">Historial de Entregas</h3>
                    {selectedStudent.practices.map(prac => (
                      <div key={prac.id} className="practice-history-card">
                        <div>
                          <div className="prac-title">{prac.title}</div>
                          <div className="prac-date">{prac.date}</div>
                        </div>
                        <div className={`prac-score ${prac.score === 0 ? 'score-bad' : prac.score >= 80 ? 'score-good' : 'score-pending'}`}>
                          {prac.score === 0 ? "No entregado" : `${prac.score}/100`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Estudiantes (Barra Derecha) */}
          <div className="directorio-list-panel">
            <div className="directorio-list-wrap">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No se encontraron alumnos.
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`directorio-student-item ${selectedStudent?.id === student.id ? "active" : ""}`}
                  >
                    <div className="student-list-info">
                      <div className="student-avatar">
                        {student.name.charAt(0)}
                      </div>
                      <div className="student-name-info">
                        <strong>{student.name}</strong>
                        <span>Grupo {student.group}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
