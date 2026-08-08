import {VisualTourProgressService} from './visual-tour-progress-service.js';
import {VisualTourRouteDirector} from './visual-tour-route-director.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const TYPE_META={
  panorama:{icon:'🌐',label:'Panorama 360'},
  object3d:{icon:'🧩',label:'Objeto 3D'},
  mission3d:{icon:'🎯',label:'Missão 3D'}
};

export class EnvironmentVisualTour{
  constructor(context,{sectorData,tour,onClose=null,onMission=null}={}){
    this.context=context;
    this.sectorData=sectorData;
    this.tour=tour;
    this.onClose=onClose;
    this.onMission=onMission;
    this.root=null;
    this.content=null;
    this.listener=null;
    this.child=null;
    this.progressService=new VisualTourProgressService(context.storage);
    this.progress=this.progressService.get(tour);
    this.director=new VisualTourRouteDirector(tour);
    this.currentIndex=Math.max(0,(tour.steps??[]).findIndex(step=>step.id===this.progress.currentStepId));
  }

  async mount(root){
    this.root=root;
    this.listener=event=>this.handle(event);
    root.addEventListener('click',this.listener);

    // Migration from v0.32 progress: infer the branch if the saved current step
    // is already one of the branch targets and no G10.5 decision exists yet.
    const current=this.step();
    if(this.director.hasBranching()&&!this.director.decisionFor(this.progress)&&current){
      const inferred=this.director.choiceForTarget(current.id);
      if(inferred){
        this.progress=this.progressService.decide(
          this.tour,
          this.progress,
          this.tour.routing.decisionStepId,
          inferred.id
        );
      }
    }

    this.renderShell();
    await this.openStep(this.currentIndex,{visit:true,inferDecision:true});
    this.context.events?.emit?.('environment:tour-opened',{
      tourId:this.tour.id,
      sectorId:this.tour.sectorId,
      routing:this.tour.routing?.mode??'linear'
    });
    return this;
  }

  stats(){
    return this.progressService.stats(this.tour,this.progress);
  }

  step(index=this.currentIndex){
    return this.tour.steps?.[index]??null;
  }

  stepById(stepId){
    return this.tour.steps?.find(step=>step.id===stepId)??null;
  }

  indexById(stepId){
    return this.tour.steps?.findIndex(step=>step.id===stepId)??-1;
  }

  routeState(){
    return this.director.state(this.progress,this.step()?.id??null);
  }

  mapPosition(stepId){
    return this.stepById(stepId)?.map??{x:50,y:50};
  }

