const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #070d14;
  --bg-card:   #0d1520;
  --bg-row:    #0a1119;
  --border:    #1a2d40;
  --border-hi: #00b4d8;
  --cyan:      #00b4d8;
  --green:     #06d6a0;
  --red:       #ff4757;
  --amber:     #ffa502;
  --text:      #c8d8e8;
  --text-dim:  #4a6080;
  --text-hi:   #e8f4ff;
  --mono:      'IBM Plex Mono', monospace;
}

html { font-size: 14px; }

body {
  font-family: var(--mono);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,180,216,0.012) 2px,
      rgba(0,180,216,0.012) 4px
    );
}

/* ── TOPBAR ── */
.topbar {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-logo {
  padding: 0 20px;
  height: 44px;
  display: flex;
  align-items: center;
  border-right: 1px solid var(--border);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--cyan);
  text-transform: uppercase;
  white-space: nowrap;
  text-decoration: none;
}

.topbar-logo span { color: var(--text-dim); font-weight: 300; }

.topbar-nav {
  display: flex;
  height: 44px;
  flex: 1;
}

.topbar-nav a {
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-dim);
  text-decoration: none;
  border-right: 1px solid var(--border);
  transition: color 0.15s, background 0.15s;
}

.topbar-nav a:hover,
.topbar-nav a.active {
  color: var(--text-hi);
  background: rgba(0,180,216,0.06);
}

.topbar-nav a.active { color: var(--cyan); }

.topbar-tag {
  margin-left: auto;
  padding: 0 20px;
  height: 44px;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--border);
  font-size: 0.72rem;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.topbar-tag .dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--green);
  display: inline-block;
  margin-right: 7px;
  box-shadow: 0 0 6px var(--green);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── LAYOUT ── */
.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* ── SECTION HEADER ── */
.sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.sec-head h1 {
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-hi);
}

.sec-head h1::before { content: '// '; color: var(--cyan); }

.sec-head .sub {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.sec-head .badge {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 3px 8px;
  border: 1px solid var(--border-hi);
  color: var(--cyan);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── MESSAGES ── */
.msg {
  padding: 10px 14px;
  margin-bottom: 20px;
  font-size: 0.82rem;
  border-left: 3px solid;
  letter-spacing: 0.02em;
}

.msg.ok  { background: rgba(6,214,160,0.08);  border-color: var(--green); color: var(--green); }
.msg.err { background: rgba(255,71,87,0.08);   border-color: var(--red);   color: var(--red);  }

.msg::before { margin-right: 8px; font-weight: 600; }
.msg.ok::before  { content: '✓'; }
.msg.err::before { content: '✗'; }

/* ── FORM ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--border);
  background: var(--bg-card);
}

.form-field {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field:nth-child(even) { border-right: none; }
.form-field.full { grid-column: 1 / -1; border-right: none; }
.form-field:last-of-type,
.form-field.no-bb { border-bottom: none; }

label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
}

input, select {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text-hi);
  font-family: var(--mono);
  font-size: 0.88rem;
  padding: 4px 0;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  -webkit-appearance: none;
}

input::placeholder { color: var(--text-dim); }

input:focus, select:focus {
  border-bottom-color: var(--cyan);
}

select option { background: #0d1520; color: var(--text); }

.form-actions {
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-top: none;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  gap: 12px;
}

button[type="submit"] {
  font-family: var(--mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 20px;
  background: var(--cyan);
  color: var(--bg);
  border: none;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
}

button[type="submit"]:hover {
  background: #00d4ff;
  box-shadow: 0 0 16px rgba(0,180,216,0.4);
}

button[type="submit"].danger {
  background: transparent;
  color: var(--red);
  border: 1px solid var(--red);
  padding: 4px 10px;
  font-size: 0.7rem;
}

button[type="submit"].danger:hover {
  background: rgba(255,71,87,0.1);
  box-shadow: none;
}

.form-hint {
  font-size: 0.72rem;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

/* ── TABLES ── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  border: 1px solid var(--border);
  margin-bottom: 28px;
}

.data-table thead tr {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.data-table th {
  padding: 9px 14px;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
}

.data-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}

.data-table tbody tr:last-child td { border-bottom: none; }

.data-table tbody tr:nth-child(odd) { background: var(--bg-row); }
.data-table tbody tr:nth-child(even) { background: var(--bg-card); }

.data-table td.mono { font-family: var(--mono); color: var(--cyan); }
.data-table td.dim  { color: var(--text-dim); }
.data-table td.amount { color: var(--green); font-weight: 500; }

.empty-row td {
  text-align: center;
  padding: 24px;
  color: var(--text-dim);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}

/* ── STAT CARD ── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.stat {
  padding: 16px 20px;
  border-right: 1px solid var(--border);
}

.stat:last-child { border-right: none; }

.stat-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--cyan);
  letter-spacing: -0.02em;
}

.stat-value.green { color: var(--green); }

/* ── BREADCRUMB / META ── */
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-bottom: 20px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--cyan);
}

