"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CustomSelect from "@/components/CustomSelect";
import DirectorioSkeleton from "@/components/skeletons/DirectorioSkeleton";
import "./directorio-docente.css";

export default function DirectorioDocentePage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar las clases/laboratorios activos del docente para llenar el dropdown
  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/proxy/classrooms?teacherId=${session.user.id}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.data) {
            setClassrooms(resData.data);
          }
        })
        .catch(err => console.error("Error al cargar laboratorios:", err));
    }
  }, [session]);

  // 2. Cargar la lista de alumnos dinámica de acuerdo al filtro de laboratorios
  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      fetch(`/api/proxy/classrooms/teacher/students?teacherId=${session.user.id}&classroomId=${filterClass}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.students) {
            setStudents(resData.students);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error al cargar alumnos:", err);
          setLoading(false);
        });
    }
  }, [session, filterClass]);

  // Mapear opciones del filtro dropdown por nombre de grupo
  const filterOptions = [
    { value: "all", label: "Todos los laboratorios" },
    ...classrooms.map(c => {
      const groupName = c.group || c.inviteCode || "";
      const label = groupName.toLowerCase().startsWith("grupo") ? groupName : `Grupo ${groupName}`;
      return { value: c.id, label };
    })
  ];

  // Aplicar filtro de búsqueda por texto localmente
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.group.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Limpiar el estudiante seleccionado si tras filtrar ya no aparece en la lista
  useEffect(() => {
    if (selectedStudent && !filteredStudents.some(s => s.id === selectedStudent.id)) {
      setSelectedStudent(null);
    }
  }, [filteredStudents, selectedStudent]);

  if (loading) {
    return <DirectorioSkeleton />;
  }

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
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div className="detail-header">
                  <div className="detail-header-avatar">
                    {selectedStudent.image ? (
                      <img src={selectedStudent.image} alt={selectedStudent.name} style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover' }} />
                    ) : (
                      selectedStudent.name.charAt(0)
                    )}
                  </div>
                  <div className="detail-header-info">
                    <h2>{selectedStudent.name}</h2>
                    <p>Grupo {selectedStudent.group}</p>
                    <span className="text-sm text-muted mt-1">{selectedStudent.email}</span>
                  </div>
                </div>

                <div className="detail-body">
                  <div className="practices-list">
                    <h3 className="practices-list-title">Historial de Entregas</h3>
                    {selectedStudent.practices && selectedStudent.practices.length > 0 ? (
                      selectedStudent.practices.map(prac => (
                        <div key={prac.id} className="practice-history-card">
                          <div>
                            <div className="prac-title">{prac.title}</div>
                            <div className="prac-date">{prac.date}</div>
                          </div>
                          <div className={`prac-score ${prac.score === 0 ? 'score-bad' : prac.score >= 80 ? 'score-good' : 'score-pending'}`}>
                            {prac.score === 0 && prac.date === "No entregada" ? "No entregado" : `${prac.score}/100`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted italic text-sm text-center py-4">Este laboratorio no tiene prácticas asignadas aún.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Estudiantes (Barra Derecha) */}
          <div className="directorio-list-panel">
            <div className="directorio-list-wrap">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">
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
                      <div className="student-avatar" style={{ overflow: 'hidden' }}>
                        {student.image ? (
                          <img src={student.image} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          student.name.charAt(0)
                        )}
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
