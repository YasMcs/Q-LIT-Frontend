"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ChallengeManageCard from "@/components/ChallengeManageCard";
import PracticeDetailModal from "@/components/PracticeDetailModal";
import StatBox from "@/components/StatBox";


import "./class-feed-docente.css";

export default function ClassFeedDocentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classroomId = searchParams.get("classroomId");
  const codeParam = searchParams.get("code");
  const titleParam = searchParams.get("title");
  
  const [classInfo, setClassInfo] = useState({
    title: titleParam || "Cargando...",
    code: codeParam || "..."
  });
  const [students, setStudents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState("todas");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("docente-feed-sidebar-open");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }

    if (classroomId) {
      // Fetch classroom and students
      fetch(`/api/proxy/classrooms/${classroomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            const cls = data.data;
            if (!titleParam) setClassInfo(prev => ({ ...prev, title: cls.name }));
            if (!codeParam) setClassInfo(prev => ({ ...prev, code: cls.inviteCode }));
            
            // Map enrollments to students
            if (cls.enrollments) {
              const mappedStudents = cls.enrollments.map(e => ({
                id: e.user.id,
                name: e.user.name || "Sin Nombre"
              }));
              setStudents(mappedStudents);
            }
          }
        })
        .catch(err => console.error("Error al cargar datos del laboratorio:", err));

      // Fetch practices
      fetch(`/api/proxy/practices/classroom/${classroomId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map(p => ({
              ...p,
              subtitle: p.description ? p.description.substring(0, 50) + "..." : "Práctica SQL",
              fecha_asignacion: p.createdAt,
              pendingCount: 0,
              status: p.deadline && new Date(p.deadline) < new Date() ? "closed" : "active"
            }));
            setChallenges(formatted);
          }
        })
        .catch(err => console.error("Error al cargar prácticas:", err));
    }
  }, [classroomId, titleParam, codeParam]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("docente-feed-sidebar-open", JSON.stringify(newState));
  };

  const handleAddChallenge = () => {
    router.push(`/crear-practica-docente?classroomId=${classroomId || ''}`);
  };

  const handleChallengeClick = (id) => {
    const practice = challenges.find(p => p.id === id);
    setSelectedPractice(practice);
  };

  const handleReview = (id) => {
    router.push(`/revisar-practica-docente?challengeId=${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/crear-practica-docente?editId=${id}`);
  };

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleChangeDateClick = (id) => {
    const challenge = challenges.find(c => c.id === id);

    let dPart = "";
    let tPart = "";
    if (challenge?.deadline) {
      try {
        const dt = new Date(challenge.deadline);
        if (!isNaN(dt.getTime())) {
          dPart = dt.toISOString().split("T")[0];
          tPart = dt.toISOString().split("T")[1].substring(0, 5);
        }
      } catch(e) {
        // ignore
      }
    }
    if (!dPart || !tPart) {
      dPart = "2024-06-15";
      tPart = "23:59";
    }

    setNewDate(dPart);
    setNewTime(tPart);
    
    setSelectedChallengeId(id);
    setIsDateModalOpen(true);
  };

  const submitDateChange = async () => {
    if (!newDate || !newTime) {
      alert("Por favor selecciona una fecha y hora válidas.");
      return;
    }

    const isoDateTime = new Date(`${newDate}T${newTime}:00`).toISOString();

    try {
      const res = await fetch(`/api/proxy/practices/${selectedChallengeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: isoDateTime })
      });

      if (!res.ok) {
        throw new Error("Error al guardar la nueva fecha en el servidor");
      }

      setChallenges(challenges.map(c => {
        if (c.id === selectedChallengeId) {
          return { ...c, status: "active", deadline: isoDateTime };
        }
        return c;
      }));
      setIsDateModalOpen(false);
      setNewDate("");
      setNewTime("");
      alert("Fecha límite actualizada con éxito.");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta práctica? Esta acción no se puede deshacer.")) {
      try {
        const res = await fetch(`/api/proxy/practices/${id}`, {
          method: "DELETE"
        });
        
        if (!res.ok) {
          throw new Error("Error al eliminar la práctica en el servidor");
        }
        
        setChallenges(challenges.filter(c => c.id !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (filterStatus === "todas") return true;
    return c.status === filterStatus;
  });

  return (
    <>
      {/* Main Container */}
      <div className="feed-app-container">
        {/* Header with Breadcrumbs & Class Code */}
        <header className="feed-header">
          <div className="feed-breadcrumbs">
            <Link href="/dashboard-docente">Tus Laboratorios</Link>
            <i className="fa-solid fa-chevron-right" />
            <span className="current-class">{classInfo.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="feed-code-badge">Código: {classInfo.code}</div>
            <button 
              onClick={toggleSidebar}
              className="p-2 text-muted hover:text-accent hover:bg-input rounded-lg transition-colors"
              title={isSidebarOpen ? "Ocultar panel de estudiantes" : "Mostrar panel de estudiantes"}
            >
              <i className="fa-solid fa-users text-xl"></i>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="feed-workspace flex">
          {/* Main Panel */}
          <main className="feed-main-panel flex-1">
            {/* Toolbar: Tabs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              {/* Premium Segmented Control Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-panel border border-border">
                  <i className="fa-solid fa-filter text-muted-foreground" title="Filtrar prácticas" />
                </div>
                <div className="flex bg-panel border border-border p-1.5 rounded-xl self-start sm:self-auto">
                  <button 
                    onClick={() => setFilterStatus("todas")} 
                    className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg ${filterStatus === 'todas' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted hover:text-foreground hover:bg-input'}`}
                  >
                    Todas
                  </button>
                  <button 
                    onClick={() => setFilterStatus("active")} 
                    className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg ${filterStatus === 'active' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted hover:text-foreground hover:bg-input'}`}
                  >
                    Activas
                  </button>
                  <button 
                    onClick={() => setFilterStatus("closed")} 
                    className={`px-4 py-2 text-sm font-semibold transition-all rounded-lg ${filterStatus === 'closed' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted hover:text-foreground hover:bg-input'}`}
                  >
                    Vencidas
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button className="feed-btn-action-master whitespace-nowrap" onClick={handleAddChallenge}>
                <i className="fa-solid fa-plus" /> Nueva Práctica
              </button>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="p-8 text-center bg-panel border border-border rounded-xl">
                  <p className="text-muted">No hay laboratorios en esta categoría.</p>
                </div>
              ) : (
                filteredChallenges.map((challenge) => (
                  <ChallengeManageCard
                    key={challenge.id}
                    id={challenge.id}
                    title={challenge.title}
                    subtitle={challenge.subtitle}
                    assignDate={challenge.fecha_asignacion ? new Date(challenge.fecha_asignacion).toLocaleDateString("es-ES") : ''}
                    deadline={challenge.deadline}
                    closeLateSubmissions={challenge.closeLateSubmissions}
                    pendingCount={challenge.pendingCount}
                    status={challenge.status}
                    onClick={handleChallengeClick}
                    onReview={handleReview}
                    onEdit={handleEdit}
                    onChangeDate={handleChangeDateClick}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar for Students */}
          {isSidebarOpen && (
            <aside className="w-80 flex-shrink-0 border-l border-border bg-panel p-6 overflow-y-auto animate-fade-in hidden lg:block">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-foreground">Estudiantes ({students.length})</h2>
                <button onClick={toggleSidebar} className="text-muted hover:text-foreground transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-[var(--bg-main)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-input text-accent flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{student.name}</span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-panel rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border">
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-[var(--bg-main)]">
              <h2 className="text-lg font-bold text-foreground">Cambiar Fecha Límite</h2>
              <button 
                onClick={() => setIsDateModalOpen(false)}
                className="text-muted hover:text-foreground transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Fecha de Entrega
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-border bg-[var(--bg-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all font-medium text-foreground"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Hora Límite
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 border border-border bg-[var(--bg-main)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all font-medium text-foreground"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted mt-4">
                Al establecer una nueva fecha, la asignación se reabrirá automáticamente si estaba vencida.
              </p>
            </div>

            <div className="px-6 py-4 bg-[var(--bg-main)] border-t border-border flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-foreground bg-panel border border-border hover:bg-input transition-all"
                onClick={() => setIsDateModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-accent hover:opacity-90 hover:shadow-lg transition-all"
                onClick={submitDateChange}
              >
                Actualizar Límite
              </button>
            </div>
          </div>
        </div>
      )}

      <PracticeDetailModal 
        isOpen={!!selectedPractice}
        onClose={() => setSelectedPractice(null)}
        practice={selectedPractice}
        role="teacher"
        onAction={handleReview}
        onEdit={() => {
          setSelectedPractice(null);
          handleEdit(selectedPractice?.id);
        }}
        onChangeDate={() => {
          setSelectedPractice(null);
          handleChangeDateClick(selectedPractice?.id);
        }}
        onDelete={() => {
          setSelectedPractice(null);
          handleDelete(selectedPractice?.id);
        }}
      />
    </>
  );
}
