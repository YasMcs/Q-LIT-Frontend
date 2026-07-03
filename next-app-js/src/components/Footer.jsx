"use client";
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container" style={{ padding: '60px 40px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
        
        <div>
          <div className="brand-logo" style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', fontWeight: '800' }}>
            Q-LIT<div className="dot" style={{ width: '6px', height: '6px', marginLeft: '4px', backgroundColor: '#6366f1', borderRadius: '50%' }} />
          </div>
          <p style={{ color: '#b5bac1', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '300px' }}>
            Plataforma interactiva avanzada para la enseñanza, gestión y evaluación de Bases de Datos.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#b5bac1', fontSize: '0.85rem' }}>Desarrollado por</span>
            <img src="/Logo empresa starcode.png" alt="Starcode Logo" style={{ height: '125px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        
        <div>
          <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.05rem', fontWeight: '600' }}><i className="fa-solid fa-scale-balanced" style={{ marginRight: '8px', color: '#6366f1' }}></i> Legal</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li>
              <a href="/aviso-privacidad" className="footer-link" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
                <i className="fa-solid fa-file-contract" style={{ marginRight: '8px' }}></i> Aviso de Privacidad
              </a>
            </li>
            <li>
              <a href="/aviso-privacidad#cookies" className="footer-link" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
                <i className="fa-solid fa-cookie-bite" style={{ marginRight: '8px' }}></i> Política de Cookies
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.05rem', fontWeight: '600' }}><i className="fa-solid fa-headset" style={{ marginRight: '8px', color: '#6366f1' }}></i> Soporte Técnico</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li>
              <a href="mailto:q.lit.laboratorios@gmail.com" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
                <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> Q.LIT.LABORATORIOS@GMAIL.COM
              </a>
            </li>
            <li>
              <a href="mailto:y.macias1802@gmail.com" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
                <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> Y.MACIAS1802@GMAIL.COM
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{ color: '#b5bac1', fontSize: '0.9rem', margin: 0 }}>
          &copy; {currentYear} STARCODE. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
