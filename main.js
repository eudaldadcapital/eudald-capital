import { supabase } from './supabase.js'
import {
  calcFixedCuota, calcFlexibleCuota, getPlanColor, getPlanBadgeClass,
  monthsSince, formatDate, fmtEur, FIXED_PLAN_RATES, FLEXIBLE_RATES
} from './plans.js'

// ─── STATE ────────────────────────────────────────────────────────────────────
let clients = []
let payments = []
let returns = []
let selectedId = null
let editingId = null
let flexClientId = null

// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) showDashboard()
  else showLoginScreen()
}
function showLoginScreen() { document.getElementById('login-screen').classList.remove('hidden') }
function showDashboard() { document.getElementById('login-screen').classList.add('hidden'); loadAll() }
async function logout() { await supabase.auth.signOut(); document.getElementById('login-screen').classList.remove('hidden') }
window.logout = logout

// ─── SUPABASE CRUD ────────────────────────────────────────────────────────────
async function loadAll() {
  const [{ data: c }, { data: p }, { data: r }] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: true }),
    supabase.from('payments').select('*').order('created_at', { ascending: false }),
    supabase.from('returns').select('*').order('created_at', { ascending: false })
  ])
  clients = c || []
  payments = p || []
  returns = r || []
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
  if (error) alert('Error al actualizar: ' + error.message)
}
async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) alert('Error al eliminar: ' + error.message)
}
async function insertPayment(p) {
  const { error } = await supabase.from('payments').insert([p])
  if (error) alert('Error al registrar pago: ' + error.message)
}
async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) alert('Error al eliminar pago: ' + error.message)
}
async function insertReturn(r) {
  const { error } = await supabase.from('returns').insert([r])
  if (error) alert('Error al registrar rentabilidad: ' + error.message)
}
async function deleteReturn(id) {
  const { error } = await supabase.from('returns').delete().eq('id', id)
  if (error) alert('Error al eliminar rentabilidad: ' + error.message)
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function totalAUM() { return clients.reduce((s, c) => s + Number(c.capital), 0) }
function totalMRR() { return clients.reduce((s, c) => s + Number(c.cuota || 0), 0) }
function badge(plan) { return `<span class="badge ${getPlanBadgeClass(plan)}">${plan}</span>` }
function statusBadge(s) {
  const cls = s === 'OK' ? 'b-ok' : s === 'PENDIENTE' ? 'b-pending' : 'b-upcoming'
  return `<span class="badge ${cls}">${s}</span>`
}
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function formatMonth(m) {
  const [y, mo] = m.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${months[parseInt(mo) - 1]} ${y}`
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
  const thisMonth = currentMonth()
  const collectedThisMonth = payments
    .filter(p => p.month === thisMonth && p.status === 'OK')
    .reduce((s, p) => s + Number(p.amount), 0)

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
    return `<div class="plan-card">
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

// ─── RENDER PAYMENTS PAGE ─────────────────────────────────────────────────────
function renderPayments() {
  const cobrado = clients.filter(c => c.pay_status === 'OK').reduce((s, c) => s + Number(c.cuota || 0), 0)
  const pendingClients = clients.filter(c => c.pay_status === 'PENDIENTE')
  const pendingAmt = pendingClients.reduce((s, c) => s + Number(c.cuota || 0), 0)
  const mrr = totalMRR()
  const totalHistorico = payments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)

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
      <div class="m-label">Total histórico</div>
      <div class="m-value">${fmtEur(totalHistorico)}</div>
      <div class="m-sub">${payments.length} pagos registrados</div>
    </div>`

  // Historial completo
  const grouped = {}
  payments.forEach(p => {
    if (!grouped[p.month]) grouped[p.month] = []
    grouped[p.month].push(p)
  })
  const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  document.getElementById('payments-history').innerHTML = sortedMonths.length ? sortedMonths.map(month => {
    const monthPayments = grouped[month]
    const monthTotal = monthPayments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)
    const client = (id) => clients.find(c => c.id === id)
    return `
      <div class="month-group">
        <div class="month-header">
          <span>${formatMonth(month)}</span>
          <span class="green">${fmtEur(monthTotal)} cobrado</span>
        </div>
        ${monthPayments.map(p => {
          const c = client(p.client_id)
          return `<div class="payment-row-hist">
            <span style="color:#e8e0d0;font-weight:500">${c ? c.name : 'Cliente eliminado'}</span>
            <span>${c ? badge(c.plan) : ''}</span>
            <span class="gold">${fmtEur(p.amount)}</span>
            <span>${statusBadge(p.status)}</span>
            <span style="color:#3a3a3a;font-size:11px">${p.notes || ''}</span>
            <button class="del-pay-btn" data-id="${p.id}">✕</button>
          </div>`
        }).join('')}
      </div>`
  }).join('') : '<div class="empty-state" style="margin-top:20px;">Sin pagos registrados aún. Registra el primer pago desde la ficha de un cliente.</div>'

  document.querySelectorAll('.del-pay-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este registro de pago?')) return
      await deletePayment(btn.dataset.id)
      await loadAll()
      showPage('payments')
    })
  })
}

// ─── RENDER CLIENT DETAIL ─────────────────────────────────────────────────────
function renderClientDetail() {
  const view = document.getElementById('client-detail-view')
  const c = clients.find(cl => cl.id === selectedId || cl.id === String(selectedId))
  if (!c) { view.innerHTML = '<div class="empty-state">Selecciona un cliente del panel izquierdo</div>'; return }

  const months = monthsSince(c.start_date)
  const pc = getPlanColor(c.plan)
  const clientPayments = payments.filter(p => p.client_id === c.id).sort((a, b) => b.month.localeCompare(a.month))
  const totalPaid = clientPayments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)

  const flexNote = c.plan === 'Flexible' ? `
    <tr><td style="color:#5a5a5a">Estructura comisión</td>
    <td style="color:#5a90e0;font-size:11px">
      1.500–3.000€ → 25% · 3.000–5.000€ → 20% · +5.000€ → 15% + €5/mes<br>Mes negativo → €0
    </td></tr>` : ''

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

    <div class="metric-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="metric-card">
        <div class="m-label">Capital gestionado</div>
        <div class="m-value gold">${fmtEur(c.capital)}</div>
      </div>
      <div class="metric-card">
        <div class="m-label">Cuota mensual</div>
        <div class="m-value" style="color:${pc}">${c.plan === 'Flexible' ? 'Variable' : fmtEur(c.cuota || 0)}</div>
      </div>
      <div class="metric-card">
        <div class="m-label">Total cobrado</div>
        <div class="m-value green">${fmtEur(totalPaid)}</div>
        <div class="m-sub">${clientPayments.length} pagos registrados</div>
      </div>
      <div class="metric-card">
        <div class="m-label">Estado actual</div>
        <div class="m-value" style="font-size:16px;margin-top:10px">${statusBadge(c.pay_status)}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div class="sec-title">Ficha</div>
        <div class="t-wrap">
          <table><tbody>
            <tr><td style="color:#5a5a5a;width:45%">Plan</td><td>${badge(c.plan)}</td></tr>
            <tr><td style="color:#5a5a5a">Inicio</td><td>${formatDate(c.start_date)}</td></tr>
            <tr><td style="color:#5a5a5a">Meses activo</td><td class="gold">${months}</td></tr>
            <tr><td style="color:#5a5a5a">Capital</td><td class="gold">${fmtEur(c.capital)}</td></tr>
            <tr><td style="color:#5a5a5a">Cuota</td><td>${c.plan === 'Flexible' ? '<span style="color:#5a90e0">Variable</span>' : fmtEur(c.cuota || 0)}</td></tr>
            ${flexNote}
            ${c.notes ? `<tr><td style="color:#5a5a5a">Notas</td><td style="color:#8a8a8a;font-size:11px">${c.notes}</td></tr>` : ''}
          </tbody></table>
        </div>
      </div>
      <div>
        <div class="sec-title">
          Historial de pagos
          <button class="add-btn" id="btn-add-payment">+ Registrar pago</button>
        </div>
        <div class="t-wrap">
          ${clientPayments.length ? `
          <table>
            <thead><tr><th>Mes</th><th>Importe</th><th>Estado</th><th>Nota</th><th></th></tr></thead>
            <tbody>
              ${clientPayments.map(p => `
                <tr>
                  <td style="color:#e8e0d0">${formatMonth(p.month)}</td>
                  <td class="gold">${fmtEur(p.amount)}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td style="color:#5a5a5a;font-size:11px">${p.notes || '—'}</td>
                  <td><button class="del-pay-btn" data-id="${p.id}" style="background:none;border:none;color:#3a3a3a;cursor:pointer;font-size:12px">✕</button></td>
                </tr>`).join('')}
            </tbody>
          </table>` : '<div style="padding:16px;color:#3a3a3a;font-size:11px;text-align:center">Sin pagos registrados</div>'}
        </div>
      </div>
    </div>

    <div class="sec-title" style="margin-top:16px">
      Rentabilidad mensual
      <button class="add-btn" id="btn-add-return">+ Registrar rentabilidad</button>
    </div>
    <div id="client-returns-view">${renderClientReturns(c)}</div>

    <div class="detail-actions" style="margin-top:8px">
      <button class="btn-ghost" id="btn-edit-capital">Editar capital</button>
      <button class="btn-ghost" id="btn-toggle-pay">Cambiar estado</button>
      ${c.plan === 'Flexible' ? '<button class="btn-ghost" id="btn-flex-cuota">Cuota flexible</button>' : ''}
      <button class="btn-ghost" id="btn-edit-client">Editar</button>
      <button class="btn-ghost" id="btn-export-client">↓ Exportar PDF</button>
      <button class="btn-danger" id="btn-delete-client">Eliminar cliente</button>
    </div>`

  document.getElementById('btn-edit-capital')?.addEventListener('click', () => openEditCapital(c))
  document.getElementById('btn-toggle-pay')?.addEventListener('click', () => togglePayStatus(c.id))
  document.getElementById('btn-flex-cuota')?.addEventListener('click', () => openFlexModal(c.id))
  document.getElementById('btn-edit-client')?.addEventListener('click', () => openEditClient(c))
  document.getElementById('btn-delete-client')?.addEventListener('click', () => confirmDelete(c))
  document.getElementById('btn-export-client')?.addEventListener('click', () => exportClientPDF(c.id))
  document.getElementById('btn-add-return')?.addEventListener('click', () => openAddReturn(c))
  document.querySelectorAll('.del-ret-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar esta rentabilidad?')) return
      await deleteReturn(btn.dataset.id)
      await loadAll()
    })
  })
  document.getElementById('btn-add-payment')?.addEventListener('click', () => openAddPayment(c))
  document.querySelectorAll('.del-pay-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este registro?')) return
      await deletePayment(btn.dataset.id)
      await loadAll()
    })
  })
}

