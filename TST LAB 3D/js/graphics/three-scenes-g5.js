import {ThreeViewport} from './three-runtime.js';
import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';
import {createEquipmentMotion} from './equipment-motion.js';
import {createCharacterPopulation} from './character-population.js';
import {createAmbientActivity} from './ambient-activity-manager.js';
import {InstancingManager} from './instancing-manager.js';
import {createScenarioActivityDirector} from '../simulation/scenario-activity-director.js';

function standard(THREE,color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.06,...extra})}
function box(THREE,size,pos,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function cylinder(THREE,r,h,pos,mat,segments=18){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function addStatus(host,text){const el=document.createElement('div');el.className='g3-asset-status g5-status';el.textContent=text;host.append(el);return el}

async function packAsset(context,viewport,pack,id,transform,loaded){
  try{
    const obj=await context.assetManager.acquireFromPack(pack,id,context.qualityManager.level);viewport.addManagedAsset(obj);
    if(transform?.position)obj.position.set(...transform.position);if(transform?.rotation)obj.rotation.set(...transform.rotation);if(transform?.scale)obj.scale.set(...transform.scale);
    loaded.push(obj);return obj;
  }catch(error){console.warn(`[TST360 G5] fallback procedural ${id}`,error);return null}
}

function riskMarker(THREE,id,pos,color=0xf06b61){const g=new THREE.Group();g.position.set(...pos);const ring=new THREE.Mesh(new THREE.TorusGeometry(.19,.045,8,18),standard(THREE,color,{emissive:color,emissiveIntensity:.13}));ring.rotation.x=Math.PI/2;g.add(ring);const core=new THREE.Mesh(new THREE.SphereGeometry(.075,12,8),standard(THREE,0xffffff,{emissive:0xffffff,emissiveIntensity:.15}));g.add(core);g.userData.riskId=id;return g}

export async function createIndustria3D(host,context,{found=[],onRisk,activeRiskIds=null,variant=null}={}){
  const viewport=new ThreeViewport(host,context,{visualProfile:'industry',environmentPreset:'industrial',cameraPosition:[9,5.4,11],target:[0,1.5,0],minDistance:5,maxDistance:19,enablePan:true,onPick:onRisk,ariaLabel:'Galpão industrial tridimensional para inspeção de riscos'});await viewport.init();
  const {THREE}=viewport.runtime;const concrete=standard(THREE,0x3c454c,{roughness:.92}),steel=standard(THREE,0x536c7c,{metalness:.32,roughness:.55}),orange=standard(THREE,0xd9832d),yellow=standard(THREE,0xe0ad31),dark=standard(THREE,0x181d22),red=standard(THREE,0xd94d46,{emissive:0x3d0704,emissiveIntensity:.2}),cardboard=standard(THREE,0x93643d);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,18),concrete);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;viewport.scene.add(floor);
  for(const x of[-7,-2,3,8])viewport.scene.add(box(THREE,[.28,5.8,.28],[x,2.9,-5.2],steel));
  viewport.scene.add(box(THREE,[20,.2,.2],[0,5.7,-5.2],steel));
  for(const x of[-5.5,0,5.5]){const lamp=new THREE.PointLight(0xd7efff,.48,9,2);lamp.position.set(x,5.2,-1);viewport.scene.add(lamp)}

  // Procedural fallbacks remain visible until GLB arrives.
  const machineFallback=new THREE.Group();machineFallback.position.set(-4,0,-1.6);machineFallback.add(box(THREE,[3.2,2.2,2],[0,1.1,0],steel));machineFallback.add(box(THREE,[2.2,.8,1.6],[0,2.45,0],steel));const wheel=new THREE.Mesh(new THREE.TorusGeometry(.65,.16,10,28),orange);wheel.rotation.y=Math.PI/2;wheel.position.set(0,1.35,1.02);machineFallback.add(wheel);viewport.scene.add(machineFallback);
  const forkliftFallback=new THREE.Group();forkliftFallback.position.set(.6,0,2.0);forkliftFallback.add(box(THREE,[2.6,.9,1.5],[0,.65,0],yellow));forkliftFallback.add(box(THREE,[1.1,1.2,1.4],[.45,1.45,0],yellow));for(const z of[-.58,.58])for(const x of[-.75,.85]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.22,16),dark);w.rotation.x=Math.PI/2;w.position.set(x,.3,z);forkliftFallback.add(w)}forkliftFallback.add(box(THREE,[.12,2.7,.12],[1.3,1.45,-.45],dark));forkliftFallback.add(box(THREE,[1.6,.1,.15],[1.95,.12,-.45],dark));viewport.scene.add(forkliftFallback);
  const extinguisherFallback=new THREE.Group();extinguisherFallback.position.set(2.7,0,-3.8);extinguisherFallback.add(cylinder(THREE,.22,.85,[0,.48,0],red));viewport.scene.add(extinguisherFallback);
  const barrierFallback=new THREE.Group();barrierFallback.position.set(-.3,0,.7);barrierFallback.add(box(THREE,[.14,1.1,.14],[-1.2,.55,0],yellow));barrierFallback.add(box(THREE,[.14,1.1,.14],[1.2,.55,0],yellow));barrierFallback.add(box(THREE,[2.6,.22,.12],[0,.9,0],yellow));viewport.scene.add(barrierFallback);
  const instancing=new InstancingManager(THREE,viewport.scene);
  instancing.createBoxes({
    size:[1,1,1],
    material:cardboard,
    name:'industry-box-stack',
    transforms:[
      {position:[5,.45,1.2],scale:[1.4,.9,1.2]},
      {position:[6.2,.55,1.4],scale:[1,.95,1]},
      {position:[4.2,.4,1.8],scale:[1.1,.8,1]},
      {position:[5.35,.38,2.65],scale:[.85,.76,.9]},
      {position:[6.15,.34,2.55],scale:[.7,.68,.8]},
      {position:[4.55,.32,2.8],scale:[.72,.64,.76]}
    ]
  });

  const activityDirector=createScenarioActivityDirector(context,{moduleId:'industria',missionId:'linha-producao',variant});
  const worker=await createCharacterController(viewport,{x:.2,z:1.15,helmet:true,vest:true,pose:'walk',initial:'walk',rotationY:-1.1,scale:.88,speed:.85,asset:characterAsset('worker'),appearance:'warm'});
  const operator=await createCharacterController(viewport,{x:-3.15,z:.1,helmet:true,vest:false,pose:'reach',initial:'reach',rotationY:-2.2,scale:.84});
  const population=await createCharacterPopulation(viewport,[
    {x:-7.2,z:3.8,state:'walk',rotationY:-1.2,patrol:{axis:'x',amplitude:.8,speed:.32}},
    {x:-5.6,z:-3.7,state:'inspect',rotationY:.5},
    {x:-1.5,z:4.8,state:'walk',rotationY:1.7,patrol:{axis:'z',amplitude:.7,speed:.28}},
    {x:3.3,z:-3.8,state:'reach',rotationY:-2.5},
    {x:6.4,z:3.6,state:'walk',rotationY:-1.4,patrol:{axis:'x',amplitude:.65,speed:.35}},
    {x:7.6,z:-2.8,state:'idle',rotationY:2.6}
  ],{id:'industria-population',maxDistance:24,activityDirector});
  const equipment=createEquipmentMotion(viewport,{activityDirector});
  const ambient=createAmbientActivity(viewport,{maxDistance:24,activityDirector});
  equipment.vibrate(machineFallback,{axis:'y',amplitude:.006,speed:17,minimum:'high'});
  equipment.statusLight(viewport.scene,{position:[-2.8,2.55,-.55],color:0x58d68d,intensity:.7,distance:3.6,speed:2.8,minimum:'medium'});
  equipment.statusLight(viewport.scene,{position:[1.15,1.65,2],color:0xe0ad31,intensity:.55,distance:3.2,speed:3.4,minimum:'high'});

  const markers={
    'unguarded-machine':[-3.05,1.55,-.55],'forklift-pedestrian':[.3,.55,1.3],'blocked-extinguisher':[2.7,.65,-3.65],
    'boxes-route':[5,1.2,1.4],'noise-source':[4.2,2.0,-1.7],'emergency-stop':[-2.8,2.55,-.45]
  };
  const activeSet=new Set(activeRiskIds?.length?activeRiskIds:Object.keys(markers));
  const markerOffsets=variant?.markerOffsets3d??{};
  for(const[id,pos]of Object.entries(markers)){
    if(!activeSet.has(id))continue;
    const off=markerOffsets[id]??[0,0,0];
    const finalPos=[pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0)];
    const marker=riskMarker(THREE,id,finalPos,found.includes(id)?0x58d68d:0xf06b61);
    viewport.scene.add(marker);viewport.addPickable(marker,id);
  }

  const hud=addStatus(host,'G5 • carregando pack industrial');const loaded=[];const pack='assets/modules/industria/g5/manifest.json';
  let ok=0;
  const machineAsset=await packAsset(context,viewport,pack,'machine',{position:[-4,0,-1.6]},loaded);
  if(machineAsset){machineFallback.visible=false;equipment.vibrate(machineAsset,{axis:'y',amplitude:.004,speed:17,minimum:'high'});ok++}
  const forkliftAsset=await packAsset(context,viewport,pack,'forklift',{position:[.6,0,2]},loaded);
  if(forkliftAsset){forkliftFallback.visible=false;ok++}
  if(await packAsset(context,viewport,pack,'extinguisher',{position:[2.7,0,-3.8]},loaded)){extinguisherFallback.visible=false;ok++}
  if(await packAsset(context,viewport,pack,'barrier',{position:[-.3,0,.7]},loaded)){barrierFallback.visible=false;ok++}

  // Atividade ambiental: objetos de fundo independentes dos hotspots da missão.
  const ambientForklift=forkliftFallback.clone(true);
  ambientForklift.visible=true;
  ambientForklift.position.set(-8,0,5.0);
  ambientForklift.scale.setScalar(.82);
  viewport.scene.add(ambientForklift);
  ambient.path(ambientForklift,[[-8,0,5.0],[7.4,0,5.0]],{speed:.035,priority:10,minimum:'medium',hideWhenInactive:true,channel:'traffic'});

  const ambientBoxes=[];
  for(let i=0;i<3;i++){
    const m=box(THREE,[.72,.52,.72],[-5+i*1.4,.3,-4.45],cardboard);
    viewport.scene.add(m);ambientBoxes.push(m);
    ambient.path(m,[[-5,.3,-4.45],[5.5,.3,-4.45]],{speed:.055,phase:i*.65,priority:4-i,minimum:'high',hideWhenInactive:true,channel:'process'});
  }
  ambient.pulseLight(viewport.scene,{position:[-7.5,3.4,4.8],color:0xe0ad31,intensity:.55,distance:4.5,speed:2.6,minimum:'medium',priority:8});

  hud.textContent=`G9.7 • ${activityDirector.profile.label} • ${ok}/4 props GLB • população ${population.stats().created} • atividade ${ambient.stats().total} • ${context.qualityManager.level}`;
  viewport.addAnimator(({delta,elapsed})=>{
    worker.update(delta,elapsed);operator.update(delta,elapsed);
    worker.root.position.x=.2+Math.sin(elapsed*.55)*.7;
    worker.root.rotation.y=-1.1+Math.sin(elapsed*.35)*.12;
  });
  const originalDispose=viewport.dispose.bind(viewport);viewport.dispose=()=>{worker.dispose();operator.dispose();population.dispose();ambient.dispose();equipment.dispose();instancing.dispose();originalDispose()};
  return{dispose:()=>viewport.dispose(),viewport};
}

