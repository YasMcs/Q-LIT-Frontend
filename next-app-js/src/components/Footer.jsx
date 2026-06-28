"use client";
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-logo" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
            Q-LIT<div className="dot" style={{ width: '6px', height: '6px', marginLeft: '2px' }} />
          </div>
          <p className="footer-description">
            Plataforma avanzada para la gestión, evaluación y monitoreo de bases de datos.
          </p>
        </div>
        
        <div className="footer-links">
          <h4><i className="fa-solid fa-scale-balanced" style={{ marginRight: '8px', color: '#6366f1' }}></i> Legal</h4>
          <ul>
            <li>
              <a href="/aviso-privacidad.pdf" target="_blank" rel="noopener noreferrer" className="footer-link">
                <i className="fa-solid fa-file-pdf" style={{ marginRight: '6px' }}></i> Aviso de Privacidad
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4><i className="fa-solid fa-headset" style={{ marginRight: '8px', color: '#6366f1' }}></i> Soporte Técnico</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <a href="mailto:q.lit.laboratorios@gmail.com" className="footer-link" style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> Q.LIT.LABORATORIOS@GMAIL.COM
              </a>
            </li>
            <li>
              <a href="mailto:y.macias1802@gmail.com" className="footer-link" style={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> Y.MACIAS1802@GMAIL.COM
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} Q-LIT. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
