import {ThreeViewport} from './three-runtime.js';
import {InstancingManager} from './instancing-manager.js';
import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';
import {createCharacterPopulation} from './character-population.js';
import {createAmbientActivity} from './ambient-activity-manager.js';
import {createScenarioActivityDirector} from '../simulation/scenario-activity-director.js';

const PACK='assets/sectors/porto/g1/manifest.json';

function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.74,metalness:.06,...extra})}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function marker(T,id,pos,found=false){
  const group=new T.Group();group.position.set(...pos);group.userData.riskId=id;
  const color=found?0x58d68d:0xf05f55;
  const ring=new T.Mesh(new T.TorusGeometry(.24,.055,8,22),mat(T,color,{emissive:color,emissiveIntensity:.16,roughness:.35}));
  ring.rotation.x=Math.PI/2;group.add(ring);
  const core=new T.Mesh(new T.SphereGeometry(.085,12,8),mat(T,0xffffff,{emissive:0xffffff,emissiveIntensity:.18}));
  group.add(core);
  return group;
}
function status(host,text){
  const el=document.createElement('div');el.className='g3-asset-status g5-status';el.textContent=text;host.append(el);return el;
}
async function loadPack(context,viewport,id,transform){
  try{
    const obj=await context.assetManager.acquireFromPack(PACK,id,context.qualityManager.level);
    viewport.addManagedAsset(obj);
    if(transform?.position)obj.position.set(...transform.position);
    if(transform?.rotation)obj.rotation.set(...transform.rotation);
    if(transform?.scale)obj.scale.set(...transform.scale);
    return obj;
  }catch(error){
    console.warn(`[TST360 Porto G1] fallback procedural: ${id}`,error);
    return null;
  }
}

function addRoadMarkings(T,instancing){
  const yellow=mat(T,0xe2bb43,{roughness:.8});
  instancing.createBoxes({
    size:[1,.025,.12],material:yellow,name:'port-lane-dashes',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:16},(_,i)=>({position:[-12+i*1.6,.025,5.2]}))
  });
  instancing.createBoxes({
    size:[.12,.025,1],material:yellow,name:'port-crossing',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:7},(_,i)=>({position:[-2.5+i*.82,.028,1.6],scale:[1,1,.52]}))
  });
}

function addContainerStacks(T,instancing){
  const blue=mat(T,0x386b91,{metalness:.12,roughness:.58});
  const rust=mat(T,0xa4613f,{metalness:.1,roughness:.65});
  const green=mat(T,0x477766,{metalness:.12,roughness:.6});
  const groups=[
    [blue,[[-9,1.3,-5],[-6.3,1.3,-5],[-9,3.95,-5],[-6.3,3.95,-5]]],
    [rust,[[7.6,1.3,-5],[10.3,1.3,-5],[7.6,3.95,-5]]],
    [green,[[5.1,1.3,-5],[5.1,3.95,-5],[10.3,3.95,-5]]]
  ];
  for(const [material,positions] of groups){
    instancing.createBoxes({
      size:[2.5,2.6,5.9],material,name:'port-container-stack',
      transforms:positions.map(position=>({position,rotation:[0,Math.PI/2,0]}))
    });
  }
}

