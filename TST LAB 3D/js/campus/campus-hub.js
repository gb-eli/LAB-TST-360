import {createCampus3D} from './three-campus.js';
import {SECTOR_3D_IDS} from '../sectors/sector-3d-registry.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const SECTORS_3D=new Set(SECTOR_3D_IDS);
const SECTORS_VISUAL=new Set(SECTOR_3D_IDS);

const ZONES=[
  {sector:'construcao',label:'Construção',icon:'🏗️',x:4,y:7,w:27,h:28,lab:'canteiro-360',labLabel:'Canteiro 360'},
  {sector:'industria',label:'Indústria',icon:'🏭',x:36,y:5,w:28,h:30,lab:'industria',labLabel:'Indústria e Máquinas'},
  {sector:'porto-logistica',label:'Porto / Logística',icon:'⚓',x:69,y:7,w:27,h:28},
  {sector:'saude',label:'Saúde / Hospital',icon:'🏥',x:4,y:55,w:27,h:28},
  {sector:'escritorio',label:'Escritório',icon:'🖥️',x:36,y:58,w:28,h:27,lab:'ergonomia',labLabel:'Ergonomia'},
  {sector:'almoxarifado',label:'Almoxarifado',icon:'📦',x:69,y:55,w:27,h:28},
  {sector:'oficina',label:'Oficina',icon:'🔧',compact:true,lab:'investigacao-acidentes',labLabel:'Investigação'},
  {sector:'obras-eletricas',label:'Obras Elétricas',icon:'⚡',compact:true,lab:'eletricidade',labLabel:'Eletricidade'}
];

export class CampusHub{
  constructor(context){
    this.context=context;
    this.root=null;
    this.listener=null;
    this.data=null;
    this.mode='2d';
    this.scene3d=null;
    this.renderToken=0;
    this.performanceOpen=false;
  }

  async init(){
    if(!this.data)this.data=await this.context.assets.json('data/sectors/sectors.json',{cache:'no-cache'});
    this.mode=this.context.storage.get('campus:view','2d');
  }

  async mount(root){
    await this.init();
    this.unmount();
    this.root=root;
    this.listener=e=>this.handle(e);
    root.addEventListener('click',this.listener);
    this.render();
  }

  dispose3D(){
    this.renderToken++;
    this.scene3d?.dispose?.();
    this.scene3d=null;
    if(this.performanceOpen){
      this.context.events.emit('module:closed',{id:'campus-3d'});
      this.performanceOpen=false;
    }
  }

  unmount(){
    this.dispose3D();
    if(this.root&&this.listener)this.root.removeEventListener('click',this.listener);
    this.listener=null;
    if(this.root)this.root.replaceChildren();
    this.root=null;
  }

  stats(sectorId){
    const sector=this.data?.sectors?.find(s=>s.id===sectorId);
    if(!sector)return{completed:0,total:0,sessions:0};
    const ids=sector.missions.map(m=>`sector-${sector.id}-${m.id}`);
    const sessions=(this.context.inspectionSessionService?.list?.()??[]).filter(s=>ids.includes(s.moduleId));
    return{
      completed:new Set(sessions.map(s=>s.moduleId)).size,
      total:sector.missions.length,
      sessions:sessions.length
    };
  }

  tourStats(sectorId){
    const tourId=`tour-${sectorId}`;
    const saved=this.context.storage.get(`visual-tour-progress:${tourId}`,null);
    const visited=new Set(saved?.visitedStepIds??[]).size;
    const total=4;
    return{
      visited,
      total,
      percent:Math.round(Math.min(visited,total)/total*100),
      complete:visited>=total
    };
  }

  zone(zone){
    const st=this.stats(zone.sector);
    const tour=this.tourStats(zone.sector);
    const sector=this.data.sectors.find(s=>s.id===zone.sector);
    const style=zone.compact?'':`style="--x:${zone.x};--y:${zone.y};--w:${zone.w};--h:${zone.h}"`;
    return `<article class="campus-zone ${zone.compact?'compact':''}" ${style} data-campus-zone="${zone.sector}">
      <button class="campus-zone-main" data-campus-sector="${zone.sector}" type="button">
        <span class="campus-zone-icon">${zone.icon}</span>
        <span class="campus-zone-copy"><strong>${esc(zone.label)} ${SECTORS_VISUAL.has(zone.sector)?'<em class="campus-zone-3d">3D/360</em>':''}</strong><small>${st.completed}/${st.total} missões • tour ${tour.percent}% • ${st.sessions} sessão(ões)</small></span>
      </button>
      ${zone.lab?`<button class="campus-zone-lab" type="button" data-campus-lab="${zone.lab}">Lab: ${esc(zone.labLabel)}</button>`:''}
      <span class="campus-zone-role">${esc(sector?.tstRole||'')}</span>
    </article>`;
  }

