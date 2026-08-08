import {EventBus} from './core/event-bus.js';
import {StorageService} from './core/storage.js';
import {AssetProvider} from './core/asset-provider.js';
import {ModuleRegistry} from './core/module-registry.js';
import {ModuleManager} from './core/module-manager.js';
import {QualityManager} from './graphics/quality-manager.js';
import {PerformanceManager} from './graphics/performance-manager.js';
import {ResourceManager} from './graphics/resource-manager.js';
import {AssetManager} from './graphics/asset-manager.js';
import {RiskEngine} from './simulation/risk-engine.js';
import {ScenarioEngine} from './simulation/scenario-engine.js';
import {TstToolkit} from './tools/tst-toolkit.js';
import {RiskBridge} from './tools/risk-bridge.js';
import {PerformanceBudgetManager} from './graphics/performance-budget-manager.js';
import {InspectionSessionService} from './tools/inspection-session-service.js';
import {SectorHub} from './sectors/sector-hub.js';
import {CampusHub} from './campus/campus-hub.js';

const base=new URL('../',import.meta.url);
const events=new EventBus();
const storage=new StorageService();
const assets=new AssetProvider(base);
const qualityManager=new QualityManager(storage);
const performanceManager=new PerformanceManager(qualityManager,events);
const riskEngine=new RiskEngine(events);
const scenarioEngine=new ScenarioEngine(events);
const assetManager=new AssetManager(assets,events);
const riskBridge=new RiskBridge(events,storage);
const budgetManager=new PerformanceBudgetManager(events,storage,assets,qualityManager);
const inspectionSessionService=new InspectionSessionService(storage,events);
const services={events,storage,assets,assetManager,qualityManager,performanceManager,budgetManager,riskBridge,inspectionSessionService,riskEngine,scenarioEngine,ResourceManager};
const registry=new ModuleRegistry(assets);
const manager=new ModuleManager(services);
const toolkit=new TstToolkit(services);
const sectorHub=new SectorHub(services);
const campusHub=new CampusHub(services);
const $=selector=>document.querySelector(selector);
const ui={home:$('#home'),runtime:$('#runtime'),grid:$('#grid'),count:$('#count'),root:$('#module-root'),back:$('#back'),title:$('#runtime-title'),status:$('#runtime-status'),quality:$('#quality'),qualitySelect:$('#quality-select'),version:$('#version'),error:$('#error'),perf:$('#perf'),openTools:$('#open-tools'),openToolsHome:$('#open-tools-home'),toolsView:$('#tools-view'),toolsRoot:$('#tools-root'),toolsBack:$('#tools-back'),openSectors:$('#open-sectors'),openSectorsHome:$('#open-sectors-home'),sectorsView:$('#sectors-view'),sectorsRoot:$('#sectors-root'),sectorsBack:$('#sectors-back'),openCampus:$('#open-campus'),openCampusHome:$('#open-campus-home'),campusView:$('#campus-view'),campusRoot:$('#campus-root'),campusBack:$('#campus-back')};

function showError(message=''){ui.error.hidden=!message;ui.error.textContent=message}
function qualityLabel(){const auto=qualityManager.mode==='auto';ui.quality.textContent=auto?`Auto • ${qualityManager.level}`:qualityManager.level;ui.qualitySelect.value=auto?'auto':qualityManager.level;document.documentElement.dataset.quality=qualityManager.level;if(ui.root)ui.root.dataset.quality=qualityManager.level}
function card(record){const m=record.manifest;const functional=m.status==='functional';return `<article class="card"><div class="card-top"><div class="icon">${m.icon||'🧪'}</div><span class="badge">${functional?'FUNCIONAL':'BASE'}</span></div><h3>${m.name}</h3><p>${m.description}</p><div class="card-foot"><small class="muted">v${m.version} • ${m.renderer}</small><button data-id="${m.id}">Abrir</button></div></article>`}
async function boot(){qualityLabel();try{await budgetManager.init();const v=await assets.json('version.json');ui.version.textContent=`v${v.version}`;const list=await registry.load();ui.grid.innerHTML=list.map(card).join('');ui.count.textContent=`${list.length} laboratórios funcionais • G10.8 • atmosfera setorial adaptativa • 16 panoramas híbridos • 80 hotspots • 157 GLBs`}catch(e){console.error(e);showError('Falha ao carregar a plataforma. Use GitHub Pages ou um servidor HTTP local.')}}



async function hideAll(){
  await manager.close();
  toolkit.unmount();
  await sectorHub.unmount();
  campusHub.unmount();
  ui.home.hidden=true;
  ui.runtime.hidden=true;
  ui.toolsView.hidden=true;
  ui.sectorsView.hidden=true;
  ui.campusView.hidden=true;
  if(ui.perf)ui.perf.hidden=true;
  showError();
}

async function openTools(){
  await hideAll();
  ui.toolsView.hidden=false;
  await toolkit.mount(ui.toolsRoot,'dashboard');
}
async function closeTools(){
  toolkit.unmount();ui.toolsRoot.replaceChildren();
  ui.toolsView.hidden=true;ui.home.hidden=false;showError();
}
async function openSectors(sectorId=null){
  await hideAll();
  ui.sectorsView.hidden=false;
  await sectorHub.mount(ui.sectorsRoot);
  if(sectorId)sectorHub.renderSector(sectorId);
}
async function closeSectors(){
  await sectorHub.unmount();ui.sectorsRoot.replaceChildren();
  ui.sectorsView.hidden=true;ui.home.hidden=false;showError();
}
async function openCampus(){
  await hideAll();
  ui.campusView.hidden=false;
  await campusHub.mount(ui.campusRoot);
}
async function closeCampus(){
  campusHub.unmount();ui.campusRoot.replaceChildren();
  ui.campusView.hidden=true;ui.home.hidden=false;showError();
}

