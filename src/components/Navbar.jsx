import React, { useState, useEffect } from 'react'
import Logo from './Logo'

const G = '#c9a84c'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? '0.8rem 2.5rem' : '1.1rem 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid #1a1a1a',
      background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)',
      transition: 'padding 0.3s'
    }}>
      <div style={{ cursor: 'pointer' }} onClick={() => go('inicio')}>
        <Logo height={38} />
      </div>

      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
        {[
          ['como-funciona', 'Cómo funciona'],
          ['sobre-mi', 'Sobre mí'],
          ['precios', 'Precios'],
          ['calculadora', 'Calculadora'],
          ['contacto', 'Contacto'],
        ].map(([id, label]) => (
          <li key={id}>
            <span onClick={() => go(id)} style={{ color: '#8a8a8a', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fafaf8'}
              onMouseLeave={e => e.target.style.color = '#8a8a8a'}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      <button onClick={() => go('contacto')} style={{ background: `linear-gradient(135deg, ${G}, #a8832a)`, color: '#0a0a0a', padding: '0.55rem 1.4rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 600, border: 'none', transition: 'opacity 0.2s, transform 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
        Sesión gratuita
      </button>
    </nav>
  )
}
