import React from 'react';
import { signIn } from 'next-auth/react';

export default function Hero() {
  const handleStart = () => {
    signIn("google", undefined, { prompt: "select_account" });
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-grid-container">
        {/* Left Side: Dark Copy Section */}
        <div className="hero-text-content">
          <div className="hero-badge">
            Aprende • Enseña • Practica
          </div>
          <h1>
            Laboratorio de Consultas
            <br />
            para la
            <br />
            <span>Enseñanza Interactiva</span>
          </h1>
          <p className="subtitle">
            Plataforma interactiva para la enseñanza de Bases de Datos.
            <br />
            Evalúa consultas con IA, genera laboratorios personalizados y
            <br />
            fomenta la lógica SQL 100% práctica sin configuraciones previas.
          </p>
          <div className="hero-cta-group">
            <button className="btn-cta-start" onClick={handleStart}>
              ¡Quiero empezar ya! <i className="fa-solid fa-chevron-right ml-2" style={{ marginLeft: '8px' }}></i>
            </button>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>100%</strong>
                <span>Práctico</span>
              </div>
              <div className="stat-item">
                <strong>Cero</strong>
                <span>Config</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Vibrant Graphic Section */}
        <div className="hero-image-wrapper">
          <div className="hero-glow-orb"></div>

          {/* Twinkling Stars */}
          <div className="star s-1"></div>
          <div className="star s-2"></div>
          <div className="star s-3"></div>
          <div className="star s-4"></div>
          <div className="star s-5"></div>
          <div className="star s-6"></div>
          <div className="star s-7"></div>
          <div className="star s-8"></div>
          <div className="star s-9"></div>
          <div className="star s-10"></div>
          <div className="star s-11"></div>
          <div className="star s-12"></div>
          <div className="star s-13"></div>
          <div className="star s-14"></div>
          <div className="star s-15"></div>

          {/* Floating Queries */}
          <div className="orbiting-query query-1">SELECT *</div>
          <div className="orbiting-query query-2">WHERE id = ?</div>
          <div className="orbiting-query query-3">JOIN users</div>
          <div className="orbiting-query query-4">UPDATE roles</div>
          <div className="orbiting-query query-5">INSERT INTO</div>
          <div className="orbiting-query query-6">ORDER BY desc</div>

          <img src="/recurso-7.svg" alt="Q-LIT Premium Visual" className="hero-illustration svg-inverted" />
        </div>
      </div>
    </section>
  );
}
