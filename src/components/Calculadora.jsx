import React, { useState, useMemo } from 'react'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'

const PLANES = [
  { name: 'Conservador', min: 5, max: 7, cuotas: [4, 6, 8] },
  { name: 'Moderado', min: 8, max: 12, cuotas: [6, 8, 11] },
  { name: 'Agresivo', min: 12, max: 18, cuotas: [10, 13, 16] },
]

function getCuota(plan, capital) {
  if (capital <= 2500) return plan.cuotas[0]
  if (capital <= 3500) return plan.cuotas[1]
  return plan.cuotas[2]
}

function calcular(capital, aportacion, tasa, anos) {
  const r = tasa / 100 / 12
  const datos = []
  let valor = capital
  for (let m = 1; m <= anos * 12; m++) {
    valor = valor * (1 + r) + aportacion
    if (m % 12 === 0) datos.push(Math.round(valor))
  }
  return datos
}

const fmt = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + '€'

export default function Calculadora() {
  const [capital, setCapital] = useState(2000)
  const [aportacion, setAportacion] = useState(100)
  const [anos, setAnos] = useState(10)
  const [planIdx, setPlanIdx] = useState(1)
  const titleRef = useAnimateIn(0)
  const controlsRef = useAnimateIn(100)
  const resultsRef = useAnimateIn(200)

  const plan = PLANES[planIdx]
  const tasa = (plan.min + plan.max) / 2
  const cuota = getCuota(plan, capital)
  const cuotaTotal = cuota * 12 * anos
  const invertidoTotal = capital + aportacion * 12 * anos

  const datosBrutos = useMemo(() => calcular(capital, aportacion, tasa, anos), [capital, aportacion, tasa, anos])
  const finalBruto = datosBrutos[datosBrutos.length - 1] || capital
  const finalNeto = finalBruto - cuotaTotal
  const gananciaBruta = finalBruto - invertidoTotal
  const gananciaNeta = finalNeto - invertidoTotal

  const W = 520, H = 180, PX = 8, PY = 8
  const datosNetos = datosBrutos.map((v, i) => v - cuota * 12 * (i + 1))
  const maxV = Math.max(...datosBrutos)
  const minV = Math.min(capital, ...datosNetos)
  const range = maxV - minV || 1
  const tx = (i) => PX + (i / (datosBrutos.length - 1)) * (W - PX * 2)
  const ty = (v) => H - PY - ((v - minV) / range) * (H - PY * 2)
  const pathB = datosBrutos.map((v, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(v)}`).join(' ')
  const pathN = datosNetos.map((v, i) => `${i === 0 ? 'M' : 'L'}${tx(i)},${ty(v)}`).join(' ')
  const areaB = pathB + ` L${tx(datosBrutos.length-1)},${H-PY} L${PX},${H-PY} Z`
  const areaN = pathN + ` L${tx(datosNetos.length-1)},${H-PY} L${PX},${H-PY} Z`

  return (
    <section id="calculadora" style={{ padding: '6rem 2.5rem', background: '#0d0d0d', borderTop: '1px solid #1e1e1e' }}>
      <div ref={titleRef}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Herramienta gratuita</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '0.8rem' }}>Calcula tu estimación</div>
        <p style={{ color: '#8a8a8a', fontSize: '1rem', lineHeight: 1.8, marginBottom: '3rem', maxWidth: 520 }}>Descubre cuánto puede crecer tu dinero y cuánto te costaría el servicio cada mes.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        <div ref={controlsRef} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>Plan de inversión</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {PLANES.map((p, i) => (
                <button key={p.name} onClick={() => setPlanIdx(i)} style={{ flex: 1, padding: '0.6rem 0', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 500, border: planIdx === i ? `1px solid ${G}` : '1px solid #2a2a2a', background: planIdx === i ? 'rgba(201,168,76,0.1)' : 'transparent', color: planIdx === i ? G : '#8a8a8a', transition: 'all 0.2s', cursor: 'pointer' }}>{p.name}</button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.5rem' }}>Rentabilidad estimada: {plan.min}–{plan.max}% anual</div>
          </div>

          {[
            { label: 'Capital inicial', val: fmt(capital), min: 1000, max: 20000, step: 100, value: capital, set: setCapital },
            { label: 'Aportación mensual', val: fmt(aportacion), min: 0, max: 1000, step: 25, value: aportacion, set: setAportacion },
            { label: 'Horizonte temporal', val: `${anos} años`, min: 1, max: 30, step: 1, value: anos, set: setAnos },
          ].map(({ label, val, min, max, step, value, set }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.6rem' }}>
                <span style={{ color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ color: G, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{val}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} style={{ width: '100%', accentColor: G, padding: 0, background: 'transparent', border: 'none', cursor: 'pointer' }} />
            </div>
          ))}

          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1rem', padding: '1.2rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>Resumen</div>
            {[['Capital inicial', fmt(capital)], ['Aportaciones totales', fmt(aportacion * 12 * anos)], ['Cuota mensual del plan', fmt(cuota) + '/mes'], ['Coste total del servicio', fmt(cuotaTotal)]].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #1a1a1a', fontSize: '0.84rem' }}>
                <span style={{ color: '#8a8a8a' }}>{label}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '1.2rem', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Valor estimado en {anos} años</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '2rem', color: G }}>{fmt(finalBruto)}</div>
            <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.3rem' }}>Ganancia bruta: <span style={{ color: G }}>+{fmt(gananciaBruta)}</span></div>
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.2rem', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Tras descontar la cuota del servicio</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '2rem', color: '#fafaf8' }}>{fmt(finalNeto)}</div>
            <div style={{ fontSize: '0.78rem', color: '#8a8a8a', marginTop: '0.3rem' }}>Ganancia neta: <span style={{ color: '#fafaf8' }}>+{fmt(gananciaNeta)}</span> · Coste: <span style={{ color: '#555' }}>-{fmt(cuotaTotal)}</span></div>
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
              {[['#c9a84c', 'Sin cuota'], ['#6b8cff', 'Descontando cuota']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#8a8a8a' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />{label}
                </div>
              ))}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b8cff" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#6b8cff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaB} fill="url(#gG)" />
              <path d={areaN} fill="url(#gB)" />
              <path d={pathB} fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
              <path d={pathN} fill="none" stroke="#6b8cff" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3" />
              {datosBrutos.map((_, i) => {
                const step = Math.ceil(anos / 5)
                if ((i + 1) % step !== 0 && i !== datosBrutos.length - 1) return null
                return <text key={i} x={tx(i)} y={H + 4} textAnchor="middle" fill="#444" fontSize="9">{i + 1}a</text>
              })}
            </svg>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#333', fontStyle: 'italic', borderLeft: '2px solid #1e1e1e', paddingLeft: '1rem', lineHeight: 1.7 }}>
            Estimación basada en {tasa}% anual con capitalización mensual. No es una garantía. Toda inversión conlleva riesgo.
          </p>
        </div>
      </div>
    </section>
  )
}