.meta strong { color: var(--text-hi); }
.meta a { color: var(--cyan); text-decoration: none; letter-spacing: 0.02em; }
.meta a:hover { text-decoration: underline; }
.meta-sep { color: var(--border); }

/* ── SECTION SUBHEAD ── */
h2.subhead {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 12px;
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
}

h2.subhead::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── BACK LINK ── */
.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-dim);
  text-decoration: none;
  letter-spacing: 0.04em;
  margin-top: 20px;
}

.back:hover { color: var(--cyan); }
.back::before { content: '←'; }
`

export function layout(title: string, body: string, activeNav?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — mppx-proxy</title>
  <style>${CSS}</style>
</head>
<body>
  <header class="topbar">
    <a class="topbar-logo" href="/dashboard">mppx<span>-proxy</span></a>
    <nav class="topbar-nav">
      <a href="/dashboard"${activeNav === 'register' ? ' class="active"' : ''}>Register API</a>
      <a href="/dashboard/pricing"${activeNav === 'pricing' ? ' class="active"' : ''}>Route Pricing</a>
      <a href="/dashboard/demo"${activeNav === 'demo' ? ' class="active"' : ''}>Demo</a>
    </nav>
    <div class="topbar-tag"><span class="dot"></span>live</div>
  </header>
  <main class="page">
    ${body}
  </main>
</body>
</html>`
}

export function registerView(msg?: { ok: boolean; text: string }): string {
  return layout('Register API', `
    <div class="sec-head">
      <h1>Register API</h1>
      <span class="sub">Wrap any HTTP API with MPP payment gating</span>
    </div>

    ${msg ? `<div class="msg ${msg.ok ? 'ok' : 'err'}">${msg.text}</div>` : ''}

    <form method="POST" action="/dashboard/register">
      <div class="form-grid">
        <div class="form-field full">
          <label>Origin Host</label>
          <input name="origin_host" required placeholder="api.openweathermap.org">
        </div>
        <div class="form-field full">
          <label>Real API Key</label>
          <input name="api_key" required type="password" placeholder="sk-…">
        </div>
        <div class="form-field">
          <label>Solana Wallet (receives USDC)</label>
          <input name="owner_wallet" required placeholder="Pubkey…">
        </div>
        <div class="form-field">
          <label>Default Price per Call (USDC)</label>
          <input name="default_price" required placeholder="0.001" value="0.001">
        </div>
        <div class="form-field">
          <label>Key Injection Method</label>
          <select name="key_injection">
            <option value="header">Header</option>
            <option value="query">Query Param</option>
          </select>
        </div>
        <div class="form-field no-bb">
          <label>Header / Query Param Name</label>
          <input name="key_field" required placeholder="X-API-Key">
        </div>
      </div>
      <div class="form-actions">
        <button type="submit">Register →</button>
        <span class="form-hint">Key encrypted at rest · AES-256-GCM</span>
      </div>
    </form>
  `, 'register')
}

export function pricingView(
  host: string,
  routes: { id: string; path_pattern: string; price: string; priority: number }[],
  msg?: { ok: boolean; text: string },
): string {
  const rows = routes.length
    ? routes.map(r => `
      <tr>
        <td class="mono">${r.path_pattern}</td>
        <td class="amount">${r.price} USDC</td>
        <td class="dim">${r.priority}</td>
        <td>
          <form method="POST" action="/dashboard/routes/delete" style="display:inline">
            <input type="hidden" name="id" value="${r.id}">
            <input type="hidden" name="host" value="${host}">
            <button type="submit" class="danger">Delete</button>
          </form>
        </td>
      </tr>`).join('')
    : `<tr class="empty-row"><td colspan="4">No routes — using default price for all paths</td></tr>`

  return layout('Route Pricing', `
    <div class="sec-head">
      <h1>Route Pricing</h1>
      <span class="badge">Per-path</span>
    </div>

    <div class="meta">
      <strong>${host}</strong>
      <span class="meta-sep">·</span>
      <a href="/dashboard/earnings?host=${encodeURIComponent(host)}">View Earnings →</a>
    </div>

    ${msg ? `<div class="msg ${msg.ok ? 'ok' : 'err'}">${msg.text}</div>` : ''}

    <table class="data-table">
      <thead>
        <tr>
          <th>Path Pattern</th>
          <th>Price</th>
          <th>Priority</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <h2 class="subhead">Add Route</h2>

    <form method="POST" action="/dashboard/routes">
      <input type="hidden" name="host" value="${host}">
      <div class="form-grid">
        <div class="form-field">
          <label>Path Pattern</label>
          <input name="path_pattern" required placeholder="/v1/premium/*">
        </div>
        <div class="form-field">
          <label>Price (USDC)</label>
          <input name="price" required placeholder="0.005">
        </div>
        <div class="form-field full no-bb">
          <label>Priority (lower = matched first)</label>
          <input name="priority" type="number" value="0">
        </div>
      </div>
      <div class="form-actions">
        <button type="submit">Add Route →</button>
        <span class="form-hint">Trailing * matches multiple segments · e.g. /v1/* = 0.005</span>
      </div>
    </form>
  `, 'pricing')
}