async function openLabById(id){
  const record=registry.getById(id);if(!record)return;
  await hideAll();
  ui.runtime.hidden=false;ui.title.textContent=record.manifest.name;ui.status.textContent='Carregando módulo…';
  try{
    const manifest=await manager.open(record,ui.root);
    qualityLabel();ui.status.textContent=`v${manifest.version} • ${manifest.renderer}`;ui.root.focus({preventScroll:true});
  }catch(error){
    console.error(error);showError(error.message);ui.status.textContent='Falha ao carregar';
  }
}

ui.grid.addEventListener('click',async event=>{const button=event.target.closest('[data-id]');if(button)await openLabById(button.dataset.id)});
ui.back.addEventListener('click',async()=>{await manager.close();riskEngine.reset();scenarioEngine.clear();ui.root.replaceChildren();ui.runtime.hidden=true;ui.home.hidden=false;if(ui.perf)ui.perf.hidden=true;showError()});
ui.openTools?.addEventListener('click',openTools);
ui.openToolsHome?.addEventListener('click',openTools);
ui.toolsBack?.addEventListener('click',closeTools);
ui.openSectors?.addEventListener('click',()=>openSectors());
ui.openSectorsHome?.addEventListener('click',()=>openSectors());
ui.sectorsBack?.addEventListener('click',closeSectors);
ui.openCampus?.addEventListener('click',openCampus);
ui.openCampusHome?.addEventListener('click',openCampus);
ui.campusBack?.addEventListener('click',closeCampus);
events.on('campus:navigate',async nav=>{
  if(!nav)return;
  if(nav.type==='sector')await openSectors(nav.id);
  else if(nav.type==='lab')await openLabById(nav.id);
  else if(nav.type==='tools')await openTools();
  else if(nav.type==='home'){await hideAll();ui.home.hidden=false}
});
ui.qualitySelect.addEventListener('change',()=>{const value=ui.qualitySelect.value;if(value==='auto')qualityManager.setMode('auto');else qualityManager.setMode(value);qualityLabel();events.emit('quality:changed',{level:qualityManager.level,mode:qualityManager.mode,manual:value!=='auto'})});
events.on('quality:changed',qualityLabel);
let latestMetrics=null,latestBudget=null;
function renderPerf(){
  if(!ui.perf)return;
  if(!latestMetrics){ui.perf.hidden=true;ui.perf.dataset.budget='';return}
  ui.perf.hidden=false;
  const suffix=latestBudget?` • ${latestBudget.status==='ok'?'budget OK':latestBudget.status==='attention'?'atenção':'budget ↑'}`:'';
  ui.perf.textContent=`${latestMetrics.fps} FPS • ${latestMetrics.calls} calls • ${latestMetrics.instances} inst.${suffix}`;
  ui.perf.dataset.budget=latestBudget?.status||'';
  const budgetText=latestBudget?.violations?.length
    ? ` • Limites: ${latestBudget.violations.map(v=>`${v.label} ${v.value}/${v.limit}`).join(', ')}`
    : latestBudget?' • Dentro das metas internas do perfil':'';
  const dressingText=latestMetrics.dressing?` • Contexto visual: ${latestMetrics.dressing.visible}/${latestMetrics.dressing.created} (${latestMetrics.dressing.profile})`:'';
  const propText=latestMetrics.contextProps?` • Props GLB reutilizados: ${latestMetrics.contextProps.visible}/${latestMetrics.contextProps.created} (${latestMetrics.contextProps.labels.join(', ')||'nenhum'})`:'';
  const scenicText=latestMetrics.scenicProps?` • Props cenográficos: ${latestMetrics.scenicProps.assetTypes} tipos / ${latestMetrics.scenicProps.renderedInstances} instâncias (${latestMetrics.scenicProps.labels.join(', ')||'nenhum'})`:'';
  const atmosphereText=latestMetrics.atmosphere?` • Atmosfera: ${latestMetrics.atmosphere.profile} / detalhe ${latestMetrics.atmosphere.detail} / ${latestMetrics.atmosphere.accentLights} luz(es)`:'';
  ui.perf.title=`Triângulos: ${latestMetrics.triangles.toLocaleString('pt-BR')} • Geometrias: ${latestMetrics.geometries} • Texturas: ${latestMetrics.textures} • Assets em cache: ${latestMetrics.cachedAssets} • Referências: ${latestMetrics.assetRefs}${dressingText}${propText}${scenicText}${atmosphereText}${budgetText}`;
}
events.on('scene:metrics',metrics=>{latestMetrics=metrics;if(!metrics)latestBudget=null;renderPerf()});
events.on('performance:budget',result=>{latestBudget=result;renderPerf()});

let lastFrame=performance.now();function frame(now){if(latestMetrics)performanceManager.sample(now-lastFrame);else performanceManager.samples.length=0;lastFrame=now;requestAnimationFrame(frame)}requestAnimationFrame(frame);
boot();
