"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ClassCard from "@/components/ClassCard";
import "../dashboard-docente/dashboard-docente.css";

export default function ArchivoDocentePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [archivedClasses, setArchivedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar las clases archivadas desde el backend real
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`http://localhost:4000/api/classrooms?teacherId=${session.user.id}&archived=true`)
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
    if (!window.confirm(`¿Estás seguro de que deseas desarchivar el laboratorio "${cls.title}"?`)) return;
    try {
      const response = await fetch(`http://localhost:4000/api/classrooms/${cls.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false })
      });
      if (response.ok) {
        setArchivedClasses(archivedClasses.filter(c => c.id !== cls.id));
      } else {
        const data = await response.json();
        alert(data.error?.message || "Error al desarchivar el laboratorio");
      }
    } catch (error) {
      console.error("Error al desarchivar:", error);
      alert("Error de conexión");
    }
  };

  if (loading) {
    return <main className="docente-main"><p>Cargando laboratorios archivados...</p></main>;
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
