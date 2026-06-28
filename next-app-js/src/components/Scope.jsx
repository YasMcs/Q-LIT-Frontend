import React from 'react';

export default function Scope() {
  const commands = [
    { name: "SELECT", desc: "Consultas de selección y filtrado (WHERE, ORDER BY, GROUP BY)" },
    { name: "INSERT", desc: "Inserción de nuevos registros en tablas" },
    { name: "UPDATE", desc: "Actualización de datos existentes" },
    { name: "DELETE", desc: "Eliminación de registros" },
    { name: "CREATE TABLE", desc: "Definición y creación de estructuras de tablas" },
    { name: "DROP TABLE", desc: "Eliminación completa de tablas" },
    { name: "ALTER TABLE", desc: "Modificación de la estructura de tablas existentes" },
    { name: "JOINs", desc: "INNER JOIN, LEFT JOIN para consultas multi-tabla básicas" }
  ];

  return (
    <section className="scope-section" id="scope">
      <div className="scope-container">
        <div className="scope-header">
          <div className="feature-badge">Especialización</div>
          <h2>Enfoque en Fundamentos SQL</h2>
          <p>
            Q-LIT está diseñado específicamente para dominar las <strong>consultas y programación básica del lenguaje SQL</strong>. 
            No abarcamos funciones avanzadas de administración de servidores, sino que nos centramos en que los estudiantes 
            comprendan y practiquen la lógica fundamental de manipulación y definición de datos (DML y DDL).
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
