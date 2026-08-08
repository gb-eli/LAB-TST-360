const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function common(){
  return `<defs>
    <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#284e68"/><stop offset=".72" stop-color="#14293a"/><stop offset="1" stop-color="#101a24"/></linearGradient>
    <linearGradient id="pFloor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#657079"/><stop offset="1" stop-color="#262d33"/></linearGradient>
    <filter id="soft"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity=".22"/></filter>
  </defs>
  <rect width="2400" height="345" fill="url(#pSky)"/>
  <rect y="345" width="2400" height="175" fill="url(#pFloor)"/>
  <path d="M0 420H2400" stroke="#d7b347" stroke-width="5" stroke-dasharray="35 25" opacity=".7"/>
  <g opacity=".28" fill="#e7f3f7">${[140,420,760,1080,1390,1740,2070,2310].map(x=>`<circle cx="${x}" cy="105" r="2"/><circle cx="${x+60}" cy="155" r="1.5"/>`).join('')}</g>`;
}

function construction(){
  return `${common()}
  <g filter="url(#soft)">
    <rect x="55" y="150" width="325" height="220" rx="8" fill="#9aa9b0"/><rect x="95" y="112" width="245" height="45" fill="#caa959"/>
    <g stroke="#7c8b94" stroke-width="8"><line x1="455" y1="105" x2="455" y2="400"/><line x1="610" y1="105" x2="610" y2="400"/><line x1="455" y1="170" x2="610" y2="170"/><line x1="455" y1="255" x2="610" y2="255"/><line x1="455" y1="340" x2="610" y2="340"/></g>
    <g fill="#d8aa32"><rect x="780" y="72" width="16" height="315"/><rect x="700" y="72" width="270" height="14"/></g>
    <rect x="1035" y="310" width="135" height="70" fill="#8d603c"/><rect x="1195" y="325" width="110" height="55" fill="#9d6b3f"/>
    <path d="M1400 350l110-140 110 140z" fill="#7a8790"/><rect x="1535" y="198" width="220" height="172" fill="#8f9ba2"/>
    <g stroke="#c3ccd0" stroke-width="7"><line x1="1810" y1="150" x2="1910" y2="370"/><line x1="1910" y1="150" x2="1810" y2="370"/></g>
    <rect x="2040" y="285" width="230" height="95" rx="8" fill="#667985"/><rect x="2090" y="235" width="130" height="55" fill="#8799a2"/>
  </g>`;
}

function industry(){
  return `${common()}
  <g filter="url(#soft)">
    <rect x="60" y="205" width="300" height="170" rx="10" fill="#6d8795"/><circle cx="215" cy="285" r="56" fill="#16232c" stroke="#aabac2" stroke-width="9"/><circle cx="215" cy="285" r="26" fill="#c96538"/>
    <path d="M420 360H780" stroke="#6f8793" stroke-width="28"/><g fill="#b9824b">${[465,560,655,750].map(x=>`<rect x="${x}" y="325" width="62" height="50"/>`).join('')}</g>
    <g transform="translate(845 315)"><rect width="145" height="78" rx="12" fill="#d5a42f"/><circle cx="32" cy="78" r="23" fill="#12191d"/><circle cx="116" cy="78" r="23" fill="#12191d"/><rect x="130" y="-25" width="9" height="115" fill="#232a2d"/></g>
    <rect x="1080" y="165" width="280" height="210" rx="9" fill="#59756d"/><rect x="1120" y="122" width="200" height="58" fill="#739088"/>
    <g fill="#a16b3e"><rect x="1450" y="315" width="110" height="62"/><rect x="1580" y="295" width="115" height="82"/></g>
    <rect x="1790" y="190" width="270" height="185" rx="9" fill="#657d88"/><circle cx="1925" cy="275" r="60" fill="#18262e" stroke="#aebbc1" stroke-width="8"/>
    <rect x="2185" y="290" width="120" height="88" rx="8" fill="#a74842"/>
  </g>`;
}

