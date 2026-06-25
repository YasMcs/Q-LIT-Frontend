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
            Aprende • Enseña • Conecta
          </div>
          <h1>
            Tu camino al
            <br />
            éxito con
            <br />
            <span>Laboratorios en Vivo</span>
          </h1>
          <p className="subtitle">
            Conecta con un entorno seguro en tiempo real.
            <br />
            Agiliza prácticas, asegura autenticidad y acelera el
            <br />
            aprendizaje con la mejor plataforma.
          </p>
          <div className="hero-cta-group">
            <button className="btn-cta-start" onClick={handleStart}>
              ¡Quiero empezar ya! <i className="fa-solid fa-chevron-right ml-2" style={{ marginLeft: '8px' }}></i>
            </button>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>Anti</strong>
                <span>Plagio</span>
              </div>
              <div className="stat-item">
                <strong>24/7</strong>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Vibrant Graphic Section */}
        <div className="hero-image-wrapper">
          <div className="hero-glow-orb"></div>
          <img src="/machine-learning.svg" alt="Q-LIT Machine Learning Robot" className="hero-illustration svg-inverted" />
        </div>
      </div>
    </section>
  );
}
