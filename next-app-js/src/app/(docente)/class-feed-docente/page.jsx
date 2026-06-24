"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ChallengeManageCard from "@/components/ChallengeManageCard";
import PracticeDetailModal from "@/components/PracticeDetailModal";
import StatBox from "@/components/StatBox";
import mockData from "@/app/api/mocks/teacher/class-feed.json";
import "./class-feed-docente.css";

import studentMocks from "@/app/api/mocks/teacher/class-students.json";

const mockStudents = studentMocks.students;

export default function ClassFeedDocentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classroomId = searchParams.get("classroomId");
  const codeParam = searchParams.get("code");
  const titleParam = searchParams.get("title");
  
  const [classInfo] = useState({
    title: titleParam || mockData.classInfo.title,
    code: codeParam || mockData.classInfo.code
  });
  const [challenges, setChallenges] = useState([]);
  const [selectedPractice, setSelectedPractice] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("docente-feed-sidebar-open");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }

    if (classroomId) {
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
  }, [classroomId]);

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

    const deadlineStr = challenge?.deadline || "2024-06-15T23:59";
    const [datePart, timePart] = deadlineStr.split("T");
    setNewDate(datePart || "");
    setNewTime(timePart || "");
    
    setSelectedChallengeId(id);
    setIsDateModalOpen(true);
  };

  const submitDateChange = () => {
    if (!newDate || !newTime) {
      alert("Por favor selecciona una fecha y hora válidas.");
      return;
    }
    setChallenges(challenges.map(c => {
      if (c.id === selectedChallengeId) {


        return { ...c, status: "active" };
      }
      return c;
    }));
    setIsDateModalOpen(false);
    setNewDate("");
    alert("Fecha límite actualizada con éxito.");
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta práctica? Esta acción no se puede deshacer.")) {
      setChallenges(challenges.filter(c => c.id !== id));
    }
  };

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
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
            <div className="feed-panel-header">
              <div>
                <h1>Estructura del Laboratorio</h1>
                <p>
                  Controla las asignaciones activas, añade nuevas prácticas y evalúa el desempeño técnico.
                </p>
              </div>
              <button className="feed-btn-action-master" onClick={handleAddChallenge}>
                <i className="fa-solid fa-plus" /> Añadir Práctica SQL
              </button>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <ChallengeManageCard
                  key={challenge.id}
                  id={challenge.id}
                  title={challenge.title}
                  subtitle={challenge.subtitle}
                  assignDate={challenge.fecha_asignacion ? challenge.fecha_asignacion.split('T')[0] : ''}
                  pendingCount={challenge.pendingCount}
                  status={challenge.status}
                  onClick={handleChallengeClick}
                  onReview={handleReview}
                  onEdit={handleEdit}
                  onChangeDate={handleChangeDateClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </main>

          {/* Right Sidebar for Students */}
          {isSidebarOpen && (
            <aside className="w-80 flex-shrink-0 border-l border-slate-200 bg-white p-6 overflow-y-auto animate-fade-in hidden lg:block">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Estudiantes ({mockStudents.length})</h2>
                <button onClick={toggleSidebar} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              <div className="space-y-3">
                {mockStudents.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{student.name}</span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Cambiar Fecha Límite</h2>
              <button 
                onClick={() => setIsDateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha de Entrega
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora Límite
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Al establecer una nueva fecha, la asignación se reabrirá automáticamente si estaba vencida.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all"
                onClick={() => setIsDateModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all"
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