// ─── MODAL: REGISTER PAYMENT ──────────────────────────────────────────────────
function openAddPayment(c) {
  document.getElementById('pay-client-name').textContent = c.name
  document.getElementById('pay-month').value = currentMonth()
  document.getElementById('pay-amount').value = c.cuota || ''
  document.getElementById('pay-status').value = 'OK'
  document.getElementById('pay-notes').value = ''
  if (c.plan === 'Flexible') {
    document.getElementById('pay-flex-hint').style.display = 'block'
  } else {
    document.getElementById('pay-flex-hint').style.display = 'none'
  }
  document.getElementById('modal-payment').classList.add('open')
  document.getElementById('pay-save').onclick = async () => {
    const amount = parseFloat(document.getElementById('pay-amount').value)
    const month = document.getElementById('pay-month').value
    const status = document.getElementById('pay-status').value
    const notes = document.getElementById('pay-notes').value.trim()
    if (!amount || !month) { alert('Rellena importe y mes.'); return }
    await insertPayment({ client_id: c.id, amount, month, status, notes })
    await updateClient(c.id, { pay_status: status })
    document.getElementById('modal-payment').classList.remove('open')
    await loadAll()
  }
}

// ─── TOGGLE PAY STATUS ────────────────────────────────────────────────────────
async function togglePayStatus(id) {
  const c = clients.find(cl => cl.id === id)
  const opts = ['OK', 'PENDIENTE', 'PRÓXIMO']
  const next = opts[(opts.indexOf(c.pay_status) + 1) % opts.length]
  await updateClient(id, { pay_status: next })
  await loadAll()
}

