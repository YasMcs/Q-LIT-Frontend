import React from 'react';

export default function Features() {
  const featuresList = [
    {
      icon: "fa-laptop-code",
      title: "Salas Interactivas",
      description: "Únete a salas dinámicas con chat fluido y reacciones en tiempo real. Aprende haciendo con la guía de tu entorno."
    },
    {
      icon: "fa-users",
      title: "Docentes Expertos",
      description: "Encuentra profesionales dispuestos a compartir su experiencia y guiarte en tu carrera."
    },
    {
      icon: "fa-shield-halved",
      title: "Seguridad Total",
      description: "Tu privacidad es lo primero. Entorno seguro y moderado para una mejor experiencia."
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-simple-grid">
        {featuresList.map((feat, index) => (
          <div className="simple-feature-card" key={index} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="simple-feature-icon">
              <i className={`fa-solid ${feat.icon}`}></i>
            </div>
            <div className="simple-feature-text">
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
