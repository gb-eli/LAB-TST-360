import {downloadJson} from '../ui/lab-kit.js';

const MODULES=[
  ['epi-lab','EPI Lab'],['canteiro-360','Canteiro'],['industria','Indústria'],['investigacao-acidentes','Investigação'],
  ['espaco-confinado','Espaço Confinado'],['eletricidade','Eletricidade'],['ergonomia','Ergonomia'],['incendio-evacuacao','Incêndio/Evacuação']
];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const now=()=>new Date().toISOString();

export class TstToolkit{
  constructor(context){
    this.context=context;
    this.root=null;
    this.templates=null;
    this.tool='dashboard';
    this.listener=null;
    this.drafts={};
  }

  async init(){
    if(!this.templates)this.templates=await this.context.assets.json('data/tools/templates.json',{cache:'no-cache'});
  }
  get(key,fallback=[]){return this.context.storage.get(`toolkit:${key}`,fallback)}
  set(key,value){return this.context.storage.set(`toolkit:${key}`,value)}

  async mount(root,tool='dashboard'){
    await this.init();this.unmount();this.root=root;this.tool=tool;
    this.listener=event=>this.handle(event);
    this.root.addEventListener('click',this.listener);
    this.root.addEventListener('input',this.listener);
    this.render();
  }
  unmount(){
    if(this.root&&this.listener){
      this.root.removeEventListener('click',this.listener);
      this.root.removeEventListener('input',this.listener);
    }
    this.listener=null;this.root=null;
  }

  shell(content){
    const inbox=this.get('risk-inbox',[]);
    const nav=[
      ['dashboard','Visão geral'],
      ['inbox',`Riscos dos labs${inbox.length?` (${inbox.length})`:''}`],
      ['inspections','Inspeções registradas'],
      ['matrix','Matriz de risco'],
      ['apr','APR didática'],
      ['checklist','Checklist'],
      ['inventory','Inventário'],
      ['pgr','PGR / Plano de ação']
    ];
    return `<div class="toolkit-shell">
      <aside class="toolkit-nav">
        <p class="kicker">Central TST</p><h2>Ferramentas</h2>
        <p class="muted">Registros ficam somente neste navegador.</p>
        <nav>${nav.map(([id,label])=>`<button class="${this.tool===id?'active':''}" data-tool="${id}">${label}</button>`).join('')}</nav>
        <button class="tool-export" data-command="export-all">Exportar portfólio JSON</button>
      </aside>
      <section class="toolkit-content">${content}</section>
    </div>`;
  }

  render(){
    if(!this.root)return;
    const map={
      dashboard:()=>this.dashboard(),
      inbox:()=>this.inbox(),
      inspections:()=>this.inspections(),
      matrix:()=>this.matrix(),
      apr:()=>this.apr(),
      checklist:()=>this.checklist(),
      inventory:()=>this.inventory(),
      pgr:()=>this.pgr()
    };
    this.root.innerHTML=this.shell((map[this.tool]||map.dashboard)());
  }

  labHistory(){
    return MODULES.map(([id,name])=>{
      const rows=this.context.storage.get(`results:${id}`,[]);
      const performance=this.context.storage.get(`performance:last:${id}`,null);
      return{id,name,count:rows.length,last:rows[0]||null,performance};
    });
  }

