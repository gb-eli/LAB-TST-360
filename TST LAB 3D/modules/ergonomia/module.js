import {saveResult,downloadJson,setQualityOnRoot} from '../../js/ui/lab-kit.js';
import {createErgonomia3D} from '../../js/graphics/three-scenes.js';

const controls=[
 {id:'chair',name:'Altura do assento',hint:'Ajuste em escala didática para favorecer apoio e postura neutra.',min:0,max:100,start:28,target:[42,58]},
 {id:'monitor',name:'Altura do monitor',hint:'Busque uma posição que evite flexão/extensão excessiva do pescoço.',min:0,max:100,start:78,target:[45,62]},
 {id:'distance',name:'Distância do monitor',hint:'Escala didática: muito perto ou muito longe aumenta desconforto visual/postural.',min:0,max:100,start:20,target:[42,68]},
 {id:'keyboard',name:'Posição do teclado',hint:'Procure manter os membros superiores em posição confortável e sem alcance excessivo.',min:0,max:100,start:78,target:[40,62]}
];

export function createModule(context){
 let root=null,res=null,values=Object.fromEntries(controls.map(c=>[c.id,c.start])),lastReport=null,viewMode='2d',scene3d=null,renderToken=0;
 const status=c=>values[c.id]>=c.target[0]&&values[c.id]<=c.target[1];
 const score=()=>Math.round(controls.filter(status).length/controls.length*100);
 const dispose3D=()=>{scene3d?.dispose?.();scene3d=null};

 function figure(){
  const chair=values.chair,monitor=values.monitor,distance=values.distance,keyboard=values.keyboard;
  const seatY=370-(chair-50)*.8,monitorY=155+(50-monitor)*1.2,monitorX=470+(distance-50)*1.4,kbX=420+(keyboard-50)*1.1;
  return `<svg viewBox="0 0 760 500" role="img" aria-label="Posto de trabalho ajustável em escala didática"><defs><linearGradient id="wallE" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#243a4b"/><stop offset="1" stop-color="#14232e"/></linearGradient></defs><rect width="760" height="360" fill="url(#wallE)"/><rect y="360" width="760" height="140" fill="#333a3d"/><rect x="355" y="305" width="320" height="24" rx="5" fill="#866244"/><rect x="390" y="329" width="18" height="130" fill="#62472f"/><rect x="625" y="329" width="18" height="130" fill="#62472f"/><rect x="${monitorX}" y="${monitorY}" width="145" height="92" rx="8" fill="#17222c" stroke="#8599a5" stroke-width="6"/><rect x="${monitorX+57}" y="${monitorY+92}" width="30" height="42" fill="#687b86"/><rect x="${monitorX+20}" y="${monitorY+130}" width="105" height="10" rx="5" fill="#687b86"/><rect x="${kbX}" y="290" width="160" height="16" rx="6" fill="#b7c0c5"/><g><rect x="208" y="${seatY}" width="120" height="26" rx="10" fill="#334f67"/><rect x="222" y="${seatY-120}" width="26" height="125" rx="10" fill="#334f67"/><rect x="255" y="${seatY+24}" width="18" height="85" fill="#283a49"/><path d="M205 ${seatY+108}h120" stroke="#283a49" stroke-width="12"/><circle cx="215" cy="${seatY+116}" r="10" fill="#17222a"/><circle cx="315" cy="${seatY+116}" r="10" fill="#17222a"/></g><g><circle cx="285" cy="215" r="33" fill="#ac7554"/><path d="M280 248q-35 65-12 135" stroke="#e09236" stroke-width="42" fill="none" stroke-linecap="round"/><path d="M282 292q80 18 132 -5" stroke="#ad7554" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M280 365q45 8 88 40" stroke="#243b50" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M368 405q42 18 78 3" stroke="#243b50" stroke-width="24" fill="none" stroke-linecap="round"/></g><path d="M304 210q90 -15 ${monitorX} ${monitorY+45}" stroke="#58d68d" stroke-width="3" stroke-dasharray="10 8" opacity=".55"/><text x="28" y="42" class="zone-label">ESCALA DIDÁTICA DE AJUSTE</text></svg>`;
 }

 async function mount3D(token){
  const host=root?.querySelector('[data-ergo-three]');if(!host||viewMode!=='3d')return;
  host.innerHTML='<div class="three-loading"><span class="spinner"></span><strong>Montando posto 3D…</strong><small>Personagem articulado e estação tridimensional são carregados somente neste modo.</small></div>';
  try{const scene=await createErgonomia3D(host,context,{values});if(token!==renderToken||viewMode!=='3d'){scene.dispose();return}scene3d=scene}
  catch(error){console.error(error);if(token!==renderToken)return;viewMode='2d';context.storage.set('view:ergonomia','2d');render();const box=root.querySelector('#ergo-feedback');box.className='feedback warn';box.innerHTML='<strong>3D indisponível.</strong> A simulação continuou automaticamente no modo 2D.'}
 }

 function visual(){return viewMode==='3d'?'<div class="ergo-visual ergo-visual-3d"><div class="three-host ergo-three-host" data-ergo-three></div><div class="three-help">Arraste para girar • roda/pinça para zoom</div></div>':`<div class="ergo-visual" data-ergo-svg>${figure()}</div>`}

 function render(){
  renderToken++;dispose3D();setQualityOnRoot(root,context.qualityManager);
  root.innerHTML=`<div class="lab-shell"><div class="lab-head"><div><p class="kicker">Laboratório híbrido G4</p><h2>Ergonomia — Posto de Trabalho</h2><p>Ajuste quatro parâmetros em uma escala didática e compare a postura no modo 2D ou 3D articulado.</p></div><div class="lab-metrics"><div class="metric"><strong data-score>${score()}%</strong><span>Ajustes neutros</span></div><div class="metric"><strong data-neutral>${controls.filter(status).length}/${controls.length}</strong><span>Faixas</span></div><div class="metric"><strong>${context.qualityManager.level}</strong><span>Gráfico</span></div></div></div><div class="lab-layout"><section class="scene-card"><div class="scene-toolbar"><div><strong>Estação administrativa</strong><small>Escala visual — não representa medidas normativas</small></div><div class="scene-mode"><button data-view="2d" class="${viewMode==='2d'?'active':''}">2D leve</button><button data-view="3d" class="${viewMode==='3d'?'active':''}">3D postura</button></div></div><div class="ergo-stage">${visual()}<div class="ergo-controls">${controls.map(c=>`<div class="range-row"><label><span>${c.name}</span><strong data-value="${c.id}">${values[c.id]}</strong></label><small>${c.hint}</small><input type="range" min="${c.min}" max="${c.max}" value="${values[c.id]}" data-range="${c.id}"></div>`).join('')}</div></div></section><aside class="panel-card"><h3>Análise postural</h3><p>As faixas são parâmetros internos da simulação para treinar comparação visual, não valores legais ou prescrições individuais.</p><div class="posture-status" data-posture>${postureHtml()}</div><div id="ergo-feedback" class="feedback ${score()===100?'ok':'warn'}">${score()===100?'Todos os parâmetros estão na faixa didática neutra.':'Ajuste os controles e observe a postura no cenário.'}</div><div class="lab-actions"><button class="lab-btn primary" data-command="assess">Registrar avaliação</button><button class="lab-btn" data-command="reset">Reiniciar</button>${lastReport?'<button class="lab-btn" data-command="report">Baixar relatório</button>':''}</div></aside></div></div>`;
  if(viewMode==='3d')mount3D(renderToken)
 }

 function postureHtml(){return controls.map(c=>`<div class="posture-pill ${status(c)?'ok':'warn'}"><strong>${status(c)?'✓':'!'} ${c.name}</strong><br><span class="muted">${status(c)?'Faixa didática neutra':'Requer ajuste'}</span></div>`).join('')}
 function refreshVisuals(){
  root.querySelector('[data-score]').textContent=`${score()}%`;root.querySelector('[data-neutral]').textContent=`${controls.filter(status).length}/${controls.length}`;
  for(const c of controls){const value=root.querySelector(`[data-value="${c.id}"]`);if(value)value.textContent=values[c.id]}
  const posture=root.querySelector('[data-posture]');if(posture)posture.innerHTML=postureHtml();
  const feedback=root.querySelector('#ergo-feedback');if(feedback){feedback.className=`feedback ${score()===100?'ok':'warn'}`;feedback.textContent=score()===100?'Todos os parâmetros estão na faixa didática neutra.':'Ajuste os controles e observe a postura no cenário.'}
  const svg=root.querySelector('[data-ergo-svg]');if(svg)svg.innerHTML=figure();scene3d?.setParameters?.(values)
 }
 function input(e){const r=e.target.closest('[data-range]');if(!r)return;values[r.dataset.range]=Number(r.value);refreshVisuals()}
 function click(e){
  const view=e.target.closest('[data-view]')?.dataset.view;if(view){viewMode=view;context.storage.set('view:ergonomia',viewMode);render();return}
  const cmd=e.target.closest('[data-command]')?.dataset.command;
  if(cmd==='assess'){lastReport={module:'ergonomia',viewMode,values:{...values},neutral:controls.filter(status).map(c=>c.id),score:score(),date:new Date().toISOString()};saveResult(context.storage,'ergonomia',lastReport);render()}
  if(cmd==='reset'){values=Object.fromEntries(controls.map(c=>[c.id,c.start]));lastReport=null;render()}
  if(cmd==='report'&&lastReport)downloadJson('tst360-ergonomia-relatorio.json',lastReport)
 }
 return{async init(){res=new context.ResourceManager();viewMode=context.storage.get('view:ergonomia','2d')},async load(){},async start(mount){root=mount;root.addEventListener('input',input);root.addEventListener('click',click);res.onDispose(()=>root?.removeEventListener('input',input));res.onDispose(()=>root?.removeEventListener('click',click));res.onDispose(dispose3D);render()},async pause(){},async resume(){},async destroy(){dispose3D();res?.disposeAll();res=null;root?.replaceChildren();root=null}}
}