  head(){
    const all=this.context.inspectionSessionService?.list?.()??[];
    const sectorSessions=all.filter(row=>String(row.moduleId).startsWith('sector-')).length;
    const completed=ZONES.reduce((sum,z)=>sum+this.stats(z.sector).completed,0);
    const total=ZONES.reduce((sum,z)=>sum+this.stats(z.sector).total,0);
    const toursCompleted=ZONES.filter(z=>this.tourStats(z.sector).complete).length;
    return `<section class="campus-head">
      <div><p class="kicker">Mapa Geral da Plataforma</p><h2>Campus Virtual TST</h2><p>Use o mapa leve ou gire a maquete 3D. Todos os setores levam a bibliotecas visuais modulares com missões 3D, objetos em foco e panoramas 360 híbridos, objetos 3D, missões e tours visuais guiados com progresso local, todos carregados sob demanda.</p></div>
      <div class="campus-head-side">
        <div class="campus-summary">
          <div><strong>8</strong><span>setores</span></div>
          <div><strong>${completed}/${total}</strong><span>missões concluídas</span></div>
          <div><strong>${sectorSessions}</strong><span>sessões setoriais</span></div><div><strong>${SECTORS_VISUAL.size}</strong><span>setores 3D/360</span></div><div><strong>${toursCompleted}/8</strong><span>tours concluídos</span></div>
        </div>
        <div class="campus-mode" role="group" aria-label="Visualização do Campus">
          <button type="button" data-campus-mode="2d" class="${this.mode==='2d'?'active':''}">Mapa 2D</button>
          <button type="button" data-campus-mode="3d" class="${this.mode==='3d'?'active':''}">Maquete 3D</button>
        </div>
      </div>
    </section>`;
  }

  render2D(){
    return `<section class="campus-map" aria-label="Mapa esquemático do Campus TST">
      <div class="campus-road road-h road-one"></div><div class="campus-road road-h road-two"></div><div class="campus-road road-v road-three"></div>
      ${ZONES.filter(z=>!z.compact).map(z=>this.zone(z)).join('')}
      <article class="campus-central"><div class="campus-central-logo">TST</div><strong>Central TST</strong><span>Matriz • APR • Inventário • Inspeções • Plano de ação</span><button type="button" data-campus-tools>Abrir Central</button></article>
      <article class="campus-labs"><strong>🧪 Pavilhão de Laboratórios</strong><span>8 experiências principais 2D/3D</span><button type="button" data-campus-home>Ver laboratórios</button></article>
    </section>
    <section class="campus-lower">${ZONES.filter(z=>z.compact).map(z=>this.zone(z)).join('')}</section>`;
  }

  render3D(){
    return `<section class="campus-3d-card">
      <div class="campus-3d-toolbar">
        <div><strong>Maquete navegável</strong><small>Arraste para girar • pinça/roda para aproximar • toque em um prédio para entrar</small></div>
        <span class="badge">G10.8 • 8/8 setores 3D/360</span>
      </div>
      <div class="campus-3d-host" data-campus-three-host></div>
      <div class="campus-3d-actions">
        ${ZONES.map(z=>`<button type="button" data-campus-sector="${z.sector}">${z.icon} ${esc(z.label)}${SECTORS_VISUAL.has(z.sector)?' • 3D/360':''}</button>`).join('')}
        <button type="button" data-campus-tools>📋 Central TST</button>
      </div>
    </section>`;
  }

  render(){
    if(!this.root)return;
    this.dispose3D();
    this.root.innerHTML=`<div class="campus-hub">${this.head()}${this.mode==='3d'?this.render3D():this.render2D()}
      <section class="campus-legend">
        <div><span class="dot sector"></span><strong>Setor profissional</strong><small>Abre a biblioteca de missões.</small></div>
        <div><span class="dot lab"></span><strong>Laboratório relacionado</strong><small>Atalho para uma experiência principal.</small></div>
        <div><span class="dot central"></span><strong>Central TST</strong><small>Organiza os registros produzidos nas atividades.</small></div>
      </section></div>`;
    if(this.mode==='3d')this.mount3D(++this.renderToken);
  }

  async mount3D(token){
    const host=this.root?.querySelector('[data-campus-three-host]');
    if(!host)return;
    host.innerHTML='<div class="three-loading"><span class="spinner"></span><strong>Construindo a maquete 3D…</strong><small>O motor gráfico é carregado somente neste modo.</small></div>';
    try{
      this.context.events.emit('module:opened',{manifest:{id:'campus-3d',name:'Campus Virtual TST 3D',version:'0.38.0',renderer:'Three.js procedural campus + links 3D/360'}});
      this.performanceOpen=true;
      const progress=Object.fromEntries(ZONES.map(zone=>[zone.sector,this.stats(zone.sector)]));
      const scene=await createCampus3D(host,this.context,{
        onNavigate:nav=>this.context.events.emit('campus:navigate',nav),
        progress,
        sectors3D:[...SECTORS_3D]
      });
      if(token!==this.renderToken||this.mode!=='3d'){scene?.dispose?.();return}
      this.scene3d=scene;
    }catch(error){
      console.error('[TST360 Campus] Falha no 3D',error);
      if(token!==this.renderToken)return;
      this.mode='2d';
      this.context.storage.set('campus:view','2d');
      this.render();
      const note=document.createElement('div');note.className='feedback warn';note.innerHTML='<strong>Maquete 3D indisponível.</strong> O Campus voltou ao mapa 2D.';
      this.root?.prepend(note);
    }
  }

  handle(event){
    const mode=event.target.closest?.('[data-campus-mode]')?.dataset.campusMode;
    if(mode){
      this.mode=mode;
      this.context.storage.set('campus:view',mode);
      this.render();
      return;
    }
    const sector=event.target.closest?.('[data-campus-sector]')?.dataset.campusSector;
    if(sector){this.context.events.emit('campus:navigate',{type:'sector',id:sector});return}
    const lab=event.target.closest?.('[data-campus-lab]')?.dataset.campusLab;
    if(lab){this.context.events.emit('campus:navigate',{type:'lab',id:lab});return}
    if(event.target.closest?.('[data-campus-tools]')){this.context.events.emit('campus:navigate',{type:'tools'});return}
    if(event.target.closest?.('[data-campus-home]'))this.context.events.emit('campus:navigate',{type:'home'});
  }
}
