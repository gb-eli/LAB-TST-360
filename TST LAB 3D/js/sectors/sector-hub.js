import {createInspectionLab} from '../ui/inspection-lab.js';
import {hasSector3D,getSector3DDescriptor} from './sector-3d-registry.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function sectorScene(theme='construction'){
  const common=`<defs>
    <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#203b53"/><stop offset="1" stop-color="#101b28"/></linearGradient>
    <linearGradient id="floorS" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4c555b"/><stop offset="1" stop-color="#282e32"/></linearGradient>
  </defs><rect width="900" height="335" fill="url(#skyS)"/><rect y="335" width="900" height="185" fill="url(#floorS)"/>`;
  const scenes={
    construction:`${common}<g fill="#9aaab5"><rect x="95" y="150" width="290" height="230" rx="5"/><rect x="130" y="115" width="220" height="45" fill="#c6a55b"/></g><g stroke="#788791" stroke-width="8"><line x1="440" y1="115" x2="440" y2="395"/><line x1="575" y1="115" x2="575" y2="395"/><line x1="440" y1="170" x2="575" y2="170"/><line x1="440" y1="250" x2="575" y2="250"/><line x1="440" y1="330" x2="575" y2="330"/><line x1="440" y1="115" x2="575" y2="250"/><line x1="575" y1="115" x2="440" y2="250"/></g><g fill="#d7ad35"><rect x="700" y="80" width="15" height="290"/><rect x="625" y="80" width="210" height="12"/></g><line x1="785" y1="92" x2="785" y2="230" stroke="#d9dde0" stroke-width="3"/><rect x="752" y="230" width="66" height="52" fill="#855c37"/><g fill="#a16b3d"><rect x="55" y="392" width="125" height="28"/><rect x="205" y="410" width="100" height="22"/></g>`,
    industry:`${common}<g fill="#6e8797"><rect x="80" y="205" width="245" height="170" rx="8"/><rect x="115" y="150" width="180" height="75" rx="7"/><circle cx="205" cy="285" r="52" fill="#1c2831" stroke="#a8bac5" stroke-width="8"/><circle cx="205" cy="285" r="27" fill="#ce7140"/></g><g fill="#55756b"><rect x="570" y="205" width="185" height="170" rx="8"/><rect x="595" y="165" width="135" height="55" rx="6"/></g><g transform="translate(360 330)"><rect width="135" height="72" rx="12" fill="#d7a42c"/><circle cx="30" cy="70" r="22" fill="#151a1e"/><circle cx="108" cy="70" r="22" fill="#151a1e"/><rect x="120" y="-20" width="8" height="100" fill="#222"/></g><g fill="#9a693d"><rect x="770" y="340" width="80" height="48"/><rect x="735" y="390" width="110" height="45"/></g>`,
    port:`${common}<rect x="65" y="260" width="220" height="105" rx="8" fill="#4c697a"/><rect x="98" y="225" width="100" height="42" fill="#718a98"/><circle cx="110" cy="368" r="28" fill="#12181c"/><circle cx="245" cy="368" r="28" fill="#12181c"/><g fill="#9c5c38"><rect x="535" y="205" width="150" height="72"/><rect x="555" y="132" width="150" height="72"/><rect x="705" y="205" width="130" height="72"/></g><g fill="#d6ad38"><rect x="380" y="70" width="16" height="300"/><rect x="300" y="70" width="270" height="13"/></g><line x1="520" y1="84" x2="520" y2="215" stroke="#d8dde0" stroke-width="3"/><rect x="480" y="215" width="80" height="55" fill="#8e5e36"/><path d="M20 435H880" stroke="#d5b542" stroke-width="6" stroke-dasharray="28 18"/>`,
    health:`${common}<rect x="0" y="70" width="900" height="265" fill="#d7e3e7" opacity=".7"/><g fill="#f3f6f7"><rect x="70" y="115" width="180" height="180"/><rect x="650" y="115" width="180" height="180"/></g><g fill="#5b8392"><rect x="95" y="145" width="130" height="22"/><rect x="675" y="145" width="130" height="22"/></g><g transform="translate(400 310)"><rect x="0" y="25" width="115" height="60" rx="8" fill="#6f8790"/><circle cx="22" cy="88" r="13" fill="#222"/><circle cx="92" cy="88" r="13" fill="#222"/><rect x="95" y="-20" width="7" height="60" fill="#6f8790"/></g><rect x="740" y="350" width="65" height="85" rx="8" fill="#c5534c"/><path d="M60 440H840" stroke="#e6d9a8" stroke-width="8" stroke-dasharray="32 18"/>`,
    office:`${common}<rect x="0" y="75" width="900" height="260" fill="#d6dde0" opacity=".55"/><g fill="#725a46"><rect x="90" y="280" width="250" height="20"/><rect x="115" y="300" width="14" height="120"/><rect x="300" y="300" width="14" height="120"/><rect x="520" y="280" width="250" height="20"/><rect x="545" y="300" width="14" height="120"/><rect x="730" y="300" width="14" height="120"/></g><g fill="#243845"><rect x="155" y="195" width="115" height="75" rx="5"/><rect x="590" y="195" width="115" height="75" rx="5"/></g><g fill="#3d5564"><rect x="190" y="340" width="62" height="70" rx="15"/><rect x="625" y="340" width="62" height="70" rx="15"/></g><rect x="800" y="125" width="60" height="140" fill="#487b69"/>`,
    warehouse:`${common}<g stroke="#6e7f89" stroke-width="10" fill="none"><rect x="80" y="105" width="245" height="280"/><rect x="575" y="105" width="245" height="280"/><line x1="80" y1="190" x2="325" y2="190"/><line x1="80" y1="275" x2="325" y2="275"/><line x1="575" y1="190" x2="820" y2="190"/><line x1="575" y1="275" x2="820" y2="275"/></g><g fill="#9b6a3e"><rect x="105" y="128" width="85" height="52"/><rect x="205" y="128" width="90" height="52"/><rect x="600" y="212" width="90" height="52"/><rect x="705" y="212" width="86" height="52"/><rect x="645" y="300" width="110" height="72"/></g><g transform="translate(400 370)" fill="#657f8c"><rect width="110" height="60" rx="8"/><circle cx="20" cy="60" r="14" fill="#222"/><circle cx="90" cy="60" r="14" fill="#222"/></g>`,
    workshop:`${common}<rect x="90" y="285" width="290" height="25" fill="#795942"/><rect x="115" y="310" width="18" height="110" fill="#5f4431"/><rect x="335" y="310" width="18" height="110" fill="#5f4431"/><g fill="#637d8a"><rect x="470" y="205" width="210" height="170" rx="8"/><circle cx="575" cy="285" r="55" fill="#1b272e" stroke="#aebdc5" stroke-width="8"/></g><g stroke="#bac4ca" stroke-width="9"><line x1="155" y1="240" x2="255" y2="185"/><line x1="205" y1="212" x2="260" y2="270"/></g><path d="M330 430c90-45 135 30 220-10" stroke="#1b1f23" stroke-width="10" fill="none"/>`,
    electrical:`${common}<g fill="#5e7580"><rect x="95" y="125" width="205" height="270" rx="8"/><rect x="345" y="115" width="220" height="280" rx="8"/></g><g fill="#273b46"><rect x="120" y="155" width="155" height="100"/><rect x="375" y="150" width="160" height="190"/></g><polygon points="455,182 420,250 452,250 430,315 505,228 470,228 495,182" fill="#e3c04a"/><rect x="650" y="120" width="165" height="40" rx="8" fill="#49342b"/><path d="M570 440c90-45 150-10 245-45" stroke="#22292d" stroke-width="15" fill="none"/><path d="M580 445c85-42 145-8 238-42" stroke="#d9a83d" stroke-width="4" fill="none"/>`
  };
  return `<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Cenário setorial TST 360">${scenes[theme]||scenes.construction}</svg>`;
}