export async function createEspacoConfinado3D(host,context,{stepIndex=0}={}){
  const viewport=new ThreeViewport(host,context,{visualProfile:'confined',environmentPreset:'confined',cameraPosition:[8,4.3,9.5],target:[0,1.7,0],minDistance:5,maxDistance:16,enablePan:true,ariaLabel:'Área tridimensional externa de acesso a espaço confinado para simulação didática'});await viewport.init();
  const {THREE}=viewport.runtime;const steel=standard(THREE,0x728895,{metalness:.42,roughness:.47}),dark=standard(THREE,0x18232b),yellow=standard(THREE,0xd6ad36),blue=standard(THREE,0x335b70),groundMat=standard(THREE,0x343a3d,{roughness:1}),green=standard(THREE,0x57c783,{emissive:0x12391f,emissiveIntensity:.22});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(22,17),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;viewport.scene.add(ground);
  const tankFallback=new THREE.Group();const body=cylinder(THREE,2.4,5.2,[0,2.6,-1.4],steel,28);tankFallback.add(body);const hatch=cylinder(THREE,.88,.22,[0,5.25,-1.4],dark,24);tankFallback.add(hatch);viewport.scene.add(tankFallback);
  const rail=new THREE.Group();for(const x of[-2.3,2.3])rail.add(box(THREE,[.11,1.1,.11],[x,5.8,-1.4],yellow));rail.add(box(THREE,[4.7,.1,.1],[0,6.2,-1.4],yellow));viewport.scene.add(rail);
  const monitorFallback=new THREE.Group();monitorFallback.position.set(-4,0,2.2);monitorFallback.add(box(THREE,[.9,1.1,.42],[0,.75,0],blue));monitorFallback.add(box(THREE,[.62,.24,.04],[0,.93,.23],green));viewport.scene.add(monitorFallback);
  const tripodFallback=new THREE.Group();tripodFallback.position.set(0,0,-.2);for(const x of[-1.2,1.2,0]){const leg=box(THREE,[.12,3.4,.12],[x*.35,1.7,Math.abs(x)*.2],steel);leg.rotation.z=x===0?0:x>0?.32:-.32;tripodFallback.add(leg)}tripodFallback.add(box(THREE,[1.2,.18,.4],[0,3.3,0],yellow));viewport.scene.add(tripodFallback);
  const blowerFallback=new THREE.Group();blowerFallback.position.set(4.1,0,1.6);blowerFallback.add(cylinder(THREE,.65,1.1,[0,.65,0],yellow,24));blowerFallback.children[0].rotation.z=Math.PI/2;viewport.scene.add(blowerFallback);
  const attendant=await createCharacterController(viewport,{x:-3.1,z:.8,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:-.5,scale:.88,asset:characterAsset('tst'),appearance:'standard'});
  const warning=new THREE.PointLight(stepIndex>=1?0xf0a94e:0x57c783,1.0,7,2);warning.position.set(-4,2.2,2.2);viewport.scene.add(warning);
  const hud=addStatus(host,'G5 • carregando pack espaço confinado');const loaded=[];const pack='assets/modules/espaco-confinado/g5/manifest.json';let ok=0;
  if(await packAsset(context,viewport,pack,'tank',{position:[0,0,-1.4]},loaded)){tankFallback.visible=false;ok++}
  if(await packAsset(context,viewport,pack,'monitor',{position:[-4,0,2.2]},loaded)){monitorFallback.visible=false;ok++}
  if(await packAsset(context,viewport,pack,'tripod',{position:[0,0,-.2]},loaded)){tripodFallback.visible=false;ok++}
  if(await packAsset(context,viewport,pack,'blower',{position:[4.1,0,1.6]},loaded)){blowerFallback.visible=false;ok++}
  hud.textContent=`G5 • ${ok}/4 props GLB • atmosfera didática • equipe externa • ${context.qualityManager.level}`;
  viewport.addAnimator(({delta,elapsed})=>{attendant.update(delta,elapsed);warning.intensity=.72+Math.sin(elapsed*2.2)*.18});
  const originalDispose=viewport.dispose.bind(viewport);viewport.dispose=()=>{attendant.dispose();originalDispose()};
  return{dispose:()=>viewport.dispose(),viewport};
}
