import React, { useEffect, useRef, useState } from 'react'

const G = '#c9a84c'

function useCountUp(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return val
}

function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02
        if (p.y < -5) p.y = H + 5
        if (p.x < -5) p.x = W + 5
        if (p.x > W + 5) p.x = -5
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${a})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

function GridLines() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c9a84c" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
}

export default function Hero() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState('')
  const fullText = 'Invierte de forma '
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const count1 = useCountUp(1000, 1500, statsVisible)
  const count2 = useCountUp(2, 1200, statsVisible)
  const count3 = useCountUp(4, 1000, statsVisible)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    let i = 0
    const interval = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++ }
      else clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.5 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="inicio" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8rem 2.5rem 4rem', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      <ParticleCanvas />
      <GridLines />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 65%)', pointerEvents: 'none', transition: 'transform 0.1s' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 1s ease, transform 1s ease' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: G, padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '2rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: G, animation: 'pulse 2s infinite' }} />
          Educación e inversión · Valencia
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.5rem', maxWidth: 700 }}>
          <span>{typed}</span>
          <em style={{ fontStyle: 'normal', color: G }}>inteligente</em>
          <span style={{ opacity: typed.length >= fullText.length ? 1 : 0, transition: 'opacity 0.5s' }}>{' '}desde el primer euro.</span>
        </h1>

        <p style={{ fontSize: '1rem', color: '#8a8a8a', maxWidth: 460, marginBottom: '2rem', lineHeight: 1.8, opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease 0.4s' }}>
          Comparto mi experiencia y acompaño a jóvenes y adultos a entender y construir sus propias carteras de ETFs. Sencillo, transparente y a largo plazo.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e1e', padding: '0.5rem 1rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.5 }}>
            ⚠️ Servicio educativo e informativo. No constituye asesoramiento financiero regulado. Invertir conlleva riesgo de pérdida de capital.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
          <button onClick={() => go('contacto')} style={{ background: `linear-gradient(135deg, ${G}, #a8832a)`, color: '#0a0a0a', padding: '0.9rem 2rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, border: 'none', transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(201,168,76,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            Reserva tu sesión gratuita →
          </button>
          <button onClick={() => go('calculadora')} style={{ border: '1px solid #2a2a2a', color: '#fafaf8', padding: '0.9rem 2rem', borderRadius: '2rem', fontSize: '0.9rem', background: 'transparent', transition: 'border-color 0.2s, transform 0.2s, background 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'rgba(201,168,76,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'transparent' }}>
            Calcular mi ganancia
          </button>
        </div>

        <div ref={statsRef} style={{ display: 'flex', gap: '3rem', paddingTop: '3rem', borderTop: '1px solid #1e1e1e', flexWrap: 'wrap' }}>
          {[
            { num: `${count1.toLocaleString('es-ES')}€`, suffix: '', label: 'Capital mínimo de entrada' },
            { num: `+${count2}`, suffix: ' años', label: 'Experiencia invirtiendo' },
            { num: `${count3}€`, suffix: '/mes', label: 'Desde solo al mes' },
          ].map(({ num, label }) => (
            <div key={label} style={{ transition: 'transform 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '2rem', color: G }}>{num}</div>
              <div style={{ fontSize: '0.78rem', color: '#8a8a8a', letterSpacing: '0.03em', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
