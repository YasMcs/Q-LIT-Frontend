"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RoleCard from "@/components/RoleCard";
import "../welcome.css";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user?.role) {
      if (session.user.role === "teacher") router.push("/dashboard-docente");
      if (session.user.role === "student") router.push("/class-feed-alumno");
    }
  }, [status, session, router]);

  const handleRoleSelection = async (role) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/users/${session.user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      
      if (res.ok) {
        const data = await res.json();
        await update({ role: data.data.role });
        
        const dest = role === "teacher" ? "/dashboard-docente" : "/class-feed-alumno";
        router.push(dest);
      } else {
        alert("Hubo un error al asignar tu rol. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error asignando rol:", err);
      alert("Error de conexión al servidor");
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#0f172a', color: 'white' }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-3x" style={{ color: '#3b82f6' }}></i>
      </div>
    );
  }

  return (
    <div className="home-page-container animate-fade-in animate-scale-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <section className="roles-section" id="roles" style={{ marginTop: 0, padding: '4rem 2rem' }}>
        <div className="roles-section-header">
          <h2>¡Bienvenido a Q-LIT!</h2>
          <p>Para comenzar a utilizar la plataforma, por favor selecciona el perfil que mejor describa tu rol.</p>
        </div>
        <div className="role-grid">
          <RoleCard
            role="teacher"
            icon="fa-graduation-cap"
            title="Entorno Docente"
            features={[
              "Crea laboratorios virtuales y define la estructura y datos de la Base de Datos (DDL/DML).",
              "Gestiona a tus alumnos con códigos de invitación y obtén métricas de desempeño.",
              "Motor de IA integrado: Evalúa automáticamente si las consultas de los estudiantes cumplen con tus rubricas.",
              "Control anti-plagio avanzado y supervisión de entregas."
            ]}
            onRegister={() => handleRoleSelection("teacher")}
          />
          <RoleCard
            role="student"
            icon="fa-code"
            title="Entorno Estudiante"
            features={[
              "Resuelve retos interactivos escribiendo consultas SQL en un editor profesional con autocompletado.",
              "Consulta los esquemas y diccionarios de datos de tu laboratorio en tiempo real.",
              "Obtén retroalimentación instantánea de IA sobre la precisión de tus consultas.",
              "Visualiza el resultado tabular real de tus sentencias SQL antes de entregar."
            ]}
            onRegister={() => handleRoleSelection("student")}
          />
        </div>
      </section>
    </div>
  );
}
