import React from 'react';
import { signIn } from 'next-auth/react';

export default function Hero() {
  const handleStart = () => {
    signIn("google", undefined, { prompt: "select_account" });
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span> Plataforma de Prácticas
        </div>
        <h1>
          <span>Q-LIT</span>
        </h1>
        <h2 className="hero-long-name">
          Laboratorio de Consultas para la Enseñanza Interactiva
        </h2>
        <p className="subtitle">
          El soporte interactivo más avanzado para tus laboratorios de Bases de Datos. Agiliza la recepción de prácticas, asegura la autenticidad de las entregas y lleva el aprendizaje al siguiente nivel con un entorno web seguro e innovador.
        </p>
        <button className="btn-cta-start" onClick={handleStart}>
          Comienza ahora <i className="fa-solid fa-arrow-right ml-2" style={{ marginLeft: '8px' }}></i>
        </button>
      </div>
      <div className="hero-image-container">
        <img src="/Coding workshop-cuate.svg" alt="Q-LIT Education Workspace" className="hero-illustration" />
      </div>
      <div className="scroll-hint">
        <i className="fa-solid fa-chevron-down" />
      </div>
    </section>
  );
}