// ─── DELETE CLIENT ────────────────────────────────────────────────────────────
async function confirmDelete(c) {
  if (!confirm(`¿Eliminar a ${c.name}? Esta acción no se puede deshacer.`)) return
  await deleteClient(c.id)
  selectedId = null
  await loadAll()
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
function closeModal() { document.getElementById('modal-overlay').classList.remove('open') }
function updateCuotaHint() {
  const plan = document.getElementById('f-plan').value
  const cap = parseFloat(document.getElementById('f-capital').value) || 0
  const hint = document.getElementById('cuota-hint')
  const cuotaInput = document.getElementById('f-cuota')
  if (plan === 'Flexible') {
    if (cap < 1500) { hint.textContent = '⚠ Plan Flexible requiere mínimo €1.500.'; hint.style.color = '#c0392b' }
    else {
      const tier = FLEXIBLE_RATES.find(r => cap >= r.min && cap < r.max)
      hint.textContent = tier ? `Comisión: ${tier.commission * 100}% sobre beneficios${tier.maintenance ? ` + €${tier.maintenance}/mes` : ''}. Mes negativo → €0.` : ''
      hint.style.color = '#5a90e0'
    }
    cuotaInput.placeholder = 'Según rentabilidad'
  } else if (cap > 0) {
    const auto = calcFixedCuota(plan, cap)
    hint.textContent = auto ? `Cuota según tarifa: €${auto}/mes` : ''
    hint.style.color = '#c9a84c'
    if (!cuotaInput.value) cuotaInput.value = auto || ''
  } else { hint.textContent = ''; cuotaInput.placeholder = 'Auto' }
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
  if (plan === 'Flexible' && capital < 1500) { alert('Plan Flexible requiere mínimo €1.500.'); return }
  const payload = { name, plan, capital, cuota, start_date, pay_status, notes }
  if (editingId) { await updateClient(editingId, payload) }
  else { const nc = await insertClient(payload); if (nc) selectedId = nc.id }
  closeModal()
  await loadAll()
  if (!editingId) showPage('clients')
}

// ─── MODAL: EDIT CAPITAL ──────────────────────────────────────────────────────
function openEditCapital(c) {
  document.getElementById('cap-value').value = c.capital
  updateCapHint(c)
  document.getElementById('modal-capital').classList.add('open')
  document.getElementById('cap-save').onclick = async () => {
    const newCap = parseFloat(document.getElementById('cap-value').value)
    if (!newCap || newCap <= 0) { alert('Capital inválido.'); return }
    let newCuota = c.cuota
    if (c.plan !== 'Flexible') newCuota = calcFixedCuota(c.plan, newCap)
    await updateClient(c.id, { capital: newCap, cuota: newCuota })
    document.getElementById('modal-capital').classList.remove('open')
    await loadAll()
  }
  document.getElementById('cap-value').oninput = () => updateCapHint(c)
}
function updateCapHint(c) {
  const cap = parseFloat(document.getElementById('cap-value').value) || 0
  const hint = document.getElementById('cap-cuota-hint')
  if (c.plan !== 'Flexible' && cap > 0) {
    const auto = calcFixedCuota(c.plan, cap)
    hint.textContent = auto ? `Nueva cuota automática: €${auto}/mes` : ''
    hint.style.color = '#c9a84c'
  } else hint.textContent = ''
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
    if (ret <= 0) { result.textContent = 'Mes negativo → cuota €0.'; result.style.color = '#4caf74' }
    else { const cuota = calcFlexibleCuota(Number(c.capital), ret); result.textContent = `Beneficio €${ret} → Cuota: €${cuota}`; result.style.color = '#c9a84c' }
  }
}

