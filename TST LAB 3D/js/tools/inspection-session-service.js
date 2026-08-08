const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));

export class InspectionSessionService {
  constructor(storage, events) {
    this.storage = storage;
    this.events = events;
    this.key = 'inspection:sessions';
  }

  list() {
    return this.storage.get(this.key, []);
  }

  save(session) {
    const rows = this.list();
    const index = rows.findIndex(row => row.id === session.id);
    if (index >= 0) rows[index] = session;
    else rows.unshift(session);
    this.storage.set(this.key, rows.slice(0, 60));
    this.events.emit('inspection:session-saved', session);
    return session;
  }

  get(id) {
    return this.list().find(row => row.id === id) ?? null;
  }

  remove(id) {
    const rows = this.list().filter(row => row.id !== id);
    this.storage.set(this.key, rows);
    this.events.emit('inspection:session-removed', {id});
  }

  clear() {
    this.storage.set(this.key, []);
    this.events.emit('inspection:sessions-cleared');
  }

  createReportHtml(session) {
    const findings = session.findings ?? [];
    const rows = findings.map((finding, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${esc(finding.title)}</strong><br><small>${esc(finding.category)}</small></td>
        <td>${esc(finding.severity)}</td>
        <td>${esc(finding.evidenceNote || 'Sem nota textual registrada')}</td>
        <td>${esc(finding.control || '—')}</td>
        <td>${finding.captures || 0}</td>
      </tr>`).join('');

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório de Inspeção — ${esc(session.moduleTitle)}</title>
<style>
body{font-family:Arial,sans-serif;margin:36px;color:#1c2730;line-height:1.45}
header{border-bottom:3px solid #2f855a;padding-bottom:14px;margin-bottom:24px}
h1{margin:0 0 6px;font-size:25px}h2{margin-top:28px}
.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 24px;background:#f4f7f8;padding:14px;border-radius:8px}
table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ccd4d9;padding:8px;vertical-align:top;text-align:left;font-size:13px}
th{background:#eef3f5}.notice{margin-top:24px;padding:12px;background:#fff7df;border-left:4px solid #d69e2e;font-size:12px}
footer{margin-top:30px;font-size:11px;color:#66757f}
@media print{body{margin:15mm}.notice{break-inside:avoid}}
</style>
</head>
<body>
<header>
  <h1>Relatório Didático de Inspeção TST 360</h1>
  <div>${esc(session.moduleTitle)}</div>
</header>
<section class="meta">
  <div><strong>Sessão:</strong> ${esc(session.id)}</div>
  <div><strong>Variante:</strong> ${esc(session.variantLabel || 'Padrão')}</div>
  <div><strong>Estado ambiental:</strong> ${esc(session.activityProfileLabel || 'Padrão')}</div>
  <div><strong>Início:</strong> ${new Date(session.startedAt).toLocaleString('pt-BR')}</div>
  <div><strong>Finalização:</strong> ${new Date(session.finishedAt).toLocaleString('pt-BR')}</div>
  <div><strong>Visualização:</strong> ${esc(session.viewMode)}</div>
  <div><strong>Resultado:</strong> ${session.score}% (${findings.length}/${session.totalRisks})</div>
</section>
<h2>Achados registrados</h2>
<table>
<thead><tr><th>#</th><th>Achado</th><th>Severidade do cenário</th><th>Evidência/observação</th><th>Controle sugerido no cenário</th><th>Capturas</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6">Nenhum achado registrado.</td></tr>'}</tbody>
</table>
<div class="notice"><strong>Uso educacional.</strong> Este relatório é gerado a partir de uma simulação e não substitui inspeção de campo, documentação oficial, avaliação profissional, medição, procedimento ou requisito aplicável à organização real.</div>
<footer>TST 360 — Laboratório Virtual de Segurança do Trabalho • v0.38.0</footer>
</body></html>`;
  }

  downloadHtml(session) {
    const html = this.createReportHtml(session);
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tst360-inspecao-${session.moduleId}-${session.id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
