"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassCard from "@/components/ClassCard";
import CreateClassModal from "@/components/CreateClassModal";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { showAlert, showConfirm, showPrompt } from "@/utils/alerts";
import "./dashboard-docente.css";

export default function DashboardDocentePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar las clases desde el backend real
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/proxy/classrooms?teacherId=${session.user.id}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            if (data?.error?.message) {
              showAlert("Aviso", data.error.message, "error");
            } else {
              showAlert("Error", "No se pudo conectar con el servidor.", "error");
            }
            throw new Error(data?.error?.message || "Error al cargar las clases");
          }
          return data;
        })
        .then(data => {
          if (data.data) {
            setClasses(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching classrooms:", err);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const handleCreateClass = async (newClass) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/proxy/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClass.title,
          group: newClass.group, 
          teacherId: session.user.id
        })
      });

      const data = await response.json();
      
      if (response.ok && data.data) {
        setClasses([...classes, data.data]);
        setIsModalOpen(false);
      } else {
        await showAlert("Error", data.error?.message || "Error al crear el laboratorio", "error");
      }
    } catch (error) {
      console.error("Error al crear la clase:", error);
      await showAlert("Error de Conexión", "Error de conexión al servidor", "error");
    }
  };

  if (loading) {
    return (
      <main className="docente-main animate-fade-in">
        <div className="docente-header-actions">
          <h1>Tus grupos asignados</h1>
          <button className="docente-btn-create" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <i className="fa-solid fa-plus" /> Crear Nuevo Laboratorio
          </button>
        </div>
        <DashboardSkeleton count={6} />
      </main>
    );
  }

  return (
    <>
      {/* Main Content */}
      <main className="docente-main animate-fade-in">
        {/* Header */}
        <div className="docente-header-actions">
          <h1>Tus grupos asignados</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="docente-btn-create"
          >
            <i className="fa-solid fa-plus" /> Crear Nuevo Laboratorio
          </button>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
            <i className="fa-solid fa-chalkboard-user" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h2>No tienes laboratorios creados</h2>
            <p>Comienza creando tu primer laboratorio para invitar alumnos.</p>
          </div>
        ) : (
          <div className="docente-class-grid">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                title={cls.title}
                group={cls.group}
                inviteCode={cls.inviteCode}
                studentsCount={cls.studentsCount}
                pendingReviews={cls.pendingReviews}
                onClick={() => {
                  router.push(`/class-feed-docente?classroomId=${cls.id}&code=${cls.inviteCode}&title=${encodeURIComponent(cls.title)}`);
                }}
                onArchive={async () => {
                   const confirmed = await showConfirm(
                     "¿Estás seguro?",
                     `¿Deseas archivar el laboratorio "${cls.title}"?`
                   );
                   if (!confirmed) return;
                   try {
                     const response = await fetch(`/api/proxy/classrooms/${cls.id}`, {
                       method: "DELETE"
                     });
                     if (response.ok) {
                       setClasses(classes.filter(c => c.id !== cls.id));
                     } else {
                       const data = await response.json();
                       await showAlert("Error", data.error?.message || "Error al archivar el laboratorio", "error");
                     }
                   } catch (error) {
                     console.error("Error al archivar el laboratorio:", error);
                     await showAlert("Error", "Error de conexión", "error");
                   }
                 }}
                 onEdit={async () => {
                   const newTitle = await showPrompt(
                     "Editar Nombre",
                     `Introduce el nuevo nombre para el laboratorio "${cls.title}":`,
                     cls.title,
                     "Nombre del laboratorio"
                   );
                   if (newTitle && newTitle.trim() !== "" && newTitle !== cls.title) {
                     try {
                       const response = await fetch(`/api/proxy/classrooms/${cls.id}`, {
                         method: "PATCH",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ name: newTitle })
                       });
                       if (response.ok) {
                         setClasses(classes.map(c => c.id === cls.id ? { ...c, title: newTitle } : c));
                       } else {
                         const data = await response.json();
                         await showAlert("Error", data.error?.message || "Error al actualizar el laboratorio", "error");
                       }
                     } catch (error) {
                       console.error("Error al actualizar el laboratorio:", error);
                       await showAlert("Error", "Error de conexión", "error");
                     }
                   }
                 }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateClass}
      />
    </>
  );
}
