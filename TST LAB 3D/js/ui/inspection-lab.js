import {saveResult,downloadJson,setQualityOnRoot} from './lab-kit.js';
import {attachSceneDepth} from '../graphics/scene-depth.js';
import {ScenarioVariantManager} from '../simulation/scenario-variant-manager.js';
import {resolveScenarioActivityProfile} from '../simulation/scenario-activity-director.js';

export function createInspectionLab(context,config){
  let root=null,res=null,found=new Set(),identifiedAt=new Map(),notes=new Map(),captures=new Map(),
      startedAt=0,lastReport=null,viewMode='2d',scene3d=null,renderToken=0,currentRiskId=null,
      variantManager=null,variant=null,activeRisks=[];

  function chooseVariant(advance=false){
    variantManager ??= new ScenarioVariantManager(context.storage);
    variant=variantManager.select(config.id,config.variants??[],{advance});
    activeRisks=variantManager.applyRisks(config.risks,variant);
    if(!activeRisks.length)activeRisks=config.risks.map(r=>({...r}));
  }

  function riskById(id){return activeRisks.find(r=>r.id===id)}
  function score(){return Math.round(found.size/Math.max(1,activeRisks.length)*100)}

  function taskRows(){
    return activeRisks.map((risk,i)=>`
      <div class="task-item ${found.has(risk.id)?'done':''}">
        <span class="task-check">${found.has(risk.id)?'✓':i+1}</span>
        <div>
          <strong>${found.has(risk.id)?risk.title:'Risco ainda não identificado'}</strong>
          <div class="muted">${found.has(risk.id)?risk.category:'Explore o cenário'}</div>
        </div>
      </div>`).join('');
  }

  function modeButtons(){
    return config.create3D?`<div class="scene-mode" role="group" aria-label="Modo de visualização">
      <button data-view="2d" class="${viewMode==='2d'?'active':''}">2D leve</button>
      <button data-view="3d" class="${viewMode==='3d'?'active':''}">${config.view3DLabel||'3D real'}</button>
    </div>`:'';
  }

  function dispose3D(){scene3d?.dispose?.();scene3d=null}

  async function mount3D(token){
    if(viewMode!=='3d'||!config.create3D)return;
    const host=root?.querySelector('[data-three-host]');
    if(!host)return;
    host.innerHTML='<div class="three-loading"><span class="spinner"></span><strong>Preparando ambiente 3D…</strong><small>O motor gráfico é carregado somente agora.</small></div>';
    try{
      const scene=await config.create3D(host,context,{
        found:[...found],
        onRisk:inspect,
        activeRiskIds:activeRisks.map(r=>r.id),
        variant
      });
      if(token!==renderToken||viewMode!=='3d'){scene?.dispose?.();return}
      scene3d=scene;
    }catch(error){
      console.error(error);
      if(token!==renderToken)return;
      viewMode='2d';
      context.storage.set(`view:${config.id}`,'2d');
      render();
      const box=root?.querySelector('#inspection-feedback');
      if(box){box.className='feedback warn';box.innerHTML='<strong>O 3D não pôde ser iniciado.</strong> O laboratório voltou automaticamente para a versão 2D leve.'}
    }
  }

  function findingEditor(){
    if(!currentRiskId||!found.has(currentRiskId))return '';
    const risk=riskById(currentRiskId);
    if(!risk)return '';
    return `<div class="finding-editor">
      <div class="finding-editor-head">
        <strong>Evidência do achado</strong>
        <span>${captures.get(risk.id)||0} captura(s) 3D</span>
      </div>
      <textarea data-finding-note="${risk.id}" placeholder="Registre uma observação curta: localização, condição encontrada, contexto visual...">${notes.get(risk.id)||''}</textarea>
      <div class="finding-editor-actions">
        <button class="lab-btn" data-action="save-note" data-risk-id="${risk.id}">Salvar nota</button>
        ${viewMode==='3d'?`<button class="lab-btn" data-action="capture-view" data-risk-id="${risk.id}">Capturar vista 3D</button>`:''}
      </div>
      <small>O risco também fica disponível em “Central TST → Riscos dos labs” como rascunho revisável.</small>
    </div>`;
  }

  function render(){
    renderToken++;
    dispose3D();
    setQualityOnRoot(root,context.qualityManager);

    const pct=score();
    const variantBadge=variant?`<span class="scenario-variant-badge" title="${variant.description||''}">${variant.label}</span>`:'';
    const activityProfile=variant?resolveScenarioActivityProfile(variant):null;
    const activityBadge=activityProfile?`<span class="scenario-activity-badge" title="Estado ambiental didático desta variante">Atividade: ${activityProfile.label}</span>`:'';
    const sceneMarkup=viewMode==='3d'&&config.create3D
      ? `<div class="scene scene-3d"><div class="three-host" data-three-host></div><div class="three-help">Arraste para girar • gesto de pinça/roda para aproximar • toque nos marcadores</div><div class="scene-note">${config.scene3DNote||'Visualização tridimensional. A missão e os riscos ativos são os mesmos do modo leve.'}</div></div>`
      : `<div class="scene">${config.sceneSvg}<div class="scene-note">${variant?.sceneNote||config.sceneNote}</div>${activeRisks.map(r=>`<button class="hotspot ${found.has(r.id)?'found':''}" style="left:${r.x}%;top:${r.y}%" data-risk="${r.id}" data-severity="${r.severity}" aria-label="Inspecionar ponto de risco">${found.has(r.id)?'✓':'!'}</button><span class="hotspot-label" style="left:${r.x}%;top:${r.y}%">${r.hint}</span>`).join('')}</div>`;

    root.innerHTML=`${config.navHtml||''}<div class="lab-shell">
      <div class="lab-head">
        <div><p class="kicker">Inspeção profissional simulada ${variantBadge} ${activityBadge}</p><h2>${config.title}</h2><p>${variant?.description||config.description}</p></div>
        <div class="lab-metrics">
          <div class="metric"><strong>${found.size}/${activeRisks.length}</strong><span>Achados</span></div>
          <div class="metric"><strong>${pct}%</strong><span>Inspeção</span></div>
          <div class="metric"><strong>${context.qualityManager.level}</strong><span>Gráfico</span></div>
        </div>
      </div>

      <div class="inspection-flow">
        <span class="${found.size?'done':''}">1. Observar</span>
        <span class="${found.size?'done':''}">2. Registrar</span>
        <span class="${lastReport?'done':''}">3. Encaminhar</span>
        <span class="${lastReport?'done':''}">4. Relatório</span>
      </div>

      <div class="lab-layout">
        <section class="scene-card">
          <div class="scene-toolbar"><div><strong>${variant?.sceneTitle||config.sceneTitle}</strong><small>${viewMode==='3d'?'Cena 3D navegável':'Clique nos marcadores para inspecionar'}</small></div>${modeButtons()}</div>
          ${sceneMarkup}
        </section>

        <aside class="panel-card">
          <h3>Checklist da sessão</h3>
          <p>${variant?.instruction||'Identifique os perigos ativos do cenário, registre evidências e finalize a inspeção.'}</p>
          <div id="inspection-feedback" class="feedback">Comece examinando o ambiente. A variante desta sessão fica registrada no relatório.</div>
          ${findingEditor()}
          <div class="task-list">${taskRows()}</div>
          <div class="lab-actions">
            <button class="lab-btn primary" data-action="finish" ${found.size===0?'disabled':''}>Finalizar inspeção</button>
            <button class="lab-btn" data-action="reset">${config.variants?.length?'Nova sessão / variante':'Reiniciar'}</button>
            ${lastReport?'<button class="lab-btn" data-action="report">Relatório JSON</button><button class="lab-btn" data-action="report-html">Relatório HTML</button>':''}
          </div>
        </aside>
      </div>
    </div>`;

    if(viewMode==='2d')attachSceneDepth(root.querySelector('.scene'),context.qualityManager);
    else mount3D(renderToken);
  }

  function showRiskFeedback(risk,note=''){
    const box=root?.querySelector('#inspection-feedback');
    if(!box)return;
    box.className=`feedback ${risk.severity==='high'?'bad':'warn'}`;
    box.innerHTML=`<strong>${risk.title}</strong><br>${risk.explanation}<br><span class="muted">Medida preventiva no cenário: ${risk.control}</span>${note?`<br><small>${note}</small>`:''}`;
  }

  function inspect(id){
    const risk=riskById(id);if(!risk)return;
    const first=!found.has(id);
    found.add(id);
    currentRiskId=id;
    if(first){
      identifiedAt.set(id,new Date().toISOString());
      context.riskEngine.identify({
        id:`${config.id}:${risk.id}`,
        moduleId:config.id,
        moduleTitle:config.title,
        type:risk.category,
        category:risk.category,
        title:risk.title,
        hazard:risk.title,
        severity:risk.severity,
        explanation:risk.explanation,
        control:risk.control,
        variantId:variant?.id,
        variantLabel:variant?.label,
        activityProfileId:variant?resolveScenarioActivityProfile(variant).id:null,
        activityProfileLabel:variant?resolveScenarioActivityProfile(variant).label:null
      });
    }
    render();
    showRiskFeedback(risk,first?'Achado registrado nesta sessão. Acrescente uma nota de evidência se desejar.':'Achado já registrado; você pode complementar a evidência.');
  }

  function saveNote(riskId){
    const area=root?.querySelector(`[data-finding-note="${riskId}"]`);
    if(!area)return;
    notes.set(riskId,area.value.trim());
    const risk=riskById(riskId);
    if(risk)showRiskFeedback(risk,'Nota de evidência salva localmente nesta sessão.');
  }

  function captureView(riskId){
    const ok=scene3d?.viewport?.capturePng?.(`tst360-${config.id}-${riskId}-evidencia.png`);
    const risk=riskById(riskId);
    if(ok){
      captures.set(riskId,(captures.get(riskId)||0)+1);
      render();
      if(risk)showRiskFeedback(risk,'Captura PNG gerada. O relatório registra a quantidade de capturas, não armazena a imagem no navegador.');
    }else if(risk){
      showRiskFeedback(risk,'Não foi possível capturar esta vista.');
    }
  }

  function buildSession(elapsed){
    const missing=activeRisks.filter(r=>!found.has(r.id));
    const findings=activeRisks.filter(r=>found.has(r.id)).map(r=>({
      riskId:r.id,
      title:r.title,
      category:r.category,
      severity:r.severity,
      explanation:r.explanation,
      control:r.control,
      identifiedAt:identifiedAt.get(r.id)||null,
      evidenceNote:notes.get(r.id)||'',
      captures:captures.get(r.id)||0,
      status:'pending'
    }));
    return {
      id:`${config.id}-${Date.now().toString(36)}`,
      moduleId:config.id,
      moduleTitle:config.title,
      variantId:variant?.id||'default',
      variantLabel:variant?.label||'Padrão',
      variantDescription:variant?.description||'',
      activityProfileId:variant?resolveScenarioActivityProfile(variant).id:null,
      activityProfileLabel:variant?resolveScenarioActivityProfile(variant).label:null,
      viewMode,
      startedAt:new Date(startedAt).toISOString(),
      finishedAt:new Date().toISOString(),
      elapsedSeconds:elapsed,
      score:score(),
      totalRisks:activeRisks.length,
      missingRiskIds:missing.map(r=>r.id),
      findings,
      status:'completed',
      educationalNotice:'Sessão simulada. Não substitui inspeção real, medição, procedimento, documento oficial ou responsabilidade profissional.'
    };
  }

  function finish(){
    const elapsed=Math.max(1,Math.round((Date.now()-startedAt)/1000));
    const session=buildSession(elapsed);
    lastReport={
      module:config.id,title:config.title,viewMode,
      variantId:session.variantId,variantLabel:session.variantLabel,
      identified:[...found],missing:session.missingRiskIds,
      findings:session.findings,score:session.score,elapsedSeconds:elapsed,date:session.finishedAt,
      sessionId:session.id
    };
    saveResult(context.storage,config.id,lastReport);
    context.inspectionSessionService?.save(session);
    if(config.variants?.length)variantManager.select(config.id,config.variants,{advance:true});
    render();
    const box=root.querySelector('#inspection-feedback');
    box.className=`feedback ${session.missingRiskIds.length?'warn':'ok'}`;
    box.innerHTML=session.missingRiskIds.length
      ? `Sessão <strong>${session.variantLabel}</strong> registrada com <strong>${session.score}%</strong>. ${session.missingRiskIds.length} achado(s) ativo(s) não foram identificados. A sessão já está disponível na Central TST.`
      : `<strong>Inspeção completa.</strong> Todos os achados ativos da ${session.variantLabel} foram identificados em ${elapsed}s e enviados à Central TST.`;
  }

  function resetSession(){
    const completed=!!lastReport;
    found.clear();identifiedAt.clear();notes.clear();captures.clear();currentRiskId=null;lastReport=null;
    startedAt=Date.now();
    chooseVariant(!!config.variants?.length&&!completed);
    render();
  }

  function click(e){
    const view=e.target.closest('[data-view]')?.dataset.view;
    if(view){viewMode=view;context.storage.set(`view:${config.id}`,viewMode);render();return}
    const risk=e.target.closest('[data-risk]');if(risk){inspect(risk.dataset.risk);return}

    const action=e.target.closest('[data-action]')?.dataset.action;
    const riskId=e.target.closest('[data-risk-id]')?.dataset.riskId;
    if(action==='finish')finish();
    if(action==='reset')resetSession();
    if(action==='save-note'&&riskId)saveNote(riskId);
    if(action==='capture-view'&&riskId)captureView(riskId);
    if(action==='report'&&lastReport)downloadJson(`tst360-${config.id}-relatorio.json`,lastReport);
    if(action==='report-html'&&lastReport){
      const session=context.inspectionSessionService?.get(lastReport.sessionId);
      if(session)context.inspectionSessionService.downloadHtml(session);
    }
  }

  return{
    async init(){
      res=new context.ResourceManager();
      viewMode=config.create3D?context.storage.get(`view:${config.id}`,'2d'):'2d';
      chooseVariant(false);
    },
    async load(){},
    async start(mount){
      root=mount;startedAt=Date.now();
      root.addEventListener('click',click);
      res.onDispose(()=>root?.removeEventListener('click',click));
      res.onDispose(dispose3D);
      render();
    },
    async pause(){},async resume(){},
    async destroy(){dispose3D();res?.disposeAll();res=null;root?.replaceChildren();root=null}
  }
}
