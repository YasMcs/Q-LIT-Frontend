import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Hero() {
  const [showAlternative, setShowAlternative] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('teacher');

  const handleStart = () => {
    signIn("google", undefined, { prompt: "select_account" });
  };

  const handleAlternativeLogin = (e) => {
    e.preventDefault();
    if (email) {
      signIn("credentials", { email, role, callbackUrl: role === 'teacher' ? '/laboratorios' : '/clase' });
    }
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
          <div className="hero-cta-group" style={{ flexWrap: 'wrap', gap: '20px' }}>
            <button className="btn-cta-start" onClick={handleStart}>
              ¡Quiero empezar ya! <i className="fa-solid fa-chevron-right ml-2" style={{ marginLeft: '8px' }}></i>
            </button>

            <button 
              onClick={() => setShowAlternative(!showAlternative)} 
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '16px 32px',
                borderRadius: '999px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            >
              Acceso con Correo
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

          {showAlternative && (
            <form onSubmit={handleAlternativeLogin} style={{ marginTop: '24px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@institucion.edu" 
                  required
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Tipo de Cuenta</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    background: 'rgba(5,5,10,0.95)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="teacher">Docente</option>
                  <option value="student">Alumno</option>
                </select>
              </div>
              <button 
                type="submit"
                style={{
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '6px',
                  fontSize: '0.95rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
              >
                Ingresar
              </button>
            </form>
          )}

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
