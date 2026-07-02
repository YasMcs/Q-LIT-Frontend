"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoleGuard({ children, allowedRole, fallback = null }) {
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
        router.push("/laboratorios");
      } else if (currentRole === "student") {
        router.push("/clase");
      } else if (currentRole === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [status, session, allowedRole, router]);

  if (status === "loading") {
    // Show children immediately while loading so the page can show its own skeleton
    return <>{children}</>;
  }

  if (!isAuthorized) {
    return fallback;
  }

  return <>{children}</>;
}