  dashboard(){
    const labs=this.labHistory(),completed=labs.filter(item=>item.count).length,totalReports=labs.reduce((sum,item)=>sum+item.count,0);
    const matrix=this.get('matrix'),apr=this.get('apr'),inventory=this.get('inventory'),actions=this.get('pgr'),inbox=this.get('risk-inbox',[]),sessions=this.context.inspectionSessionService?.list?.()??[];
    const perfKnown=labs.filter(item=>item.performance).length;
    return `<div class="tool-head"><div><p class="kicker">Painel integrado</p><h2>Central de Ferramentas TST</h2><p>Use os laboratórios para observar situações e estas ferramentas para organizar análises didáticas. Os modelos não substituem documentos ou procedimentos oficiais.</p></div></div>
    <div class="tool-stat-grid">
      <div><strong>${completed}/8</strong><span>Labs com registros</span></div>
      <div><strong>${totalReports}</strong><span>Relatórios locais</span></div>
      <div><strong>${inbox.length}</strong><span>Riscos capturados</span></div>
      <div><strong>${perfKnown}/8</strong><span>Labs com métrica 3D</span></div>
      <div><strong>${sessions.length}</strong><span>Sessões de inspeção</span></div>
    </div>
    ${sessions.length?`<div class="tool-panel tool-inbox-callout"><div><strong>${sessions.length} sessão(ões) de inspeção registrada(s)</strong><p>Revise achados, gere ações e exporte relatórios HTML.</p></div><button data-tool="inspections">Abrir inspeções</button></div>`:''}
    ${inbox.length?`<div class="tool-panel tool-inbox-callout"><div><strong>${inbox.length} risco(s) aguardando revisão</strong><p>Transforme observações dos laboratórios em rascunhos de matriz, inventário ou APR.</p></div><button data-tool="inbox">Revisar riscos</button></div>`:''}
    <div class="tool-panel"><h3>Resultados dos laboratórios</h3><div class="lab-history">${labs.map(item=>{
      const perf=item.performance;
      const perfLabel=perf?` • 3D ${perf.status==='ok'?'dentro do budget':perf.status==='attention'?'atenção':'acima do budget'}`:'';
      return `<article><strong>${esc(item.name)}</strong><span>${item.count?`${item.count} registro(s) • último ${Number.isFinite(item.last?.score)?item.last.score+'%':'concluído'}`:'sem registro'}${perfLabel}</span></article>`;
    }).join('')}</div></div>
    <div class="tool-grid">
      <button data-tool="matrix"><strong>Matriz de risco</strong><span>${matrix.length} avaliações salvas</span></button>
      <button data-tool="apr"><strong>APR didática</strong><span>${apr.length} itens registrados</span></button>
      <button data-tool="inventory"><strong>Inventário</strong><span>${inventory.length} riscos cadastrados</span></button>
      <button data-tool="pgr"><strong>Plano de ação</strong><span>${actions.length} ações cadastradas</span></button>
    </div>`;
  }

  severityToNumber(value){
    const text=String(value||'').toLowerCase();
    if(text.includes('high')||text.includes('alto')||text.includes('crít'))return 4;
    if(text.includes('low')||text.includes('baixo'))return 2;
    return 3;
  }

  normalizeCategory(value){
    const text=String(value||'').toLowerCase();
    if(text.includes('ergon'))return 'Ergonômico';
    if(text.includes('quím'))return 'Químico';
    if(text.includes('biol'))return 'Biológico';
    if(text.includes('fís')||text.includes('ruído')||text.includes('calor'))return 'Físico';
    return 'Acidente';
  }

