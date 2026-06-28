import React from 'react';

export default function LoadingSpinner({ fullScreen = true, text = "Cargando..." }) {
  const containerStyle = fullScreen 
    ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#0a0a0a', color: 'white', position: 'fixed', top: 0, left: 0, zIndex: 9999 }
    : { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'white' };

  return (
    <div style={containerStyle} className="animate-fade-in">
      <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid rgba(124, 58, 237, 0.2)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid #7c3aed', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', backgroundColor: '#00d2ff', borderRadius: '50%', boxShadow: '0 0 10px #00d2ff' }}></div>
      </div>
      <div style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {text}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
