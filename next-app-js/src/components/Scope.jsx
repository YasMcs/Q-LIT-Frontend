import React from 'react';

export default function Scope() {
  const commands = [
    { name: "SELECT", desc: "Consultas básicas, filtros y ordenamiento (WHERE, LIKE, GROUP BY, HAVING)" },
    { name: "INSERT", desc: "Inserción de nuevos registros individuales en tablas" },
    { name: "UPDATE", desc: "Actualización de datos controlada y segura" },
    { name: "DELETE", desc: "Eliminación de registros individuales" },
    { name: "JOINs", desc: "Uniones de hasta dos tablas (INNER, LEFT, RIGHT JOIN)" },
    { name: "Asistencia IA", desc: "Retroalimentación lógica y dinámica ante errores de ejecución" }
  ];

  return (
    <section className="scope-section" id="scope">
      <div className="scope-container">
        <div className="scope-header">
          <div className="feature-badge">Especialización</div>
          <h2>Alcance del Laboratorio</h2>
          <p>
            Nuestra plataforma está optimizada para la evaluación automatizada de cursos básicos e intermedios de Bases de Datos. 
            Nos enfocamos en la seguridad y el aprendizaje estructurado, delimitando las consultas a las funciones más esenciales:
          </p>
        </div>
        
        <div className="commands-grid">
          {commands.map((cmd, idx) => (
            <div className="command-card" key={idx}>
              <div className="command-name">{cmd.name}</div>
              <div className="command-desc">{cmd.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
