export function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — mppx-proxy</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 1.4rem; } h2 { font-size: 1.1rem; color: #444; }
    a { color: #0070f3; }
    nav a { margin-right: 16px; }
    label { display: block; margin: 12px 0 4px; font-size: 0.9rem; font-weight: 500; }
    input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95rem; box-sizing: border-box; }
    button { margin-top: 16px; padding: 10px 20px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.95rem; }
    button:hover { background: #0051cc; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 0.9rem; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .msg { padding: 10px; border-radius: 4px; margin: 12px 0; }
    .msg.ok { background: #e6f4ea; color: #1e7e34; }
    .msg.err { background: #fce8e8; color: #c62828; }
  </style>
</head>
<body>
  <nav><strong>mppx-proxy</strong> &nbsp;&nbsp; <a href="/dashboard">Register API</a> <a href="/dashboard/pricing">Route Pricing</a></nav>
  <hr>
  ${body}
</body>
</html>`
}

export function registerView(msg?: { ok: boolean; text: string }): string {
  return layout('Register API', `
    <h1>Register an API</h1>
    ${msg ? `<div class="msg ${msg.ok ? 'ok' : 'err'}">${msg.text}</div>` : ''}
    <form method="POST" action="/dashboard/register">
      <label>Origin Host (e.g. api.openweathermap.org)</label>
      <input name="origin_host" required placeholder="api.openweathermap.org">
      <label>Real API Key</label>
      <input name="api_key" required type="password" placeholder="sk-...">
      <label>Your Solana Wallet (receives USDC)</label>
      <input name="owner_wallet" required placeholder="Solana pubkey">
      <label>Default Price per Call (USDC)</label>
      <input name="default_price" required placeholder="0.001" value="0.001">
      <label>Key Injection Method</label>
      <select name="key_injection">
        <option value="header">Header</option>
        <option value="query">Query Param</option>
      </select>
      <label>Header/Query Param Name</label>
      <input name="key_field" required placeholder="X-API-Key">
      <button type="submit">Register</button>
    </form>
  `)
}

export function pricingView(
  host: string,
  routes: { id: string; path_pattern: string; price: string; priority: number }[],
  msg?: { ok: boolean; text: string },
): string {
  const rows = routes.map(r => `
    <tr>
      <td>${r.path_pattern}</td>
      <td>${r.price}</td>
      <td>${r.priority}</td>
      <td>
        <form method="POST" action="/dashboard/routes/delete" style="display:inline">
          <input type="hidden" name="id" value="${r.id}">
          <input type="hidden" name="host" value="${host}">
          <button type="submit" style="background:#e53e3e;padding:4px 10px;font-size:0.8rem">Delete</button>
        </form>
      </td>
    </tr>`).join('')

  return layout('Route Pricing', `
    <h1>Route Pricing</h1>
    <p>API: <strong>${host}</strong> &nbsp; <a href="/dashboard/earnings?host=${host}">View Earnings →</a></p>
    ${msg ? `<div class="msg ${msg.ok ? 'ok' : 'err'}">${msg.text}</div>` : ''}
    <table>
      <thead><tr><th>Pattern</th><th>Price (USDC)</th><th>Priority</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="color:#888">No routes — using default price.</td></tr>'}</tbody>
    </table>
    <h2>Add Route</h2>
    <form method="POST" action="/dashboard/routes">
      <input type="hidden" name="host" value="${host}">
      <label>Path Pattern (e.g. /v1/premium/*)</label>
      <input name="path_pattern" required placeholder="/v1/premium/*">
      <label>Price (USDC)</label>
      <input name="price" required placeholder="0.005">
      <label>Priority (lower = matched first)</label>
      <input name="priority" type="number" value="0">
      <button type="submit">Add Route</button>
    </form>
  `)
}

export function earningsView(
  host: string,
  total: string,
  rows: { signature: string; amount: string; paid_at: number }[],
): string {
  const trs = rows.map(r => `
    <tr>
      <td style="font-family:monospace;font-size:0.8rem">${r.signature.slice(0, 20)}…</td>
      <td>${r.amount} USDC</td>
      <td>${new Date(r.paid_at).toISOString().replace('T', ' ').slice(0, 19)}</td>
    </tr>`).join('')

  return layout('Earnings', `
    <h1>Earnings — ${host}</h1>
    <p>Total earned: <strong>${total} USDC</strong> (last 100 calls)</p>
    <table>
      <thead><tr><th>Tx Signature</th><th>Amount</th><th>Time (UTC)</th></tr></thead>
      <tbody>${trs || '<tr><td colspan="3" style="color:#888">No payments yet.</td></tr>'}</tbody>
    </table>
    <p><a href="/dashboard/pricing?host=${host}">← Back to pricing</a></p>
  `)
}
