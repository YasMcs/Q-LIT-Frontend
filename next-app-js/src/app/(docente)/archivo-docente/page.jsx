"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassCard from "@/components/ClassCard";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { showAlert, showConfirm } from "@/utils/alerts";
import "../dashboard-docente/dashboard-docente.css";

export default function ArchivoDocentePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [archivedClasses, setArchivedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar las clases archivadas desde el backend real
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/proxy/classrooms?teacherId=${session.user.id}&archived=true`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setArchivedClasses(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching archived classrooms:", err);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  const handleUnarchive = async (cls) => {
    const confirmed = await showConfirm(
      "¿Estás seguro?",
      `¿Deseas desarchivar el laboratorio "${cls.title}"?`
    );
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/proxy/classrooms/${cls.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false })
      });
      if (response.ok) {
        setArchivedClasses(archivedClasses.filter(c => c.id !== cls.id));
      } else {
        const data = await response.json();
        await showAlert("Error", data.error?.message || "Error al desarchivar el laboratorio", "error");
      }
    } catch (error) {
      console.error("Error al desarchivar:", error);
      await showAlert("Error", "Error de conexión", "error");
    }
  };

  if (loading) {
    return (
      <main className="docente-main">
        <header className="docente-header-actions">
          <div>
            <h1>Archivados</h1>
            <p className="text-muted text-sm mt-1">Laboratorios y grupos de semestres anteriores.</p>
          </div>
        </header>
        <DashboardSkeleton count={3} />
      </main>
    );
  }

  return (
    <>
      {/* Main Content */}
      <main className="docente-main">
        <header className="docente-header-actions">
          <div>
            <h1>Archivados</h1>
            <p className="text-muted text-sm mt-1">Laboratorios y grupos de semestres anteriores.</p>
          </div>
        </header>

        {archivedClasses.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}>
            <i className="fa-solid fa-box-archive" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h2>No tienes laboratorios archivados</h2>
            <p>Los laboratorios que archives aparecerán en esta sección.</p>
          </div>
        ) : (
          <section className="docente-class-grid mt-6">
            {archivedClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                title={cls.title}
                group={cls.group}
                inviteCode={cls.inviteCode}
                studentsCount={cls.studentsCount}
                pendingReviews={cls.pendingReviews}
                isArchived={true}
                onClick={() => router.push(`/class-feed-docente?classroomId=${cls.id}`)}
                onUnarchive={() => handleUnarchive(cls)}
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
