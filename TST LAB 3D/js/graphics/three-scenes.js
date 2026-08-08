import {ThreeViewport} from './three-runtime.js';
import {createCharacterRig} from './character-rig.js';
import {InstancingManager} from './instancing-manager.js';

function standard(THREE,color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.06,...extra})}
function box(THREE,size,position,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;return m}
function cylinder(THREE,radius,height,position,material,segments=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;return m}
function cylinderBetween(THREE,a,b,radius,material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),12),material);mesh.position.copy(start.clone().add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function addAssetHud(host,text='G4 • preparando assets'){const el=document.createElement('div');el.className='g3-asset-status g4-status';el.textContent=text;host.append(el);return el}

async function swapAsset({context,viewport,pack,id,current,onReady}){
  const quality=context.qualityManager.level;
  const packData=await context.assetManager.manifest(pack);
  const definition=packData?.assets?.[id];
  const variant=context.assetManager.selectVariant(definition,quality);
  if(current?.userData?.__assetDefinition?.variant===variant){onReady?.(current,quality);return current}
  const next=await context.assetManager.acquireFromPack(pack,id,quality);
  viewport.addManagedAsset(next);
  if(current){context.assetManager.release(current);const index=viewport.managedAssets.indexOf(current);if(index>=0)viewport.managedAssets.splice(index,1)}
  onReady?.(next,quality);
  return next;
}

function buildFallbackPPE(THREE,viewport){
  const ppe={},fallback={};
  const add=(id,group)=>{group.visible=false;ppe[id]=group;fallback[id]=group;viewport.scene.add(group)};
  const yellow=standard(THREE,0xf1c232),blue=standard(THREE,0x24577d),brown=standard(THREE,0x5a3b25),black=standard(THREE,0x111820),cyan=new THREE.MeshPhysicalMaterial({color:0xaeeeff,transparent:true,opacity:.33,roughness:.15,transmission:.15,side:THREE.DoubleSide});
  {const g=new THREE.Group();const h=new THREE.Mesh(new THREE.SphereGeometry(.43,28,14,0,Math.PI*2,0,Math.PI/2),yellow);h.position.y=3.28;h.scale.y=.68;h.castShadow=true;g.add(h);g.add(box(THREE,[.98,.08,.22],[0,3.18,.18],yellow));add('helmet',g)}
  {const g=new THREE.Group();for(const sx of[-1,1])g.add(box(THREE,[.32,.16,.06],[sx*.18,3.1,.32],cyan));g.add(box(THREE,[.12,.05,.05],[0,3.1,.33],black));add('glasses',g)}
  {const g=new THREE.Group();for(const sx of[-1,1]){const pad=cylinder(THREE,.19,.12,[sx*.39,3.09,0],blue,18);pad.rotation.z=Math.PI/2;g.add(pad)}g.add(cylinderBetween(THREE,[-.38,3.19,0],[.38,3.19,0],.035,blue));add('hearing',g)}
  {const g=new THREE.Group();const mask=new THREE.Mesh(new THREE.SphereGeometry(.28,18,12),standard(THREE,0xd7e2e5));mask.position.set(0,2.94,.25);mask.scale.set(1,.65,.45);g.add(mask);add('respirator',g)}
  {const g=new THREE.Group();g.add(box(THREE,[.82,.82,.035],[0,2.98,.42],cyan));add('face',g)}
  {const g=new THREE.Group();for(const sx of[-1,1]){const glove=new THREE.Mesh(new THREE.SphereGeometry(.21,16,12),blue);glove.position.set(sx*.73,.9,0);glove.scale.set(.8,1.1,.75);g.add(glove)}add('gloves',g)}
  {const g=new THREE.Group();for(const sx of[-1,1])g.add(box(THREE,[.48,.28,.72],[sx*.27,.08,.14],brown));add('boots',g)}
  {const g=new THREE.Group();const strap=standard(THREE,0x111111);const left=box(THREE,[.09,1.48,.08],[-.27,2.02,.34],strap);left.rotation.z=-.34;g.add(left);const right=box(THREE,[.09,1.48,.08],[.27,2.02,.34],strap);right.rotation.z=.34;g.add(right);g.add(box(THREE,[.92,.09,.08],[0,1.75,.34],strap));add('harness',g)}
  return{ppe,fallback};
}

export async function createEpi3D(host,context,{selected=[]}={}){
  const viewport=new ThreeViewport(host,context,{visualProfile:'epi',dressingScale:.55,background:0x0b1520,cameraPosition:[4.1,2.8,5.5],target:[0,1.55,0],minDistance:3,maxDistance:8,ariaLabel:'Manequim tridimensional articulado para seleção de EPI'});await viewport.init();
  const {THREE}=viewport.runtime;
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.8,48),standard(THREE,0x182432,{roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;viewport.scene.add(floor);const grid=new THREE.GridHelper(7,14,0x35516b,0x213548);grid.position.y=.005;viewport.scene.add(grid);

  const character=createCharacterRig(THREE,{vest:true,helmet:false,pose:'idle',shirt:0xe7772f});viewport.scene.add(character.root);
  const {ppe,fallback}=buildFallbackPPE(THREE,viewport),loaded={};
  let active=new Set(selected);
  function setPPE(items){active=new Set(items);for(const[id,group]of Object.entries(ppe))group.visible=active.has(id)}setPPE(selected);

  const hud=addAssetHud(host);const pack='assets/modules/epi-lab/g4/manifest.json';let generation=0;
  async function upgrade(){
    const token=++generation;let ok=0;
    for(const id of['helmet','glasses','hearing','respirator','face','gloves','boots','harness']){
      try{
        const instance=await swapAsset({context,viewport,pack,id,current:loaded[id],onReady:(obj)=>{if(token!==generation){context.assetManager.release(obj);return}loaded[id]=obj;fallback[id].visible=false;ppe[id]=obj;obj.visible=active.has(id)}});
        if(token!==generation){context.assetManager.release(instance);continue}ok++;
      }catch(error){console.warn(`[TST360] fallback procedural para ${id}`,error)}
    }
    hud.textContent=`G4 • ${ok}/8 EPIs em GLB • personagem articulado • ${context.qualityManager.level}`;
  }
  await upgrade();
  const offQuality=context.events.on('quality:changed',()=>upgrade());
  viewport.addAnimator(({delta,elapsed})=>{character.update(delta,elapsed);character.joints.torso.rotation.y=Math.sin(elapsed*.42)*.018});
  const originalDispose=viewport.dispose.bind(viewport);viewport.dispose=()=>{generation++;offQuality?.();character.dispose();originalDispose()};
  return{setPPE,setPose:name=>character.setPose(name),dispose:()=>viewport.dispose(),viewport,assetStats:()=>context.assetManager.stats()};
}

function makeScaffoldFallback(THREE,steel,wood){const scaffold=new THREE.Group();for(const x of[-1.3,1.3])for(const z of[-.7,.7])scaffold.add(cylinder(THREE,.07,4.7,[x,2.35,z],steel,10));for(const y of[.7,2.1,3.5,4.6])for(const z of[-.7,.7])scaffold.add(cylinderBetween(THREE,[-1.3,y,z],[1.3,y,z],.06,steel));for(const y of[1,2.4,3.8])scaffold.add(box(THREE,[2.8,.1,1.6],[0,y,0],wood));return scaffold}
function makeWheelbarrowFallback(THREE,steel,dark){const g=new THREE.Group();const tray=box(THREE,[1.25,.35,.78],[0,.7,0],steel);tray.rotation.z=-.14;g.add(tray);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.26,.07,8,18),dark);wheel.rotation.y=Math.PI/2;wheel.position.set(.47,.28,0);g.add(wheel);return g}
function makeBarrierFallback(THREE,orange,dark){const g=new THREE.Group();g.add(box(THREE,[2.2,.28,.12],[0,1,0],orange));for(const x of[-.85,.85]){g.add(box(THREE,[.12,1.2,.12],[x,.55,0],dark));g.add(box(THREE,[.55,.08,.45],[x,.04,0],dark))}return g}

