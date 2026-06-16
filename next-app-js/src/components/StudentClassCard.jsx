"use client";
import React from "react";

export default function StudentClassCard({ title, teacher, practicesCount, accuracy, onClick }) {
  return (
    <div className="alumno-class-card" onClick={onClick}>

      <h3 className="truncate">{title}</h3>
      <p className="truncate">{teacher}</p>
      
      <div className="alumno-class-footer">
        <span>
          <i className="fa-solid fa-database" style={{ color: "#06b6d4" }} /> {practicesCount} Prácticas
        </span>
        <span>Precisión: {accuracy}</span>
      </div>
    </div>
  );
}
