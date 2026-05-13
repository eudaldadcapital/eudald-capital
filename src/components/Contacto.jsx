import React, { useState } from 'react'
import { supabase } from '../supabase'
import useAnimateIn from '../hooks/useAnimateIn'

const G = '#c9a84c'
const WA = '34662558710'

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [wait, setWait] = useState({ nombre: '', email: '' })
  const [stC, setStC] = useState(null)
  const [stW, setStW] = useState(null)
  const [ldC, setLdC] = useState(false)
  const [ldW, setLdW] = useState(false)
  const leftRef = useAnimateIn(0)
  const rightRef = useAnimateIn(150)

  const sendContact = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.mensaje) return
    setLdC(true)
    const { error } = await supabase.from('contactos').insert([form])
    setLdC(false)
    if (error) setStC('error')
    else { setStC('ok'); setForm({ nombre: '', email: '', mensaje: '' }) }
  }

  const sendWait = async (e) => {
    e.preventDefault()
    if (!wait.nombre || !wait.email) return
    setLdW(true)
    const { error } = await supabase.from('lista_espera').insert([wait])
    setLdW(false)
    if (error) setStW('error')
    else { setStW('ok'); setWait({ nombre: '', email: '' }) }
  }

  const inp = { background: '#161616', border: '1px solid #2a2a2a', borderRadius: '0.75rem', color: '#fafaf8', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', padding: '0.85rem 1.1rem', width: '100%', outline: 'none' }
  const btnG = { background: `linear-gradient(135deg,${G},#a8832a)`, color: '#0a0a0a', padding: '0.9rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, border: 'none', width: '100%', marginTop: '0.5rem', transition: 'opacity 0.2s, transform 0.2s', cursor: 'pointer' }
  const btnO = { background: 'transparent', border: `1px solid rgba(201,168,76,0.4)`, color: G, padding: '0.9rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 500, width: '100%', marginTop: '0.5rem', transition: 'all 0.2s', cursor: 'pointer' }
  const ok = { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '1rem', padding: '1rem', color: G, fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }
  const err = { background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '1rem', padding: '1rem', color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' }

  return (
    <section id="contacto" style={{ padding: '6rem 2.5rem', background: '#0d0d0d', borderTop: '1px solid #1e1e1e' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: G, marginBottom: '1rem' }}>Contacto</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>Hablemos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <div ref={leftRef}>
          <p style={{ color: '#8a8a8a', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>La sesión inicial es gratuita, de 20 minutos y sin compromiso. Cuéntame tu situación y te digo si puedo ayudarte.</p>
          <button onClick={() => window.open(`https://wa.me/${WA}?text=Hola%20Eudald%2C%20me%20gustar%C3%ADa%20reservar%20una%20sesi%C3%B3n%20gratuita`, '_blank')}
            style={{ ...btnG, width: 'auto', padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2.5rem' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
            💬 Escribir por WhatsApp
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
            <span style={{ fontSize: '0.75rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>o envía un mensaje</span>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
          </div>
          <form onSubmit={sendContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input style={inp} placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <input style={inp} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <textarea style={{ ...inp, resize: 'vertical' }} rows={4} placeholder="Cuéntame tu situación, capital disponible y objetivo..." value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} />
            <button type="submit" style={btnG} onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
              {ldC ? 'Enviando...' : 'Enviar mensaje →'}
            </button>
            {stC === 'ok' && <div style={ok}>✓ Mensaje enviado. Te respondo pronto.</div>}
            {stC === 'error' && <div style={err}>Algo fue mal. Escríbeme por WhatsApp.</div>}
          </form>
        </div>
        <div ref={rightRef} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '1.5rem', padding: '2rem' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>📋 Lista de espera</div>
          <p style={{ color: '#8a8a8a', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>Si las plazas están llenas, apúntate y te aviso cuando haya disponibilidad. Sin compromisos.</p>
          <form onSubmit={sendWait} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input style={inp} placeholder="Tu nombre" value={wait.nombre} onChange={e => setWait({ ...wait, nombre: e.target.value })} />
            <input style={inp} type="email" placeholder="Tu email" value={wait.email} onChange={e => setWait({ ...wait, email: e.target.value })} />
            <button type="submit" style={btnO} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {ldW ? 'Guardando...' : 'Apuntarme →'}
            </button>
            {stW === 'ok' && <div style={ok}>✓ Apuntado. Te aviso cuando haya plaza.</div>}
            {stW === 'error' && <div style={err}>Algo fue mal. Inténtalo de nuevo.</div>}
          </form>
        </div>
      </div>
    </section>
  )
}