async function buildYard(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'port',environmentPreset:'outdoor',cameraPosition:[14,9,16],target:[0,1.5,0],
    minDistance:7,maxDistance:28,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Pátio portuário tridimensional para inspeção de segurança'
  });
  await vp.init();
  const T=vp.runtime.THREE;
  const concrete=mat(T,0x4d5558,{roughness:.95});
  const steel=mat(T,0x596b73,{metalness:.34,roughness:.5});
  const yellow=mat(T,0xd6aa32);
  const orange=mat(T,0xd47b2e);
  const dark=mat(T,0x22282c);
  const water=mat(T,0x245a73,{roughness:.35,metalness:.08});
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'porto-logistica',missionId:'patio-conteineres',variant:state.variant});
  const yardLayouts={
    A:{truck:[-7,0,3.5],reach:[3.8,0,1.2],suspended:[1,3.1,-6.8]},
    B:{truck:[-4.8,0,4.8],reach:[6.0,0,-.6],suspended:[-2.0,3.35,-6.8]},
    C:{truck:[-8.4,0,.8],reach:[1.5,0,3.0],suspended:[4.0,3.0,-6.8]}
  };
  const layout=yardLayouts[variantId]||yardLayouts.A;

  const ground=new T.Mesh(new T.PlaneGeometry(34,25),concrete);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;vp.scene.add(ground);
  const sea=new T.Mesh(new T.PlaneGeometry(34,10),water);sea.rotation.x=-Math.PI/2;sea.position.set(0,-.08,-16);vp.scene.add(sea);

  const instancing=new InstancingManager(T,vp.scene);
  addRoadMarkings(T,instancing);
  addContainerStacks(T,instancing);

  // Guindaste/pórtico leve procedural
  const crane=new T.Group();crane.position.set(1,0,-6.8);
  crane.add(box(T,[.45,8,.45],[-5,4,0],yellow),box(T,[.45,8,.45],[5,4,0],yellow),box(T,[11,.38,.45],[0,7.7,0],yellow));
  crane.add(box(T,[.18,4,.18],[0,5.5,0],steel));
  const suspendedFallback=box(T,[2.5,2.6,5.9],[layout.suspended[0]-1,layout.suspended[1],layout.suspended[2]+6.8],orange);suspendedFallback.rotation.y=Math.PI/2;crane.add(suspendedFallback);
  vp.scene.add(crane);

  // Caminhão fallback
  const truckFallback=new T.Group();truckFallback.position.set(...layout.truck);
  truckFallback.add(box(T,[2.4,.45,6],[0,.45,0],dark),box(T,[2.25,1.8,1.8],[0,1.25,2],orange),box(T,[2.25,1.0,3.5],[0,.95,-.9],steel));
  vp.scene.add(truckFallback);

  // Reach stacker fallback
  const reachFallback=new T.Group();reachFallback.position.set(...layout.reach);
  reachFallback.add(box(T,[3.4,.8,5],[0,.55,0],yellow),box(T,[1.5,1.7,1.6],[-.7,1.65,1.1],yellow),box(T,[.45,.45,5.8],[.7,2.7,-.3],steel));
  vp.scene.add(reachFallback);

  const worker=await createCharacterController(vp,{x:layout.truck[0]+2.0,z:layout.truck[2]-.4,helmet:true,vest:true,pose:'walk',initial:'walk',rotationY:-1.2,scale:.9,speed:.75,asset:characterAsset('worker'),appearance:'warm'});
  const tst=await createCharacterController(vp,{x:8.3,z:4.6,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.6,scale:.9,asset:characterAsset('tst'),appearance:'standard'});
  const population=await createCharacterPopulation(vp,[
    {x:-10.4,z:-1.5,state:'walk',rotationY:-1.2,patrol:{axis:'x',amplitude:1.0,speed:.26}},
    {x:-7.5,z:-5.0,state:'inspect',rotationY:.4},
    {x:-2.8,z:5.2,state:'walk',rotationY:1.5,patrol:{axis:'z',amplitude:.9,speed:.24}},
    {x:3.8,z:5.5,state:'idle',rotationY:-2.5},
    {x:8.8,z:-1.0,state:'walk',rotationY:-1.4,patrol:{axis:'x',amplitude:.8,speed:.29}},
    {x:10.5,z:-5.4,state:'inspect',rotationY:2.4}
  ],{id:'porto-yard-population',maxDistance:31,activityDirector});
  const ambient=createAmbientActivity(vp,{maxDistance:31,activityDirector});

  const map={
    'truck-person':[layout.truck[0]+1.5,1.25,layout.truck[2]-.25],
    'container-stack':[8.1,3.2,-3.6],
    'suspended':[layout.suspended[0],layout.suspended[1]+1.85,layout.suspended[2]+.55],
    'visibility':variantId==='C'?[1.2,.35,2.4]:[-.2,.35,1.6]
  };
  const active=new Set(state.activeRiskIds?.length?state.activeRiskIds:Object.keys(map));
  const offsets=state.variant?.markerOffsets3d??{};
  for(const [id,pos] of Object.entries(map)){
    if(!active.has(id))continue;
    const off=offsets[id]??[0,0,0];
    const m=marker(T,id,[pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0)],state.found?.includes(id));
    vp.scene.add(m);vp.addPickable(m,id);
  }

  const hud=status(host,'Porto G1 • carregando GLB/LOD');
  let ok=0;
  const truck=await loadPack(context,vp,'truck',{position:layout.truck});if(truck){truckFallback.visible=false;ok++}
  const reach=await loadPack(context,vp,'reachstacker',{position:layout.reach});if(reach){reachFallback.visible=false;ok++}
  const suspended=await loadPack(context,vp,'container',{position:layout.suspended,rotation:[0,Math.PI/2,0]});if(suspended){suspendedFallback.visible=false;ok++}

  const ambientTruck=truckFallback.clone(true);
  ambientTruck.visible=true;ambientTruck.position.set(-11,0,8);ambientTruck.scale.setScalar(.78);vp.scene.add(ambientTruck);
  ambient.path(ambientTruck,[[-11,0,8],[11,0,8]],{speed:.025,priority:10,minimum:'medium',hideWhenInactive:true});

  const trolley=box(T,[1.1,.25,.65],[-4.2,7.35,-6.8],yellow);vp.scene.add(trolley);
  ambient.path(trolley,[[-4.2,7.35,-6.8],[4.2,7.35,-6.8]],{speed:.04,priority:8,minimum:'medium',hideWhenInactive:true,channel:'process'});
  ambient.pulseLight(vp.scene,{position:[0,7.95,-6.8],color:0xe2bb43,intensity:.7,distance:5,speed:2.1,minimum:'high',priority:6});

  hud.textContent=`Porto G9.7 • variante ${variantId} • ${activityDirector.profile.label} • população ${population.stats().created} • atividade ${ambient.stats().total} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{
    worker.update(delta,elapsed);
    tst.update(delta,elapsed);
    worker.root.position.z=layout.truck[2]-.4+Math.sin(elapsed*.42)*.65;
    crane.position.y=Math.sin(elapsed*.35)*.025;
  });

  const old=vp.dispose.bind(vp);
  vp.dispose=()=>{worker.dispose();tst.dispose();population.dispose();ambient.dispose();instancing.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

async function buildDock(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'port',environmentPreset:'industrial',cameraPosition:[13,7.2,14],target:[0,1.5,0],
    minDistance:6,maxDistance:25,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Doca portuária tridimensional para inspeção de segurança'
  });
  await vp.init();
  const T=vp.runtime.THREE;
  const concrete=mat(T,0x555c60,{roughness:.95});
  const wall=mat(T,0x667883,{roughness:.82});
  const steel=mat(T,0x404b51,{metalness:.28,roughness:.55});
  const yellow=mat(T,0xdeb039);
  const wood=mat(T,0x8b603a,{roughness:.88});
  const dark=mat(T,0x22272b);
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'porto-logistica',missionId:'doca-carregamento',variant:state.variant});
  const dockLayouts={
    A:{truck:[5.0,0,-2.0],pallet:[-1.5,1.27,-3.4],manual:[-.5,0,1.8]},
    B:{truck:[6.2,0,-.7],pallet:[-3.2,1.27,-3.3],manual:[-1.8,0,2.5]},
    C:{truck:[3.8,0,-3.2],pallet:[.2,1.27,-3.5],manual:[1.2,0,1.9]}
  };
  const layout=dockLayouts[variantId]||dockLayouts.A;

  const floor=new T.Mesh(new T.PlaneGeometry(30,22),concrete);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;vp.scene.add(floor);
  vp.scene.add(box(T,[26,6,.4],[0,3,-7.4],wall));
  vp.scene.add(box(T,[13,1.25,5.2],[-4.5,.625,-4.5],concrete)); // plataforma
  vp.scene.add(box(T,[13,.18,.25],[-4.5,1.25,-2.0],yellow)); // borda

  const instancing=new InstancingManager(T,vp.scene);
  instancing.createBoxes({
    size:[.16,.05,1.0],material:yellow,name:'dock-floor-lanes',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:9},(_,i)=>({position:[4.2,.03,-4.7+i*.85]}))
  });
  instancing.createBoxes({
    size:[1.2,.18,.16],material:yellow,name:'dock-crosswalk',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:6},(_,i)=>({position:[-.4+i*1.45,.035,3.2]}))
  });

  const truckFallback=new T.Group();truckFallback.position.set(...layout.truck);
  truckFallback.add(box(T,[2.4,.45,6],[0,.45,0],dark),box(T,[2.2,1.8,1.8],[0,1.25,2],yellow),box(T,[2.25,1.0,3.5],[0,.95,-.9],steel));
  vp.scene.add(truckFallback);

  // pallet/carga na doca
  const pallet=new T.Group();pallet.position.set(...layout.pallet);
  pallet.add(box(T,[2.2,.18,1.5],[0,.1,0],wood),box(T,[1.8,1.2,1.2],[0,.8,0],mat(T,0x9b6a3e)));
  vp.scene.add(pallet);

  const manualWorker=await createCharacterController(vp,{x:layout.manual[0],z:layout.manual[2],helmet:true,vest:true,pose:'crouch',initial:'crouch',rotationY:-2.4,scale:.9,asset:characterAsset('worker'),appearance:'deep'});
  const guide=await createCharacterController(vp,{x:4,z:3.5,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:3.0,scale:.9,asset:characterAsset('tst'),appearance:'cool'});
  const population=await createCharacterPopulation(vp,[
    {x:-9.5,z:4.0,state:'walk',rotationY:-1.2,patrol:{axis:'x',amplitude:.7,speed:.27}},
    {x:-6.2,z:4.8,state:'idle',rotationY:.5},
    {x:-2.2,z:5.0,state:'walk',rotationY:1.5,patrol:{axis:'z',amplitude:.65,speed:.31}},
    {x:2.6,z:4.5,state:'inspect',rotationY:-2.1},
    {x:7.8,z:2.8,state:'walk',rotationY:-1.4,patrol:{axis:'x',amplitude:.75,speed:.26}},
    {x:9.2,z:-5.5,state:'idle',rotationY:2.5}
  ],{id:'porto-dock-population',maxDistance:29,activityDirector});
  const ambient=createAmbientActivity(vp,{maxDistance:29,activityDirector});

  const bumperFallback=[];
  for(const x of[-8,-5,-2]){
    const b=box(T,[.55,1.1,.45],[x,.72,-1.82],dark);vp.scene.add(b);bumperFallback.push(b);
  }

  const map={
    'dock-edge':[-6.8,1.55,-1.8],
    'vehicle':[layout.truck[0]-.4,.9,layout.truck[2]+1.7],
    'pallet':[layout.pallet[0],layout.pallet[1]+.9,layout.pallet[2]+.1],
    'manual':[layout.manual[0],1.25,layout.manual[2]]
  };
  const active=new Set(state.activeRiskIds?.length?state.activeRiskIds:Object.keys(map));
  const offsets=state.variant?.markerOffsets3d??{};
  for(const [id,pos] of Object.entries(map)){
    if(!active.has(id))continue;
    const off=offsets[id]??[0,0,0];
    const m=marker(T,id,[pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0)],state.found?.includes(id));
    vp.scene.add(m);vp.addPickable(m,id);
  }

  const hud=status(host,'Porto G1 • carregando doca GLB/LOD');
  let ok=0;
  const truck=await loadPack(context,vp,'truck',{position:layout.truck});if(truck){truckFallback.visible=false;ok++}
  for(let i=0;i<3;i++){
    const b=await loadPack(context,vp,'dock-bumper',{position:[-8+i*3,.17,-1.82]});
    if(b){bumperFallback[i].visible=false;ok++}
  }

  const ambientTruck=truckFallback.clone(true);
  ambientTruck.visible=true;ambientTruck.position.set(10,0,5.4);ambientTruck.scale.setScalar(.76);vp.scene.add(ambientTruck);
  ambient.path(ambientTruck,[[10,0,5.4],[10,0,-4.2]],{speed:.025,priority:10,minimum:'medium',hideWhenInactive:true});

  const shutter=box(T,[3.2,3.6,.18],[8.2,3.05,-7.15],wall);vp.scene.add(shutter);
  ambient.door(shutter,{axis:'y',distance:2.6,speed:.11,priority:8,minimum:'medium'});
  ambient.pulseLight(vp.scene,{position:[8.2,5.35,-6.95],color:0xe2bb43,intensity:.6,distance:4.5,speed:2.4,minimum:'high',priority:6});

  hud.textContent=`Porto G9.7 • variante ${variantId} • ${activityDirector.profile.label} • população ${population.stats().created} • atividade ${ambient.stats().total} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{
    manualWorker.update(delta,elapsed);guide.update(delta,elapsed);
    guide.root.rotation.y=3+Math.sin(elapsed*.4)*.08;
  });
  const old=vp.dispose.bind(vp);
  vp.dispose=()=>{manualWorker.dispose();guide.dispose();population.dispose();ambient.dispose();instancing.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

export async function createPortSector3D(host,context,state={}){
  return state.missionId==='doca-carregamento'
    ? buildDock(host,context,state)
    : buildYard(host,context,state);
}
