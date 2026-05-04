// Plan definitions with exact pricing from Eudald Capital

export const PLANS = ['Conservador', 'Moderado', 'Agresivo', 'Flexible']

export const FIXED_PLAN_RATES = {
  Conservador: [
    { min: 700,  max: 2500,  cuota: 4 },
    { min: 2500, max: 3500,  cuota: 6 },
    { min: 3500, max: Infinity, cuota: 8 }
  ],
  Moderado: [
    { min: 700,  max: 2500,  cuota: 6 },
    { min: 2500, max: 3500,  cuota: 8 },
    { min: 3500, max: Infinity, cuota: 11 }
  ],
  Agresivo: [
    { min: 700,  max: 2500,  cuota: 10 },
    { min: 2500, max: 3500,  cuota: 13 },
    { min: 3500, max: Infinity, cuota: 16 }
  ]
}

export const FLEXIBLE_RATES = [
  { min: 1500, max: 3000,  commission: 0.25, maintenance: 0 },
  { min: 3000, max: 5000,  commission: 0.20, maintenance: 0 },
  { min: 5000, max: Infinity, commission: 0.15, maintenance: 5 }
]

export function calcFixedCuota(plan, capital) {
  const rates = FIXED_PLAN_RATES[plan]
  if (!rates) return 0
  const tier = rates.find(r => capital >= r.min && capital < r.max)
  return tier ? tier.cuota : 0
}

export function calcFlexibleCuota(capital, monthlyReturn) {
  // monthlyReturn: positive = earnings in €, negative = loss
  if (monthlyReturn <= 0) return 0
  const tier = FLEXIBLE_RATES.find(r => capital >= r.min && capital < r.max)
  if (!tier) return 0
  return Math.round(monthlyReturn * tier.commission + tier.maintenance)
}

export function getPlanColor(plan) {
  const colors = {
    Conservador: '#4caf74',
    Moderado:    '#c9a84c',
    Agresivo:    '#c0392b',
    Flexible:    '#5a90e0'
  }
  return colors[plan] || '#5a5a5a'
}

export function getPlanBadgeClass(plan) {
  const classes = {
    Conservador: 'b-conservador',
    Moderado:    'b-moderado',
    Agresivo:    'b-agresivo',
    Flexible:    'b-flexible'
  }
  return classes[plan] || 'b-gray'
}

export function monthsSince(dateStr) {
  const [y, m] = dateStr.split('-').map(Number)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - y) * 12 + (now.getMonth() + 1) - m)
}

export function formatDate(dateStr) {
  const [y, m] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${months[parseInt(m) - 1]} ${y}`
}

export function fmtEur(n) {
  return '€' + Number(n).toLocaleString('es-ES')
}