  inbox(){
    const rows=this.get('risk-inbox',[]);
    return `<div class="tool-head"><div><p class="kicker">Integração laboratório → ferramenta</p><h2>Riscos identificados nos laboratórios</h2><p>Os itens abaixo são observações didáticas capturadas automaticamente. Ao enviar para uma ferramenta, o sistema cria apenas um <strong>rascunho</strong>; revise probabilidade, severidade, exposição, controles e contexto antes de salvar.</p></div></div>
    <div class="risk-inbox">${rows.length?rows.map((row,index)=>`
      <article class="risk-inbox-card">
        <div class="risk-inbox-head"><div><span class="badge">${esc(row.moduleTitle||row.moduleId)}</span>${row.variantLabel?`<span class="badge">${esc(row.variantLabel)}</span>`:''}<strong>${esc(row.title)}</strong></div><small>${row.occurrences||1} ocorrência(s)</small></div>
        <p>${esc(row.explanation||'Risco identificado durante uma atividade do laboratório.')}</p>
        <div class="muted">Categoria registrada: ${esc(row.category||'—')} • Controle sugerido no cenário: ${esc(row.control||'—')}</div>
        <div class="risk-inbox-actions">
          <button data-inbox-action="matrix" data-index="${index}">Rascunho matriz</button>
          <button data-inbox-action="inventory" data-index="${index}">Rascunho inventário</button>
          <button data-inbox-action="apr" data-index="${index}">Rascunho APR</button>
          <button class="ghost" data-inbox-action="archive" data-index="${index}">Arquivar</button>
        </div>
      </article>`).join(''):'<p class="empty-state">Nenhum risco capturado. Identifique riscos nos laboratórios para alimentar esta caixa.</p>'}</div>
      ${rows.length?'<div class="tool-actions"><button data-command="inbox-clear">Limpar caixa de entrada</button><button data-command="inbox-export">Exportar riscos JSON</button></div>':''}`;
  }


  inspections(){
    const sessions=this.context.inspectionSessionService?.list?.()??[];
    return `<div class="tool-head"><div><p class="kicker">Fluxo profissional simulado</p><h2>Inspeções registradas</h2><p>Cada sessão reúne variante, achados, notas de evidência, capturas e resultado. Use os achados para abrir um rascunho de ação antes de exportar o relatório didático.</p></div></div>
    <div class="inspection-session-list">${sessions.length?sessions.map((session,sIndex)=>`
      <article class="inspection-session-card">
        <div class="inspection-session-head">
          <div><span class="badge">${esc(session.variantLabel||'Padrão')}</span>${session.activityProfileLabel?`<span class="badge">${esc(session.activityProfileLabel)}</span>`:''}<strong>${esc(session.moduleTitle)}</strong><small>${new Date(session.finishedAt).toLocaleString('pt-BR')} • ${session.score}% • ${session.viewMode}</small></div>
          <div class="inspection-session-actions">
            <button data-session-action="html" data-session="${sIndex}">Relatório HTML</button>
            <button data-session-action="json" data-session="${sIndex}">JSON</button>
            <button class="ghost" data-session-action="remove" data-session="${sIndex}">Remover</button>
          </div>
        </div>
        <div class="inspection-findings">${(session.findings??[]).map((finding,fIndex)=>`
          <div class="inspection-finding">
            <div><strong>${esc(finding.title)}</strong><span>${esc(finding.category)} • ${esc(finding.severity)} • ${finding.captures||0} captura(s)</span><small>${esc(finding.evidenceNote||'Sem nota textual')}</small></div>
            <button data-session-action="pgr" data-session="${sIndex}" data-finding="${fIndex}">Criar rascunho de ação</button>
          </div>`).join('')||'<p class="empty-state">Nenhum achado registrado.</p>'}
        </div>
      </article>`).join(''):'<p class="empty-state">Nenhuma sessão de inspeção registrada. Finalize uma inspeção no Canteiro, Indústria ou Eletricidade para começar.</p>'}</div>
      ${sessions.length?'<div class="tool-actions"><button data-command="inspections-export">Exportar todas em JSON</button><button data-command="inspections-clear">Limpar sessões</button></div>':''}`;
  }

  riskLevel(score){return this.templates.riskScale.levels.find(level=>score>=level.min&&score<=level.max)?.label||'—'}

