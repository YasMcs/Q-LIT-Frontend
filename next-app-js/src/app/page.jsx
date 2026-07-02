"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Scope from "@/components/Scope";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
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
      } else if (session.user.role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && session?.user)) {
    return <div className="min-h-screen w-full bg-[var(--bg-main)]"></div>;
  }

  return (
    <div className="home-page-container animate-fade-in animate-scale-up relative">
      <div className="stars-layer"></div>
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <Navbar />
      <Hero />
      <Features />
      <Scope />
      <Footer />
    </div>
  );
}
