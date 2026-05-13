import React from 'react'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'

const planes = [
  { name: 'Plan Conservador', range: '5–7% anual estimado', featured: false, prices: [{ c: '1.000 – 2.500€', p: '4€/mes' }, { c: '2.500 – 3.500€', p: '6€/mes' }, { c: '+3.500€', p: '8€/mes' }] },
  { name: 'Plan Moderado', range: '8–12% anual estimado', featured: true, prices: [{ c: '1.000 – 2.500€', p: '6€/mes' }, { c: '2.500 – 3.500€', p: '8€/mes' }, { c: '+3.500€', p: '11€/mes' }] },
  { name: 'Plan Agresivo', range: '12–18% anual estimado', featured: false, prices: [{ c: '1.000 – 2.500€', p: '10€/mes' }, { c: '2.500 – 3.500€', p: '13€/mes' }, { c: '+3.500€', p: '16€/mes' }] },
]

const includes = ['Diseño de cartera personalizada', 'Informe mensual completo', 'Explicación de cada movimiento', 'Acompañamiento por WhatsApp', 'Ajustes mensuales según el mercado', 'Recomendación de inversión mensual', 'Estrategia enfocada 100% en largo plazo']

const Row = ({ c, p, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: last ? 'none' : '1px solid #1a1a1a', fontSize: '0.85rem' }}>
    <span style={{ color: '#8a8a8a' }}>{c}</span>
    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{p}</span>
  </div>
)

function PlanCard({ plan, delay }) {
  const ref = useAnimateIn(delay)
  return (
    <div ref={ref} style={{ background: '#111', border: plan.featured ? '1px solid rgba(201,168,76,0.45)' : '1px solid #1e1e1e', borderRadius: '1.5rem', padding: '2rem', transition: 'border-color 0.3s, transform 0.3s' }}
      onMouseEnter={e => { if (!plan.featured) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { if (!plan.featured) e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.transform = 'translateY(0)' }}>
      {plan.featured && <div style={{ background: 'rgba(201,168,76,0.12)', color: G, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', borderRadius: '2rem', display: 'inline-block', marginBottom: '0.8rem' }}>Más popular</div>}
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.3rem' }}>{plan.name}</div>
      <div style={{ fontSize: '0.8rem', color: G, marginBottom: '1.5rem' }}>{plan.range}</div>
      {plan.prices.map((r, i) => <Row key={i} c={r.c} p={r.p} last={i === plan.prices.length - 1} />)}
    </div>
  )
}

export default function Precios() {
  const titleRef = useAnimateIn(0)
  const flexRef = useAnimateIn(100)
  const inclRef = useAnimateIn(150)

  return (
    <section id="precios" style={{ padding: '6rem 2.5rem' }}>
      <div ref={titleRef}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Planes y precios</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Elige tu plan</div>
        <p style={{ color: '#8a8a8a', fontSize: '1rem', maxWidth: 520, lineHeight: 1.8, marginBottom: '3rem' }}>Tu cuota se adapta a tu capital y objetivo. Siempre pagas mucho menos de lo que ganarías.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {planes.map((plan, i) => <PlanCard key={plan.name} plan={plan} delay={i * 100} />)}
      </div>

      <div ref={flexRef} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '3rem' }}>
        <div style={{ background: 'rgba(201,168,76,0.1)', color: G, fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.3rem 0.8rem', borderRadius: '2rem', display: 'inline-block', marginBottom: '0.8rem' }}>Plan especial</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.4rem' }}>Plan Flexible — Pagas solo si ganas</div>
        <p style={{ color: '#8a8a8a', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Para inversores que prefieren pagar únicamente cuando su cartera obtiene beneficios. Sin cuota mensual fija.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>Comisión sobre beneficios</div>
            {[{ c: '1.500 – 3.000€', p: '25% sobre beneficios' }, { c: '3.000 – 5.000€', p: '20% sobre beneficios' }, { c: '+5.000€', p: '15% + 5€/mes' }].map((r, i, a) => <Row key={i} c={r.c} p={r.p} last={i === a.length - 1} />)}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>Ejemplo real</div>
            <div style={{ background: '#161616', borderRadius: '1rem', padding: '1.2rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '0.4rem' }}>Si inviertes <strong style={{ color: '#fafaf8' }}>2.000€</strong> y sube un <strong style={{ color: '#fafaf8' }}>2%</strong> ese mes:</p>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '0.4rem' }}>Generas <strong style={{ color: G }}>40€ de beneficio</strong></p>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '0.4rem' }}>Solo pagas <strong style={{ color: '#fafaf8' }}>10€</strong></p>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: 0 }}>Mes negativo → <strong style={{ color: '#fafaf8' }}>no pagas nada</strong></p>
            </div>
            {['Solo cobramos si tu cartera sube', 'Nunca pagas dos veces por el mismo beneficio'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#8a8a8a', padding: '0.35rem 0' }}>
                <span style={{ color: G, fontWeight: 600 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={inclRef}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '1rem', marginBottom: '1.2rem' }}>Incluido en todos los planes</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.5rem', marginBottom: '2rem' }}>
          {includes.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.6rem 0', fontSize: '0.87rem', color: '#8a8a8a' }}>
              <span style={{ color: G, flexShrink: 0 }}>✓</span>{item}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.77rem', color: '#444', fontStyle: 'italic', borderLeft: '2px solid #1e1e1e', paddingLeft: '1rem', lineHeight: 1.7 }}>
          Los porcentajes de rentabilidad mostrados son estimaciones basadas en escenarios proyectados. Toda inversión conlleva riesgo y no existe una rentabilidad exacta o garantizada.
        </p>
      </div>
    </section>
  )
}
