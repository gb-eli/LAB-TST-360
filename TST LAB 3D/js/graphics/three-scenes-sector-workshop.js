import {ThreeViewport} from './three-runtime.js';
import {InstancingManager} from './instancing-manager.js';
import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';
import {createEquipmentMotion} from './equipment-motion.js';
import {createScenarioActivityDirector} from '../simulation/scenario-activity-director.js';

const PACK='assets/sectors/oficina/g1/manifest.json';
function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.78,metalness:.04,...extra})}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function marker(T,id,pos,found=false){
  const g=new T.Group();g.position.set(...pos);g.userData.riskId=id;
  const color=found?0x58d68d:0xf05f55;
  const ring=new T.Mesh(new T.TorusGeometry(.22,.052,8,20),mat(T,color,{emissive:color,emissiveIntensity:.15,roughness:.35}));
  ring.rotation.x=Math.PI/2;g.add(ring);
  g.add(new T.Mesh(new T.SphereGeometry(.08,12,8),mat(T,0xffffff,{emissive:0xffffff,emissiveIntensity:.17})));
  return g;
}
function status(host,text){const el=document.createElement('div');el.className='g3-asset-status g5-status';el.textContent=text;host.append(el);return el}
async function loadPack(context,vp,id,transform){
  try{
    const obj=await context.assetManager.acquireFromPack(PACK,id,context.qualityManager.level);
    vp.addManagedAsset(obj);
    if(transform?.position)obj.position.set(...transform.position);
    if(transform?.rotation)obj.rotation.set(...transform.rotation);
    if(transform?.scale)obj.scale.set(...transform.scale);
    return obj;
  }catch(error){
    console.warn(`[TST360 Oficina G1] fallback procedural: ${id}`,error);
    return null;
  }
}
function shell(T,vp){
  const floor=mat(T,0x4f565a,{roughness:.95});
  const wall=mat(T,0xbcc5c9,{roughness:.9});
  const ground=new T.Mesh(new T.PlaneGeometry(28,19),floor);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;vp.scene.add(ground);
  vp.scene.add(box(T,[28,6,.25],[0,3,-6.8],wall));
  for(const x of[-8,-2,4,9]){
    const light=new T.PointLight(0xf5f7f8,.36,8,2);light.position.set(x,5,-1);vp.scene.add(light);
  }
}
function activeMarkers(T,vp,state,map){
  const active=new Set(state.activeRiskIds?.length?state.activeRiskIds:Object.keys(map));
  const offsets=state.variant?.markerOffsets3d??{};
  for(const [id,pos] of Object.entries(map)){
    if(!active.has(id))continue;
    const off=offsets[id]??[0,0,0];
    const m=marker(T,id,[pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0)],state.found?.includes(id));
    vp.scene.add(m);vp.addPickable(m,id);
  }
}