export function demoView(): string {
  return layout('Demo', `
    <div class="sec-head">
      <h1>Live Demo</h1>
      <span class="sub">End-to-end MPP/Solana payment · Gemini API</span>
      <span class="badge">Devnet</span>
    </div>

    <div class="demo-wrap">

      <!-- ── REQUEST CONFIG ── -->
      <div class="demo-panel">
        <div class="demo-panel-label">01 // REQUEST</div>
        <div class="form-grid">
          <div class="form-field">
            <label>Model</label>
            <select id="demo-model">
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
              <option value="gemini-3.1-flash-lite-preview" selected>gemini-3.1-flash-lite-preview</option>
            </select>
          </div>
          <div class="form-field">
            <label>Proxy Host</label>
            <input value="proxy → generativelanguage.googleapis.com" readonly style="color:var(--text-dim);font-size:0.78rem">
          </div>
          <div class="form-field full no-bb">
            <label>Prompt</label>
            <input id="demo-prompt" placeholder="Ask anything…" value="What is 2 + 2? Answer in one short sentence.">
          </div>
        </div>
        <div class="form-actions" style="justify-content:space-between">
          <button type="button" id="demo-btn" onclick="runDemo()">Execute →</button>
          <span class="form-hint" id="demo-status" style="font-size:0.75rem">Ready</span>
        </div>
      </div>

      <!-- ── PAYMENT FLOW ── -->
      <div class="demo-panel">
        <div class="demo-panel-label">02 // PAYMENT FLOW</div>
        <div id="flow-log" class="flow-log">
          <div class="flow-idle">Waiting for execution…</div>
        </div>
      </div>

      <!-- ── RESPONSE ── -->
      <div class="demo-panel">
        <div class="demo-panel-label">03 // RESPONSE</div>
        <div id="response-area" class="response-area">
          <div class="flow-idle">No response yet</div>
        </div>
      </div>

    </div>

    <style>
    .demo-wrap {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .demo-panel {
      border: 1px solid var(--border);
      border-top: none;
      background: var(--bg-card);
    }

    .demo-panel:first-child {
      border-top: 1px solid var(--border);
    }

    .demo-panel-label {
      padding: 8px 16px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cyan);
      border-bottom: 1px solid var(--border);
      background: rgba(0,180,216,0.04);
    }

    .flow-log {
      padding: 16px;
      min-height: 180px;
      font-size: 0.82rem;
      line-height: 1.8;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .flow-idle {
      color: var(--text-dim);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
    }

    .flow-step {
      display: flex;
      align-items: baseline;
      gap: 10px;
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .flow-step.visible {
      opacity: 1;
      transform: translateX(0);
    }

    .step-num {
      color: var(--text-dim);
      font-size: 0.68rem;
      min-width: 18px;
      text-align: right;
      flex-shrink: 0;
    }

    .step-text { flex: 1; }

    .flow-step.type-request  .step-text { color: var(--text); }
    .flow-step.type-status402 .step-text { color: var(--amber); }
    .flow-step.type-pay      .step-text { color: var(--amber); }
    .flow-step.type-tx       .step-text { color: var(--text-dim); font-size: 0.75rem; }
    .flow-step.type-confirmed .step-text { color: var(--green); }
    .flow-step.type-retry    .step-text { color: var(--text); }
    .flow-step.type-success  .step-text { color: var(--green); font-weight: 600; }
    .flow-step.type-error    .step-text { color: var(--red); }

    .flow-step.type-success .step-text {
      text-shadow: 0 0 12px rgba(6,214,160,0.5);
    }

    .response-area {
      padding: 16px;
      min-height: 80px;
    }

    .response-text {
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--text-hi);
      letter-spacing: 0.01em;
      white-space: pre-wrap;
      border-left: 3px solid var(--green);
      padding-left: 14px;
      margin-bottom: 12px;
      animation: fadein 0.4s ease;
    }

    .receipt-line {
      font-size: 0.72rem;
      color: var(--text-dim);
      letter-spacing: 0.02em;
      border-top: 1px solid var(--border);
      padding-top: 10px;
      margin-top: 4px;
    }

    .receipt-line strong { color: var(--cyan); }

    @keyframes fadein {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    #demo-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    </style>

    <script>
    async function runDemo() {
      const prompt = document.getElementById('demo-prompt').value.trim()
      const model  = document.getElementById('demo-model').value
      const btn    = document.getElementById('demo-btn')
      const status = document.getElementById('demo-status')
      const log    = document.getElementById('flow-log')
      const resp   = document.getElementById('response-area')

      if (!prompt) return

      btn.disabled = true
      btn.textContent = 'Running…'
      status.textContent = 'executing…'
      log.innerHTML  = ''
      resp.innerHTML = '<div class="flow-idle">Waiting…</div>'

      const host  = 'generativelanguage.googleapis.com'
      const path  = '/v1beta/models/' + model + ':generateContent'

      await addStep(log, 'request',   '→ POST ' + path)
      await delay(180)
      await addStep(log, 'status402', '← 402 Payment Required')
      await delay(160)
      await addStep(log, 'pay',       '⟳ Initiating USDC payment…')

      const t0 = Date.now()
      let result

      try {
        const r = await fetch('/dashboard/demo/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, model, host })
        })
        result = await r.json()
      } catch (e) {
        await addStep(log, 'error', '✗ Network error: ' + e.message)
        reset(btn, status)
        return
      }

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2)

      if (result.error) {
        await addStep(log, 'error', '✗ ' + result.error)
        reset(btn, status)
        return
      }

      const sig = result.signature ?? (result.receipt ? tryDecodeReceipt(result.receipt) : null)
      if (sig) await addStep(log, 'tx', '  Tx: ' + sig)

      await delay(120)
      await addStep(log, 'confirmed', '✓ Payment confirmed on Solana devnet')
      await delay(140)
      await addStep(log, 'retry',     '→ Retry with Authorization: Payment <credential>')
      await delay(200)
      await addStep(log, 'success',   '← 200 OK  (' + elapsed + 's)')

      const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text
                ?? JSON.stringify(result.data, null, 2)

      let receiptHtml = ''
      if (result.receipt) {
        try {
          const rd = JSON.parse(atob(result.receipt))
          receiptHtml = '<div class="receipt-line">'
            + 'Receipt · method: <strong>' + rd.method + '</strong>'
            + ' · ref: <strong>' + (rd.reference ?? '').slice(0,20) + '…</strong>'
            + ' · ' + (rd.timestamp ?? '')
            + '</div>'
        } catch (_) {}
      }

      resp.innerHTML = '<div class="response-text">' + esc(text) + '</div>' + receiptHtml
      status.textContent = 'Done (' + elapsed + 's)'
      reset(btn, status, false)
    }

    async function addStep(log, type, text) {
      const el = document.createElement('div')
      el.className = 'flow-step type-' + type
      const n = log.querySelectorAll('.flow-step').length + 1
      el.innerHTML = '<span class="step-num">' + String(n).padStart(2,'0') + '</span>'
                   + '<span class="step-text">' + esc(text) + '</span>'
      log.appendChild(el)
      el.getBoundingClientRect()
      el.classList.add('visible')
      await delay(20)
    }

    function tryDecodeReceipt(b64) {
      try { return JSON.parse(atob(b64)).reference?.slice(0,48) + '…' } catch(_) { return null }
    }

    function reset(btn, status, setText = true) {
      btn.disabled = false
      btn.textContent = 'Execute →'
      if (setText) status.textContent = 'Ready'
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
    function esc(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>')
    }
    </script>
  `, 'demo')
}