function port(){
  return `${common()}
  <g filter="url(#soft)">
    <rect x="45" y="260" width="250" height="110" rx="8" fill="#4f6a78"/><rect x="85" y="215" width="115" height="50" fill="#758b96"/><circle cx="100" cy="372" r="28" fill="#10171a"/><circle cx="250" cy="372" r="28" fill="#10171a"/>
    <g fill="#9c5b39"><rect x="390" y="258" width="170" height="78"/><rect x="410" y="178" width="170" height="78"/><rect x="590" y="258" width="160" height="78"/></g>
    <g fill="#d7ad36"><rect x="850" y="65" width="17" height="310"/><rect x="760" y="65" width="320" height="14"/></g><line x1="1010" y1="80" x2="1010" y2="240" stroke="#dbe0e3" stroke-width="4"/><rect x="965" y="240" width="92" height="60" fill="#8b5e3b"/>
    <path d="M1170 402H1450" stroke="#e1be48" stroke-width="7" stroke-dasharray="28 16"/>
    <g transform="translate(1510 300)"><rect width="215" height="92" rx="12" fill="#546f7c"/><circle cx="45" cy="92" r="29" fill="#11171a"/><circle cx="174" cy="92" r="29" fill="#11171a"/><rect x="160" y="-80" width="18" height="165" fill="#d0a336"/><rect x="174" y="-80" width="140" height="15" fill="#d0a336"/></g>
    <g fill="#a05f39"><rect x="1900" y="215" width="180" height="82"/><rect x="2085" y="215" width="180" height="82"/><rect x="1990" y="130" width="180" height="82"/></g>
    <rect x="2290" y="350" width="75" height="28" fill="#d3aa36"/>
  </g>`;
}

function health(){
  return `${common()}
  <rect y="80" width="2400" height="265" fill="#d8e4e7" opacity=".82"/>
  <g filter="url(#soft)">
    ${[60,630,1200,1770].map(x=>`<rect x="${x}" y="115" width="250" height="190" fill="#f3f6f7"/><rect x="${x+30}" y="145" width="190" height="25" fill="#638695"/>`).join('')}
    <g transform="translate(360 310)"><rect y="22" width="125" height="62" rx="8" fill="#6c8791"/><circle cx="25" cy="86" r="14" fill="#222"/><circle cx="100" cy="86" r="14" fill="#222"/><rect x="105" y="-25" width="7" height="62" fill="#6c8791"/></g>
    <rect x="940" y="330" width="70" height="85" rx="8" fill="#be5750"/>
    <g transform="translate(1480 308)"><rect width="170" height="58" rx="8" fill="#d8e4e6"/><rect x="12" y="58" width="8" height="42" fill="#758a92"/><rect x="150" y="58" width="8" height="42" fill="#758a92"/><circle cx="20" cy="104" r="12" fill="#222"/><circle cx="150" cy="104" r="12" fill="#222"/></g>
    <rect x="2130" y="185" width="85" height="160" fill="#4a806c"/><path d="M2172 215v88M2138 259h68" stroke="#e8f1ee" stroke-width="10"/>
  </g>`;
}

function office(){
  return `${common()}
  <rect y="82" width="2400" height="262" fill="#d8dfe2" opacity=".62"/>
  <g filter="url(#soft)">
    ${[75,650,1225,1800].map(x=>`<rect x="${x}" y="285" width="330" height="22" fill="#765b46"/><rect x="${x+32}" y="307" width="15" height="110" fill="#5e4738"/><rect x="${x+285}" y="307" width="15" height="110" fill="#5e4738"/><rect x="${x+105}" y="190" width="125" height="83" rx="6" fill="#233946"/><rect x="${x+142}" y="345" width="70" height="70" rx="16" fill="#425967"/>`).join('')}
    <path d="M450 430c80-65 130 35 220-25M1040 430c70-60 130 30 220-20" stroke="#262c31" stroke-width="9" fill="none"/>
    <rect x="2260" y="125" width="70" height="150" fill="#4b7b68"/>
  </g>`;
}