// ─── PAGE NAV ─────────────────────────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('page-' + name)?.classList.add('active')
  document.querySelector(`.nav-btn[data-page="${name}"]`)?.classList.add('active')
  if (name === 'clients') renderClientDetail()
  if (name === 'payments') renderPayments()
  if (name === 'analytics') renderAnalytics()
}
function renderAll() { renderSidebar(); renderOverview(); renderPayments(); if (selectedId) renderClientDetail() }

// ─── CLOCK ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date()
  document.getElementById('clock').textContent = now.toLocaleTimeString('es-ES')
  document.getElementById('today-date').textContent = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btn-login')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value
    const errorEl = document.getElementById('login-error')
    if (!email || !password) { errorEl.textContent = 'Introduce email y contraseña.'; errorEl.classList.add('show'); return }
    document.getElementById('btn-login').textContent = 'Entrando...'
    document.getElementById('btn-login').disabled = true
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { errorEl.textContent = 'Email o contraseña incorrectos.'; errorEl.classList.add('show'); document.getElementById('btn-login').textContent = 'Entrar'; document.getElementById('btn-login').disabled = false }
    else showDashboard()
  })
  document.getElementById('login-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-login').click() })
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)))
  document.getElementById('btn-add-overview')?.addEventListener('click', openAddClient)
  document.getElementById('btn-export-overview')?.addEventListener('click', exportOverviewPDF)
  document.getElementById('modal-close')?.addEventListener('click', closeModal)
  document.getElementById('btn-cancel')?.addEventListener('click', closeModal)
  document.getElementById('btn-save')?.addEventListener('click', saveClient)
  document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal() })
  document.getElementById('capital-close')?.addEventListener('click', () => document.getElementById('modal-capital').classList.remove('open'))
  document.getElementById('cap-cancel')?.addEventListener('click', () => document.getElementById('modal-capital').classList.remove('open'))
  document.getElementById('flex-close')?.addEventListener('click', () => document.getElementById('modal-flexible').classList.remove('open'))
  document.getElementById('flex-cancel')?.addEventListener('click', () => document.getElementById('modal-flexible').classList.remove('open'))
  document.getElementById('flex-save')?.addEventListener('click', async () => {
    const ret = parseFloat(document.getElementById('flex-return').value)
    if (isNaN(ret)) return
    const c = clients.find(cl => cl.id === flexClientId)
    const cuota = ret <= 0 ? 0 : calcFlexibleCuota(Number(c.capital), ret)
    await updateClient(flexClientId, { cuota, pay_status: 'OK' })
    document.getElementById('modal-flexible').classList.remove('open')
    await loadAll()
  })
  document.getElementById('payment-close')?.addEventListener('click', () => document.getElementById('modal-payment').classList.remove('open'))
  document.getElementById('pay-cancel')?.addEventListener('click', () => document.getElementById('modal-payment').classList.remove('open'))
  document.getElementById('f-plan')?.addEventListener('change', updateCuotaHint)
  document.getElementById('f-capital')?.addEventListener('input', updateCuotaHint)
  document.getElementById('return-close')?.addEventListener('click', () => document.getElementById('modal-return').classList.remove('open'))
  document.getElementById('ret-cancel')?.addEventListener('click', () => document.getElementById('modal-return').classList.remove('open'))
  document.getElementById('search-input')?.addEventListener('input', e => renderSidebar(e.target.value))
  updateClock()
  setInterval(updateClock, 1000)
  await initAuth()
})

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
function exportOverviewPDF() {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  // Header
  doc.setFillColor(201, 168, 76)
  doc.rect(0, 0, 220, 18, 'F')
  doc.setTextColor(8, 8, 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('EUDALD CAPITAL', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Advisory Dashboard', 14, 17)

  // Date
  doc.setTextColor(90, 90, 90)
  doc.setFontSize(9)
  doc.text(`Generado el ${today}`, 14, 26)

  // Summary metrics
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen ejecutivo', 14, 36)

  const mrr = totalMRR()
  const aum = totalAUM()
  const pending = clients.filter(c => c.pay_status === 'PENDIENTE').length

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text(`Capital total gestionado:`, 14, 44)
  doc.setTextColor(201, 168, 76)
  doc.text(`${fmtEur(aum)}`, 80, 44)

  doc.setTextColor(90, 90, 90)
  doc.text(`Clientes activos:`, 14, 51)
  doc.setTextColor(20, 20, 20)
  doc.text(`${clients.length}`, 80, 51)

  doc.setTextColor(90, 90, 90)
  doc.text(`Ingresos mensuales:`, 14, 58)
  doc.setTextColor(76, 175, 116)
  doc.text(`${fmtEur(mrr)}`, 80, 58)

  doc.setTextColor(90, 90, 90)
  doc.text(`Pagos pendientes:`, 14, 65)
  doc.setTextColor(pending > 0 ? 192 : 76, pending > 0 ? 57 : 175, pending > 0 ? 43 : 116)
  doc.text(`${pending}`, 80, 65)

  doc.setTextColor(90, 90, 90)
  doc.text(`Proyección anual:`, 14, 72)
  doc.setTextColor(201, 168, 76)
  doc.text(`${fmtEur(mrr * 12)}`, 80, 72)

  // Clients table
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Listado de clientes', 14, 84)

  doc.autoTable({
    startY: 88,
    head: [['Cliente', 'Plan', 'Capital', 'Cuota/mes', 'Meses', 'Inicio', 'Estado']],
    body: clients.map(c => [
      c.name,
      c.plan,
      fmtEur(c.capital),
      c.plan === 'Flexible' ? 'Variable' : fmtEur(c.cuota || 0),
      monthsSince(c.start_date),
      formatDate(c.start_date),
      c.pay_status
    ]),
    styles: { fontSize: 9, cellPadding: 3, textColor: [20, 20, 20] },
    headStyles: { fillColor: [15, 15, 15], textColor: [201, 168, 76], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { textColor: [201, 168, 76] },
      6: { textColor: [76, 175, 116] }
    }
  })

  // Payment history
  if (payments.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text('Historial de pagos', 14, finalY)

    const totalHistorico = payments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)

    doc.autoTable({
      startY: finalY + 4,
      head: [['Mes', 'Cliente', 'Plan', 'Importe', 'Estado', 'Nota']],
      body: payments.map(p => {
        const c = clients.find(cl => cl.id === p.client_id)
        return [
          formatMonth(p.month),
          c ? c.name : '—',
          c ? c.plan : '—',
          fmtEur(p.amount),
          p.status,
          p.notes || '—'
        ]
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 15, 15], textColor: [201, 168, 76], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      foot: [['', '', 'TOTAL COBRADO', fmtEur(totalHistorico), '', '']],
      footStyles: { fillColor: [201, 168, 76], textColor: [8, 8, 8], fontStyle: 'bold' }
    })
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Eudald Capital — Documento confidencial — Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 8)
  }

  doc.save(`EudaldCapital_Resumen_${today.replace(/ /g, '_')}.pdf`)
}

function exportClientPDF(clientId) {
  const { jsPDF } = window.jspdf
  const c = clients.find(cl => cl.id === clientId)
  if (!c) return

  const doc = new jsPDF()
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const clientPayments = payments.filter(p => p.client_id === c.id).sort((a, b) => b.month.localeCompare(a.month))
  const totalPaid = clientPayments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)
  const months = monthsSince(c.start_date)

  // Header
  doc.setFillColor(201, 168, 76)
  doc.rect(0, 0, 220, 18, 'F')
  doc.setTextColor(8, 8, 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('EUDALD CAPITAL', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha de cliente', 14, 17)

  doc.setTextColor(90, 90, 90)
  doc.setFontSize(9)
  doc.text(`Generado el ${today}`, 14, 26)

  // Client name
  doc.setTextColor(20, 20, 20)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(c.name, 14, 38)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(90, 90, 90)
  doc.text(`Plan ${c.plan} · Cliente desde ${formatDate(c.start_date)}`, 14, 45)

  // Metrics
  const metrics = [
    ['Capital gestionado', fmtEur(c.capital)],
    ['Cuota mensual', c.plan === 'Flexible' ? 'Variable' : fmtEur(c.cuota || 0)],
    ['Meses activo', `${months} meses`],
    ['Total cobrado', fmtEur(totalPaid)],
    ['Estado del pago', c.pay_status],
    ['Pagos registrados', `${clientPayments.length}`]
  ]

  doc.autoTable({
    startY: 52,
    body: metrics,
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { textColor: [90, 90, 90], cellWidth: 70 },
      1: { textColor: [20, 20, 20], fontStyle: 'bold' }
    },
    alternateRowStyles: { fillColor: [248, 248, 248] }
  })

  // Payment history
  if (clientPayments.length > 0) {
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text('Historial de pagos', 14, finalY)

    doc.autoTable({
      startY: finalY + 4,
      head: [['Mes', 'Importe', 'Estado', 'Nota']],
      body: clientPayments.map(p => [
        formatMonth(p.month),
        fmtEur(p.amount),
        p.status,
        p.notes || '—'
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [15, 15, 15], textColor: [201, 168, 76], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      foot: [['TOTAL', fmtEur(totalPaid), '', '']],
      footStyles: { fillColor: [201, 168, 76], textColor: [8, 8, 8], fontStyle: 'bold' }
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Eudald Capital — Documento confidencial`, 14, doc.internal.pageSize.height - 8)

  doc.save(`EudaldCapital_${c.name.replace(/ /g, '_')}_${today.replace(/ /g, '_')}.pdf`)
}

window.exportOverviewPDF = exportOverviewPDF
window.exportClientPDF = exportClientPDF

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
let chartMRR = null
let chartPlans = null
let chartClients = null

const CHART_DEFAULTS = {
  color: '#e8e0d0',
  grid: '#1a1a1a',
  gold: '#c9a84c',
  green: '#4caf74',
  red: '#c0392b',
  blue: '#5a90e0',
  muted: '#3a3a3a'
}

function destroyCharts() {
  if (chartMRR) { chartMRR.destroy(); chartMRR = null }
  if (chartPlans) { chartPlans.destroy(); chartPlans = null }
  if (chartClients) { chartClients.destroy(); chartClients = null }
}

function renderAnalytics() {
  // Metrics
  const totalHistorico = payments.filter(p => p.status === 'OK').reduce((s, p) => s + Number(p.amount), 0)
  const avgCapital = clients.length ? Math.round(totalAUM() / clients.length) : 0
  const topClient = clients.length ? clients.reduce((a, b) => Number(a.capital) > Number(b.capital) ? a : b) : null
  const bestPlan = (() => {
    const plans = ['Conservador','Moderado','Agresivo','Flexible']
    return plans.reduce((a, b) => {
      const ca = clients.filter(c => c.plan === a).reduce((s,c) => s+Number(c.capital),0)
      const cb = clients.filter(c => c.plan === b).reduce((s,c) => s+Number(c.capital),0)
      return ca > cb ? a : b
    })
  })()

  document.getElementById('analytics-metrics').innerHTML = `
    <div class="metric-card">
      <div class="m-label">Total histórico cobrado</div>
      <div class="m-value green">${fmtEur(totalHistorico)}</div>
      <div class="m-sub">${payments.length} pagos registrados</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Capital medio por cliente</div>
      <div class="m-value gold">${fmtEur(avgCapital)}</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Cliente mayor capital</div>
      <div class="m-value" style="font-size:16px;margin-top:8px">${topClient ? topClient.name.split(' ')[0] : '—'}</div>
      <div class="m-sub">${topClient ? fmtEur(topClient.capital) : ''}</div>
    </div>
    <div class="metric-card">
      <div class="m-label">Plan con más capital</div>
      <div class="m-value" style="font-size:16px;margin-top:8px;color:${getPlanColor(bestPlan)}">${bestPlan}</div>
    </div>`

  destroyCharts()

  // Chart 1: MRR by month
  const monthlyData = {}
  payments.filter(p => p.status === 'OK').forEach(p => {
    monthlyData[p.month] = (monthlyData[p.month] || 0) + Number(p.amount)
  })
  const sortedMonths = Object.keys(monthlyData).sort()
  const mrrCtx = document.getElementById('chart-mrr')
  if (mrrCtx) {
    chartMRR = new Chart(mrrCtx, {
      type: 'bar',
      data: {
        labels: sortedMonths.map(m => formatMonth(m)),
        datasets: [{
          label: 'Cobrado (€)',
          data: sortedMonths.map(m => monthlyData[m]),
          backgroundColor: '#c9a84c',
          borderRadius: 3,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#5a5a5a', font: { size: 10 } }, grid: { color: '#1a1a1a' } },
          y: { ticks: { color: '#5a5a5a', font: { size: 10 }, callback: v => '€' + v }, grid: { color: '#1a1a1a' } }
        }
      }
    })
  }

  // Chart 2: Capital by plan (doughnut)
  const planNames = ['Conservador', 'Moderado', 'Agresivo', 'Flexible']
  const planCapitals = planNames.map(p => clients.filter(c => c.plan === p).reduce((s, c) => s + Number(c.capital), 0))
  const planColors = ['#4caf74', '#c9a84c', '#c0392b', '#5a90e0']
  const plansCtx = document.getElementById('chart-plans')
  if (plansCtx) {
    chartPlans = new Chart(plansCtx, {
      type: 'doughnut',
      data: {
        labels: planNames,
        datasets: [{
          data: planCapitals,
          backgroundColor: planColors,
          borderColor: '#0f0f0f',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#c8c0b0', font: { size: 11 }, padding: 12, boxWidth: 12 }
          },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.label}: ${fmtEur(ctx.raw)}` }
          }
        }
      }
    })
  }

  // Chart 3: Clients ranking (horizontal bar)
  const sorted = [...clients].sort((a, b) => Number(b.capital) - Number(a.capital)).slice(0, 10)
  const clientsCtx = document.getElementById('chart-clients')
  if (clientsCtx) {
    chartClients = new Chart(clientsCtx, {
      type: 'bar',
      data: {
        labels: sorted.map(c => c.name),
        datasets: [{
          label: 'Capital (€)',
          data: sorted.map(c => Number(c.capital)),
          backgroundColor: sorted.map(c => getPlanColor(c.plan)),
          borderRadius: 3,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#5a5a5a', font: { size: 10 }, callback: v => '€' + v.toLocaleString() }, grid: { color: '#1a1a1a' } },
          y: { ticks: { color: '#c8c0b0', font: { size: 10 } }, grid: { color: '#1a1a1a' } }
        }
      }
    })
  }
}

