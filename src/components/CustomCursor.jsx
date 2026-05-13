import React, { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const dotPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)

    let raf
    const animate = () => {
      dotPos.current.x += (pos.current.x - dotPos.current.x) * 0.12
      dotPos.current.y += (pos.current.y - dotPos.current.y) * 0.12
      if (cursorRef.current) {
        cursorRef.current.style.left = dotPos.current.x + 'px'
        cursorRef.current.style.top = dotPos.current.y + 'px'
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    const over = () => { if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(2.5)'; if (dotRef.current) dotRef.current.style.opacity = '0' }
    const out = () => { if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1)'; if (dotRef.current) dotRef.current.style.opacity = '1' }
    document.querySelectorAll('a,button,[onclick]').forEach(el => { el.addEventListener('mouseenter', over); el.addEventListener('mouseleave', out) })

    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <div ref={cursorRef} style={{ position: 'fixed', width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(201,168,76,0.6)', pointerEvents: 'none', zIndex: 9999, transform: 'translate(-50%,-50%)', transition: 'transform 0.3s ease, border-color 0.3s', mixBlendMode: 'difference', top: 0, left: 0 }} />
      <div ref={dotRef} style={{ position: 'fixed', width: 5, height: 5, borderRadius: '50%', background: '#c9a84c', pointerEvents: 'none', zIndex: 9999, transform: 'translate(-50%,-50%)', top: 0, left: 0, transition: 'opacity 0.2s' }} />
    </>
  )
}
