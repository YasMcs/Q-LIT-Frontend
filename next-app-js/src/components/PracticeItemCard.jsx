"use client";
import { useRouter } from "next/navigation";


export default function PracticeItemCard({ id, title, status, dueDate, assignDate, onClick }) {
  const router = useRouter();
  const isSolved = status === "solved";
  const isOverdue = status === "overdue";
  const isAssigned = status === "assigned";

  return (
    <div className="alumno-practice-item animate-fade-in" onClick={() => {
      if (onClick) {
        onClick(id);
      } else {
        router.push(`/practice/${id}`);
      }
    }}>
      <div className="alumno-practice-meta">
        <div className="alumno-practice-icon animate-fade-in">
          <i className="fa-solid fa-database" />
        </div>
        <div>
          <h4>{title}</h4>
          <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-muted">
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar-plus" /> Publicado: {assignDate}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa-regular fa-calendar-clock" /> Vence: {dueDate}
            </span>
          </div>
        </div>
      </div>
      {isSolved && (
        <span className="alumno-status-text solved">
          <i className="fa-solid fa-circle-check" /> Entregado
        </span>
      )}
      {isOverdue && (
        <span className="alumno-status-text overdue">
          Sin entregar
        </span>
      )}
      {isAssigned && (
        <span className="alumno-status-text assigned">
          Asignada
        </span>
      )}
    </div>
  );
}