  matrix(){
    const rows=this.get('matrix'),d=this.drafts.matrix||{};
    const prob=Number(d.probability||2),sev=Number(d.severity||3),preview=prob*sev;
    return `<div class="tool-head"><div><p class="kicker">Análise didática</p><h2>Matriz de risco</h2><p>${esc(this.templates.riskScale.notice)}</p></div></div>
    ${d.source?`<div class="draft-banner"><strong>Rascunho vindo de ${esc(d.source)}</strong><span>Revise P, S e os controles antes de salvar.</span></div>`:''}
    <form class="tool-form" data-form="matrix">
      <label>Perigo<input name="hazard" required value="${esc(d.hazard||'')}" placeholder="Ex.: circulação próxima à empilhadeira"></label>
      <label>Probabilidade<select name="probability">${[1,2,3,4,5].map(v=>`<option ${v===prob?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Severidade<select name="severity">${[1,2,3,4,5].map(v=>`<option ${v===sev?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Controle existente<input name="control" value="${esc(d.control||'')}" placeholder="Ex.: segregação de rotas"></label>
      <button type="button" data-command="matrix-add">Adicionar avaliação</button>
    </form>
    <div class="matrix-preview" id="matrix-preview"><strong>${preview}</strong><span>${this.riskLevel(preview)}</span></div>
    ${this.tableMatrix(rows)}
    <div class="tool-actions"><button data-command="matrix-clear">Limpar matriz</button><button data-command="matrix-export">Exportar JSON</button></div>`;
  }

  tableMatrix(rows){
    return `<div class="tool-table"><div class="tool-row header"><span>Perigo</span><span>P×S</span><span>Nível</span><span>Controle</span></div>${rows.length?rows.map(row=>`<div class="tool-row"><span>${esc(row.hazard)}</span><span>${row.probability}×${row.severity}=${row.score}</span><span>${esc(row.level)}</span><span>${esc(row.control||'—')}</span></div>`).join(''):'<p class="empty-state">Nenhuma avaliação registrada.</p>'}</div>`;
  }

  apr(){
    const rows=this.get('apr'),d=this.drafts.apr||{};
    return `<div class="tool-head"><div><p class="kicker">Planejamento</p><h2>APR didática</h2><p>Registre etapas, perigos percebidos e medidas propostas. O modelo é educacional e deve ser adaptado aos procedimentos aplicáveis em situações reais.</p></div></div>
    ${d.source?`<div class="draft-banner"><strong>Rascunho vindo de ${esc(d.source)}</strong><span>Revise atividade, etapa e medidas antes de salvar.</span></div>`:''}
    <form class="tool-form tool-form-wide" data-form="apr">
      <label>Atividade<input name="activity" required value="${esc(d.activity||'')}" placeholder="Atividade analisada"></label>
      <label>Etapa<input name="step" required value="${esc(d.step||'')}" placeholder="Etapa da tarefa"></label>
      <label>Perigo<input name="hazard" required value="${esc(d.hazard||'')}" placeholder="Perigo identificado"></label>
      <label>Medida proposta<input name="control" required value="${esc(d.control||'')}" placeholder="Eliminação, EPC, administrativa, EPI..."></label>
      <button type="button" data-command="apr-add">Adicionar item</button>
    </form>
    ${this.simpleList(rows,row=>`<strong>${esc(row.activity)} — ${esc(row.step)}</strong><span>Perigo: ${esc(row.hazard)}</span><span>Medida: ${esc(row.control)}</span>`)}
    <div class="tool-actions"><button data-command="apr-clear">Limpar</button><button data-command="apr-export">Exportar JSON</button></div>`;
  }

  checklist(){
    const state=this.get('checklist',{});
    return `<div class="tool-head"><div><p class="kicker">Inspeção geral</p><h2>Checklist didático</h2><p>Checklist genérico para treino de observação. Itens específicos devem seguir a realidade, o procedimento e a norma aplicável.</p></div></div>
    <div class="checklist-tool">${this.templates.checklist.map((item,index)=>{const value=state[index]||'pending';return `<div class="check-tool-row"><span>${esc(item)}</span><div><button class="${value==='ok'?'active ok':''}" data-check="${index}" data-value="ok">OK</button><button class="${value==='attention'?'active attention':''}" data-check="${index}" data-value="attention">Atenção</button><button class="${value==='na'?'active':''}" data-check="${index}" data-value="na">N/A</button></div></div>`}).join('')}</div>
    <label class="tool-note">Observações<textarea id="checklist-notes" placeholder="Registre observações da inspeção">${esc(this.get('checklist-notes',''))}</textarea></label>
    <div class="tool-actions"><button data-command="checklist-save">Salvar observações</button><button data-command="checklist-clear">Limpar</button><button data-command="checklist-export">Exportar JSON</button></div>`;
  }

  inventory(){
    const rows=this.get('inventory'),d=this.drafts.inventory||{};
    const category=this.normalizeCategory(d.category);
    const prob=Number(d.probability||2),sev=Number(d.severity||3);
    return `<div class="tool-head"><div><p class="kicker">GRO / PGR didático</p><h2>Inventário de riscos</h2><p>Organize perigos, exposição e controles em um exercício de gerenciamento de riscos. Não constitui PGR oficial.</p></div></div>
    ${d.source?`<div class="draft-banner"><strong>Rascunho vindo de ${esc(d.source)}</strong><span>Revise categoria, exposição, P e S antes de salvar.</span></div>`:''}
    <form class="tool-form tool-form-wide" data-form="inventory">
      <label>Categoria<select name="category">${this.templates.categories.map(v=>`<option ${v===category?'selected':''}>${esc(v)}</option>`).join('')}</select></label>
      <label>Perigo<input name="hazard" required value="${esc(d.hazard||'')}"></label>
      <label>Exposição / situação<input name="exposure" required value="${esc(d.exposure||'')}"></label>
      <label>Controle existente<input name="control" value="${esc(d.control||'')}"></label>
      <label>Probabilidade<select name="probability">${[1,2,3,4,5].map(v=>`<option ${v===prob?'selected':''}>${v}</option>`).join('')}</select></label>
      <label>Severidade<select name="severity">${[1,2,3,4,5].map(v=>`<option ${v===sev?'selected':''}>${v}</option>`).join('')}</select></label>
      <button type="button" data-command="inventory-add">Adicionar risco</button>
    </form>
    ${this.simpleList(rows,row=>`<strong>${esc(row.category)} • ${esc(row.hazard)}</strong><span>${esc(row.exposure)}</span><span>Risco didático: ${row.score} (${esc(row.level)}) • Controle: ${esc(row.control||'—')}</span>`)}
    <div class="tool-actions"><button data-command="inventory-clear">Limpar</button><button data-command="inventory-export">Exportar JSON</button></div>`;
  }

  pgr(){
    const rows=this.get('pgr'),inventory=this.get('inventory'),d=this.drafts.pgr||{};
    return `<div class="tool-head"><div><p class="kicker">Plano de ação</p><h2>PGR didático</h2><p>Transforme riscos já observados em ações, responsáveis e prioridades. Esta ferramenta é uma simulação educacional.</p></div></div>
    ${d.source?`<div class="draft-banner"><strong>Rascunho vindo de ${esc(d.source)}</strong><span>Revise ação, prioridade, responsável e prazo antes de salvar.</span></div>`:''}
    <div class="tool-panel"><strong>Base disponível</strong><p>${inventory.length} risco(s) no inventário local. Você pode referenciar um deles pelo nome no plano de ação.</p></div>
    <form class="tool-form tool-form-wide" data-form="pgr"><label>Risco / situação<input name="risk" required value="${esc(d.risk||'')}" placeholder="Risco priorizado"></label><label>Ação planejada<input name="action" required value="${esc(d.action||'')}" placeholder="Medida preventiva"></label><label>Responsável<input name="owner" value="${esc(d.owner||'')}" placeholder="Responsável fictício / setor"></label><label>Prioridade<select name="priority">${['Baixa','Média','Alta','Imediata'].map(v=>`<option ${v===(d.priority||'Média')?'selected':''}>${v}</option>`).join('')}</select></label><label>Prazo<input name="deadline" type="date" value="${esc(d.deadline||'')}"></label><button type="button" data-command="pgr-add">Adicionar ação</button></form>
    ${this.simpleList(rows,row=>`<strong>${esc(row.risk)} • ${esc(row.priority)}</strong><span>${esc(row.action)}</span><span>Responsável: ${esc(row.owner||'—')} • Prazo: ${esc(row.deadline||'—')}</span>`)}
    <div class="tool-actions"><button data-command="pgr-clear">Limpar</button><button data-command="pgr-export">Exportar JSON</button></div>`;
  }

  simpleList(rows,renderRow){
    return `<div class="tool-list">${rows.length?rows.map((row,index)=>`<article>${renderRow(row)}<button data-remove="${this.tool}" data-index="${index}" aria-label="Remover item">×</button></article>`).join(''):'<p class="empty-state">Nenhum item registrado.</p>'}</div>`;
  }

  formData(name){
    const form=this.root?.querySelector(`[data-form="${name}"]`);
    return form?Object.fromEntries(new FormData(form).entries()):{};
  }

  append(key,row){
    const rows=this.get(key);
    rows.unshift({...row,date:now()});
    this.set(key,rows.slice(0,100));
    delete this.drafts[key];
    this.render();
  }

  openDraft(target,row){
    const severity=this.severityToNumber(row.severity);
    if(target==='matrix'){
      this.drafts.matrix={source:row.moduleTitle,hazard:row.hazard,control:row.control,severity,probability:2};
    }
    if(target==='inventory'){
      this.drafts.inventory={source:row.moduleTitle,category:row.category,hazard:row.hazard,exposure:`${row.moduleTitle}: ${row.explanation||'situação observada no laboratório'}`,control:row.control,severity,probability:2};
    }
    if(target==='apr'){
      this.drafts.apr={source:row.moduleTitle,activity:row.moduleTitle,step:'Situação observada no laboratório',hazard:row.hazard,control:row.control||'Definir medida preventiva após análise do contexto.'};
    }
    this.tool=target;
    this.render();
  }

  handle(event){
    const tool=event.target.closest?.('[data-tool]')?.dataset.tool;
    if(tool){this.tool=tool;this.render();return}

    if(event.type==='input'&&event.target.closest?.('[data-form="matrix"]')){
      const data=this.formData('matrix'),score=Number(data.probability||1)*Number(data.severity||1),box=this.root.querySelector('#matrix-preview');
      if(box)box.innerHTML=`<strong>${score}</strong><span>${this.riskLevel(score)}</span>`;
      return;
    }

    const check=event.target.closest?.('[data-check]');
    if(check){const state=this.get('checklist',{});state[check.dataset.check]=check.dataset.value;this.set('checklist',state);this.render();return}

    const inboxAction=event.target.closest?.('[data-inbox-action]');
    if(inboxAction){
      const rows=this.get('risk-inbox',[]),index=Number(inboxAction.dataset.index),row=rows[index];
      if(!row)return;
      const action=inboxAction.dataset.inboxAction;
      if(action==='archive'){rows.splice(index,1);this.set('risk-inbox',rows);this.render();return}
      this.openDraft(action,row);return;
    }


    const sessionButton=event.target.closest?.('[data-session-action]');
    if(sessionButton){
      const sessions=this.context.inspectionSessionService?.list?.()??[];
      const sIndex=Number(sessionButton.dataset.session),session=sessions[sIndex];
      if(!session)return;
      const action=sessionButton.dataset.sessionAction;
      if(action==='html'){this.context.inspectionSessionService.downloadHtml(session);return}
      if(action==='json'){downloadJson(`tst360-inspecao-${session.moduleId}-${session.id}.json`,session);return}
      if(action==='remove'){this.context.inspectionSessionService.remove(session.id);this.render();return}
      if(action==='pgr'){
        const finding=session.findings?.[Number(sessionButton.dataset.finding)];
        if(!finding)return;
        this.drafts.pgr={
          source:`${session.moduleTitle} • ${session.variantLabel}`,
          risk:finding.title,
          action:finding.control||'Definir medida preventiva após análise.',
          owner:'',
          priority:String(finding.severity).toLowerCase().includes('high')?'Alta':'Média',
          deadline:''
        };
        this.tool='pgr';this.render();return;
      }
    }

    const remove=event.target.closest?.('[data-remove]');
    if(remove){const rows=this.get(remove.dataset.remove);rows.splice(Number(remove.dataset.index),1);this.set(remove.dataset.remove,rows);this.render();return}

    const command=event.target.closest?.('[data-command]')?.dataset.command;
    if(!command)return;

    if(command==='matrix-add'){const d=this.formData('matrix');if(!d.hazard)return;const score=Number(d.probability)*Number(d.severity);this.append('matrix',{...d,probability:Number(d.probability),severity:Number(d.severity),score,level:this.riskLevel(score)});return}
    if(command==='apr-add'){const d=this.formData('apr');if(!d.activity||!d.step||!d.hazard||!d.control)return;this.append('apr',d);return}
    if(command==='inventory-add'){const d=this.formData('inventory');if(!d.hazard||!d.exposure)return;const score=Number(d.probability)*Number(d.severity);this.append('inventory',{...d,probability:Number(d.probability),severity:Number(d.severity),score,level:this.riskLevel(score)});return}
    if(command==='pgr-add'){const d=this.formData('pgr');if(!d.risk||!d.action)return;this.append('pgr',d);return}
    if(command==='checklist-save'){this.set('checklist-notes',this.root.querySelector('#checklist-notes')?.value||'');this.render();return}


    if(command==='inspections-clear'){this.context.inspectionSessionService?.clear?.();this.render();return}
    if(command==='inspections-export'){downloadJson('tst360-inspecoes-profissionais-didaticas.json',{version:'0.38.0',exportedAt:now(),notice:'Sessões simuladas; não substituem inspeções ou documentos oficiais.',data:this.context.inspectionSessionService?.list?.()??[]});return}

    if(command==='inbox-clear'){this.set('risk-inbox',[]);this.render();return}
    if(command==='inbox-export'){downloadJson('tst360-riscos-dos-laboratorios.json',{version:'0.38.0',exportedAt:now(),notice:'Observações didáticas capturadas nos laboratórios; exigem revisão antes de uso em qualquer documento.',data:this.get('risk-inbox',[])});return}

    if(command.endsWith('-clear')){
      const key=command.replace('-clear','');
      this.set(key,key==='checklist'?{}:[]);
      if(key==='checklist')this.set('checklist-notes','');
      delete this.drafts[key];
      this.render();return;
    }

    if(command.endsWith('-export')){
      const key=command.replace('-export','');
      downloadJson(`tst360-${key}.json`,{
        tool:key,version:'0.38.0',
        data:key==='checklist'?{items:this.get('checklist',{}),notes:this.get('checklist-notes',''),template:this.templates.checklist}:this.get(key),
        exportedAt:now(),notice:'Conteúdo didático do TST 360; não substitui documentação oficial.'
      });
      return;
    }

    if(command==='export-all')this.exportAll();
  }

  exportAll(){
    downloadJson('tst360-portfolio-didatico.json',{
      version:'0.38.0',
      exportedAt:now(),
      notice:'Portfólio educacional local. Não substitui documentos, avaliações ou programas oficiais.',
      laboratories:this.labHistory(),
      capturedRisks:this.get('risk-inbox',[]),
      inspectionSessions:this.context.inspectionSessionService?.list?.()??[],
      matrix:this.get('matrix'),
      apr:this.get('apr'),
      checklist:{items:this.get('checklist',{}),notes:this.get('checklist-notes','')},
      inventory:this.get('inventory'),
      actionPlan:this.get('pgr')
    });
  }
}
