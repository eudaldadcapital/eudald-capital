import React from 'react'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'

const steps = [
  { num: '01', icon: '🎯', title: 'Diagnóstico inicial', desc: '20 minutos por WhatsApp. Hablamos de tu objetivo, perfil de riesgo y capital disponible.' },
  { num: '02', icon: '📊', title: 'Cartera personalizada', desc: 'Te entrego una propuesta con distribución de activos y ETFs adaptada exactamente a ti.' },
  { num: '03', icon: '📅', title: 'Seguimiento mensual', desc: 'Informe claro con el estado de tu cartera, evolución y recomendaciones concretas.' },
  { num: '04', icon: '💬', title: 'Acompañamiento', desc: 'Resuelvo tus dudas por mensaje cuando las necesites. Nunca estás solo.' },
]

function StepCard({ step, delay }) {
  const ref = useAnimateIn(delay)
  return (
    <div ref={ref} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.2rem', padding: '2rem', position: 'relative', transition: 'border-color 0.3s, transform 0.3s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '3rem', color: 'rgba(201,168,76,0.1)', position: 'absolute', top: '1.2rem', right: '1.5rem' }}>{step.num}</div>
      <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{step.icon}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{step.title}</div>
      <p style={{ fontSize: '0.85rem', color: '#8a8a8a', lineHeight: 1.7 }}>{step.desc}</p>
    </div>
  )
}

export default function ComoFunciona() {
  const titleRef = useAnimateIn(0)
  return (
    <section id="como-funciona" style={{ padding: '6rem 2.5rem' }}>
      <div ref={titleRef}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Proceso</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Cómo funciona</div>
        <p style={{ color: '#8a8a8a', fontSize: '1rem', maxWidth: 480, lineHeight: 1.8, marginBottom: '4rem' }}>Cuatro pasos para que tu dinero empiece a trabajar para ti.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem' }}>
        {steps.map((s, i) => <StepCard key={s.num} step={s} delay={i * 100} />)}
      </div>
    </section>
  )
}
