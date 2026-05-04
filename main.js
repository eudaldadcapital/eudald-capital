import { supabase } from './lib/supabase.js'
import {
  calcFixedCuota, calcFlexibleCuota, getPlanColor, getPlanBadgeClass,
  monthsSince, formatDate, fmtEur, FIXED_PLAN_RATES, FLEXIBLE_RATES
} from './lib/plans.js'

// ─── STATE ────────────────────────────────────────────────────────────────────
let clients = []
let selectedId = null
let editingId = null
let flexClientId = null

// ─── SUPABASE CRUD ────────────────────────────────────────────────────────────
async function loadClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error(error); return }
  clients = data
  if (clients.length > 0 && !selectedId) selectedId = clients[0].id
  renderAll()
}

async function insertClient(c) {
  const { data, error } = await supabase.from('clients').insert([c]).select()
  if (error) { alert('Error al guardar: ' + error.message); return null }
  return data[0]
}

async function updateClient(id, fields) {
  const { error } = await supabase.from('clients').update(fields).eq('id', id)
  if (error) { alert('Error al actualizar: ' + error.message) }
}

async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) { alert('Error al eliminar: ' + error.message) }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function totalAUM()  { return clients.reduce((s, c) => s + Number(c.capital), 0) }
function totalMRR()  { return clients.reduce((s, c) => s + Number(c.cuota || 0), 0) }
function badge(plan) { return `<span class="badge ${getPlanBadgeClass(plan)}">${plan}</span>` }
function statusBadge(s) {
  const cls = s === 'OK' ? 'b-ok' : s === 'PENDIENTE' ? 'b-pending' : 'b-upcoming'
  return `<span class="badge ${cls}">${s}</span>`
}

// ─── RENDER SIDEBAR ───────────────────────────────────────────────────────────
function renderSidebar(filter = '') {
  const list = document.getElementById('client-list')
  const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
  document.getElementById('client-count').textContent = clients.length
  document.getElementById('sidebar-aum').textContent = fmtEur(totalAUM())
  list.innerHTML = filtered.length
    ? filtered.map(c => `
        <div class="client-item${c.id === selectedId ? ' active' : ''}" data-id="${c.id}">
          <div class="c-name">${c.name}</div>
          <div class="c-plan" style="color:${getPlanColor(c.plan)}">${c.plan}</div>
          <div class="c-aum">${fmtEur(c.capital)}</div>
        </div>`).join('')
    : '<div class="loading-msg">Sin resultados</div>'
  list.querySelectorAll('.client-item').forEach(el => {
    el.addEventListener('click', () => {
      selectedId = el.dataset.id
      renderSidebar(filter)
      renderClientDetail()
      showPage('clients')
    })
  })
}

// ─── RENDER OVERVIEW ─────────────────────────────────────────────────────────
function renderOverview() {
  const pending = clients.filter(c => c.pay_status === 'PENDIENTE')
  const mrr = totalMRR()

  document.getElementById('overview-metrics').innerHTML = `
    <div class="metric-card">
      <div class="m-label">Capital gestionado</div>
      <div class="m-value gold">${fmtEur(totalAUM())}</div>
      <div class="m-sub">${clients.length} clientes activos</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Clientes activos</div>
      <div class="m-value">${clients.length}</div>
      <div class="m-sub">${clients.filter(c => c.plan === 'Flexible').length} en plan Flexible</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Ingresos mensuales</div>
      <div class="m-value green">${fmtEur(mrr)}</div>
      <div class="m-sub">${fmtEur(mrr * 12)} proyectado anual</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Pagos pendientes</div>
      <div class="m-value ${pending.length ? 'red' : 'green'}">${pending.length}</div>
      <div class="m-sub">${pending.length ? pending.map(c => c.name.split(' ')[0]).join(', ') : 'Sin pendientes'}</div>
    </div>`

  const planNames = ['Conservador', 'Moderado', 'Agresivo', 'Flexible']
  document.getElementById('plan-grid').innerHTML = planNames.map(p => {
    const cs = clients.filter(c => c.plan === p)
    const rev = cs.reduce((s, c) => s + Number(c.cuota || 0), 0)
    const cap = cs.reduce((s, c) => s + Number(c.capital), 0)
    return `
      <div class="plan-card">
        <div class="plan-card-name" style="color:${getPlanColor(p)}">${p}</div>
        <div class="plan-count">${cs.length}</div>
        <div class="plan-count-label">clientes</div>
        <div class="plan-revenue">${fmtEur(cap)} capital<br><span style="color:${getPlanColor(p)}">${fmtEur(rev)}/mes</span></div>
      </div>`
  }).join('')

  document.getElementById('overview-table').innerHTML = clients.map(c => `
    <tr class="clickable" data-id="${c.id}">
      <td style="color:#e8e0d0;font-weight:500">${c.name}</td>
      <td>${badge(c.plan)}</td>
      <td class="gold">${fmtEur(c.capital)}</td>
      <td>${c.plan === 'Flexible' ? '<span style="color:#5a5a5a">Variable</span>' : fmtEur(c.cuota || 0)}</td>
      <td style="color:#5a5a5a">${monthsSince(c.start_date)}</td>
      <td style="color:#5a5a5a">${formatDate(c.start_date)}</td>
      <td>${statusBadge(c.pay_status)}</td>
    </tr>`).join('')

  document.querySelectorAll('#overview-table tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      selectedId = row.dataset.id
      renderSidebar()
      renderClientDetail()
      showPage('clients')
    })
  })
}