async function buildGrinding(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'workshop',environmentPreset:'industrial',cameraPosition:[12.5,6.5,14],target:[0,1.2,0],
    minDistance:5,maxDistance:24,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Oficina tridimensional para inspeção de corte e esmerilhamento'
  });
  await vp.init();
  const T=vp.runtime.THREE;shell(T,vp);
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'oficina',missionId:'esmerilhamento',variant:state.variant});
  const layouts={
    A:{bench:[-4.5,0,-2.8],grinder:[-.8,0,-1.4],worker:[1.3,0,-.8],clutter:[2.0,.04,3.1],observer:[4.4,0,.6]},
    B:{bench:[-3.2,0,-3.2],grinder:[1.0,0,-1.2],worker:[2.7,0,-.3],clutter:[.5,.04,3.7],observer:[5.3,0,1.5]},
    C:{bench:[-5.0,0,-2.0],grinder:[-1.6,0,-.7],worker:[.4,0,.1],clutter:[3.2,.04,2.6],observer:[4.8,0,-.1]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x687b86,{metalness:.22,roughness:.55}),wood=mat(T,0x79583f,{roughness:.88}),dark=mat(T,0x30363a),yellow=mat(T,0xd8a939);

  const benchFallback=new T.Group();benchFallback.position.set(...layout.bench);
  benchFallback.add(box(T,[4,.2,1.8],[0,1.05,0],wood),box(T,[.18,1,.18],[-1.65,.5,-.65],steel),box(T,[.18,1,.18],[1.65,.5,.65],steel));vp.scene.add(benchFallback);

  const grinderFallback=new T.Group();grinderFallback.position.set(...layout.grinder);
  grinderFallback.add(box(T,[1.7,1.1,1.4],[0,.75,0],mat(T,0x3c6988)),box(T,[.2,1.4,.2],[-.95,.95,0],steel),box(T,[.2,1.4,.2],[.95,.95,0],steel));vp.scene.add(grinderFallback);

  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[.75,.12,.16],material:steel,name:'workshop-tools',
    transforms:[
      {position:[layout.clutter[0],.09,layout.clutter[2]],rotation:[0,.2,0]},
      {position:[layout.clutter[0]+.75,.09,layout.clutter[2]-.3],rotation:[0,-.35,0]},
      {position:[layout.clutter[0]-.55,.09,layout.clutter[2]+.5],rotation:[0,.55,0]}
    ]
  });

  const cable=new T.Mesh(new T.TorusGeometry(1.55,.055,8,30,Math.PI*1.45),dark);cable.rotation.x=Math.PI/2;cable.position.set(...layout.clutter);vp.scene.add(cable);

  const worker=await createCharacterController(vp,{x:layout.worker[0],z:layout.worker[2],helmet:false,vest:false,pose:'reach',initial:'reach',rotationY:-1.8,scale:.9});
  const observer=await createCharacterController(vp,{x:layout.observer[0],z:layout.observer[2],helmet:false,vest:false,pose:'walk',initial:'walk',rotationY:2.4,scale:.9,speed:.55});
  const tst=await createCharacterController(vp,{x:8.5,z:3.7,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.8,scale:.9,asset:characterAsset('tst'),appearance:'cool'});
  const equipment=createEquipmentMotion(vp,{activityDirector});
  equipment.vibrate(grinderFallback,{axis:'y',amplitude:.006,speed:19,minimum:'high'});
  equipment.statusLight(vp.scene,{position:[layout.grinder[0]+.65,1.45,layout.grinder[2]+.6],color:0xe5a23c,intensity:.62,distance:3.4,speed:4.1,minimum:'medium'});

  activeMarkers(T,vp,state,{
    'guard':[layout.grinder[0]-.95,1.1,layout.grinder[2]],
    'projection':[layout.observer[0],1.35,layout.observer[2]],
    'ppe':[layout.worker[0],1.85,layout.worker[2]],
    'clutter':[layout.clutter[0],.28,layout.clutter[2]]
  });

  const hud=status(host,'Oficina G1 • carregando corte/esmerilhamento');
  let ok=0;
  const bench=await loadPack(context,vp,'workbench',{position:layout.bench});if(bench){benchFallback.visible=false;ok++}
  const grinder=await loadPack(context,vp,'grinder',{position:layout.grinder});
  if(grinder){grinderFallback.visible=false;equipment.vibrate(grinder,{axis:'y',amplitude:.004,speed:19,minimum:'high'});ok++}
  hud.textContent=`Oficina G9.7 • variante ${variantId} • ${activityDirector.profile.label} • TST ${tst.info().kind} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{
    worker.update(delta,elapsed);observer.update(delta,elapsed);tst.update(delta,elapsed);
    observer.root.position.z=layout.observer[2]+Math.sin(elapsed*.35)*.28;
  });
  const old=vp.dispose.bind(vp);
  vp.dispose=()=>{worker.dispose();observer.dispose();tst.dispose();equipment.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

async function buildMaintenance(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'workshop',environmentPreset:'industrial',cameraPosition:[13,7,15],target:[0,1.3,0],
    minDistance:6,maxDistance:25,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Oficina tridimensional para inspeção de preparação de manutenção'
  });
  await vp.init();
  const T=vp.runtime.THREE;shell(T,vp);
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'oficina',missionId:'manutencao-maquina',variant:state.variant});
  const layouts={
    A:{machine:[-.8,0,-2.1],barrier:[4.7,0,.3],tools:[1.0,.04,3.1],third:[5.7,0,1.2]},
    B:{machine:[1.0,0,-2.5],barrier:[5.4,0,-.6],tools:[-.8,.04,3.6],third:[6.1,0,.4]},
    C:{machine:[-2.3,0,-1.6],barrier:[3.7,0,1.2],tools:[2.2,.04,2.7],third:[4.7,0,2.2]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x687b86,{metalness:.2,roughness:.56}),dark=mat(T,0x30363a),yellow=mat(T,0xd8a939),red=mat(T,0xc54c45);

  const machineFallback=new T.Group();machineFallback.position.set(...layout.machine);
  machineFallback.add(box(T,[3.2,2.4,2.6],[0,1.2,0],steel),box(T,[2.2,.35,2.1],[0,2.5,0],mat(T,0x436f8c)));vp.scene.add(machineFallback);

  const barrierFallback=new T.Group();barrierFallback.position.set(...layout.barrier);
  barrierFallback.add(box(T,[.12,1.1,.12],[-1.2,.55,0],yellow),box(T,[.12,1.1,.12],[1.2,.55,0],yellow),box(T,[2.5,.18,.12],[0,.75,0],red));vp.scene.add(barrierFallback);

  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[.75,.12,.16],material:steel,name:'maintenance-tools',
    transforms:[
      {position:[layout.tools[0],.09,layout.tools[2]],rotation:[0,.15,0]},
      {position:[layout.tools[0]+.75,.09,layout.tools[2]-.25],rotation:[0,-.4,0]},
      {position:[layout.tools[0]-.5,.09,layout.tools[2]+.45],rotation:[0,.5,0]}
    ]
  });
  const partsMat=mat(T,0x7b5a42,{roughness:.88});
  inst.createBoxes({
    size:[.85,.5,.7],material:partsMat,name:'maintenance-parts',
    transforms:[{position:[-6,.25,2.5]},{position:[-5.1,.25,2.9]},{position:[-6.4,.75,2.6],scale:[.8,.8,.8]}]
  });

  const maintainer=await createCharacterController(vp,{x:layout.machine[0]+2.4,z:layout.machine[2]+1.0,helmet:false,vest:false,pose:'crouch',initial:'crouch',rotationY:-2.2,scale:.9});
  const third=await createCharacterController(vp,{x:layout.third[0],z:layout.third[2],helmet:false,vest:false,pose:'walk',initial:'walk',rotationY:2.5,scale:.9,speed:.55});
  const tst=await createCharacterController(vp,{x:8.2,z:3.5,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.8,scale:.9,asset:characterAsset('tst'),appearance:'cool'});
  const equipment=createEquipmentMotion(vp,{activityDirector});
  equipment.statusLight(vp.scene,{position:[layout.machine[0]+1.7,1.9,layout.machine[2]+1.15],color:0xe25f4f,intensity:.72,distance:3.7,speed:2.6,minimum:'medium'});

  activeMarkers(T,vp,state,{
    'energy':[layout.machine[0]+1.7,1.8,layout.machine[2]+1.1],
    'guard':[layout.machine[0],1.5,layout.machine[2]+1.35],
    'tools':[layout.tools[0],.28,layout.tools[2]],
    'access':[layout.third[0],1.4,layout.third[2]]
  });

  const hud=status(host,'Oficina G1 • carregando manutenção');
  let ok=0;
  const machine=await loadPack(context,vp,'maintenance-machine',{position:layout.machine});if(machine){machineFallback.visible=false;ok++}
  const barrier=await loadPack(context,vp,'barrier',{position:layout.barrier});if(barrier){barrierFallback.visible=false;ok++}
  hud.textContent=`Oficina G9.7 • variante ${variantId} • ${activityDirector.profile.label} • máquina sem motion de processo • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{
    maintainer.update(delta,elapsed);third.update(delta,elapsed);tst.update(delta,elapsed);
    third.root.position.x=layout.third[0]+Math.sin(elapsed*.32)*.25;
  });
  const old=vp.dispose.bind(vp);
  vp.dispose=()=>{maintainer.dispose();third.dispose();tst.dispose();equipment.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

export async function createWorkshopSector3D(host,context,state={}){
  return state.missionId==='manutencao-maquina'
    ? buildMaintenance(host,context,state)
    : buildGrinding(host,context,state);
}
