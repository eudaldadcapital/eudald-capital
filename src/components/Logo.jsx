import React from 'react'

// Logo EudaldCapital en SVG — funciona siempre sin depender de archivos externos
export default function Logo({ height = 38, color = '#fafaf8', gold = '#c9a84c' }) {
  return (
    <svg height={height} viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      {/* Icono EC */}
      <rect x="2" y="4" width="30" height="30" rx="3" fill="none" stroke={color} strokeWidth="3"/>
      <text x="17" y="24" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="16" fill={color}>E</text>
      {/* C con gráfico dentro */}
      <path d="M28 10 Q44 10 44 19 Q44 28 28 28" stroke={gold} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Barras gráfico */}
      <rect x="32" y="20" width="3" height="6" rx="1" fill={gold}/>
      <rect x="36" y="17" width="3" height="9" rx="1" fill={gold}/>
      <rect x="40" y="14" width="3" height="12" rx="1" fill={gold}/>
      {/* Flecha tendencia */}
      <path d="M31 22 L36 17 L41 13" stroke={gold} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M39 12 L42 13 L41 16" stroke={gold} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Texto EUDALD */}
      <text x="52" y="22" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="15" fill={color} letterSpacing="1">EUDALD</text>
      {/* Texto CAPITAL */}
      <text x="52" y="36" fontFamily="Syne, sans-serif" fontWeight="400" fontSize="11" fill={gold} letterSpacing="3">CAPITAL</text>
    </svg>
  )
}
