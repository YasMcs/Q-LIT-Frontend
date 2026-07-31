"use client";
import React, { useState } from "react";
import SidebarAlumno from "@/components/SidebarAlumno";
import StudentClassCard from "@/components/StudentClassCard";
import JoinClassModal from "@/components/JoinClassModal";
import mockData from "@/app/api/mocks/student/dashboard.json";
import "./dashboard-alumno.css";

export default function DashboardAlumnoPage() {
  const [classes, setClasses] = useState(mockData.classes);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoinClass = (code) => {
    alert("Te has unido exitosamente a la asignatura.");
    setIsModalOpen(false);
    // Push a mock joined class to the list
    const newClass = {
      id: Date.now(),
      title: "Modelado de Datos Avanzado",
      teacher: "Prof. Cruz Mendoza",
      practicesCount: 0,
      accuracy: "N/A",
    };
    setClasses([...classes, newClass]);
  };

  return (
    <div className="alumno-dashboard-container">
      {/* Sidebar */}
      <SidebarAlumno activeKey="laboratorios" />

      {/* Main Content */}
      <main className="alumno-main">
        {/* Header */}
        <div className="alumno-header-actions">
          <h1>Tus laboratorios activos</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="alumno-btn-join"
          >
            <i className="fa-solid fa-plus" /> Inscribirse a Clase
          </button>
        </div>

        {/* Classes Grid */}
        <div className="alumno-class-grid">
          {classes.map((cls) => (
            <StudentClassCard
              key={cls.id}
              title={cls.title}
              teacher={cls.teacher}
              practicesCount={cls.practicesCount}
              accuracy={cls.accuracy}
              onClick={() => {
                window.location.href = "/class-feed-alumno";
              }}
            />
          ))}
        </div>
      </main>

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}
