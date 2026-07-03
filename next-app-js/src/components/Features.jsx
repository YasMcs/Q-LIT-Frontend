import React, { useEffect, useRef } from 'react';

export default function Features() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const featuresList = [
    {
      icon: "fa-laptop-code",
      title: "Laboratorios SQL Interactivos",
      subtitle: "Aprende haciendo con entornos de bases de datos reales.",
      description: "Nuestra plataforma te sumerge en una experiencia práctica inigualable. Los estudiantes interactúan directamente con esquemas de bases de datos, escribiendo y ejecutando sentencias SQL en un editor profesional.",
      bullets: [
        "Visualización inmediata de los datos en forma de tabla al consultar.",
        "Retroalimentación de la IA en cada compilación para guiar y apoyar.",
        "Entorno seguro y completamente aislado para cada práctica."
      ]
    },
    {
      icon: "fa-microchip",
      title: "Evaluación Automática Potenciada por IA",
      subtitle: "Calificaciones precisas con total control docente.",
      description: "El motor de Inteligencia Artificial analiza la estructura lógica del código SQL y los resultados obtenidos para evaluar automáticamente. Sin embargo, el docente siempre conserva la última palabra, pudiendo revisar y modificar la calificación final.",
      bullets: [
        "Análisis estructural y de buenas prácticas de codificación.",
        "Ahorro significativo del tiempo de corrección y evaluación manual.",
        "Ajuste manual y control absoluto de las notas por el profesor."
      ]
    },
    {
      icon: "fa-ban",
      title: "Control Estricto Anti-Copia",
      subtitle: "Garantiza el esfuerzo original en cada laboratorio.",
      description: "Para asegurar que el aprendizaje sea genuino, nuestro entorno de práctica restringe mecánicas que facilitan la trampa. Controlamos la posibilidad de plagio restringiendo comandos clave directamente en la interfaz de resolución.",
      bullets: [
        "Bloqueo del pegado de texto externo (Comando Ctrl+V restringido).",
        "Desactivación del menú contextual (Clic derecho) en el editor.",
        "Fomento del desarrollo de la logica y agilidad mental que pueda desarrollar."
      ]
    },
    {
      icon: "fa-wand-magic-sparkles",
      title: "Generación Ágil de Material Docente",
      subtitle: "Ejercicios personalizados a partir de un catálogo.",
      description: "El profesor agiliza la creación de sus laboratorios utilizando un extenso catálogo de bases de datos por temáticas. El sistema permite generar un enunciado diferente para cada alumno manteniendo exactamente el mismo objetivo de aprendizaje.",
      bullets: [
        "Catálogo temático de bases de datos listas para importar.",
        "Generación de enunciados aleatorios y únicos por estudiante.",
        "Prevención natural de copias mediante ejercicios individualizados."
      ]
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-zigzag-container">
        {/* Floating Pills for spatial effect */}
        <div className="floating-pill pill-1">DDL / DML</div>
        <div className="floating-pill pill-2">Autocompletado</div>
        <div className="floating-pill pill-3">Métricas</div>
        <div className="floating-pill pill-4">Editor Avanzado</div>
        <div className="floating-pill pill-5">SQL Moderno</div>
        <div className="floating-pill pill-6">Cero Configuración</div>

        {featuresList.map((feat, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <div
              className={`zigzag-row ${isReversed ? 'reversed' : ''}`}
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className="zigzag-text">
                <div className="feature-badge">Característica</div>
                <h3>{feat.title}</h3>
                <h4 className="zigzag-subtitle">{feat.subtitle}</h4>
                <p>{feat.description}</p>
                <ul className="zigzag-bullets">
                  {feat.bullets.map((bullet, i) => (
                    <li key={i}><i className="fa-solid fa-check"></i> {bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="zigzag-visual">
                <div className="visual-icon-glass">
                  <i className={`fa-solid ${feat.icon}`}></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
