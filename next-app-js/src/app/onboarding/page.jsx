"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import RoleCard from "@/components/RoleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { showAlert } from "@/utils/alerts";
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
      if (session.user.role === "admin") router.push("/admin/dashboard");
    }
  }, [status, session, router]);

  const handleRoleSelection = async (role) => {
    if (!session?.user?.id) return;
    
    try {
      const res = await fetch(`/api/proxy/users/${session.user.id}/role`, {
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
        await showAlert("Error de Rol", "Hubo un error al asignar tu rol. Por favor, intenta de nuevo.", "error");
      }
    } catch (err) {
      console.error("Error asignando rol:", err);
      await showAlert("Error de Conexión", "Error de conexión al servidor", "error");
    }
  };

  if (status === "loading" || (status === "authenticated" && session?.user?.role)) {
    return <LoadingSpinner text="Cargando perfil..." />;
  }

  return (
    <div className="home-page-container animate-fade-in animate-scale-up" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <section className="roles-section" id="roles" style={{ marginTop: 0, padding: '4rem 2rem' }}>
        {session?.user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '2rem', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', maxWidth: '500px', margin: '0 auto 2rem' }}>
            <img src={session.user.image} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{session.user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{session.user.email}</div>
            </div>
            <button 
              onClick={() => signIn('google', undefined, { prompt: 'select_account' })}
              style={{ padding: '8px 12px', background: 'transparent', color: '#a855f7', border: '1px solid #a855f7', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cambiar cuenta
            </button>
          </div>
        )}
        
        <div style={{ position: 'absolute', top: '30px', left: '40px' }}>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.3s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al inicio
          </button>
        </div>

        <div className="roles-section-header">
          <h2>¡Bienvenido a Q-LIT!</h2>
          <p>Para comenzar a utilizar la plataforma, por favor selecciona el perfil que mejor describa tu rol.</p>
        </div>
        <div className="role-grid">
          <RoleCard
            role="teacher"
            icon="fa-chalkboard-user"
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
            icon="fa-user-graduate"
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
