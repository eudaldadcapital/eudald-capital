import React from 'react'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'

const values = [
  { icon: '🧭', title: 'Soy un acompañante, no un gestor', desc: 'Tu dinero es tuyo. Siempre. Yo nunca accedo, manejo ni toco tu capital. Tú tomas las decisiones en tu propio bróker.' },
  { icon: '📚', title: 'Comparto lo que yo haría', desc: 'No te digo lo que tienes que hacer. Te explico cómo lo haría yo según mi experiencia, y tú decides si te encaja.' },
  { icon: '🤝', title: 'Te acompaño en el proceso', desc: 'Estoy contigo para resolver dudas, explicar conceptos y ayudarte a entender los mercados. La decisión final siempre es tuya.' },
]

const clarifications = [
  { label: 'Lo que SÍ hago', items: ['Comparto mi experiencia invirtiendo', 'Te ayudo a entender ETFs y mercados', 'Te explico cómo construiría yo una cartera', 'Resuelvo tus dudas por WhatsApp', 'Te acompaño mes a mes con informes educativos'], color: G },
  { label: 'Lo que NO hago', items: ['No gestiono tu dinero', 'No accedo a tu cuenta ni bróker', 'No tomo decisiones por ti', 'No soy asesor financiero regulado (CNMV)', 'No garantizo rentabilidades'], color: '#555' },
]

export default function SobreMi() {
  const leftRef = useAnimateIn(0)
  const midRef = useAnimateIn(100)
  const rightRef = useAnimateIn(200)

  return (
    <section id="sobre-mi" style={{ padding: '6rem 2.5rem', background: '#0d0d0d', borderTop: '1px solid #1e1e1e' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Sobre mí</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>¿Quién soy y cómo trabajo?</div>
      <p style={{ color: '#8a8a8a', fontSize: '1rem', maxWidth: 600, lineHeight: 1.8, marginBottom: '3rem' }}>
        Antes de empezar, quiero que tengas esto muy claro.
      </p>

      {/* Perfil + valores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
        <div ref={leftRef} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.5rem', padding: '2.5rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.04))', border: '2px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: G, marginBottom: '1.5rem' }}>EC</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.3rem' }}>Eudald</div>
          <div style={{ color: G, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Acompañante de inversión · EudaldCapital</div>
          <p style={{ color: '#8a8a8a', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Soy inversor particular con más de dos años de experiencia gestionando mi propia cartera. Decidí crear EudaldCapital para compartir lo que he aprendido y acompañar a otras personas que quieren empezar a invertir sin complicaciones.
          </p>
          <p style={{ color: '#8a8a8a', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            <strong style={{ color: '#fafaf8' }}>No soy asesor financiero registrado.</strong> Lo que ofrezco es mi experiencia personal, explicada de forma clara y honesta, para que puedas tomar tus propias decisiones con más criterio.
          </p>
          <ul style={{ listStyle: 'none', borderTop: '1px solid #1e1e1e', paddingTop: '1.2rem' }}>
            {['Especializado en ETFs indexados a largo plazo', 'Enfoque 100% educativo y transparente', 'Estudiante de la Universitat de València', 'Inversor particular, no gestor de fondos'].map(item => (
              <li key={item} style={{ padding: '0.6rem 0', borderBottom: '1px solid #1e1e1e', color: '#8a8a8a', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: G, flexShrink: 0 }} />{item}
              </li>
            ))}
          </ul>
        </div>

        <div ref={rightRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {values.map(v => (
            <div key={v.title} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1rem', padding: '1.5rem', transition: 'border-color 0.3s, transform 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'translateX(0)' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.6rem' }}>{v.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{v.title}</div>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sí / No */}
      <div ref={midRef} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.5rem', padding: '2.5rem' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Transparencia total — esto es lo que puedes esperar</div>
        <p style={{ color: '#8a8a8a', fontSize: '0.88rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          Quiero que sepas exactamente con qué y con quién estás contando antes de dar ningún paso.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {clarifications.map(col => (
            <div key={col.label}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: col.color, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col.label}</div>
              {col.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', padding: '0.55rem 0', borderBottom: '1px solid #1a1a1a', fontSize: '0.87rem', color: '#8a8a8a' }}>
                  <span style={{ color: col.color, fontWeight: 700, flexShrink: 0, marginTop: '0.05rem' }}>{col.color === G ? '✓' : '✕'}</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: '#0d0d0d', borderRadius: '0.75rem', borderLeft: `3px solid ${G}` }}>
          <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#888' }}>Nota importante:</strong> EudaldCapital no está registrado como entidad de asesoramiento financiero en la CNMV. Toda la información compartida tiene carácter educativo y refleja la experiencia personal del autor. Las decisiones de inversión son siempre responsabilidad exclusiva del inversor.
          </p>
        </div>
      </div>
    </section>
  )
}
