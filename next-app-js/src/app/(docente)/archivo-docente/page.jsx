"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ClassCard from "@/components/ClassCard";
import "../dashboard-docente/dashboard-docente.css";

export default function ArchivoDocentePage() {
  const router = useRouter();
  
  const archivedClasses = [
    {
      id: "arc-1",
      title: "Bases de Datos Relacionales",
      group: "Grupo A (2025)",
      studentsCount: 28,
      pendingReviews: 0
    },
    {
      id: "arc-2",
      title: "SQL Avanzado",
      group: "Grupo B (2025)",
      studentsCount: 15,
      pendingReviews: 0
    },
    {
      id: "arc-3",
      title: "Fundamentos de Base de Datos",
      group: "Grupo A (2024)",
      studentsCount: 42,
      pendingReviews: 0
    }
  ];

  return (
    <>
      {/* Main Content */}
      <main className="docente-main">
        <header className="docente-header-actions">
          <div>
            <h1>Archivados</h1>
            <p className="text-slate-500 text-sm mt-1">Laboratorios y grupos de semestres anteriores.</p>
          </div>
        </header>

        <section className="docente-class-grid mt-6">
          {archivedClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              title={cls.title}
              group={cls.group}
              studentsCount={cls.studentsCount}
              pendingReviews={cls.pendingReviews}
              isArchived={true}
              onClick={() => router.push("/class-feed-docente")}
            />
          ))}
        </section>
      </main>
    </>
  );
}
