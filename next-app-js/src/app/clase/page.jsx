"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PracticeItemCard from "@/components/PracticeItemCard";
import PracticeDetailModal from "@/components/PracticeDetailModal";
import JoinClassModal from "@/components/JoinClassModal";
import ClassFeedAlumnoSkeleton from "@/components/skeletons/ClassFeedAlumnoSkeleton";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import PrivacyNoticeModal from "@/components/PrivacyNoticeModal";
import { encodeId } from "@/utils/crypto";
import { showAlert, showConfirm } from "@/utils/alerts";

export default function ClassFeedAlumnoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [classrooms, setClassrooms] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [classInfo, setClassInfo] = useState({ title: "Cargando...", envStatus: "" });
  const [practices, setPractices] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all"); 
  
  // isEnrolled = tiene al menos UNA clase (activa o archivada)
  // hasActiveOnly = tiene 1 activa y 0 archivadas (flujo directo al feed sin selector)
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasArchivedOnly, setHasArchivedOnly] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);


  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchData = async (selectedId = null) => {
    try {
      // Usamos el nuevo endpoint /student/status para distinguir activas vs archivadas
      const res = await fetch("/api/proxy/classrooms/student/status");
      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.message) {
          showAlert("Aviso", data.error.message, "error");
        } else {
          showAlert("Error", "No se pudo conectar con el servidor.", "error");
        }
        setIsEnrolled(false);
        setHasArchivedOnly(false);
        setLoading(false);
        return;
      }

      const { hasActiveEnrollment, hasArchivedEnrollments, active, archived } = data;

      // Construir la lista combinada para el selector
      const combined = [
        ...(active || []).map(c => ({ ...c, isArchived: false })),
        ...(archived || []).map(c => ({ ...c, isArchived: true }))
      ];

      if (!hasActiveEnrollment && !hasArchivedEnrollments) {
        // Sin ninguna inscripción → pantalla de "Aún no estás inscrito"
        setIsEnrolled(false);
        setHasArchivedOnly(false);
        setClassrooms([]);
        setLoading(false);
        return;
      }

      // Tiene al menos una inscripción (activa o archivada)
      setIsEnrolled(true);
      setClassrooms(combined);

      if (!hasActiveEnrollment && hasArchivedEnrollments) {
        // Solo tiene archivadas → mostrar selector con solo la sección archivada, sin botón de unirse
        setHasArchivedOnly(true);
        setShowSelector(true);
        setLoading(false);
        return;
      }

      setHasArchivedOnly(false);

      // Determinar a qué clase ir
      let targetClass = null;
      if (selectedId) {
        targetClass = combined.find(c => c.id === selectedId);
      }

      // Auto-entrar si solo hay 1 activa y 0 archivadas (comportamiento original)
      if (!targetClass && (active || []).length === 1 && !hasArchivedEnrollments) {
        targetClass = active[0];
        setShowSelector(false);
      } else if (!targetClass) {
        // Tiene varias activas o mezcla → mostrar selector
        setShowSelector(true);
        setLoading(false);
        return;
      }

      if (targetClass) {
        setClassInfo(targetClass);
        const isCurrentArchived = targetClass.isArchived;

        const pr = await fetch(`/api/proxy/practices/classroom/${targetClass.id}`);
        const prData = await pr.json();
        if (pr.ok && Array.isArray(prData)) {
          const formatted = prData.map(p => {
            const studentSubmission = p.submissions?.[0];
            const isSubmitted = studentSubmission && (studentSubmission.reviewStatus === "pendiente" || studentSubmission.reviewStatus === "calificada");

            let practiceStatus = "assigned";
            if (isSubmitted) {
              practiceStatus = "solved";
            } else if (p.deadline && new Date(p.deadline) < new Date()) {
              practiceStatus = "overdue";
            }
            return {
              ...p,
              status: practiceStatus,
              score: studentSubmission?.score,
              dueDate: p.deadline ? new Date(p.deadline).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }) : "Sin límite",
              assignDate: new Date(p.createdAt).toLocaleDateString("es-ES"),
              isReadOnly: isCurrentArchived
            };
          });
          setPractices(formatted);
          setShowSelector(false);
        }
      }
    } catch (err) {
      console.error("Error al obtener datos del estudiante:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeClick = (id) => {
    const practice = practices.find(p => p.id === id);
    setSelectedPractice(practice);
  };

  const handleEnterLab = (id) => {
    router.push(`/practica?id=${encodeId(id)}`);
  };

  const handleJoinClass = async (code) => {
    try {
      const res = await fetch("/api/proxy/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert("¡Éxito!", "Te has unido exitosamente al laboratorio", "success");
        setIsJoinModalOpen(false);
        fetchData();
      } else {
        await showAlert("Error", data.error?.message || "Error al unirse al laboratorio", "error");
      }
    } catch (err) {
      await showAlert("Error", "Error de red", "error");
    }
  };

  const handleLeaveClass = async () => {
    if (!classInfo || !classInfo.id) return;
    const confirmed = await showConfirm(
      "¿Abandonar Laboratorio?",
      `¿Estás seguro de que deseas abandonar el laboratorio "${classInfo.title}"? Podrás reactivarlo más adelante si lo necesitas.`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/proxy/classrooms/${classInfo.id}/leave`, {
        method: "POST"
      });
      
      if (res.ok) {
        await showAlert("Éxito", "Has abandonado el laboratorio correctamente", "success");
        setClassInfo({ title: "Cargando...", envStatus: "" });
        setPractices([]);
        fetchData();
      } else {
        const data = await res.json();
        await showAlert("Error", data.error?.message || "No se pudo abandonar el laboratorio", "error");
      }
    } catch (err) {
      await showAlert("Error", "Error de red al intentar abandonar el laboratorio", "error");
    }
  };

  const handleEnterArchivedClass = async (cls) => {
    const confirmed = await showConfirm(
      "Reactivar Laboratorio",
      `¿Deseas desarchivar y reactivar el laboratorio "${cls.title}" para volver a ver tus prácticas y poder trabajar en él de nuevo?`
    );
    if (!confirmed) return;
    
    try {
      const res = await fetch(`/api/proxy/classrooms/${cls.id}/unarchive-student`, {
        method: "PATCH"
      });
      
      if (res.ok) {
        await showAlert("Éxito", "El laboratorio ha sido reactivado correctamente", "success");
        fetchData(cls.id);
      } else {
        const data = await res.json();
        await showAlert("Error", data.error?.message || "No se pudo reactivar el laboratorio", "error");
      }
    } catch (err) {
      await showAlert("Error", "Error de red al intentar reactivar el laboratorio", "error");
    }
  };


  const filteredPractices = practices.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });


  const sortedPractices = [...filteredPractices].sort((a, b) => b.id - a.id);


  const pendingPractices = practices.filter(p => p.status === "assigned");

  return (
    <div className="alumno-dashboard-container flex flex-col h-screen bg-main animate-fade-in">
      
      {/* Top Navbar Estudiante */}
      <header className="bg-panel border-b border-border shrink-0 shadow-sm z-10 w-full">
        <div className="w-full px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Q-LIT <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
            <div className="h-6 w-px bg-border hidden md:block"></div>
            <span className="font-bold text-muted hidden md:block mr-2">
              {isEnrolled ? (showSelector ? "Mis Laboratorios" : classInfo.title) : "Mi Laboratorio"}
            </span>
            {isEnrolled && !showSelector && (classrooms.length > 1 || classrooms.some(c => c.isArchived) || hasArchivedOnly) && (
              <button
                onClick={() => setShowSelector(true)}
                className="px-3.5 py-1.5 bg-input hover:bg-border text-muted hover:text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-2"
              >
                <i className="fa-solid fa-arrow-left"></i> Volver a mis laboratorios
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="text-sm font-bold text-muted hidden sm:flex flex-col items-end mr-2 cursor-pointer hover:text-indigo-400 transition-colors"
              title="Ver perfil"
            >
              <span className="text-foreground">{session?.user?.name || "Alumno"}</span>
            </div>
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="relative w-10 h-10 cursor-pointer group"
              title="Ver perfil"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md overflow-hidden group-hover:scale-105 group-hover:opacity-85 transition-all duration-200">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  "AL"
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-panel border border-border rounded-full flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '7px' }}></i>
              </span>
            </div>

            <UserProfileDropdown 
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              user={session?.user}
              onShowPrivacy={() => setIsPrivacyModalOpen(true)}
              onLeaveClass={!showSelector && classInfo.id && !classInfo.isArchived ? handleLeaveClass : null}
              positionClasses="top-[52px] right-0"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <ClassFeedAlumnoSkeleton />
      ) : (
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto py-8">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
            {!isEnrolled ? (

              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-20 animate-fade-in">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                  <i className="fa-solid fa-laptop-code"></i>
                </div>
                <h1 className="text-3xl font-extrabold text-foreground mb-3">Aún no estás inscrito</h1>
                <p className="text-muted mb-8 text-lg">
                  Para poder resolver prácticas y usar el entorno interactivo, necesitas unirte al laboratorio con el código de tu profesor.
                </p>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/20 text-white rounded-2xl font-bold text-lg transition-all duration-300"
                >
                  <i className="fa-solid fa-plus mr-2" /> Unirse a un laboratorio
                </button>
              </div>
            ) : (
              showSelector ? (
                <div>
                  {/* Active Laboratorios */}
                  <div>
                    <div className="mb-6 flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-extrabold text-foreground mb-2">Mis Laboratorios</h1>
                        <p className="text-muted font-medium">Selecciona un laboratorio para ver tus prácticas y progresar.</p>
                      </div>
                      <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/20 text-white rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fa-solid fa-plus" /> Unirse a un laboratorio
                      </button>
                    </div>

                    {classrooms.filter(c => !c.isArchived).length === 0 ? (
                      <div className="text-center py-16 text-muted border border-dashed border-border rounded-3xl bg-panel animate-fade-in">
                        <i className="fa-solid fa-laptop-code text-5xl mb-4 text-muted"></i>
                        <p className="font-bold text-lg text-muted mb-1">No tienes laboratorios activos</p>
                        <p className="text-sm">Únete a un nuevo laboratorio o reactiva uno de los que dejaste.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {classrooms.filter(c => !c.isArchived).map((cls) => (
                          <div
                            key={cls.id}
                            onClick={() => fetchData(cls.id)}
                            className="bg-panel border border-border rounded-3xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-1 hover:bg-input transition-all duration-300 group relative"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                <i className="fa-solid fa-flask"></i>
                              </div>
                              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-bold">
                                {cls.group || "A"}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                              {cls.title}
                            </h3>
                            <p className="text-sm text-muted line-clamp-2 mb-4">
                              Docente: <span className="text-foreground font-medium">{cls.teacher}</span>
                            </p>
                            <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
                              <span>Estado</span>
                              <span className="text-emerald-400 flex items-center gap-1.5 font-bold animate-fade-in">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Activo
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Archived Laboratorios */}
                  {classrooms.some(c => c.isArchived) && (
                    <div className="mt-12">
                      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-box-archive text-muted"></i> Laboratorios Archivados / Abandonados
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {classrooms.filter(c => c.isArchived).map((cls) => (
                          <div
                            key={cls.id}
                            onClick={() => handleEnterArchivedClass(cls)}
                            className="bg-panel border border-border rounded-3xl p-6 cursor-pointer opacity-70 hover:opacity-100 hover:border-slate-500 hover:bg-input transition-all duration-300 group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 bg-slate-500/10 text-slate-400 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                <i className="fa-solid fa-box-archive"></i>
                              </div>
                              <span className="text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-1 rounded-lg font-bold">
                                {cls.group || "A"}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground group-hover:text-slate-400 transition-colors line-clamp-1 mb-2">
                              {cls.title}
                            </h3>
                            <p className="text-sm text-muted line-clamp-2 mb-4">
                              Docente: <span className="text-foreground font-medium">{cls.teacher}</span>
                            </p>
                            <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted">
                              <span>Estado</span>
                              <span className="text-amber-500 font-bold">Archivado</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-fade-in">
                  
                  {/* Columna Principal (Feed) */}
                  <div className="xl:col-span-3">
                    <div className="mb-8">
                      <h1 className="text-3xl font-extrabold text-foreground mb-2">Tus Prácticas</h1>
                      <p className="text-muted font-medium">
                        Selecciona una asignación para abrir el entorno interactivo y ejecutar tus consultas.
                      </p>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button 
                        onClick={() => setFilter("all")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-accent text-white shadow-md' : 'bg-panel text-muted border border-border hover:bg-main'}`}
                      >
                        Todas
                      </button>
                      <button 
                        onClick={() => setFilter("assigned")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'assigned' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-panel text-muted border border-border hover:bg-main'}`}
                      >
                        <i className="fa-regular fa-clock mr-1.5"></i> Asignadas
                      </button>
                      <button 
                        onClick={() => setFilter("solved")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'solved' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-panel text-muted border border-border hover:bg-main'}`}
                      >
                        <i className="fa-solid fa-check mr-1.5"></i> Entregadas
                      </button>
                      <button 
                        onClick={() => setFilter("overdue")}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'overdue' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-panel text-muted border border-border hover:bg-main'}`}
                      >
                        <i className="fa-solid fa-triangle-exclamation mr-1.5"></i> Sin entregar
                      </button>
                    </div>

                    {/* Practices List */}
                    <div className="alumno-module-block">
                      {sortedPractices.length > 0 ? (
                        <div>
                          {sortedPractices.map((practice) => (
                            <PracticeItemCard
                              key={practice.id}
                              id={practice.id}
                              title={practice.title}
                              status={practice.status}
                              dueDate={practice.dueDate}
                              assignDate={practice.assignDate}
                              score={practice.score}
                              totalPoints={practice.totalPoints}
                              onClick={handlePracticeClick}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-muted animate-fade-in">
                          <i className="fa-solid fa-folder-open text-5xl mb-4 text-muted"></i>
                          <p className="font-bold text-lg text-muted mb-1">Nada por aquí</p>
                          <p className="text-sm">No hay prácticas que coincidan con este filtro.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Lateral (Tablerito Pendientes) */}
                  <div className="xl:col-span-1">
                    <div className="bg-panel border border-border rounded-3xl p-6 shadow-sm sticky top-0">
                      <h3 className="font-extrabold text-foreground text-lg mb-5 flex items-center gap-2 border-b border-border pb-4">
                        <i className="fa-solid fa-list-ul text-indigo-500"></i> Próximas entregas
                      </h3>
                      
                      {pendingPractices.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {pendingPractices.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => handlePracticeClick(p.id)}
                              className="p-4 bg-main border border-border rounded-2xl hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                            >
                              <h4 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-3">
                                {p.title}
                              </h4>
                              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
                                <span className={p.status === "overdue" ? "text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md" : "text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md"}>
                                  {p.status === "overdue" ? "Atrasada" : "Asignada"}
                                </span>
                                <span className="text-muted">
                                  {p.dueDate}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 animate-fade-in">
                          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <i className="fa-solid fa-party-horn text-2xl"></i>
                          </div>
                          <p className="text-base font-extrabold text-foreground">¡Todo al día!</p>
                          <p className="text-sm font-medium text-muted mt-2">No tienes prácticas pendientes por entregar.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              )
            )}
          </div>
        </main>
      </div>
      )}

      <PracticeDetailModal 
        isOpen={!!selectedPractice}
        onClose={() => setSelectedPractice(null)}
        practice={selectedPractice}
        role="student"
        onAction={handleEnterLab}
      />

      <JoinClassModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinClass}
      />


      <PrivacyNoticeModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
