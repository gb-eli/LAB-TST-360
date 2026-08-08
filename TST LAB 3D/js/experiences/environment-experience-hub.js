import {EnvironmentExperienceRegistry} from './environment-experience-registry.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const TYPE_META={
  panorama360:{icon:'🌐',label:'Panorama 360',tag:'leve'},
  object3d:{icon:'🧩',label:'Objeto 3D',tag:'sob demanda'},
  mission3d:{icon:'🎯',label:'Missão 3D',tag:'interativa'}
};

export class EnvironmentExperienceHub{
  constructor(context,{sectorId,onBack,onMission}={}){
    this.context=context;
    this.sectorId=sectorId;
    this.onBack=onBack;
    this.onMission=onMission;
    this.registry=new EnvironmentExperienceRegistry(context.assets);
    this.root=null;
    this.data=null;
    this.listener=null;
    this.viewer=null;
    this.authoringRuntime=null;
    this.tourRuntime=null;
    this.presentation=false;
  }

  async mount(root){
    this.root=root;
    this.data=await this.registry.sector(this.sectorId);
    this.listener=event=>this.handle(event);
    root.addEventListener('click',this.listener);
    this.renderLibrary();
    this.context.events?.emit?.('environment:library-opened',{
      sectorId:this.sectorId,
      experiences:this.data.experiences?.length??0
    });
    return this;
  }

  async closeViewer(){
    this.viewer?.dispose?.();
    this.viewer=null;
  }

  async closeAuthoring(){
    if(this.authoringRuntime){
      const runtime=this.authoringRuntime;
      this.authoringRuntime=null;
      await runtime.unmount?.();
    }
  }

  async closeTour(){
    if(this.tourRuntime){
      const runtime=this.tourRuntime;
      this.tourRuntime=null;
      await runtime.unmount?.();
    }
  }

  async unmount(){
    await this.closeViewer();
    await this.closeAuthoring();
    await this.closeTour();
    if(this.listener)this.root?.removeEventListener('click',this.listener);
    this.listener=null;
    this.root?.replaceChildren();
    this.root=null;
  }

  renderLibrary(){
    const experiences=this.data.experiences??[];
    const tourSaved=this.data.tour
      ?this.context.storage?.get?.(`visual-tour-progress:${this.data.tour.id}`,null)
      :null;
    const tourVisited=new Set(tourSaved?.visitedStepIds??[]).size;
    const tourTotal=this.data.tour?.stepCount??0;
    const tourPercent=tourTotal?Math.round(Math.min(tourVisited,tourTotal)/tourTotal*100):0;
    const tourChoice=tourSaved?.decisions?.entrada??null;
    this.root.innerHTML=`<div class="environment-hub ${this.presentation?'presentation':''}">
      <div class="environment-subbar">
        <button type="button" data-environment-back>← Voltar ao setor</button>
        <div><span>${this.data.icon}</span><strong>${esc(this.data.label)}</strong><small>Ambientes carregados separadamente • v0.38.0</small></div>
        <button type="button" data-environment-presentation>${this.presentation?'Sair da apresentação':'Tela de apresentação'}</button>
      </div>

      <section class="environment-hero">
        <div>
          <p class="kicker">Exploração visual 3D / 360</p>
          <h2>${esc(this.data.label)}</h2>
          <p>${esc(this.data.summary)}</p>
        </div>
        <aside>
          <strong>Uma ferramenta para todos</strong>
          <p>O mesmo recurso pode ser usado no projetor durante a explicação ou explorado individualmente. Não existe separação por perfil de professor/aluno.</p>
        </aside>
      </section>

      <div class="environment-load-note">
        <div><strong>Carregamento modular</strong><span>O panorama, o objeto 3D e a missão são independentes. Imagens 360 também são escolhidas por qualidade e carregadas apenas para a zona aberta.</span></div>
        <button type="button" data-environment-authoring>Calibrar / criar panorama 360</button>
      </div>

      <section class="environment-experience-grid">
        ${experiences.map(exp=>{
          const meta=TYPE_META[exp.type]??{icon:'🔎',label:exp.type,tag:'módulo'};
          return `<article class="environment-experience-card">
            <div class="environment-experience-icon">${meta.icon}</div>
            <div>
              <div class="mission-badges"><span class="badge">${meta.label}</span><span class="badge">${meta.tag}</span>${exp.viewpointCount?`<span class="badge">${exp.viewpointCount} pontos</span>`:''}${exp.image360Nodes?`<span class="badge">${exp.image360Nodes} imagens 360</span>`:''}</div>
              <h3>${esc(exp.title)}</h3>
              <p>${esc(exp.description)}</p>
            </div>
            <button type="button" data-environment-experience="${exp.id}">${exp.type==='mission3d'?'Abrir missão':'Explorar'}</button>
          </article>`;
        }).join('')}
        ${this.data.tour?`<article class="environment-experience-card tour-entry-card">
          <div class="environment-experience-icon">🧭</div>
          <div>
            <div class="mission-badges"><span class="badge">Tour visual</span><span class="badge">${this.data.tour.stepCount} etapas</span><span class="badge">2 rotas</span><span class="badge">${tourPercent}% explorado</span>${tourChoice?`<span class="badge">decisão salva</span>`:''}</div>
            <h3>${esc(this.data.tour.label)}</h3>
            <p>Percurso guiado com escolha de investigação: começar pelo objeto 3D ou comparar primeiro a segunda zona 360. As rotas convergem na missão final.</p>
          </div>
          <div class="tour-entry-progress"><span style="width:${tourPercent}%"></span></div>
          <button type="button" data-environment-tour>${tourVisited?'Continuar tour':'Iniciar tour'}</button>
        </article>`:''}
      </section>

      <div class="sector-notice">${esc(this.data.notice)}</div>
    </div>`;
  }

