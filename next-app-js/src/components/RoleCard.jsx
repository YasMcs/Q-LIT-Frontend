"use client";
import React from 'react';

export default function RoleCard({ role, icon, title, features, onRegister }) {
  const handleClick = () => {
    if (typeof onRegister === 'function') {
      onRegister(role);
    }
  };

  // Combine generic role-card class with role-specific modifier for hover styling
  const cardClass = `role-card ${role}-card`;

  return (
    <div className={`${cardClass} animate-fade-in`}>
      <div className="role-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h3 className="role-card-title">{title}</h3>
      <ul className="capabilities-list">
        {features.map((f, i) => (
          <li key={i}>
            <i className="fa-solid fa-check"></i> {f}
          </li>
        ))}
      </ul>
      <button className="btn-google-register" onClick={handleClick}>
        <i className="fa-solid fa-arrow-right-to-bracket" style={{ marginRight: '8px' }}></i> Seleccionar este Perfil
      </button>
    </div>
  );
}