// ─── RENDER PAYMENTS ──────────────────────────────────────────────────────────
function renderPayments() {
  const cobrado = clients.filter(c => c.pay_status === 'OK').reduce((s, c) => s + Number(c.cuota || 0), 0)
  const pendingClients = clients.filter(c => c.pay_status === 'PENDIENTE')
  const pendingAmt = pendingClients.reduce((s, c) => s + Number(c.cuota || 0), 0)
  const mrr = totalMRR()

  document.getElementById('payments-metrics').innerHTML = `
    <div class="metric-card">
      <div class="m-label">Cobrado este mes</div>
      <div class="m-value green">${fmtEur(cobrado)}</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Pendiente</div>
      <div class="m-value ${pendingClients.length ? 'red' : 'green'}">${fmtEur(pendingAmt)}</div>
      <div class="m-sub">${pendingClients.length} clientes</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Proyección anual</div>
      <div class="m-value gold">${fmtEur(mrr * 12)}</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Plan Flexible</div>
      <div class="m-value">${clients.filter(c => c.plan === 'Flexible').length}</div>
      <div class="m-sub muted">cuota variable</div>
    </div>`

  document.getElementById('payments-table').innerHTML = clients.map(c => {
    const obs = c.plan === 'Flexible'
      ? 'Comisión según rentabilidad mensual'
      : c.pay_status === 'PENDIENTE' ? 'Revisar cobro' : 'Al corriente'
    return `
      <tr>
        <td style="color:#e8e0d0;font-weight:500">${c.name}</td>
        <td>${badge(c.plan)}</td>
        <td class="gold">${fmtEur(c.capital)}</td>
        <td>${c.plan === 'Flexible' ? '<span style="color:#5a5a5a">Variable</span>' : fmtEur(c.cuota || 0)}</td>
        <td>${statusBadge(c.pay_status)}</td>
        <td style="color:#5a5a5a;font-size:11px">${obs}</td>
      </tr>`
  }).join('')
}

