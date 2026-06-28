import React from 'react';

export default function LoadingSpinner({ fullScreen = true, text = "Autenticando..." }) {
  const containerStyle = fullScreen 
    ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-main)', color: 'white', position: 'fixed', top: 0, left: 0, zIndex: 9999 }
    : { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'white' };

  return (
    <div style={containerStyle} className="animate-fade-in">
      
      {/* Opción Híbrida: Base de datos plana iluminada + Engranajes */}
      <div className="hybrid-loader">
        <div className="gears-container">
          <i className="fa-solid fa-gear gear-main"></i>
          <i className="fa-solid fa-gear gear-secondary"></i>
        </div>
        
        <div className="db-layers">
          <div className="db-layer layer-1"></div>
          <div className="db-layer layer-2"></div>
          <div className="db-layer layer-3"></div>
        </div>
      </div>

      <div style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '25px' }}>
        {text}
      </div>

      <style>{`
        .hybrid-loader {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 10px;
        }

        .db-layers {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .db-layer {
          width: 70px;
          height: 18px;
          background-color: rgba(99, 102, 241, 0.1);
          border: 3px solid #6366f1;
          border-radius: 8px;
          animation: light-up 1.2s infinite ease-in-out;
        }

        /* Orden de apilado clásico (abajo hacia arriba) */
        .layer-1 { animation-delay: 0s; }    /* Arriba */
        .layer-2 { animation-delay: 0.15s; } /* Medio */
        .layer-3 { animation-delay: 0.3s; }  /* Abajo */

        @keyframes light-up {
          0%, 100% { background-color: rgba(99, 102, 241, 0.1); box-shadow: none; border-color: #4f46e5; }
          50% { background-color: #818cf8; box-shadow: 0 0 16px #818cf8; border-color: #a5b4fc; }
        }

        .gears-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .gear-main {
          position: absolute;
          font-size: 3rem;
          top: 0;
          left: 0;
          color: #6366f1;
          animation: spin-forward 4s linear infinite;
        }

        .gear-secondary {
          position: absolute;
          font-size: 1.8rem;
          bottom: -4px;
          right: -8px;
          color: #00d2ff;
          animation: spin-backward 3s linear infinite;
        }

        @keyframes spin-forward {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-backward {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