export async function createCanteiro3D(host,context,{found=[],onRisk,activeRiskIds=null,variant=null}={}){
  const viewport=new ThreeViewport(host,context,{visualProfile:'construction',background:0x89b7d2,fogColor:0x89b7d2,cameraPosition:[10,6.2,11],target:[0,1.8,0],minDistance:6,maxDistance:20,enablePan:true,onPick:onRisk,ariaLabel:'Canteiro de obras tridimensional interativo com trabalhadores articulados'});await viewport.init();
  const {THREE}=viewport.runtime;const groundMat=standard(THREE,0x6e6250,{roughness:1}),concrete=standard(THREE,0xb9b5ab),steel=standard(THREE,0x596977,{metalness:.35}),wood=standard(THREE,0x9a6b3c),yellow=standard(THREE,0xd7ad35),orange=standard(THREE,0xe7772f),dark=standard(THREE,0x222a31),cableMat=standard(THREE,0x161a1e),windowMat=standard(THREE,0x527386,{metalness:.1,roughness:.3});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(24,20),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;viewport.scene.add(ground);
  const instancing=new InstancingManager(THREE,viewport.scene);
  const postTransforms=[];for(let x=-5.4;x<=5.4;x+=1.2)postTransforms.push({position:[x,.38,4.55],scale:[1,1,1]});
  instancing.createBoxes({size:[.11,.76,.11],material:standard(THREE,0xe7772f,{roughness:.6}),transforms:postTransforms,name:'G8-safety-posts'});
  const building=new THREE.Group();building.position.set(-2.8,0,-2.4);building.add(box(THREE,[6,4.2,3.5],[0,2.1,0],concrete));for(const y of[1.3,2.7])for(const x of[-1.9,0,1.9])building.add(box(THREE,[1.1,.8,.08],[x,y,1.79],windowMat));viewport.scene.add(building);

  const scaffoldFallback=makeScaffoldFallback(THREE,steel,wood);scaffoldFallback.position.set(1.7,0,-1);viewport.scene.add(scaffoldFallback);
  const heightWorker=createCharacterRig(THREE,{x:1.7,y:2.43,z:-1,helmet:true,vest:true,pose:'climb',rotationY:Math.PI});heightWorker.root.scale.setScalar(.78);viewport.scene.add(heightWorker.root);
  const groundWorker=createCharacterRig(THREE,{x:4.2,z:2.2,helmet:false,vest:true,pose:'walk',rotationY:-.8});groundWorker.root.scale.setScalar(.86);viewport.scene.add(groundWorker.root);
  const inspector=createCharacterRig(THREE,{x:-.2,z:3.7,helmet:true,vest:true,pose:'inspect',rotationY:.45});inspector.root.scale.setScalar(.86);viewport.scene.add(inspector.root);

  const crane=new THREE.Group();crane.position.set(5.3,0,-3);crane.add(box(THREE,[.28,6.8,.28],[0,3.4,0],yellow));crane.add(box(THREE,[5.8,.22,.22],[-1.3,6.65,0],yellow));crane.add(cylinderBetween(THREE,[1,6.55,0],[1,3.6,0],.025,dark));const load=box(THREE,[1.5,.9,1.1],[1,3.05,0],wood);crane.add(load);viewport.scene.add(crane);
  const ladderFallback=new THREE.Group();ladderFallback.position.set(-.8,0,2.1);ladderFallback.rotation.z=-.22;for(const x of[-.32,.32])ladderFallback.add(box(THREE,[.08,3.3,.08],[x,1.65,0],steel));for(let y=.3;y<3.2;y+=.42)ladderFallback.add(box(THREE,[.7,.06,.08],[0,y,0],steel));viewport.scene.add(ladderFallback);
  const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-5,.06,2.7),new THREE.Vector3(-3,.08,2),new THREE.Vector3(-1,.07,2.8),new THREE.Vector3(1,.08,2.4)]);const cable=new THREE.Mesh(new THREE.TubeGeometry(cableCurve,40,.06,8,false),cableMat);cable.castShadow=true;viewport.scene.add(cable);
  const palletFallback=new THREE.Group();for(let i=0;i<5;i++)palletFallback.add(box(THREE,[1.15,.32,.78],[-4.3+i*.55,.18,1+i*.18],wood));viewport.scene.add(palletFallback);
  const wheelbarrowFallback=makeWheelbarrowFallback(THREE,steel,dark);wheelbarrowFallback.position.set(3.2,0,1.2);wheelbarrowFallback.rotation.y=-.45;viewport.scene.add(wheelbarrowFallback);
  const barrierFallback=makeBarrierFallback(THREE,orange,dark);barrierFallback.position.set(.8,0,3.2);barrierFallback.rotation.y=.2;viewport.scene.add(barrierFallback);

  const risks={'edge-open':[-3,4.45,-.65],'worker-height':[1.7,5,-1],'suspended-load':[6.3,3.3,-3],'ladder':[-.8,2.2,2.1],'cables':[-2.8,.35,2.45],'worker-ppe':[4.2,2.8,2.2]};
  const activeSet=new Set(activeRiskIds?.length?activeRiskIds:Object.keys(risks));
  const markerOffsets=variant?.markerOffsets3d??{};
  const markers=new Map();
  const markerMat=id=>new THREE.MeshStandardMaterial({color:found.includes(id)?0x58d68d:0xf05f55,emissive:found.includes(id)?0x153e26:0x4b1111,emissiveIntensity:.65,roughness:.35});
  for(const[id,pos]of Object.entries(risks)){
    if(!activeSet.has(id))continue;
    const off=markerOffsets[id]??[0,0,0];
    const marker=new THREE.Mesh(new THREE.SphereGeometry(.22,18,12),markerMat(id));
    marker.position.set(pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0));
    marker.castShadow=true;viewport.addPickable(marker,id);viewport.scene.add(marker);markers.set(id,marker);
  }
  function setFound(items){const done=new Set(items);for(const[id,marker]of markers){marker.material.color.setHex(done.has(id)?0x58d68d:0xf05f55);marker.material.emissive.setHex(done.has(id)?0x153e26:0x4b1111)}}

  const hud=addAssetHud(host);const pack='assets/modules/canteiro-360/g4/manifest.json';const loaded={};let generation=0;
  async function upgrade(){
    const token=++generation;let ok=0;
    for(const[id,fallback]of[['ladder',ladderFallback],['pallet',palletFallback],['cone',null],['scaffold',scaffoldFallback],['wheelbarrow',wheelbarrowFallback],['barrier',barrierFallback]]){
      try{const instance=await swapAsset({context,viewport,pack,id,current:loaded[id],onReady:(obj)=>{if(token!==generation){context.assetManager.release(obj);return}loaded[id]=obj;if(fallback)fallback.visible=false}});if(token!==generation){context.assetManager.release(instance);continue}ok++}catch(error){console.warn(`[TST360] fallback procedural para ${id}`,error)}
    }
    hud.textContent=`G4 • ${ok}/6 props em GLB • 3 trabalhadores articulados • ${context.qualityManager.level}`;
  }
  await upgrade();const offQuality=context.events.on('quality:changed',()=>upgrade());
  viewport.addAnimator(({delta,elapsed})=>{
    heightWorker.update(delta,elapsed);groundWorker.update(delta,elapsed);inspector.update(delta,elapsed);
    groundWorker.root.position.x=4.2+Math.sin(elapsed*.48)*.8;groundWorker.root.position.z=2.2+Math.cos(elapsed*.48)*.36;groundWorker.root.rotation.y=-.8+Math.sin(elapsed*.48)*.35;
    for(const marker of markers.values()){const scale=1+Math.sin(elapsed*3+marker.position.x)*.09;marker.scale.setScalar(scale)}load.position.y=3.05+Math.sin(elapsed*.8)*.08;
  });
  const originalDispose=viewport.dispose.bind(viewport);viewport.dispose=()=>{generation++;offQuality?.();heightWorker.dispose();groundWorker.dispose();inspector.dispose();instancing.dispose();originalDispose()};
  return{setFound,dispose:()=>viewport.dispose(),viewport,assetStats:()=>context.assetManager.stats(),instancingStats:()=>instancing.stats()};
}