// ─── RETURNS ──────────────────────────────────────────────────────────────────
function openAddReturn(c) {
  document.getElementById('ret-client-name').textContent = c.name
  document.getElementById('ret-month').value = currentMonth()
  document.getElementById('ret-pct').value = ''
  document.getElementById('ret-eur').value = ''
  document.getElementById('ret-notes').value = ''
  document.getElementById('ret-hint').textContent = ''
  document.getElementById('modal-return').classList.add('open')

  // Auto-calc EUR from pct
  const calcHint = () => {
    const pct = parseFloat(document.getElementById('ret-pct').value)
    const hint = document.getElementById('ret-hint')
    const eurInput = document.getElementById('ret-eur')
    if (!isNaN(pct) && Number(c.capital) > 0) {
      const eur = ((pct / 100) * Number(c.capital)).toFixed(2)
      eurInput.value = eur
      if (pct < 0) {
        hint.textContent = `Mes negativo — pérdida de ${fmtEur(Math.abs(eur))}.${c.plan === 'Flexible' ? ' No se cobra cuota.' : ''}`
        hint.style.color = '#c0392b'
      } else if (pct === 0) {
        hint.textContent = 'Sin rentabilidad este mes.'
        hint.style.color = '#5a5a5a'
      } else {
        const msg = c.plan === 'Flexible'
          ? ` → Cuota a cobrar: €${calcFlexibleCuota(Number(c.capital), parseFloat(eur))}`
          : ''
        hint.textContent = `Beneficio estimado: ${fmtEur(eur)}${msg}`
        hint.style.color = '#c9a84c'
      }
    } else {
      hint.textContent = ''
    }
  }

  document.getElementById('ret-pct').oninput = calcHint

  document.getElementById('ret-save').onclick = async () => {
    const month = document.getElementById('ret-month').value
    const pct = parseFloat(document.getElementById('ret-pct').value)
    const eur = parseFloat(document.getElementById('ret-eur').value) || 0
    const notes = document.getElementById('ret-notes').value.trim()
    if (!month || isNaN(pct)) { alert('Rellena el mes y la rentabilidad.'); return }
    await insertReturn({ client_id: c.id, month, return_pct: pct, return_eur: eur, notes })
    document.getElementById('modal-return').classList.remove('open')
    await loadAll()
  }
}