// ─── RENDER CLIENT DETAIL ─────────────────────────────────────────────────────
function renderClientDetail() {
  const view = document.getElementById('client-detail-view')
  const c = clients.find(cl => cl.id === selectedId || cl.id === String(selectedId))
  if (!c) { view.innerHTML = '<div class="empty-state">Selecciona un cliente del panel izquierdo</div>'; return }

  const months = monthsSince(c.start_date)
  const totalPaid = Number(c.cuota || 0) * months
  const pc = getPlanColor(c.plan)

  const flexNote = c.plan === 'Flexible' ? `
    <tr>
      <td style="color:#5a5a5a">Estructura de comisión</td>
      <td style="color:#5a90e0;font-size:11px">
        1.500–3.000€ → 25% beneficios<br>
        3.000–5.000€ → 20% beneficios<br>
        +5.000€ → 15% + €5/mes mantenimiento<br>
        Mes negativo → €0
      </td>
    </tr>` : ''

  view.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="detail-name">${c.name}</div>
        <div class="detail-since">Cliente desde ${formatDate(c.start_date)} &nbsp;·&nbsp; ${badge(c.plan)}</div>
      </div>
      <div class="months-badge">
        <div class="months-num">${months}</div>
        <div class="months-label">meses contigo</div>
      </div>
    </div>

    <div class="metric-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="metric-card">
        <div class="m-label">Capital gestionado</div>
        <div class="m-value gold">${fmtEur(c.capital)}</div>
      </div>
      <div class="metric-card">
        <div class="m-label">Cuota mensual</div>
        <div class="m-value" style="color:${pc}">${c.plan === 'Flexible' ? 'Variable' : fmtEur(c.cuota || 0)}</div>
        <div class="m-sub">${c.plan === 'Flexible' ? 'Según rentabilidad' : 'Fija mensual'}</div>
      </div>
      <div class="metric-card">
        <div class="m-label">Total facturado</div>
        <div class="m-value green">${fmtEur(totalPaid)}</div>
        <div class="m-sub">${months} meses × ${c.plan === 'Flexible' ? 'variable' : fmtEur(c.cuota || 0)}</div>
      </div>
    </div>

    <div class="sec-title">Ficha del cliente</div>
    <div class="t-wrap">
      <table>
        <tbody>
          <tr><td style="color:#5a5a5a;width:40%">Plan contratado</td><td>${badge(c.plan)}</td></tr>
          <tr><td style="color:#5a5a5a">Fecha de inicio</td><td>${formatDate(c.start_date)}</td></tr>
          <tr><td style="color:#5a5a5a">Meses activo</td><td class="gold">${months} meses</td></tr>
          <tr><td style="color:#5a5a5a">Capital gestionado</td><td class="gold">${fmtEur(c.capital)}</td></tr>
          <tr><td style="color:#5a5a5a">Cuota mensual</td><td>${c.plan === 'Flexible' ? '<span style="color:#5a90e0">Variable</span>' : fmtEur(c.cuota || 0)}</td></tr>
          <tr><td style="color:#5a5a5a">Estado del pago</td><td>${statusBadge(c.pay_status)}</td></tr>
          <tr><td style="color:#5a5a5a">Total facturado</td><td class="green">${fmtEur(totalPaid)}</td></tr>
          ${flexNote}
          ${c.notes ? `<tr><td style="color:#5a5a5a">Notas</td><td style="color:#8a8a8a;font-size:11px">${c.notes}</td></tr>` : ''}
        </tbody>
      </table>
    </div>

    <div class="detail-actions">
      <button class="btn-ghost" id="btn-edit-capital">Editar capital</button>
      <button class="btn-ghost" id="btn-toggle-pay">Cambiar estado pago</button>
      ${c.plan === 'Flexible' ? '<button class="btn-ghost" id="btn-flex-cuota">Calcular cuota flexible</button>' : ''}
      <button class="btn-ghost" id="btn-edit-client">Editar cliente</button>
      <button class="btn-danger" id="btn-delete-client">Eliminar</button>
    </div>`

  document.getElementById('btn-edit-capital')?.addEventListener('click', () => openEditCapital(c))
  document.getElementById('btn-toggle-pay')?.addEventListener('click', () => togglePayStatus(c.id))
  document.getElementById('btn-flex-cuota')?.addEventListener('click', () => openFlexModal(c.id))
  document.getElementById('btn-edit-client')?.addEventListener('click', () => openEditClient(c))
  document.getElementById('btn-delete-client')?.addEventListener('click', () => confirmDelete(c))
}

// ─── TOGGLE PAY STATUS ────────────────────────────────────────────────────────
async function togglePayStatus(id) {
  const c = clients.find(cl => cl.id === id)
  const opts = ['OK', 'PENDIENTE', 'PRÓXIMO']
  const next = opts[(opts.indexOf(c.pay_status) + 1) % opts.length]
  await updateClient(id, { pay_status: next })
  await loadClients()
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
async function confirmDelete(c) {
  if (!confirm(`¿Eliminar a ${c.name}? Esta acción no se puede deshacer.`)) return
  await deleteClient(c.id)
  selectedId = null
  await loadClients()
  showPage('overview')
}

// ─── MODAL: ADD / EDIT CLIENT ─────────────────────────────────────────────────
function openAddClient() {
  editingId = null
  document.getElementById('modal-title').textContent = 'Nuevo cliente'
  document.getElementById('f-name').value = ''
  document.getElementById('f-plan').value = 'Conservador'
  document.getElementById('f-capital').value = ''
  document.getElementById('f-cuota').value = ''
  document.getElementById('f-notes').value = ''
  document.getElementById('f-status').value = 'OK'
  const now = new Date()
  document.getElementById('f-date').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  document.getElementById('cuota-hint').textContent = ''
  document.getElementById('modal-overlay').classList.add('open')
}

function openEditClient(c) {
  editingId = c.id
  document.getElementById('modal-title').textContent = 'Editar cliente'
  document.getElementById('f-name').value = c.name
  document.getElementById('f-plan').value = c.plan
  document.getElementById('f-capital').value = c.capital
  document.getElementById('f-cuota').value = c.cuota || ''
  document.getElementById('f-notes').value = c.notes || ''
  document.getElementById('f-status').value = c.pay_status
  document.getElementById('f-date').value = c.start_date.substring(0, 7)
  updateCuotaHint()
  document.getElementById('modal-overlay').classList.add('open')
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open')
}

function updateCuotaHint() {
  const plan = document.getElementById('f-plan').value
  const cap = parseFloat(document.getElementById('f-capital').value) || 0
  const hint = document.getElementById('cuota-hint')
  const cuotaInput = document.getElementById('f-cuota')

  if (plan === 'Flexible') {
    if (cap < 1500) {
      hint.textContent = '⚠ El plan Flexible requiere mínimo €1.500 de capital.'
      hint.style.color = '#c0392b'
    } else {
      const tier = FLEXIBLE_RATES.find(r => cap >= r.min && cap < r.max)
      hint.textContent = tier
        ? `Comisión: ${tier.commission * 100}% sobre beneficios${tier.maintenance ? ` + €${tier.maintenance}/mes mantenimiento` : ''}. Si el mes es negativo → €0.`
        : ''
      hint.style.color = '#5a90e0'
    }
    cuotaInput.placeholder = 'Se calcula según rentabilidad'
  } else if (cap > 0) {
    const auto = calcFixedCuota(plan, cap)
    hint.textContent = auto ? `Cuota recomendada según tarifa: €${auto}/mes` : ''
    hint.style.color = '#c9a84c'
    if (!cuotaInput.value) cuotaInput.value = auto || ''
  } else {
    hint.textContent = ''
    cuotaInput.placeholder = 'Auto'
  }
}

async function saveClient() {
  const name = document.getElementById('f-name').value.trim()
  const plan = document.getElementById('f-plan').value
  const capital = parseFloat(document.getElementById('f-capital').value)
  const cuota = parseFloat(document.getElementById('f-cuota').value) || 0
  const start_date = document.getElementById('f-date').value + '-01'
  const pay_status = document.getElementById('f-status').value
  const notes = document.getElementById('f-notes').value.trim()

  if (!name || !capital || !start_date) { alert('Rellena nombre, capital y fecha.'); return }
  if (plan === 'Flexible' && capital < 1500) { alert('El plan Flexible requiere mínimo €1.500 de capital.'); return }

  const payload = { name, plan, capital, cuota, start_date, pay_status, notes }

  if (editingId) {
    await updateClient(editingId, payload)
  } else {
    const newClient = await insertClient(payload)
    if (newClient) selectedId = newClient.id
  }

  closeModal()
  await loadClients()
  if (!editingId) showPage('clients')
}

// ─── MODAL: EDIT CAPITAL ──────────────────────────────────────────────────────
function openEditCapital(c) {
  document.getElementById('cap-value').value = c.capital
  updateCapHint(c)
  document.getElementById('modal-capital').classList.add('open')
  document.getElementById('cap-save').onclick = async () => {
    const newCap = parseFloat(document.getElementById('cap-value').value)
    if (!newCap || newCap <= 0) { alert('Introduce un capital válido.'); return }
    let newCuota = c.cuota
    if (c.plan !== 'Flexible') newCuota = calcFixedCuota(c.plan, newCap)
    await updateClient(c.id, { capital: newCap, cuota: newCuota })
    document.getElementById('modal-capital').classList.remove('open')
    await loadClients()
  }
  document.getElementById('cap-value').oninput = () => updateCapHint(c)
}

function updateCapHint(c) {
  const cap = parseFloat(document.getElementById('cap-value').value) || 0
  const hint = document.getElementById('cap-cuota-hint')
  if (c.plan !== 'Flexible' && cap > 0) {
    const auto = calcFixedCuota(c.plan, cap)
    hint.textContent = auto ? `Nueva cuota automática según tarifa ${c.plan}: €${auto}/mes` : ''
    hint.style.color = '#c9a84c'
  } else { hint.textContent = '' }
}

// ─── MODAL: FLEXIBLE CUOTA ────────────────────────────────────────────────────
function openFlexModal(id) {
  flexClientId = id
  document.getElementById('flex-return').value = ''
  document.getElementById('flex-result').textContent = ''
  document.getElementById('modal-flexible').classList.add('open')
  document.getElementById('flex-return').oninput = () => {
    const c = clients.find(cl => cl.id === id)
    const ret = parseFloat(document.getElementById('flex-return').value)
    const result = document.getElementById('flex-result')
    if (isNaN(ret)) { result.textContent = ''; return }
    if (ret <= 0) {
      result.textContent = 'Mes negativo → cuota €0. No se cobra nada.'
      result.style.color = '#4caf74'
    } else {
      const cuota = calcFlexibleCuota(Number(c.capital), ret)
      result.textContent = `Beneficio: €${ret} → Cuota a cobrar: €${cuota}`
      result.style.color = '#c9a84c'
    }
  }
}

// ─── PAGE NAVIGATION ──────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('page-' + name)?.classList.add('active')
  document.querySelector(`.nav-btn[data-page="${name}"]`)?.classList.add('active')
  if (name === 'clients') renderClientDetail()
  if (name === 'payments') renderPayments()
}

function renderAll() {
  renderSidebar()
  renderOverview()
  renderPayments()
  if (selectedId) renderClientDetail()
}

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date()
  document.getElementById('clock').textContent = now.toLocaleTimeString('es-ES')
  document.getElementById('today-date').textContent = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page))
  })
  // Add client buttons
  document.getElementById('btn-add-overview')?.addEventListener('click', openAddClient)
  // Modal close
  document.getElementById('modal-close')?.addEventListener('click', closeModal)
  document.getElementById('btn-cancel')?.addEventListener('click', closeModal)
  document.getElementById('btn-save')?.addEventListener('click', saveClient)
  document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal() })
  // Capital modal
  document.getElementById('capital-close')?.addEventListener('click', () => document.getElementById('modal-capital').classList.remove('open'))
  document.getElementById('cap-cancel')?.addEventListener('click', () => document.getElementById('modal-capital').classList.remove('open'))
  // Flexible modal
  document.getElementById('flex-close')?.addEventListener('click', () => document.getElementById('modal-flexible').classList.remove('open'))
  document.getElementById('flex-cancel')?.addEventListener('click', () => document.getElementById('modal-flexible').classList.remove('open'))
  document.getElementById('flex-save')?.addEventListener('click', async () => {
    const ret = parseFloat(document.getElementById('flex-return').value)
    if (isNaN(ret)) return
    const c = clients.find(cl => cl.id === flexClientId)
    const cuota = ret <= 0 ? 0 : calcFlexibleCuota(Number(c.capital), ret)
    const status = ret <= 0 ? 'OK' : 'OK'
    await updateClient(flexClientId, { cuota, pay_status: status })
    document.getElementById('modal-flexible').classList.remove('open')
    await loadClients()
  })
  // Plan/capital change → update hint
  document.getElementById('f-plan')?.addEventListener('change', updateCuotaHint)
  document.getElementById('f-capital')?.addEventListener('input', updateCuotaHint)
  // Sidebar search
  document.getElementById('search-input')?.addEventListener('input', e => renderSidebar(e.target.value))

  // Clock
  updateClock()
  setInterval(updateClock, 1000)

  // Load data
  loadClients()
})