function warehouse(){
  return `${common()}
  <g filter="url(#soft)">
    ${[55,620,1185,1750].map(x=>`<g stroke="#6d7e88" stroke-width="10" fill="none"><rect x="${x}" y="105" width="420" height="285"/><line x1="${x}" y1="195" x2="${x+420}" y2="195"/><line x1="${x}" y1="285" x2="${x+420}" y2="285"/></g><g fill="#9e6a3f"><rect x="${x+30}" y="128" width="105" height="55"/><rect x="${x+155}" y="128" width="105" height="55"/><rect x="${x+280}" y="215" width="105" height="55"/><rect x="${x+65}" y="305" width="120" height="68"/></g>`).join('')}
    <g transform="translate(520 370)" fill="#647e8a"><rect width="120" height="62" rx="8"/><circle cx="22" cy="62" r="14" fill="#222"/><circle cx="98" cy="62" r="14" fill="#222"/></g>
    <g transform="translate(1640 360)" fill="#647e8a"><rect width="120" height="62" rx="8"/><circle cx="22" cy="62" r="14" fill="#222"/><circle cx="98" cy="62" r="14" fill="#222"/></g>
  </g>`;
}

function workshop(){
  return `${common()}
  <g filter="url(#soft)">
    <rect x="60" y="285" width="380" height="26" fill="#795942"/><rect x="90" y="311" width="18" height="112" fill="#5f4431"/><rect x="390" y="311" width="18" height="112" fill="#5f4431"/>
    <g fill="#687f8a"><rect x="570" y="205" width="250" height="170" rx="8"/><circle cx="695" cy="285" r="57" fill="#18262d" stroke="#aebbc2" stroke-width="8"/></g>
    <path d="M870 430c100-55 160 30 260-10" stroke="#20262a" stroke-width="11" fill="none"/>
    <rect x="1220" y="170" width="320" height="205" rx="8" fill="#5c737e"/><rect x="1270" y="125" width="220" height="58" fill="#768c95"/>
    <g stroke="#c2cbd0" stroke-width="9"><line x1="1650" y1="235" x2="1780" y2="180"/><line x1="1715" y1="205" x2="1790" y2="275"/></g>
    <rect x="1900" y="285" width="360" height="26" fill="#795942"/><g fill="#9d6b40"><rect x="1930" y="235" width="70" height="45"/><rect x="2030" y="245" width="90" height="35"/></g>
  </g>`;
}

function electrical(){
  return `${common()}
  <g filter="url(#soft)">
    <g fill="#607682"><rect x="70" y="125" width="245" height="270" rx="8"/><rect x="370" y="115" width="260" height="280" rx="8"/></g><g fill="#263b46"><rect x="100" y="155" width="185" height="105"/><rect x="405" y="150" width="190" height="190"/></g>
    <polygon points="500,182 462,252 497,252 472,320 552,228 515,228 542,182" fill="#e4c04a"/>
    <path d="M720 438c110-50 185-5 300-45" stroke="#222a2e" stroke-width="16" fill="none"/><path d="M730 442c105-47 175-4 285-42" stroke="#d6a73d" stroke-width="4" fill="none"/>
    <rect x="1130" y="135" width="300" height="245" rx="8" fill="#607681"/><rect x="1170" y="170" width="220" height="150" fill="#263b46"/>
    <g fill="#d0a73b"><rect x="1540" y="270" width="180" height="18"/><rect x="1618" y="205" width="18" height="150"/></g>
    <rect x="1840" y="120" width="270" height="275" rx="8" fill="#5e7480"/><rect x="1880" y="155" width="190" height="170" fill="#263a45"/>
    <path d="M2150 430c70-35 130-25 205-60" stroke="#20272b" stroke-width="15" fill="none"/>
  </g>`;
}

