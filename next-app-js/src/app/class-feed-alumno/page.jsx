"use client";
import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PracticeItemCard from "@/components/PracticeItemCard";
import PracticeDetailModal from "@/components/PracticeDetailModal";
import JoinClassModal from "@/components/JoinClassModal";

export default function ClassFeedAlumnoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [classInfo, setClassInfo] = useState({ title: "Cargando...", envStatus: "" });
  const [practices, setPractices] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all"); 
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/proxy/classrooms/student");
      const data = await res.json();
      
      if (res.ok && data.data && data.data.length > 0) {
        setIsEnrolled(true);
        setClassInfo(data.data[0]);
        

        const pr = await fetch(`/api/proxy/practices/classroom/${data.data[0].id}`);
        const prData = await pr.json();
        if (pr.ok && Array.isArray(prData)) {
          const formatted = prData.map(p => ({
            ...p,
            status: p.deadline && new Date(p.deadline) < new Date() ? "overdue" : "assigned",
            dueDate: p.deadline ? new Date(p.deadline).toLocaleDateString() : "Sin límite",
            assignDate: new Date(p.createdAt).toLocaleDateString()
          }));
          setPractices(formatted);
        }
      } else {
        setIsEnrolled(false);
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
    router.push(`/practica_sql?id=${id}`);
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
        alert("Te has unido exitosamente al laboratorio!");
        setIsJoinModalOpen(false);
        fetchData();
      } else {
        alert(data.error?.message || "Error al unirse a la clase");
      }
    } catch (err) {
      alert("Error de red");
    }
  };


  const filteredPractices = practices.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });


  const sortedPractices = [...filteredPractices].sort((a, b) => b.id - a.id);


  const pendingPractices = practices.filter(p => p.status === "assigned");

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Cargando...</div>;
  }

  return (
    <div className="alumno-dashboard-container flex flex-col h-screen bg-slate-50 animate-fade-in">
      
      {/* Top Navbar Estudiante */}
      <header className="bg-white border-b border-slate-200 shrink-0 shadow-sm z-10 w-full">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              Q-LIT <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <span className="font-bold text-slate-600 hidden md:block">
              {isEnrolled ? classInfo.title : "Mi Laboratorio"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-slate-500 hidden sm:flex flex-col items-end mr-2">
              <span className="text-slate-800">{session?.user?.name || "Alumno"}</span>
              <span className="text-xs font-normal opacity-80">{session?.user?.email}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "AL"
              )}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm"
              title="Cerrar sesión"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto py-8">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
            {!isEnrolled ? (

              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-20 animate-fade-in">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                  <i className="fa-solid fa-laptop-code"></i>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Aún no estás inscrito</h1>
                <p className="text-slate-500 mb-8 text-lg">
                  Para poder resolver prácticas y usar el entorno interactivo, necesitas unirte al laboratorio con el código de tu profesor.
                </p>
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/20 text-white rounded-2xl font-bold text-lg transition-all duration-300"
                >
                  <i className="fa-solid fa-plus mr-2" /> Unirse a una clase
                </button>
              </div>
            ) : (

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                
                {/* Columna Principal (Feed) */}
                <div className="xl:col-span-3">
                  <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Tus Prácticas</h1>
                    <p className="text-slate-500 font-medium">
                      Selecciona una asignación para abrir el entorno interactivo y ejecutar tus consultas.
                    </p>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button 
                      onClick={() => setFilter("all")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      Todas
                    </button>
                    <button 
                      onClick={() => setFilter("assigned")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'assigned' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      <i className="fa-regular fa-clock mr-1.5"></i> Asignadas
                    </button>
                    <button 
                      onClick={() => setFilter("solved")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'solved' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      <i className="fa-solid fa-check mr-1.5"></i> Entregadas
                    </button>
                    <button 
                      onClick={() => setFilter("overdue")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'overdue' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
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
                            onClick={handlePracticeClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-500 animate-fade-in">
                        <i className="fa-solid fa-folder-open text-5xl mb-4 text-slate-300"></i>
                        <p className="font-bold text-lg text-slate-600 mb-1">Nada por aquí</p>
                        <p className="text-sm">No hay prácticas que coincidan con este filtro.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Lateral (Tablerito Pendientes) */}
                <div className="xl:col-span-1">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-0">
                    <h3 className="font-extrabold text-slate-800 text-lg mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                      <i className="fa-solid fa-list-ul text-indigo-500"></i> Próximas entregas
                    </h3>
                    
                    {pendingPractices.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {pendingPractices.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => handlePracticeClick(p.id)}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                          >
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug mb-3">
                              {p.title}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
                              <span className={p.status === "overdue" ? "text-red-500 bg-red-50 px-2 py-1 rounded-md" : "text-blue-600 bg-blue-50 px-2 py-1 rounded-md"}>
                                {p.status === "overdue" ? "Atrasada" : "Asignada"}
                              </span>
                              <span className="text-slate-500">
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
                        <p className="text-base font-extrabold text-slate-700">¡Todo al día!</p>
                        <p className="text-sm font-medium text-slate-400 mt-2">No tienes prácticas pendientes por entregar.</p>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            )}
          </div>
        </main>
      </div>

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
    </div>
  );
}