  async openExperience(id){
    const experience=this.data.experiences?.find(item=>item.id===id);
    if(!experience)return;
    await this.closeViewer();
    await this.closeAuthoring();
    await this.closeTour();

    if(experience.type==='mission3d'){
      await this.onMission?.(experience.id,experience);
      return;
    }

    this.root.innerHTML=`<div class="environment-hub ${this.presentation?'presentation':''}">
      <div class="environment-subbar">
        <button type="button" data-environment-library>← Experiências</button>
        <div><span>${this.data.icon}</span><strong>${esc(experience.title)}</strong><small>${TYPE_META[experience.type]?.label??experience.type} • carregamento isolado</small></div>
        <button type="button" data-environment-presentation>${this.presentation?'Sair da apresentação':'Tela de apresentação'}</button>
      </div>
      <div class="environment-viewer-host" data-environment-viewer></div>
    </div>`;
    const host=this.root.querySelector('[data-environment-viewer]');

    if(experience.type==='panorama360'){
      const {Panorama360Viewer}=await import('./panorama360-viewer.js');
      this.viewer=new Panorama360Viewer(host,experience,{
        theme:this.data.theme,
        context:this.context,
        onAction:async action=>{
          if(action?.type==='experience'&&action.experienceId){
            await this.openExperience(action.experienceId);
          }
        }
      });
      await this.viewer.mount();
    }else if(experience.type==='object3d'){
      const {ObjectFocusViewer}=await import('./object-focus-viewer.js');
      this.viewer=new ObjectFocusViewer(host,this.context,{...experience,theme:this.data.theme,sectorLabel:this.data.label});
      await this.viewer.mount();
    }

    this.context.events?.emit?.('environment:experience-opened',{
      sectorId:this.sectorId,
      experienceId:experience.id,
      type:experience.type
    });
  }

  async openAuthoring(){
    await this.closeViewer();
    await this.closeAuthoring();
    await this.closeTour();
    const experience=this.data.experiences?.find(item=>item.type==='panorama360');
    if(!experience)return;

    this.root.innerHTML=`<div class="environment-hub ${this.presentation?'presentation':''}">
      <div class="environment-subbar">
        <button type="button" data-environment-library>← Experiências</button>
        <div><span>${this.data.icon}</span><strong>Autoria 360 — ${esc(this.data.label)}</strong><small>Ferramenta local • mesma interface para qualquer usuário</small></div>
        <button type="button" data-environment-presentation>${this.presentation?'Sair da apresentação':'Tela de apresentação'}</button>
      </div>
      <div data-environment-authoring-host></div>
    </div>`;

    const {PanoramaAuthoringTool}=await import('./panorama-authoring-tool.js');
    const host=this.root.querySelector('[data-environment-authoring-host]');
    this.authoringRuntime=new PanoramaAuthoringTool(this.context,{
      sectorData:this.data,
      experience,
      onClose:()=>{
        this.authoringRuntime=null;
        this.renderLibrary();
      }
    });
    await this.authoringRuntime.mount(host);
    this.context.events?.emit?.('environment:panorama-authoring-opened',{
      sectorId:this.sectorId,
      experienceId:experience.id
    });
  }

  async openTour(){
    if(!this.data.tour?.path)return;
    await this.closeViewer();
    await this.closeAuthoring();
    await this.closeTour();

    const tour=await this.context.assets.json(this.data.tour.path,{cache:'no-cache'});
    this.root.innerHTML=`<div class="environment-hub ${this.presentation?'presentation':''}">
      <div class="environment-subbar">
        <button type="button" data-environment-library>← Experiências</button>
        <div><span>🧭</span><strong>${esc(tour.title)}</strong><small>G10.8 • percurso visual lazy</small></div>
        <button type="button" data-environment-presentation>${this.presentation?'Sair da apresentação':'Tela de apresentação'}</button>
      </div>
      <div data-environment-tour-host></div>
    </div>`;

    const {EnvironmentVisualTour}=await import('./environment-visual-tour.js');
    const host=this.root.querySelector('[data-environment-tour-host]');
    this.tourRuntime=new EnvironmentVisualTour(this.context,{
      sectorData:this.data,
      tour,
      onClose:()=>{
        this.tourRuntime=null;
        this.renderLibrary();
      },
      onMission:async missionId=>{
        await this.onMission?.(missionId);
      }
    });
    await this.tourRuntime.mount(host);
  }

  togglePresentation(){
    this.presentation=!this.presentation;
    const hub=this.root?.querySelector('.environment-hub');
    hub?.classList.toggle('presentation',this.presentation);
    const button=this.root?.querySelector('[data-environment-presentation]');
    if(button)button.textContent=this.presentation?'Sair da apresentação':'Tela de apresentação';
  }

  async handle(event){
    if(event.target.closest('[data-environment-presentation]')){
      this.togglePresentation();
      return;
    }
    if(event.target.closest('[data-environment-back]')){
      await this.unmount();
      await this.onBack?.();
      return;
    }
    if(event.target.closest('[data-environment-library]')){
      await this.closeViewer();
      await this.closeAuthoring();
      await this.closeTour();
      this.renderLibrary();
      return;
    }
    if(event.target.closest('[data-environment-authoring]')){
      await this.openAuthoring();
      return;
    }
    if(event.target.closest('[data-environment-tour]')){
      await this.openTour();
      return;
    }
    const id=event.target.closest('[data-environment-experience]')?.dataset.environmentExperience;
    if(id)await this.openExperience(id);
  }
}