function variantOverlay(theme,variant='primary'){
  if(variant!=='secondary')return'';
  const accent={
    construction:'#d1ab44',industry:'#d36b3c',port:'#d9ae39',health:'#4f9a82',
    office:'#5a8aa1',warehouse:'#c2874a',workshop:'#c87545',electrical:'#e1bd43'
  }[theme]??'#d5ad3e';
  return `<g opacity=".72" filter="url(#soft)">
    <path d="M120 455 C420 405 650 460 930 420 S1500 410 1830 445 S2180 405 2350 430" fill="none" stroke="${accent}" stroke-width="9" stroke-dasharray="42 24"/>
    <g fill="${accent}" opacity=".5">
      <circle cx="360" cy="392" r="13"/><circle cx="940" cy="408" r="11"/><circle cx="1540" cy="395" r="13"/><circle cx="2180" cy="410" r="11"/>
    </g>
  </g>`;
}

export function buildPanoramaScene(theme='construction',variant='primary'){
  const body={
    construction:construction(),
    industry:industry(),
    port:port(),
    health:health(),
    office:office(),
    warehouse:warehouse(),
    workshop:workshop(),
    electrical:electrical()
  }[theme]??construction();
  return `<svg viewBox="0 0 2400 520" preserveAspectRatio="xMidYMid slice" aria-label="Panorama 360 didático">
    ${body}
    ${variantOverlay(theme,variant)}
    <g font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="#d9e7ee" opacity=".82">
      <text x="275" y="45">NORTE</text><text x="875" y="45">LESTE</text><text x="1475" y="45">SUL</text><text x="2075" y="45">OESTE</text>
    </g>
  </svg>`;
}

export function buildPanoramaForeground(theme='construction',variant='primary'){
  const accent={
    construction:'#c89e3f',industry:'#bf633d',port:'#cfaa3b',health:'#4c907c',
    office:'#507d94',warehouse:'#ad7744',workshop:'#b7663c',electrical:'#d6b53f'
  }[theme]??'#c79f40';
  const secondary=variant==='secondary';
  return `<svg viewBox="0 0 2400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="fgFade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${accent}" stop-opacity="0"/><stop offset="1" stop-color="${accent}" stop-opacity=".12"/></linearGradient></defs>
    <rect y="405" width="2400" height="115" fill="url(#fgFade)"/>
    <g opacity="${secondary?'.42':'.3'}" fill="${accent}">
      ${[145,640,1140,1650,2150].map((x,i)=>`<rect x="${x}" y="${360+(i%2)*18}" width="${secondary?18:13}" height="${160-(i%2)*22}" rx="5"/>`).join('')}
    </g>
    <g opacity=".25" stroke="#eaf3f6" stroke-width="4">
      <path d="M0 474H2400" stroke-dasharray="16 24"/>
    </g>
  </svg>`;
}

export class Panorama360Viewer{
  constructor(host,experience,{theme='construction',context=null,onAction=null,initialNodeId=null}={}){
    this.host=host;
    this.experience=experience;
    this.theme=theme;
    this.context=context;
    this.onAction=onAction;
    this.initialNodeId=initialNodeId;
    this.offset=0;
    this.dragging=false;
    this.startX=0;
    this.startOffset=0;
    this.listeners=[];
    this.graph=null;
    this.loader=null;
    this.node=null;
    this.pendingAction=null;
    this.imageRuntime=null;
    this.imageHost=null;
    this.rendererBadge=null;
    this.offQuality=null;
    this.hotspotFocus=true;
    this.sceneHud=null;
  }

