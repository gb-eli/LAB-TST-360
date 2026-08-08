import {ThreeViewport} from './three-runtime.js';
import {InstancingManager} from './instancing-manager.js';
import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';
import {createCharacterPopulation} from './character-population.js';
import {createAmbientActivity} from './ambient-activity-manager.js';
import {createScenarioActivityDirector} from '../simulation/scenario-activity-director.js';

const PACK='assets/sectors/saude/g1/manifest.json';

function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.78,metalness:.04,...extra})}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function marker(T,id,pos,found=false){
  const g=new T.Group();g.position.set(...pos);g.userData.riskId=id;
  const color=found?0x58d68d:0xf05f55;
  const ring=new T.Mesh(new T.TorusGeometry(.22,.05,8,20),mat(T,color,{emissive:color,emissiveIntensity:.14,roughness:.35}));
  ring.rotation.x=Math.PI/2;g.add(ring);
  g.add(new T.Mesh(new T.SphereGeometry(.078,12,8),mat(T,0xffffff,{emissive:0xffffff,emissiveIntensity:.18})));
  return g;
}
function status(host,text){const el=document.createElement('div');el.className='g3-asset-status g5-status';el.textContent=text;host.append(el);return el}
async function loadPack(context,viewport,id,transform){
  try{
    const obj=await context.assetManager.acquireFromPack(PACK,id,context.qualityManager.level);
    viewport.addManagedAsset(obj);
    if(transform?.position)obj.position.set(...transform.position);
    if(transform?.rotation)obj.rotation.set(...transform.rotation);
    if(transform?.scale)obj.scale.set(...transform.scale);
    return obj;
  }catch(error){
    console.warn(`[TST360 Saúde G1] fallback procedural: ${id}`,error);
    return null;
  }
}
function addCorridor(T,vp){
  const floor=mat(T,0xaebfc5,{roughness:.9});
  const wall=mat(T,0xe2e8ea,{roughness:.88});
  const trim=mat(T,0x6aa58c,{roughness:.75});
  const ground=new T.Mesh(new T.PlaneGeometry(28,18),floor);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;vp.scene.add(ground);
  vp.scene.add(box(T,[28,5.8,.25],[0,2.9,-6.4],wall));
  vp.scene.add(box(T,[28,.18,.12],[0,1.15,-6.22],trim));
  for(const x of[-9,-3,3,9]){
    const lamp=new T.PointLight(0xf4fbff,.42,8,2);lamp.position.set(x,4.8,-1);vp.scene.add(lamp);
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

async function buildSupport(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'health',environmentPreset:'office',cameraPosition:[12,6.5,13],target:[0,1.35,0],
    minDistance:5,maxDistance:24,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Corredor hospitalar tridimensional para inspeção de segurança ocupacional'
  });
  await vp.init();
  const T=vp.runtime.THREE;addCorridor(T,vp);
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'saude',missionId:'apoio-hospitalar',variant:state.variant});
  const layouts={
    A:{cart:[1.8,0,-.2],waste:[5.3,0,-4.9],cleaner:[-5.1,0,-.3],wet:[-1.2,0.025,2.2]},
    B:{cart:[-.2,0,1.0],waste:[4.0,0,-4.9],cleaner:[-3.8,0,.6],wet:[2.0,0.025,2.6]},
    C:{cart:[3.2,0,-1.0],waste:[1.8,0,-4.9],cleaner:[-6.1,0,1.2],wet:[-3.0,0.025,2.0]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x778e99,{metalness:.2,roughness:.55}),red=mat(T,0xbe4f48),yellow=mat(T,0xdfb13b),blue=mat(T,0x5c8eaa),dark=mat(T,0x30383d);

  const cartFallback=new T.Group();cartFallback.position.set(...layout.cart);
  cartFallback.add(box(T,[1.4,.2,2.1],[0,.8,0],steel),box(T,[1.4,.12,2.1],[0,1.55,0],blue));vp.scene.add(cartFallback);
  const wasteFallback=box(T,[1,1.1,.8],[layout.waste[0],.55,layout.waste[2]],red);vp.scene.add(wasteFallback);

  // faixa de piso molhado didática
  const wet=new T.Mesh(new T.PlaneGeometry(3.4,2.0),new T.MeshStandardMaterial({color:0x7bc9db,transparent:true,opacity:.25,roughness:.25}));
  wet.rotation.x=-Math.PI/2;wet.position.set(...layout.wet);vp.scene.add(wet);
  const sign=box(T,[.55,.95,.12],[layout.wet[0]+1.25,.48,layout.wet[2]-.55],yellow);sign.rotation.y=-.2;vp.scene.add(sign);

  // apoio/armários
  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[1.6,2.6,.75],material:mat(T,0xc9d7dc),name:'hospital-support-cabinets',
    transforms:[{position:[-8,1.3,-5.9]},{position:[-6.2,1.3,-5.9]},{position:[7.2,1.3,-5.9]}]
  });

  const cleaner=await createCharacterController(vp,{x:layout.cleaner[0],z:layout.cleaner[2],helmet:false,vest:false,pose:'reach',initial:'reach',rotationY:-1.1,scale:.9,asset:characterAsset('worker'),appearance:'deep'});
  const tst=await createCharacterController(vp,{x:7.4,z:3.4,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.8,scale:.9,asset:characterAsset('tst'),appearance:'cool'});
  const population=await createCharacterPopulation(vp,[
    {x:-7.7,z:3.8,state:'walk',rotationY:-1.2,helmet:false,patrol:{axis:'x',amplitude:.55,speed:.25}},
    {x:-4.5,z:4.3,state:'idle',rotationY:.4,helmet:false},
    {x:-.8,z:4.6,state:'walk',rotationY:1.5,helmet:false,patrol:{axis:'z',amplitude:.5,speed:.28}},
    {x:2.6,z:4.0,state:'inspect',rotationY:-2.2,helmet:false},
    {x:5.5,z:-4.9,state:'walk',rotationY:-1.3,helmet:false,patrol:{axis:'x',amplitude:.5,speed:.24}},
    {x:8.0,z:-4.4,state:'idle',rotationY:2.3,helmet:false}
  ],{id:'health-support-population',maxDistance:25,activityDirector});
  const ambient=createAmbientActivity(vp,{maxDistance:25,activityDirector});

  activeMarkers(T,vp,state,{
    'wet-floor':[layout.wet[0],.22,layout.wet[2]],
    'waste':[layout.waste[0],1.15,layout.waste[2]+.2],
    'ppe-cleaning':[layout.cleaner[0],1.5,layout.cleaner[2]],
    'cart':[layout.cart[0],1.4,layout.cart[2]]
  });

  const hud=status(host,'Saúde G1 • carregando apoio hospitalar');
  let ok=0;
  const cart=await loadPack(context,vp,'cart',{position:layout.cart});if(cart){cartFallback.visible=false;ok++}
  const waste=await loadPack(context,vp,'waste-bin',{position:layout.waste});if(waste){wasteFallback.visible=false;ok++}
  const cabinet=await loadPack(context,vp,'cabinet',{position:[-8,0,-5.9]});if(cabinet){ok++}

  const ambientCart=cartFallback.clone(true);
  ambientCart.visible=true;ambientCart.position.set(-8.5,0,4.8);ambientCart.scale.setScalar(.78);vp.scene.add(ambientCart);
  ambient.path(ambientCart,[[-8.5,0,4.8],[8.3,0,4.8]],{speed:.03,priority:8,minimum:'medium',hideWhenInactive:true});

  const doorLeft=box(T,[1.25,3.2,.16],[-.72,1.6,-6.08],mat(T,0xbfd7dc));vp.scene.add(doorLeft);
  const doorRight=box(T,[1.25,3.2,.16],[.72,1.6,-6.08],mat(T,0xbfd7dc));vp.scene.add(doorRight);
  ambient.door(doorLeft,{axis:'x',distance:-1.05,speed:.12,phase:0,priority:10,minimum:'medium'});
  ambient.door(doorRight,{axis:'x',distance:1.05,speed:.12,phase:0,priority:10,minimum:'medium'});
  ambient.pulseLight(vp.scene,{position:[0,3.55,-5.85],color:0x58d68d,intensity:.42,distance:3.4,speed:2.0,minimum:'high',priority:5});

  hud.textContent=`Saúde G9.7 • variante ${variantId} • ${activityDirector.profile.label} • população ${population.stats().created} • atividade ${ambient.stats().total} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{cleaner.update(delta,elapsed);tst.update(delta,elapsed);cleaner.root.rotation.y=-1.1+Math.sin(elapsed*.45)*.08});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{cleaner.dispose();tst.dispose();population.dispose();ambient.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

async function buildTransport(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'health',environmentPreset:'office',cameraPosition:[13,6.8,14],target:[0,1.35,0],
    minDistance:5,maxDistance:25,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Corredor hospitalar 3D para transporte interno e ergonomia'
  });
  await vp.init();
  const T=vp.runtime.THREE;addCorridor(T,vp);
  const variantId=state.variant?.id||'A';
  const activityDirector=createScenarioActivityDirector(context,{sectorId:'saude',missionId:'transporte-interno',variant:state.variant});
  const layouts={
    A:{cart:[-.8,0,.7],worker:[-2.6,0,1.1],bed:[5.6,0,-2.0],cab:[8.0,0,-5.8],cable:[2.0,.04,2.7]},
    B:{cart:[1.6,0,1.7],worker:[-.4,0,2.0],bed:[4.2,0,-1.0],cab:[7.0,0,-5.8],cable:[-2.0,.04,2.0]},
    C:{cart:[-3.0,0,.1],worker:[-4.8,0,.5],bed:[6.2,0,-.2],cab:[5.8,0,-5.8],cable:[1.0,.04,3.1]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x778e99,{metalness:.22,roughness:.5}),light=mat(T,0xcbd9de),blue=mat(T,0x588baa),dark=mat(T,0x31383d),green=mat(T,0x4f987d);

  const cartFallback=new T.Group();cartFallback.position.set(...layout.cart);
  cartFallback.add(box(T,[1.4,.2,2.1],[0,.8,0],steel),box(T,[1.4,.12,2.1],[0,1.55,0],light));vp.scene.add(cartFallback);
  const bedFallback=new T.Group();bedFallback.position.set(...layout.bed);
  bedFallback.add(box(T,[2.2,.2,4.2],[0,.8,0],light));vp.scene.add(bedFallback);
  const cabFallback=box(T,[2.3,3.1,.9],[layout.cab[0],1.55,layout.cab[2]],light);vp.scene.add(cabFallback);

  const cable=new T.Mesh(new T.TorusGeometry(1.7,.06,8,32,Math.PI*1.4),dark);cable.rotation.x=Math.PI/2;cable.position.set(...layout.cable);vp.scene.add(cable);

  // saída/rota
  const exitDoor=box(T,[2.4,3.4,.25],[-9.2,1.7,-6.15],green);vp.scene.add(exitDoor);
  const routeMat=mat(T,0x5ab889,{emissive:0x123c28,emissiveIntensity:.18});
  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[.8,.025,.14],material:routeMat,name:'hospital-route',
    transforms:Array.from({length:12},(_,i)=>({position:[-7.5+i*1.15,.025,4.5]}))
  });

  const worker=await createCharacterController(vp,{x:layout.worker[0],z:layout.worker[2],helmet:false,vest:false,pose:'reach',initial:'reach',rotationY:-1.3,scale:.9,asset:characterAsset('worker'),appearance:'deep'});
  const tst=await createCharacterController(vp,{x:7.5,z:4.0,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.7,scale:.9,asset:characterAsset('tst'),appearance:'cool'});
  const population=await createCharacterPopulation(vp,[
    {x:-8.0,z:4.4,state:'walk',rotationY:-1.2,helmet:false,patrol:{axis:'x',amplitude:.55,speed:.26}},
    {x:-5.0,z:-4.8,state:'idle',rotationY:.6,helmet:false},
    {x:-1.6,z:4.7,state:'walk',rotationY:1.6,helmet:false,patrol:{axis:'z',amplitude:.55,speed:.29}},
    {x:2.4,z:-4.7,state:'inspect',rotationY:-2.1,helmet:false},
    {x:5.5,z:4.5,state:'walk',rotationY:-1.4,helmet:false,patrol:{axis:'x',amplitude:.5,speed:.24}},
    {x:8.2,z:-4.2,state:'idle',rotationY:2.4,helmet:false}
  ],{id:'health-transport-population',maxDistance:26,activityDirector});
  const ambient=createAmbientActivity(vp,{maxDistance:26,activityDirector});

  activeMarkers(T,vp,state,{
    'manual-push':[layout.worker[0]+.5,1.4,layout.worker[2]],
    'emergency-route':[layout.bed[0],1.35,layout.bed[2]+1.0],
    'cable':[layout.cable[0],.28,layout.cable[2]],
    'storage':[layout.cab[0],2.7,layout.cab[2]+.3]
  });

  const hud=status(host,'Saúde G1 • carregando transporte interno');
  let ok=0;
  const cart=await loadPack(context,vp,'cart',{position:layout.cart});if(cart){cartFallback.visible=false;ok++}
  const bed=await loadPack(context,vp,'bed',{position:layout.bed});if(bed){bedFallback.visible=false;ok++}
  const cab=await loadPack(context,vp,'cabinet',{position:layout.cab});if(cab){cabFallback.visible=false;ok++}

  const ambientCart=cartFallback.clone(true);
  ambientCart.visible=true;ambientCart.position.set(-8.6,0,4.9);ambientCart.scale.setScalar(.76);vp.scene.add(ambientCart);
  ambient.path(ambientCart,[[-8.6,0,4.9],[8.4,0,4.9]],{speed:.028,priority:8,minimum:'medium',hideWhenInactive:true});

  const doorLeft=box(T,[1.2,3.2,.16],[-.7,1.6,-6.08],mat(T,0xbfd7dc));vp.scene.add(doorLeft);
  const doorRight=box(T,[1.2,3.2,.16],[.7,1.6,-6.08],mat(T,0xbfd7dc));vp.scene.add(doorRight);
  ambient.door(doorLeft,{axis:'x',distance:-1.0,speed:.12,priority:10,minimum:'medium'});
  ambient.door(doorRight,{axis:'x',distance:1.0,speed:.12,priority:10,minimum:'medium'});
  ambient.pulseLight(vp.scene,{position:[0,3.55,-5.85],color:0x58d68d,intensity:.4,distance:3.3,speed:2.1,minimum:'high',priority:5});

  hud.textContent=`Saúde G9.7 • variante ${variantId} • ${activityDirector.profile.label} • população ${population.stats().created} • atividade ${ambient.stats().total} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{worker.update(delta,elapsed);tst.update(delta,elapsed);worker.root.position.z=layout.worker[2]+Math.sin(elapsed*.35)*.16});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{worker.dispose();tst.dispose();population.dispose();ambient.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

export async function createHealthSector3D(host,context,state={}){
  return state.missionId==='transporte-interno'
    ? buildTransport(host,context,state)
    : buildSupport(host,context,state);
}