function renderClientReturns(c) {
  const clientReturns = returns
    .filter(r => r.client_id === c.id)
    .sort((a, b) => b.month.localeCompare(a.month))

  if (!clientReturns.length) return '<div style="padding:16px;color:#3a3a3a;font-size:11px;text-align:center">Sin rentabilidades registradas</div>'

  const avgReturn = clientReturns.reduce((s, r) => s + Number(r.return_pct), 0) / clientReturns.length
  const totalEur = clientReturns.filter(r => r.return_eur > 0).reduce((s, r) => s + Number(r.return_eur), 0)
  const positiveMonths = clientReturns.filter(r => Number(r.return_pct) > 0).length

  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
      <div class="metric-card" style="padding:10px;">
        <div class="m-label">Rentabilidad media</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;color:${avgReturn >= 0 ? '#4caf74' : '#c0392b'};margin-top:4px">${avgReturn.toFixed(2)}%</div>
      </div>
      <div class="metric-card" style="padding:10px;">
        <div class="m-label">Beneficio total</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;color:#c9a84c;margin-top:4px">${fmtEur(totalEur)}</div>
      </div>
      <div class="metric-card" style="padding:10px;">
        <div class="m-label">Meses positivos</div>
        <div style="font-family:'Playfair Display',serif;font-size:18px;margin-top:4px">${positiveMonths} / ${clientReturns.length}</div>
      </div>
    </div>
    <div class="t-wrap">
      <table>
        <thead><tr><th>Mes</th><th>Rentabilidad</th><th>Beneficio €</th><th>Nota</th><th></th></tr></thead>
        <tbody>
          ${clientReturns.map(r => `
            <tr>
              <td style="color:#e8e0d0">${formatMonth(r.month)}</td>
              <td style="color:${Number(r.return_pct) >= 0 ? '#4caf74' : '#c0392b'};font-weight:600">
                ${Number(r.return_pct) >= 0 ? '+' : ''}${Number(r.return_pct).toFixed(2)}%
              </td>
              <td style="color:${Number(r.return_eur) >= 0 ? '#c9a84c' : '#c0392b'}">
                ${Number(r.return_eur) >= 0 ? '+' : ''}${fmtEur(r.return_eur)}
              </td>
              <td style="color:#5a5a5a;font-size:11px">${r.notes || '—'}</td>
              <td><button class="del-ret-btn" data-id="${r.id}" style="background:none;border:none;color:#3a3a3a;cursor:pointer;font-size:12px">✕</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}