  async mount(){
    this.host.innerHTML=`<section class="panorama360 panorama-graph">
      <div class="panorama-toolbar">
        <div><strong data-pan-title>${esc(this.experience.title)}</strong><small>Arraste • toque nos pontos • troque de zona sem carregar o setor inteiro</small></div>
        <div class="panorama-buttons">
          <button type="button" data-pan-left aria-label="Girar para a esquerda">←</button>
          <button type="button" data-pan-reset>Centralizar</button>
          <button type="button" data-pan-right aria-label="Girar para a direita">→</button>
          <button type="button" data-pan-mode>Visual: automático</button>
          <button type="button" data-pan-hotspots>Hotspots: destaque</button>
        </div>
      </div>
      <div class="panorama-viewpoints" data-pan-viewpoints></div>
      <div class="panorama-window" tabindex="0" data-pan-window>
        <div class="panorama-atmosphere" data-pan-atmosphere></div>
        <div class="panorama-track panorama-track-base" data-pan-track></div>
        <div class="panorama-track panorama-track-near" data-pan-near></div>
        <div class="panorama-image360-host" data-pan-image360 hidden></div>
        <div class="panorama-scene-hud" data-pan-scene-hud></div>
        <div class="panorama-compass">
          <span data-pan-degree>0°</span>
          <small data-pan-node-label>panorama 360 didático</small>
          <em data-pan-renderer>procedural</em>
        </div>
        <div class="panorama-loading" data-pan-loading hidden><span class="spinner"></span><strong>Carregando nova zona…</strong></div>
      </div>
      <div class="panorama-source-strip" data-pan-source><strong>Renderização</strong><span>Panorama procedural leve.</span></div>
      <div class="panorama-note" data-pan-note><strong>Explore o ambiente.</strong><span>${esc(this.experience.description)}</span></div>
    </section>`;

    this.window=this.host.querySelector('[data-pan-window]');
    this.track=this.host.querySelector('[data-pan-track]');
    this.near=this.host.querySelector('[data-pan-near]');
    this.atmosphere=this.host.querySelector('[data-pan-atmosphere]');
    this.degree=this.host.querySelector('[data-pan-degree]');
    this.note=this.host.querySelector('[data-pan-note]');
    this.title=this.host.querySelector('[data-pan-title]');
    this.nodeLabel=this.host.querySelector('[data-pan-node-label]');
    this.viewpoints=this.host.querySelector('[data-pan-viewpoints]');
    this.loading=this.host.querySelector('[data-pan-loading]');
    this.imageHost=this.host.querySelector('[data-pan-image360]');
    this.rendererBadge=this.host.querySelector('[data-pan-renderer]');
    this.sourceStrip=this.host.querySelector('[data-pan-source]');
    this.sceneHud=this.host.querySelector('[data-pan-scene-hud]');
    this.renderMode='auto';
    this.updateSceneHud();
    this.bind();
    this.offQuality=this.context?.events?.on?.('quality:changed',()=>this.handleQualityChange());

    if(this.experience.graph&&this.context?.assets){
      const {PanoramaGraphLoader}=await import('./panorama-graph-loader.js');
      this.loader=new PanoramaGraphLoader(this.context.assets,this.experience.graph);
      this.graph=await this.loader.graph();
      this.renderViewpoints();
      const firstNode=this.initialNodeId&&this.graph.nodes?.some(node=>node.id===this.initialNodeId)
        ?this.initialNodeId
        :(this.graph.defaultNode??this.graph.nodes?.[0]?.id);
      await this.loadNode(firstNode);
    }else{
      await this.renderLegacy();
    }
    return this;
  }


updateHotspotButton(){
  const button=this.host?.querySelector('[data-pan-hotspots]');
  if(button)button.textContent=`Hotspots: ${this.hotspotFocus?'destaque':'suave'}`;
}

setHotspotFocus(active){
  this.hotspotFocus=!!active;
  this.window?.classList.toggle('focus-hotspots',this.hotspotFocus);
  this.host?.classList.toggle('focus-hotspots',this.hotspotFocus);
  this.updateHotspotButton();
  this.updateSceneHud();
}

updateSceneHud(activeHotspot=null){
  if(!this.sceneHud)return;
  const quality=this.context?.qualityManager?.level??'eco';
  const hotspots=this.node?.hotspots?.length??0;
  const renderLabel=this.rendererBadge?.textContent??(this.renderMode==='auto'?'automático':this.renderMode);
  const cue=activeHotspot?.label??this.node?.title??this.experience.title;
  this.sceneHud.innerHTML=`
    <article><b>qualidade</b><span>${esc(quality)}</span></article>
    <article><b>visual</b><span>${esc(renderLabel)}</span></article>
    <article><b>hotspots</b><span>${hotspots}</span></article>
    <article><b>foco</b><span>${esc(cue)}</span></article>
  `;
}