  renderMiniMap(){
    const steps=this.tour.steps??[];
    const state=this.routeState();
    const decision=state.choice;
    const edgeLines=state.edges.map(edge=>{
      const from=this.mapPosition(edge.from);
      const to=this.mapPosition(edge.to);
      const selected=!edge.branch||decision?.id===edge.branch;
      const muted=edge.branch&&!selected&&!!decision;
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
        class="tour-route-edge ${edge.branch?'branch':''} ${selected?'selected':''} ${muted?'muted':''}"
        data-route-branch="${esc(edge.branch??'')}" />`;
    }).join('');

    return `<div class="tour-map ${decision?'route-chosen':'route-open'}" aria-label="Mini-mapa do tour">
      <svg viewBox="0 0 100 82" preserveAspectRatio="none" aria-hidden="true">
        ${edgeLines}
      </svg>
      ${steps.map((step,i)=>{
        const p=step.map??{x:50,y:50};
        const visited=this.progress.visitedStepIds.includes(step.id);
        const recommended=state.path.includes(step.id);
        return `<button type="button" data-tour-step="${i}" class="tour-map-point ${i===this.currentIndex?'current':''} ${visited?'visited':''} ${recommended?'recommended':''}" style="left:${p.x}%;top:${p.y}%">
          <span>${TYPE_META[step.type]?.icon??'•'}</span>
          <b>${i+1}</b>
          <em>${esc(step.label)}</em>
        </button>`;
      }).join('')}
    </div>`;
  }

  renderShell(){
    const stats=this.stats();
    this.root.innerHTML=`<section class="environment-tour branching-tour">
      <header class="tour-head">
        <div>
          <p class="kicker">G10.5 • rota visual ramificada</p>
          <h2>${esc(this.tour.title)}</h2>
          <p>${esc(this.tour.description)}</p>
        </div>
        <button type="button" data-tour-close>← Experiências</button>
      </header>

      <div class="tour-summary">
        <div><strong data-tour-progress-value>${stats.percent}%</strong><span>explorado</span></div>
        <div><strong data-tour-progress-count>${stats.visited}/${stats.total}</strong><span>etapas visitadas</span></div>
        <div><strong data-tour-route-status>2 rotas</strong><span>ordem de investigação</span></div>
        <button type="button" data-tour-reset>Reiniciar percurso</button>
      </div>

      <div class="tour-progress-track"><span data-tour-progress-bar style="width:${stats.percent}%"></span></div>

      <section class="tour-route-card">
        <div class="tour-route-head">
          <div><strong>Mini-mapa do percurso</strong><small data-tour-route-help>Escolha a ordem de investigação e revisite qualquer ponto.</small></div>
          <span class="badge">${this.tour.steps.length} etapas • 1 decisão</span>
        </div>
        <div data-tour-map>${this.renderMiniMap()}</div>
      </section>

      <section class="tour-step-head" data-tour-step-head></section>
      <div class="tour-decision-slot" data-tour-decision></div>
      <div class="tour-content" data-tour-content></div>

      <nav class="tour-navigation">
        <button type="button" data-tour-prev>← Anterior na rota</button>
        <div data-tour-step-dots></div>
        <button type="button" data-tour-next>Próximo na rota →</button>
      </nav>

      <div class="sector-notice">${esc(this.tour.notice)}</div>
    </section>`;
    this.content=this.root.querySelector('[data-tour-content]');
  }

  renderDecision(){
    const slot=this.root.querySelector('[data-tour-decision]');
    if(!slot)return;
    const step=this.step();
    const state=this.routeState();

    if(!this.director.hasBranching()){
      slot.replaceChildren();
      return;
    }

    if(step?.id===this.tour.routing.decisionStepId&&!state.choice){
      slot.innerHTML=`<section class="tour-decision-card">
        <div class="tour-decision-copy">
          <p class="kicker">Escolha de investigação</p>
          <h3>Por onde você quer continuar?</h3>
          <p>As duas áreas continuam disponíveis. Sua escolha define apenas a ordem sugerida do percurso.</p>
        </div>
        <div class="tour-choice-grid">
          ${(state.choices??[]).map(choice=>`
            <button type="button" data-tour-choice="${choice.id}">
              <span>${choice.icon??'⇢'}</span>
              <strong>${esc(choice.label)}</strong>
              <small>${esc(choice.description)}</small>
              <em>Escolher esta rota →</em>
            </button>`).join('')}
        </div>
      </section>`;
      return;
    }

    if(state.choice){
      const target=this.stepById(state.choice.targetStepId);
      const then=this.stepById(state.choice.thenStepId);
      slot.innerHTML=`<section class="tour-route-choice-summary">
        <div>
          <span>${state.choice.icon??'🧭'}</span>
          <div><strong>Rota escolhida: ${esc(state.choice.label)}</strong>
          <small>${esc(target?.label??'Etapa')} → ${esc(then?.label??'Etapa')} → missão</small></div>
        </div>
        ${step?.id===this.tour.routing.decisionStepId
          ?'<button type="button" data-tour-change-choice>Trocar ordem</button>'
          :state.converged?'<span class="badge">rotas comparadas</span>':''}
      </section>`;
      return;
    }

    slot.replaceChildren();
  }

  updateChrome(){
    const step=this.step();
    const stats=this.stats();
    const state=this.routeState();
    const meta=TYPE_META[step?.type]??{icon:'•',label:'Etapa'};
    const head=this.root.querySelector('[data-tour-step-head]');
    if(head&&step){
      head.innerHTML=`<div class="tour-step-number">${this.currentIndex+1}</div>
        <div>
          <div class="mission-badges">
            <span class="badge">${meta.icon} ${meta.label}</span>
            <span class="badge">${this.progress.visitedStepIds.includes(step.id)?'visitada':'em exploração'}</span>
            ${state.converged?'<span class="badge">comparação concluída</span>':''}
          </div>
          <h3>${esc(step.title)}</h3>
          <p>${esc(step.instruction)}</p>
        </div>`;
    }

    const progressValue=this.root.querySelector('[data-tour-progress-value]');
    const progressCount=this.root.querySelector('[data-tour-progress-count]');
    const progressBar=this.root.querySelector('[data-tour-progress-bar]');
    if(progressValue)progressValue.textContent=`${stats.percent}%`;
    if(progressCount)progressCount.textContent=`${stats.visited}/${stats.total}`;
    if(progressBar)progressBar.style.width=`${stats.percent}%`;

    const routeStatus=this.root.querySelector('[data-tour-route-status]');
    if(routeStatus){
      routeStatus.textContent=state.choice
        ?`${state.choice.icon??'🧭'} escolhida`
        :'2 rotas';
    }

    const routeHelp=this.root.querySelector('[data-tour-route-help]');
    if(routeHelp){
      routeHelp.textContent=state.choice
        ?`Rota sugerida: ${state.path.map(id=>this.stepById(id)?.label??id).join(' → ')}`
        :'Escolha entre investigar o objeto 3D ou comparar primeiro a segunda zona 360.';
    }

    const map=this.root.querySelector('[data-tour-map]');
    if(map)map.innerHTML=this.renderMiniMap();

    const dots=this.root.querySelector('[data-tour-step-dots]');
    if(dots)dots.innerHTML=(this.tour.steps??[]).map((s,i)=>
      `<button type="button" data-tour-step="${i}" class="${i===this.currentIndex?'active':''} ${this.progress.visitedStepIds.includes(s.id)?'visited':''} ${state.path.includes(s.id)?'recommended':''}" aria-label="Etapa ${i+1}"></button>`
    ).join('');

    const prevId=state.previousStepId;
    const nextId=state.nextStepId;
    const prev=this.root.querySelector('[data-tour-prev]');
    const next=this.root.querySelector('[data-tour-next]');
    if(prev){
      prev.disabled=!prevId;
      prev.dataset.targetStep=prevId??'';
      prev.textContent=prevId?`← ${this.stepById(prevId)?.label??'Anterior'}`:'← Início';
    }
    if(next){
      const waitingChoice=step?.id===this.tour.routing?.decisionStepId&&!state.choice;
      next.disabled=!nextId;
      next.dataset.targetStep=nextId??'';
      if(waitingChoice)next.textContent='Escolha uma rota acima';
      else if(nextId)next.textContent=`${this.stepById(nextId)?.label??'Próximo'} →`;
      else next.textContent='Fim do percurso';
    }

    this.renderDecision();
  }

  async disposeChild(){
    this.child?.dispose?.();
    this.child=null;
    this.content?.replaceChildren();
  }

  async ensureDecisionForTarget(stepId){
    if(!this.director.hasBranching()||this.director.decisionFor(this.progress))return;
    const choice=this.director.choiceForTarget(stepId);
    if(!choice)return;
    this.progress=this.progressService.decide(
      this.tour,
      this.progress,
      this.tour.routing.decisionStepId,
      choice.id
    );
    this.context.events?.emit?.('environment:tour-choice',{
      tourId:this.tour.id,
      sectorId:this.tour.sectorId,
      stepId:this.tour.routing.decisionStepId,
      choiceId:choice.id,
      targetStepId:choice.targetStepId,
      inferred:true
    });
  }

  async chooseRoute(choiceId){
    const choice=this.director.choiceById(choiceId);
    if(!choice)return;
    this.progress=this.progressService.decide(
      this.tour,
      this.progress,
      this.tour.routing.decisionStepId,
      choice.id
    );
    this.context.events?.emit?.('environment:tour-choice',{
      tourId:this.tour.id,
      sectorId:this.tour.sectorId,
      stepId:this.tour.routing.decisionStepId,
      choiceId:choice.id,
      targetStepId:choice.targetStepId,
      inferred:false
    });
    await this.openStepById(choice.targetStepId,{visit:true,inferDecision:false});
  }

  async changeRoute(){
    if(!this.director.hasBranching())return;
    this.progress=this.progressService.clearDecision(
      this.tour,
      this.progress,
      this.tour.routing.decisionStepId
    );
    await this.openStepById(this.tour.routing.decisionStepId,{visit:false,inferDecision:false});
  }

  async openStepById(stepId,options={}){
    const index=this.indexById(stepId);
    if(index>=0)await this.openStep(index,options);
  }

  async openStep(index,{visit=true,inferDecision=true}={}){
    const safe=Math.max(0,Math.min(index,this.tour.steps.length-1));
    const step=this.tour.steps[safe];
    if(!step)return;
    if(inferDecision)await this.ensureDecisionForTarget(step.id);

    await this.disposeChild();
    this.currentIndex=safe;

    const shouldVisit=visit&&step.type!=='mission3d';
    if(shouldVisit)this.progress=this.progressService.visit(this.tour,this.progress,step.id);
    else this.progress=this.progressService.current(this.tour,this.progress,step.id);
    this.updateChrome();

    if(step.type==='panorama'){
      const experience=this.sectorData.experiences.find(e=>e.id===step.experienceId);
      const {Panorama360Viewer}=await import('./panorama360-viewer.js');
      this.child=new Panorama360Viewer(this.content,experience,{
        theme:this.sectorData.theme,
        context:this.context,
        initialNodeId:step.nodeId,
        onAction:async action=>{
          if(action?.type==='experience'&&action.experienceId){
            const candidates=this.tour.steps.filter(s=>s.experienceId===action.experienceId);
            const target=candidates.find(s=>s.id!==step.id)??candidates[0];
            if(target)await this.openStepById(target.id,{visit:true,inferDecision:true});
          }
        }
      });
      await this.child.mount();
    }else if(step.type==='object3d'){
      const experience=this.sectorData.experiences.find(e=>e.id===step.experienceId);
      const {ObjectFocusViewer}=await import('./object-focus-viewer.js');
      this.child=new ObjectFocusViewer(this.content,this.context,{...experience,theme:this.sectorData.theme,sectorLabel:this.sectorData.label});
      await this.child.mount();
    }else if(step.type==='mission3d'){
      const stats=this.stats();
      const route=this.routeState();
      this.content.innerHTML=`<section class="tour-mission-launch">
        <div class="tour-mission-icon">🎯</div>
        <div>
          <p class="kicker">Convergência da rota</p>
          <h3>${esc(step.title)}</h3>
          <p>${esc(step.instruction)}</p>
          <div class="mission-badges">
            <span class="badge">${stats.percent}% do tour explorado</span>
            <span class="badge">${route.converged?'duas perspectivas comparadas':'rota ainda pode ser revisitada'}</span>
            <span class="badge">RiskEngine + evidências + relatório</span>
          </div>
          <button type="button" data-tour-launch-mission>Abrir missão 3D</button>
          <small>Ao abrir a missão, o progresso do tour fica salvo localmente. Depois você pode retornar ao setor e revisitar qualquer etapa.</small>
        </div>
      </section>`;
    }

    this.context.events?.emit?.('environment:tour-step',{
      tourId:this.tour.id,
      sectorId:this.tour.sectorId,
      stepId:step.id,
      stepIndex:safe,
      type:step.type,
      routing:this.routeState(),
      progress:this.stats()
    });
  }

  async reset(){
    await this.disposeChild();
    this.progress=this.progressService.reset(this.tour);
    this.currentIndex=0;
    await this.openStep(0,{visit:true,inferDecision:false});
  }

  async handle(event){
    if(event.target.closest('[data-tour-close]')){
      await this.unmount();
      await this.onClose?.();
      return;
    }

    if(event.target.closest('[data-tour-reset]')){
      await this.reset();
      return;
    }

    const choice=event.target.closest('[data-tour-choice]')?.dataset.tourChoice;
    if(choice){
      await this.chooseRoute(choice);
      return;
    }

    if(event.target.closest('[data-tour-change-choice]')){
      await this.changeRoute();
      return;
    }

    const stepButton=event.target.closest('[data-tour-step]');
    if(stepButton){
      const index=Number(stepButton.dataset.tourStep);
      const target=this.tour.steps[index];
      if(target)await this.openStep(index,{visit:true,inferDecision:true});
      return;
    }

    const prev=event.target.closest('[data-tour-prev]');
    if(prev&&!prev.disabled&&prev.dataset.targetStep){
      await this.openStepById(prev.dataset.targetStep,{visit:true,inferDecision:true});
      return;
    }

    const next=event.target.closest('[data-tour-next]');
    if(next&&!next.disabled&&next.dataset.targetStep){
      await this.openStepById(next.dataset.targetStep,{visit:true,inferDecision:true});
      return;
    }

    if(event.target.closest('[data-tour-launch-mission]')){
      const step=this.step();
      this.progress=this.progressService.visit(this.tour,this.progress,step.id);
      this.updateChrome();
      this.context.events?.emit?.('environment:tour-mission-launch',{
        tourId:this.tour.id,
        sectorId:this.tour.sectorId,
        missionId:step.experienceId,
        choiceId:this.director.decisionFor(this.progress)?.id??null
      });
      await this.onMission?.(step.experienceId);
    }
  }

  async unmount(){
    await this.disposeChild();
    if(this.listener)this.root?.removeEventListener('click',this.listener);
    this.listener=null;
    this.root?.replaceChildren();
    this.root=null;
  }
}
