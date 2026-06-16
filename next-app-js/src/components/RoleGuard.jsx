"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoleGuard({ children, allowedRole }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const currentRole = session?.user?.role;

    if (!currentRole) {
      router.push("/onboarding");
      return;
    }

    // Validación de Seguridad Estricta
    if (currentRole === allowedRole) {
      setIsAuthorized(true);
    } else {
      // Expulsar si no tiene el rol correcto
      if (currentRole === "teacher") {
        router.push("/dashboard-docente");
      } else if (currentRole === "student") {
        router.push("/class-feed-alumno");
      }
    }
  }, [status, session, allowedRole, router]);

  if (status === "loading" || !isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#0f172a', color: 'white' }}>
        <i className="fa-solid fa-circle-notch fa-spin fa-3x" style={{ color: '#3b82f6' }}></i>
      </div>
    );
  }

  return <>{children}</>;
}