  renderViewpoints(){
    if(!this.graph||!this.viewpoints)return;
    this.viewpoints.innerHTML=`<span>Pontos de observação</span>${(this.graph.nodes??[]).map((node,i)=>`
      <button type="button" data-pan-node="${node.id}" class="${node.id===this.node?.id?'active':''}">
        <b>${i+1}</b>${esc(node.title)}
      </button>`).join('')}`;
  }

  async renderLegacy(){
    this.node={
      id:'legacy',title:this.experience.title,description:this.experience.description,
      sceneVariant:'primary',startOffset:0,hotspots:this.experience.hotspots??[]
    };
    await this.renderNode();
  }

  async loadNode(nodeId){
    if(!nodeId||!this.loader)return;
    this.disposeImageRuntime();
    this.setLoading(true);
    this.window?.classList.add('changing');
    try{
      this.node=await this.loader.node(nodeId);
      this.renderViewpoints();
      await this.renderNode();
      this.context?.events?.emit?.('environment:panorama-node-opened',{
        experienceId:this.experience.id,
        nodeId:this.node.id,
        title:this.node.title
      });
    }catch(error){
      console.error('[TST360 PanoramaGraph]',error);
      this.note.innerHTML=`<strong>Zona indisponível.</strong><span>O ponto panorâmico não pôde ser carregado. Você pode continuar na biblioteca visual.</span>`;
    }finally{
      this.setLoading(false);
      setTimeout(()=>this.window?.classList.remove('changing'),120);
    }
  }

  setLoading(value){
    if(this.loading)this.loading.hidden=!value;
  }

  hotspotMarkup(h,i){
    const icon=h.action?.type==='node'?'⇢':h.action?.type==='experience'?'↗':String(i+1);
    return `<button class="panorama-hotspot" type="button" data-category="${esc(h.category??'note')}" style="left:${h.x}%;top:${h.y}%" data-pan-hotspot="${i}" title="${esc(h.label)}"><span>${icon}</span><b>${esc(h.label)}</b></button>`;
  }

  async renderNode(){
    if(!this.node)return;
    this.track.innerHTML=`${buildPanoramaScene(this.theme,this.node.sceneVariant)}${(this.node.hotspots??[]).map((h,i)=>this.hotspotMarkup(h,i)).join('')}`;
    this.near.innerHTML=buildPanoramaForeground(this.theme,this.node.sceneVariant);
    this.title.textContent=`${this.experience.title} • ${this.node.title}`;
    this.nodeLabel.textContent=this.node.title;
    this.note.innerHTML=`<strong>${esc(this.node.title)}</strong><span>${esc(this.node.description??this.experience.description)}</span>`;
    this.pendingAction=null;
    this.setRendererLabel('procedural','Panorama procedural leve, sem download de imagem 360.');
    this.setOffset(this.node.startOffset??0);
    this.renderViewpoints();
    this.setHotspotFocus(this.hotspotFocus);
    this.updateSceneHud();
    await this.activateImage360();
  }

  setRendererLabel(value,description=null){
    if(this.rendererBadge)this.rendererBadge.textContent=value;
    if(this.sourceStrip&&description){
      this.sourceStrip.innerHTML=`<strong>Renderização</strong><span>${esc(description)}</span>`;
    }
    this.updateSceneHud();
  }