export class SectorHub{
  constructor(context){this.context=context;this.root=null;this.data=null;this.listener=null;this.currentSector=null;this.currentMission=null;this.missionRuntime=null;this.experienceRuntime=null;this.activePerformanceId=null}
  async init(){if(!this.data)this.data=await this.context.assets.json('data/sectors/sectors.json',{cache:'no-cache'})}
  async mount(root){await this.init();await this.unmountMission();if(this.root&&this.listener)this.root.removeEventListener('click',this.listener);this.root=root;this.listener=e=>this.handle(e);root.addEventListener('click',this.listener);this.renderOverview()}
  async unmountMission(){if(this.missionRuntime){await this.missionRuntime.destroy?.();this.missionRuntime=null;this.context.riskEngine.reset();this.context.scenarioEngine.clear()}if(this.activePerformanceId){this.context.events.emit('module:closed',{id:this.activePerformanceId});this.activePerformanceId=null}}
  async unmountExperience(){if(this.experienceRuntime){await this.experienceRuntime.unmount?.();this.experienceRuntime=null}}
  async unmount(){await this.unmountMission();await this.unmountExperience();if(this.root&&this.listener)this.root.removeEventListener('click',this.listener);this.listener=null;if(this.root)this.root.replaceChildren();this.root=null;this.currentSector=null;this.currentMission=null}
  sessionsFor(missionId){return (this.context.inspectionSessionService?.list?.()??[]).filter(row=>row.moduleId===missionId)}
  sectorStats(sector){const ids=sector.missions.map(m=>`sector-${sector.id}-${m.id}`);const sessions=this.context.inspectionSessionService?.list?.()??[];const completed=new Set(sessions.filter(s=>ids.includes(s.moduleId)).map(s=>s.moduleId));return{completed:completed.size,total:sector.missions.length,sessions:sessions.filter(s=>ids.includes(s.moduleId)).length}}
  renderOverview(){this.currentSector=null;this.currentMission=null;const total=this.data.sectors.reduce((n,s)=>n+s.missions.length,0);const sessions=this.context.inspectionSessionService?.list?.()??[];const sectorSessions=sessions.filter(s=>String(s.moduleId).startsWith('sector-')).length;this.root.innerHTML=`<div class="sector-hub"><div class="sector-hero"><div><p class="kicker">Biblioteca profissional</p><h2>Cenários por setor</h2><p>Explore contextos de atuação do TST usando o mesmo fluxo de inspeção, evidências, Central TST e relatórios da plataforma.</p></div><div class="sector-summary"><strong>${this.data.sectors.length}</strong><span>setores</span><strong>${total}</strong><span>missões</span><strong>${sectorSessions}</strong><span>sessões locais</span></div></div><div class="sector-grid">${this.data.sectors.map(sector=>{const st=this.sectorStats(sector);return `<article class="sector-card"><div class="sector-icon">${sector.icon}</div><div><span class="badge">${st.completed}/${st.total} missões concluídas</span><h3>${esc(sector.name)}</h3><p>${esc(sector.summary)}</p><small><strong>Papel do TST:</strong> ${esc(sector.tstRole)}</small></div><button data-sector="${sector.id}">Explorar setor</button></article>`}).join('')}</div><div class="sector-notice">${esc(this.data.notice)}</div></div>`}
  renderSector(id){const sector=this.data.sectors.find(s=>s.id===id);if(!sector)return;this.currentSector=sector;const st=this.sectorStats(sector);this.root.innerHTML=`<div class="sector-hub"><div class="sector-subbar"><button data-sector-overview>← Todos os setores</button><div><span>${sector.icon}</span><strong>${esc(sector.name)}</strong><small>${st.sessions} sessão(ões) registrada(s)</small></div></div><div class="sector-intro"><div><p class="kicker">Contexto profissional</p><h2>${esc(sector.name)}</h2><p>${esc(sector.summary)}</p></div><aside><strong>O que observar como TST</strong><p>${esc(sector.tstRole)}</p></aside></div>
    <section class="sector-visual-entry">
      <div>
        <p class="kicker">Ambientes gráficos modulares</p>
        <h3>Explorar ${esc(sector.name)} em 3D / 360</h3>
        <p>Abra panorama 360 híbrido, objeto 3D, missão ou um tour visual guiado que conecta essas experiências em uma rota. Cada etapa continua independente e carregada sob demanda.</p>
        <div class="mission-badges"><span class="badge">🌐 Panorama híbrido • 2 zonas</span><span class="badge">🧩 Objeto 3D</span><span class="badge">🎯 Missão 3D</span><span class="badge">🧭 Tour visual</span><span class="badge">mesma ferramenta para todos</span></div>
      </div>
      <button type="button" data-sector-experiences="${sector.id}">Abrir experiências visuais</button>
    </section>
    <div class="mission-grid">${sector.missions.map((mission,index)=>{const id=`sector-${sector.id}-${mission.id}`;const sessions=this.sessionsFor(id);const last=sessions[0];return `<article class="mission-card"><span class="mission-number">${String(index+1).padStart(2,'0')}</span><div><div class="mission-badges"><span class="badge">${sessions.length?sessions.length+' sessão(ões)':'não realizada'}</span><span class="badge">${mission.variants?.length||1} variantes</span>${hasSector3D(sector.id)?`<span class="badge port-3d-badge">2D + 3D</span>`:''}</div><h3>${esc(mission.title)}</h3><p>${esc(mission.description)}</p><small>${last?`Último resultado: ${last.score}% • ${new Date(last.finishedAt).toLocaleDateString('pt-BR')} • ${esc(last.variantLabel||'Padrão')}`:'Fluxo: observar → evidenciar → registrar → relatório'}</small></div><button data-mission="${mission.id}">Iniciar missão</button></article>`}).join('')}</div></div>`}
  async openExperiences(){
    const sector=this.currentSector;if(!sector)return;
    await this.unmountMission();
    await this.unmountExperience();
    const {EnvironmentExperienceHub}=await import('../experiences/environment-experience-hub.js');
    this.experienceRuntime=new EnvironmentExperienceHub(this.context,{
      sectorId:sector.id,
      onBack:async()=>{this.experienceRuntime=null;this.renderSector(sector.id)},
      onMission:async missionId=>{
        await this.unmountExperience();
        this.renderSector(sector.id);
        await this.startMission(missionId);
      }
    });
    await this.experienceRuntime.mount(this.root);
  }
  async startMission(missionId){
    const sector=this.currentSector;if(!sector)return;
    const mission=sector.missions.find(m=>m.id===missionId);if(!mission)return;
    await this.unmountMission();
    await this.unmountExperience();
    this.currentMission=mission;
    const id=`sector-${sector.id}-${mission.id}`;
    const descriptor=getSector3DDescriptor(sector.id,mission.id);
    const sector3D=!!descriptor;
    const config={
      id,
      title:`${sector.name} — ${mission.title}`,
      description:mission.description,
      sceneTitle:`${sector.icon} ${mission.title}`,
      sceneNote:`Missão setorial • ${sector.name}. ${this.data.notice}`,
      sceneSvg:sectorScene(sector.theme),
      risks:mission.risks,
      variants:mission.variants||[],
      instruction:mission.instruction,
      navHtml:`<div class="sector-mission-nav"><button data-sector-hub-back>← Missões de ${esc(sector.name)}</button><div><span>${sector.icon}</span><strong>${esc(mission.title)}</strong><small>Biblioteca setorial • v0.38.0${sector3D?` • 3D ${descriptor.label}`:''}</small></div></div>`,
      ...(sector3D?{
        create3D:descriptor.create3D,
        view3DLabel:`3D ${descriptor.label}`,
        scene3DNote:descriptor.note
      }:{})
    };
    this.activePerformanceId=id;
    this.context.events.emit('module:opened',{manifest:{id,name:config.title,version:'0.38.0',renderer:sector3D?`SVG + Three.js ${descriptor.label} G1`:'SVG setorial'}});
    this.missionRuntime=createInspectionLab(this.context,config);
    await this.missionRuntime.init?.();
    await this.missionRuntime.load?.();
    await this.missionRuntime.start(this.root);
  }
  async handle(event){const overview=event.target.closest?.('[data-sector-overview]');if(overview){await this.unmountMission();await this.unmountExperience();this.renderOverview();return}const back=event.target.closest?.('[data-sector-hub-back]');if(back){await this.unmountMission();await this.unmountExperience();this.renderSector(this.currentSector?.id);return}const visual=event.target.closest?.('[data-sector-experiences]');if(visual){await this.openExperiences();return}const sector=event.target.closest?.('[data-sector]')?.dataset.sector;if(sector){await this.unmountExperience();this.renderSector(sector);return}const mission=event.target.closest?.('[data-mission]')?.dataset.mission;if(mission){await this.startMission(mission)}}
}
