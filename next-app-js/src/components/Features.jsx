import React from 'react';

export default function Features() {
  const featuresList = [
    {
      icon: "fa-laptop-code",
      title: "Práctica Interactiva",
      description: "Escribe y ejecuta consultas SQL en un entorno seguro y en tiempo real, sin configuraciones complejas.",
      size: "wide"
    },
    {
      icon: "fa-shield-halved",
      title: "Entorno Anti-Plagio",
      description: "Control estricto de acciones como copiar y pegar, asegurando la autenticidad del trabajo de cada estudiante.",
      size: "tall"
    },
    {
      icon: "fa-bolt",
      title: "Evaluación Ágil",
      description: "Docentes pueden revisar, probar y calificar las entregas directamente en la plataforma, agilizando el flujo de trabajo.",
      size: ""
    },
    {
      icon: "fa-users-viewfinder",
      title: "Gestión Centralizada",
      description: "Administra clases, diccionarios de datos y esquemas de manera organizada desde un solo lugar.",
      size: "wide"
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <span className="features-badge">¿Por qué Q-LIT?</span>
        <h2>Todo lo que necesitas para enseñar y aprender Bases de Datos</h2>
        <p>Una plataforma diseñada específicamente para resolver los retos de los laboratorios de SQL modernos.</p>
      </div>
      <div className="features-grid">
        {featuresList.map((feat, index) => (
          <div className={`feature-card ${feat.size}`} key={index} style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="feature-icon-wrapper">
              <i className={`fa-solid ${feat.icon}`}></i>
            </div>
            <div>
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