  showHotspot(item){
    if(!item)return;
    this.pendingAction=item.action??null;
    const action=this.pendingAction
      ? `<button type="button" class="panorama-note-action" data-pan-action>${esc(this.pendingAction.label??'Abrir')}</button>`
      : '';
    this.note.innerHTML=`<strong>${esc(item.label)}</strong><span>${esc(item.note)}</span>${action}`;
    this.updateSceneHud(item);
  }

  async activateImage360(){
    this.disposeImageRuntime();
    this.window?.classList.remove('image360-active');
    if(this.imageHost){
      this.imageHost.hidden=true;
      this.imageHost.replaceChildren();
    }
    const image360=this.node?.image360;
    const level=this.context?.qualityManager?.level??'eco';
    if(this.renderMode==='procedural'){
      this.setRendererLabel('procedural • manual','Visual procedural selecionado manualmente.');
      return false;
    }
    if(!image360||level==='eco'){
      this.setRendererLabel(
        level==='eco'&&image360?'procedural • Eco':'procedural',
        level==='eco'&&image360
          ? 'Eco preserva a experiência sem baixar panorama raster.'
          : 'Panorama procedural leve.'
      );
      return false;
    }

    try{
      const {EquirectangularPanoramaRuntime}=await import('./equirectangular-panorama-runtime.js');
      this.imageHost.hidden=false;
      const runtime=new EquirectangularPanoramaRuntime(this.imageHost,this.context,this.node,{
        onHotspot:item=>this.showHotspot(item),
        onViewChange:view=>{
          if(this.degree)this.degree.textContent=`${view.degree}°`;
        },
        onFallback:reason=>{
          if(reason==='quality-profile')this.deactivateImage360('procedural • Eco','Eco preserva o panorama sem baixar imagem raster.');
        }
      });
      this.imageRuntime=runtime;
      await runtime.mount();
      this.window?.classList.add('image360-active');
      this.setRendererLabel(
        `imagem 360 • ${runtime.loadedTier}`,
        image360.notice??'Panorama equiretangular carregado sob demanda.'
      );
      this.context?.events?.emit?.('environment:panorama-image-active',{
        experienceId:this.experience.id,
        nodeId:this.node.id,
        tier:runtime.loadedTier,
        sourceType:image360.sourceType??'image'
      });
      return true;
    }catch(error){
      console.warn('[TST360 Panorama360] Imagem equiretangular indisponível; usando fallback procedural.',error);
      this.deactivateImage360('procedural • fallback','Imagem 360 indisponível; fallback procedural ativado automaticamente.');
      this.context?.events?.emit?.('environment:panorama-image-fallback',{
        experienceId:this.experience.id,
        nodeId:this.node?.id,
        reason:error?.message??String(error)
      });
      return false;
    }
  }

  deactivateImage360(label='procedural',description='Panorama procedural leve.'){
    this.disposeImageRuntime();
    this.window?.classList.remove('image360-active');
    if(this.imageHost){
      this.imageHost.hidden=true;
      this.imageHost.replaceChildren();
    }
    this.setRendererLabel(label,description);
    this.setOffset(this.node?.startOffset??0);
  }

  disposeImageRuntime(){
    this.imageRuntime?.dispose?.();
    this.imageRuntime=null;
  }

  handleQualityChange(){
    if(!this.node?.image360)return;
    if(this.renderMode==='procedural')return;
    if(this.imageRuntime)return;
    if((this.context?.qualityManager?.level??'eco')!=='eco'){
      void this.activateImage360();
    }
    this.updateSceneHud();
  }

  async cycleRenderMode(){
    const order=['auto','image','procedural'];
    this.renderMode=order[(order.indexOf(this.renderMode)+1)%order.length];
    const button=this.host?.querySelector('[data-pan-mode]');
    if(button){
      const labels={auto:'automático',image:'imagem 360',procedural:'procedural'};
      button.textContent=`Visual: ${labels[this.renderMode]}`;
    }
    this.updateSceneHud();
    if(this.renderMode==='procedural'){
      this.deactivateImage360('procedural • manual','Visual procedural selecionado manualmente.');
      return;
    }
    await this.activateImage360();
  }