export async function createErgonomia3D(host,context,{values={}}={}){
  const viewport=new ThreeViewport(host,context,{visualProfile:'office',dressingScale:.72,background:0x182734,fog:false,cameraPosition:[5.2,3.15,5.8],target:[0,1.35,.55],minDistance:3.5,maxDistance:9,enablePan:false,ariaLabel:'Posto de trabalho tridimensional com personagem articulado sentado'});await viewport.init();
  const {THREE}=viewport.runtime;const floorMat=standard(THREE,0x31393e,{roughness:.95}),deskMat=standard(THREE,0x815c3e,{roughness:.8}),metal=standard(THREE,0x687985,{metalness:.25,roughness:.5}),dark=standard(THREE,0x151e26),chairMat=standard(THREE,0x29475f),screenMat=standard(THREE,0x1d2c38,{emissive:0x172d3a,emissiveIntensity:.28,roughness:.25});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(10,8),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;viewport.scene.add(floor);
  const desk=new THREE.Group();desk.add(box(THREE,[4,.15,1.4],[.6,1.22,1.6],deskMat));for(const x of[-1.05,2.25])desk.add(box(THREE,[.12,1.2,.12],[x,.6,1.6],metal));viewport.scene.add(desk);
  const monitor=new THREE.Group();monitor.add(box(THREE,[1.25,.78,.08],[0,0,0],dark));monitor.add(box(THREE,[1.12,.65,.09],[0,0,.015],screenMat));monitor.add(box(THREE,[.08,.55,.08],[0,-.64,-.02],metal));monitor.add(box(THREE,[.65,.06,.42],[0,-.91,0],metal));viewport.scene.add(monitor);
  const keyboard=box(THREE,[1.45,.06,.45],[0,1.34,.75],standard(THREE,0xa9b3b9,{roughness:.65}));viewport.scene.add(keyboard);
  const chair=new THREE.Group();chair.add(box(THREE,[1.0,.14,1.0],[-1.45,.84,0],chairMat));chair.add(box(THREE,[1.0,1.15,.13],[-1.45,1.48,-.43],chairMat));chair.add(box(THREE,[.12,.75,.12],[-1.45,.42,0],metal));chair.add(box(THREE,[1.1,.08,.12],[-1.45,.08,0],metal));viewport.scene.add(chair);

  const worker=createCharacterRig(THREE,{x:-1.45,y:.88,z:.12,helmet:false,vest:false,pose:'seated',rotationY:0,shirt:0x4d80a7});worker.root.scale.setScalar(.82);viewport.scene.add(worker.root);
  const hud=addAssetHud(host,'G4 • postura articulada • escala didática');

  let current={...values};
  function setParameters(next={}){
    current={...current,...next};
    const chairValue=current.chair??50,monitorValue=current.monitor??50,distance=current.distance??50,keyboardValue=current.keyboard??50;
    const chairDelta=(chairValue-50)*.0045;
    chair.position.y=chairDelta;worker.root.position.y=.88+chairDelta;
    const monitorHeight=1.95+(monitorValue-50)*.008;const monitorZ=1.72+(distance-50)*.012;
    monitor.position.set(.55,monitorHeight,monitorZ);
    keyboard.position.z=.78+(keyboardValue-50)*.011;
    const neckDeviation=(50-monitorValue)/50*.26+(50-distance)/50*.08;worker.setNeckAdjustment(neckDeviation);
    const reach=Math.max(-.2,Math.min(.32,(keyboardValue-50)/50*.35));worker.joints.leftShoulder.rotation.x=-.48-reach;worker.joints.rightShoulder.rotation.x=-.48-reach;
    hud.textContent=`G4 • postura 3D • cadeira ${chairValue} • monitor ${monitorValue} • distância ${distanceValue(distance)}`;
  }
  function distanceValue(value){return value<38?'próxima':value>72?'distante':'intermediária'}
  setParameters(current);
  viewport.addAnimator(({delta,elapsed})=>{worker.update(delta,elapsed);worker.joints.torso.rotation.y=Math.sin(elapsed*.38)*.008});
  const originalDispose=viewport.dispose.bind(viewport);viewport.dispose=()=>{worker.dispose();originalDispose()};
  return{setParameters,dispose:()=>viewport.dispose(),viewport};
}
