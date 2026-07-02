
import React from "react";
import RoleGuard from "@/components/RoleGuard";

export default function ClassFeedAlumnoLayout({ children }) {
  return (
    <RoleGuard allowedRole="student">
      {children}
    </RoleGuard>
  );
}