  on(target,event,fn,options){
    target?.addEventListener(event,fn,options);
    this.listeners.push(()=>target?.removeEventListener(event,fn,options));
  }

  bind(){
    this.on(this.host,'click',async event=>{
      if(event.target.closest('[data-pan-mode]')){
        await this.cycleRenderMode();
        return;
      }
      if(event.target.closest('[data-pan-hotspots]')){
        this.setHotspotFocus(!this.hotspotFocus);
        return;
      }
      if(event.target.closest('[data-pan-left]')){
        if(this.imageRuntime)this.imageRuntime.nudge(-18);
        else this.setOffset(this.offset-8);
        return;
      }
      if(event.target.closest('[data-pan-right]')){
        if(this.imageRuntime)this.imageRuntime.nudge(18);
        else this.setOffset(this.offset+8);
        return;
      }
      if(event.target.closest('[data-pan-reset]')){
        if(this.imageRuntime)this.imageRuntime.reset();
        else this.setOffset(this.node?.startOffset??0);
        return;
      }

      const nodeButton=event.target.closest('[data-pan-node]');
      if(nodeButton){await this.loadNode(nodeButton.dataset.panNode);return}

      const actionButton=event.target.closest('[data-pan-action]');
      if(actionButton&&this.pendingAction){
        const action=this.pendingAction;
        if(action.type==='node')await this.loadNode(action.nodeId);
        else await this.onAction?.(action);
        return;
      }

      const hotspot=event.target.closest('[data-pan-hotspot]');
      if(hotspot){
        const item=this.node?.hotspots?.[Number(hotspot.dataset.panHotspot)];
        this.showHotspot(item);
      }
    });

    this.on(this.window,'keydown',event=>{
      if(event.key==='ArrowLeft'){
        event.preventDefault();
        if(this.imageRuntime)this.imageRuntime.nudge(-12);else this.setOffset(this.offset-5);
      }
      if(event.key==='ArrowRight'){
        event.preventDefault();
        if(this.imageRuntime)this.imageRuntime.nudge(12);else this.setOffset(this.offset+5);
      }
    });

    this.on(this.window,'pointerdown',event=>{
      if(this.imageRuntime)return;
      if(event.target.closest('.panorama-hotspot'))return;
      this.dragging=true;
      this.startX=event.clientX;
      this.startOffset=this.offset;
      this.window.setPointerCapture?.(event.pointerId);
      this.window.classList.add('dragging');
    });

    this.on(this.window,'pointermove',event=>{
      if(this.imageRuntime)return;
      if(!this.dragging)return;
      const width=Math.max(1,this.window.clientWidth);
      this.setOffset(this.startOffset-(event.clientX-this.startX)/width*25);
    });

    const end=event=>{
      this.dragging=false;
      this.window.classList.remove('dragging');
      try{this.window.releasePointerCapture?.(event.pointerId)}catch{}
    };
    this.on(this.window,'pointerup',end);
    this.on(this.window,'pointercancel',end);
  }

  setOffset(value){
    this.offset=clamp(value,0,75);
    const nearOffset=clamp(this.offset*1.045,0,75);
    if(this.track)this.track.style.transform=`translate3d(-${this.offset}%,0,0)`;
    if(this.near)this.near.style.transform=`translate3d(-${nearOffset}%,0,0)`;
    if(this.atmosphere)this.atmosphere.style.transform=`translate3d(${(this.offset-37.5)*.035}%,0,0)`;
    if(this.degree)this.degree.textContent=`${Math.round(this.offset/75*360)}°`;
  }

  dispose(){
    this.disposeImageRuntime();
    this.offQuality?.();
    this.offQuality=null;
    this.hotspotFocus=true;
    this.sceneHud=null;
    for(const off of this.listeners)off();
    this.listeners.length=0;
    this.host?.replaceChildren();
  }
}
