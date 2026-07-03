"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ChallengeManageCard from "@/components/ChallengeManageCard";
import PracticeDetailModal from "@/components/PracticeDetailModal";
import StatBox from "@/components/StatBox";
import ClassFeedSkeleton from "@/components/skeletons/ClassFeedSkeleton";
import { showAlert, showConfirm } from "@/utils/alerts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomTimePicker from '@/components/CustomTimePicker';
import { encodeId, decodeId } from "@/utils/crypto";
import "./class-feed-docente.css";

export default function ClassFeedDocentePage() {
  return (
    <Suspense fallback={<ClassFeedSkeleton isSidebarOpen={true} />}>
      <ClassFeedDocenteContent />
    </Suspense>
  );
}

function ClassFeedDocenteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classroomId = decodeId(searchParams.get("classroomId"));
  const codeParam = searchParams.get("code");
  const titleParam = searchParams.get("title");
  
  const [classInfo, setClassInfo] = useState({
    title: titleParam || "Cargando...",
    code: codeParam || "..."
  });
  const [students, setStudents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering
  const [filterStatus, setFilterStatus] = useState("todas");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("docente-feed-sidebar-open");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }

    if (classroomId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/proxy/classrooms/${classroomId}`).then(res => res.json()),
        fetch(`/api/proxy/practices/classroom/${classroomId}`).then(res => res.json())
      ])
      .then(([classroomData, practicesData]) => {
        // Handle Classroom & Students
        if (classroomData && !classroomData.error) {
          const cls = classroomData.data || classroomData;
          setClassInfo({
            title: cls.name || titleParam,
            code: cls.inviteCode || codeParam
          });
          if (cls.enrollments) {
            const mappedStudents = cls.enrollments.map(e => ({
              id: e.user.id,
              name: e.user.name || "Sin Nombre",
              image: e.user.image || null
            }));
            setStudents(mappedStudents);
          }
        }
        
        // Handle Practices
        if (Array.isArray(practicesData)) {
          const formatted = practicesData.map(p => ({
            ...p,
            subtitle: p.description ? p.description.substring(0, 50) + "..." : "Práctica SQL",
            fecha_asignacion: p.createdAt,
            pendingCount: p._count?.submissions || 0,
            status: p.deadline && new Date(p.deadline) < new Date() ? "closed" : "active"
          }));
          setChallenges(formatted);
        }
      })
      .catch(err => console.error("Error fetching class feed data:", err))
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [classroomId, titleParam, codeParam]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("docente-feed-sidebar-open", JSON.stringify(newState));
  };

  const handleAddChallenge = () => {
    router.push(`/laboratorios/crear?classroomId=${encodeId(classroomId) || ''}`);
  };

  const handleChallengeClick = (id) => {
    const practice = challenges.find(p => p.id === id);
    setSelectedPractice(practice);
  };

  const handleReview = (id) => {
    router.push(`/laboratorios/revisar?challengeId=${encodeId(id)}`);
  };

  const handleEdit = (id) => {
    router.push(`/laboratorios/crear?editId=${encodeId(id)}`);
  };

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isSavingDate, setIsSavingDate] = useState(false);

  const handleChangeDateClick = (id) => {
    const challenge = challenges.find(c => c.id === id);

    let dPart = "";
    let tPart = "";
    if (challenge?.deadline) {
      try {
        const dt = new Date(challenge.deadline);
        if (!isNaN(dt.getTime())) {
          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          const dd = String(dt.getDate()).padStart(2, '0');
          const hh = String(dt.getHours()).padStart(2, '0');
          const min = String(dt.getMinutes()).padStart(2, '0');
          dPart = `${yyyy}-${mm}-${dd}`;
          tPart = `${hh}:${min}`;
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
      await showAlert("Campos Incompletos", "Por favor selecciona una fecha y hora válidas.", "warning");
      return;
    }

    const [y, m, d] = newDate.split('-');
    const parsedDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    if (
      parsedDate.getFullYear() !== parseInt(y, 10) ||
      parsedDate.getMonth() !== parseInt(m, 10) - 1 ||
      parsedDate.getDate() !== parseInt(d, 10)
    ) {
      await showAlert("Fecha Inválida", "La fecha ingresada no existe en el calendario (ej. un 31 en un mes de 30 días o año bisiesto).", "warning");
      return;
    }

    const selectedDateObj = new Date(`${newDate}T${newTime}:00`);
    if (isNaN(selectedDateObj.getTime())) {
      await showAlert("Fecha Inválida", "La fecha ingresada no es válida.", "warning");
      return;
    }

    if (selectedDateObj < new Date()) {
      await showAlert("Fecha en el pasado", "La fecha y hora de entrega ya pasaron. Por favor selecciona una fecha futura.", "warning");
      return;
    }

    const isoDateTime = selectedDateObj.toISOString();

    if (isSavingDate) return;
    setIsSavingDate(true);

    try {
      const res = await fetch(`/api/proxy/practices/${selectedChallengeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deadline: isoDateTime,
          deadlineIso: isoDateTime
        })
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
      await showAlert("Éxito", "Fecha límite actualizada con éxito.", "success");
    } catch (err) {
      console.error(err);
      await showAlert("Error", "Error al actualizar la fecha. Inténtalo de nuevo.", "error");
    } finally {
      setIsSavingDate(false);
    }
  };

  if (loading) {
    return <ClassFeedSkeleton isSidebarOpen={isSidebarOpen} />;
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "¿Estás seguro?",
      "¿Deseas eliminar esta práctica? Esta acción no se puede deshacer."
    );
    if (confirmed) {
      try {
        const res = await fetch(`/api/proxy/practices/${id}`, {
          method: "DELETE"
        });
        
        if (!res.ok) {
          throw new Error("Error al eliminar la práctica en el servidor");
        }
        
        setChallenges(challenges.filter(c => c.id !== id));
        await showAlert("Éxito", "Práctica eliminada exitosamente", "success");
      } catch (err) {
        await showAlert("Error", err.message, "error");
      }
    }
  };

  const filteredChallenges = challenges.filter(c => {
    if (filterStatus === "todas") return true;
    return c.status === filterStatus;
  });

  const handleCopyCode = async () => {
    try {
      const textToCopy = `¡Únete a mi laboratorio "${classInfo.title}"!\nIngresa con el código: ${classInfo.code}\nPlataforma: https://q-lit.online`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar texto", err);
    }
  };

  return (
    <>
      {/* Main Container */}
      <div className="feed-app-container">
        {/* Header with Breadcrumbs & Class Code */}
        <header className="feed-header">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/laboratorios')} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-input text-foreground hover:bg-indigo-500 hover:text-white transition-all shadow-sm shrink-0"
              title="Volver a tus laboratorios"
            >
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight m-0">{classInfo.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCopyCode} 
              className={`feed-code-badge flex items-center gap-2 transition-all cursor-pointer ${isCopied ? 'border-green-500/50 text-green-400' : 'hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30'}`}
              title={isCopied ? "¡Copiado!" : "Copiar invitación"}
            >
              <span>Código: {classInfo.code}</span>
              <i className={`text-sm ${isCopied ? 'fa-solid fa-check text-green-400' : 'fa-regular fa-copy opacity-70'}`}></i>
            </button>
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
                    <div className="w-8 h-8 rounded-full bg-input text-accent flex items-center justify-center font-bold text-sm shrink-0 uppercase" style={{ overflow: 'hidden' }}>
                      {student.image ? (
                        <img src={student.image} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        student.name.charAt(0)
                      )}
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
                  <div className="flex items-center gap-3 bg-[var(--bg-main)] rounded-xl border border-border px-4 py-2.5 focus-within:border-indigo-500 transition-all">
                    <i className="fa-regular fa-calendar text-muted shrink-0"></i>
                    <div className="flex-1 relative">
                      <DatePicker
                        id="modal-duedate"
                        className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none placeholder-muted"
                        selected={newDate ? new Date(`${newDate}T00:00:00`) : null}
                        onChange={(date) => {
                          if (date) {
                            const offset = date.getTimezoneOffset()
                            const adjustedDate = new Date(date.getTime() - (offset*60*1000))
                            setNewDate(adjustedDate.toISOString().split('T')[0]);
                          } else {
                            setNewDate('');
                          }
                        }}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        placeholderText="dd/mm/aaaa"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Hora Límite
                  </label>
                  <div className="flex items-center gap-3 bg-[var(--bg-main)] rounded-xl border border-border px-4 py-2.5 focus-within:border-indigo-500 transition-all">
                    <i className="fa-regular fa-clock text-muted shrink-0"></i>
                    <div className="flex-1">
                      <CustomTimePicker
                        id="modal-duetime"
                        className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted mt-4">
                Al establecer una nueva fecha, la asignación se reabrirá automáticamente si estaba vencida.
              </p>
                <div className="flex items-center gap-3 mt-8">
                  <button 
                    className="flex-1 py-3 px-4 bg-accent text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submitDateChange}
                    disabled={isSavingDate}
                  >
                    {isSavingDate ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button 
                    className="py-3 px-6 bg-input text-muted rounded-xl font-bold hover:bg-border transition-colors disabled:opacity-50"
                    onClick={() => setIsDateModalOpen(false)}
                    disabled={isSavingDate}
                  >
                    Cancelar
                  </button>
                </div>
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
