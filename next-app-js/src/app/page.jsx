"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import "./welcome.css";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (!session.user.role) {
        
        router.push("/onboarding");
      } else if (session.user.role === "teacher") {
        router.push("/dashboard-docente");
      } else if (session.user.role === "student") {
        router.push("/class-feed-alumno");
      }
    }
  }, [status, session, router]);

  return (
    <div className="home-page-container animate-fade-in animate-scale-up relative">
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}
