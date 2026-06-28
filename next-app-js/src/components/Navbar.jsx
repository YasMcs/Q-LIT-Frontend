"use client";
import React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="brand-logo">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', fontSize: '1.8rem', fontWeight: '800' }}>
          Q-LIT<div className="dot" style={{ width: '8px', height: '8px', marginLeft: '4px', backgroundColor: '#6366f1', borderRadius: '50%', boxShadow: '0 0 10px #6366f1' }} />
        </a>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/#features" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
            Características
          </a>
          <a href="/#scope" style={{ color: '#b5bac1', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#b5bac1'}>
            Alcance
          </a>
        </nav>

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src={session.user.image} 
              alt="Profile" 
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--border-color)' }}
            />
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{session.user.name}</span>
            <button 
              onClick={() => signOut()}
              style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn-login-trigger" onClick={() => signIn('google', undefined, { prompt: 'select_account' })}>
              <i className="fa-brands fa-google" style={{ marginRight: '8px' }}></i> ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
