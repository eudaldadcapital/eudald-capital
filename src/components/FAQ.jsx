import React, { useState } from 'react'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'

const faqs = [
  { q: '¿Necesito ser rico para invertir?', a: 'No. Puedes empezar con tan solo 1.000€ y una cuota mensual menor que Netflix. La clave es empezar pronto, no empezar con mucho.' },
  { q: '¿Qué garantías hay?', a: 'La inversión en mercados no tiene garantías de rentabilidad. Lo que sí garantizo es transparencia total, acompañamiento constante y una estrategia sólida basada en evidencia histórica de largo plazo.' },
  { q: '¿Puedo retirar dinero cuando quiera?', a: 'Sí. Tu dinero está en tu propio bróker a tu nombre. Puedes retirarlo en cualquier momento. Yo solo asesoro, no gestiono directamente tu cuenta.' },
  { q: '¿Cómo pago?', a: 'El pago se acuerda directamente por WhatsApp una vez iniciado el servicio. Se realiza mensualmente de forma sencilla y directa.' },
  { q: '¿Qué es un ETF?', a: 'Un ETF es un fondo cotizado que replica un índice como el S&P 500. Es la forma más eficiente y diversificada de invertir en mercados globales con comisiones muy bajas.' },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)
  const ref = useAnimateIn(0)
  return (
    <section id="faq" style={{ padding: '6rem 2.5rem', borderTop: '1px solid #1e1e1e' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Preguntas frecuentes</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>FAQ</div>
      <div ref={ref} style={{ maxWidth: 720 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #1e1e1e' }}>
            <div onClick={() => setOpen(open === i ? null : i)} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 500, fontSize: '0.95rem', padding: '1.4rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: open === i ? '#fafaf8' : '#ccc', transition: 'color 0.2s' }}>
              {faq.q}
              <span style={{ fontSize: '1.2rem', color: open === i ? G : '#555', transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.3s, color 0.2s', flexShrink: 0, marginLeft: '1rem' }}>+</span>
            </div>
            {open === i && <div style={{ fontSize: '0.87rem', color: '#8a8a8a', lineHeight: 1.8, paddingBottom: '1.4rem' }}>{faq.a}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
