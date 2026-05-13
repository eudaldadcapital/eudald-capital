import React from 'react'
import Logo from './Logo'

const G = '#c9a84c'

export default function Footer() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer style={{ borderTop: '1px solid #1e1e1e' }}>
      {/* Disclaimer */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1e1e1e', padding: '1.5rem 2.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#444', lineHeight: 1.7, maxWidth: 800 }}>
          <strong style={{ color: '#555' }}>Aviso legal:</strong> EudaldCapital no es una entidad regulada por la CNMV. Los contenidos de esta web tienen carácter meramente informativo y educativo, y no constituyen asesoramiento financiero personalizado. Toda decisión de inversión es responsabilidad exclusiva del usuario. Invertir en mercados financieros conlleva riesgo de pérdida parcial o total del capital invertido. Las rentabilidades pasadas no garantizan rentabilidades futuras.
        </p>
      </div>
      {/* Footer principal */}
      <div style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ opacity: 0.6 }}>
          <Logo height={30} />
        </div>
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          {[['como-funciona', 'Cómo funciona'], ['precios', 'Precios'], ['calculadora', 'Calculadora'], ['contacto', 'Contacto']].map(([id, label]) => (
            <li key={id}>
              <span onClick={() => go(id)} style={{ fontSize: '0.78rem', color: '#444', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#8a8a8a'}
                onMouseLeave={e => e.target.style.color = '#444'}>
                {label}
              </span>
            </li>
          ))}
        </ul>
        <div style={{ fontSize: '0.75rem', color: '#333' }}>© 2025 EudaldCapital · Valencia</div>
      </div>
    </footer>
  )
}
