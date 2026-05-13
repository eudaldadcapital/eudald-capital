import { useEffect, useRef } from 'react'

export default function useAnimateIn(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity 0.75s ease, transform 0.75s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, delay)
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return ref
}