export function earningsView(
  host: string,
  total: string,
  rows: { signature: string; amount: string; paid_at: number }[],
): string {
  const trs = rows.length
    ? rows.map(r => `
      <tr>
        <td class="mono">${r.signature.slice(0, 24)}…</td>
        <td class="amount">${r.amount} USDC</td>
        <td class="dim">${new Date(r.paid_at).toISOString().replace('T', ' ').slice(0, 19)}</td>
      </tr>`).join('')
    : `<tr class="empty-row"><td colspan="3">No payments recorded yet</td></tr>`

  const count = rows.length

  return layout('Earnings', `
    <div class="sec-head">
      <h1>Earnings</h1>
      <span class="sub">${host}</span>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div class="stat-label">Total Earned</div>
        <div class="stat-value green">${total} USDC</div>
      </div>
      <div class="stat">
        <div class="stat-label">Payments (last 100)</div>
        <div class="stat-value">${count}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Avg per Call</div>
        <div class="stat-value">${count > 0 ? (parseFloat(total) / count).toFixed(4) : '—'}</div>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Tx Signature</th>
          <th>Amount</th>
          <th>Time (UTC)</th>
        </tr>
      </thead>
      <tbody>${trs}</tbody>
    </table>

    <a class="back" href="/dashboard/pricing?host=${encodeURIComponent(host)}"> Back to pricing</a>
  `)
}
