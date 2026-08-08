import {ThreeViewport} from './three-runtime.js';
import {InstancingManager} from './instancing-manager.js';
import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';

const PACK='assets/sectors/escritorio/g1/manifest.json';

function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.78,metalness:.04,...extra})}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function marker(T,id,pos,found=false){
  const g=new T.Group();g.position.set(...pos);g.userData.riskId=id;
  const color=found?0x58d68d:0xf05f55;
  const ring=new T.Mesh(new T.TorusGeometry(.21,.05,8,20),mat(T,color,{emissive:color,emissiveIntensity:.14,roughness:.35}));
  ring.rotation.x=Math.PI/2;g.add(ring);
  g.add(new T.Mesh(new T.SphereGeometry(.075,12,8),mat(T,0xffffff,{emissive:0xffffff,emissiveIntensity:.16})));
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
    console.warn(`[TST360 Escritório G1] fallback procedural: ${id}`,error);
    return null;
  }
}
function addOfficeShell(T,vp){
  const floor=mat(T,0x80888d,{roughness:.94});
  const wall=mat(T,0xdce2e4,{roughness:.9});
  const trim=mat(T,0x6b8ca0,{roughness:.76});
  const ground=new T.Mesh(new T.PlaneGeometry(26,18),floor);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;vp.scene.add(ground);
  vp.scene.add(box(T,[26,5.6,.24],[0,2.8,-6.5],wall));
  vp.scene.add(box(T,[26,.14,.08],[0,1.0,-6.32],trim));
  for(const x of[-8,-2,4,9]){
    const light=new T.PointLight(0xf2fbff,.38,8,2);light.position.set(x,4.8,-1);vp.scene.add(light);
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

async function buildWorkstations(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'office',environmentPreset:'office',cameraPosition:[12,6.2,13],target:[0,1.2,0],
    minDistance:5,maxDistance:23,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Escritório administrativo tridimensional para inspeção ergonômica'
  });
  await vp.init();
  const T=vp.runtime.THREE;addOfficeShell(T,vp);
  const variantId=state.variant?.id||'A';
  const layouts={
    A:{desk:[-3.2,0,-.8],chair:[-3.2,0,1.2],monitor:[-3.2,1.22,-.85],worker:[-3.2,0,1.45],boxes:[5.2,0,2.4],cable:[.4,.04,2.3]},
    B:{desk:[-1.2,0,-1.4],chair:[-1.1,0,.8],monitor:[-1.0,1.22,-1.4],worker:[-1.1,0,1.0],boxes:[3.6,0,3.0],cable:[-4.0,.04,2.2]},
    C:{desk:[-4.6,0,-.4],chair:[-4.3,0,1.5],monitor:[-4.6,1.22,-.5],worker:[-4.3,0,1.7],boxes:[1.7,0,3.5],cable:[3.4,.04,2.0]}
  };
  const layout=layouts[variantId]||layouts.A;
  const wood=mat(T,0x7d5a3f,{roughness:.86}),steel=mat(T,0x71838c,{metalness:.2,roughness:.55}),dark=mat(T,0x2e353a),blue=mat(T,0x4f7c98),card=mat(T,0x9a6a42);

  const deskFallback=new T.Group();deskFallback.position.set(...layout.desk);
  deskFallback.add(box(T,[3.6,.18,1.8],[0,1.15,0],wood),box(T,[.15,1.05,.15],[-1.45,.55,-.55],steel),box(T,[.15,1.05,.15],[1.45,.55,-.55],steel));vp.scene.add(deskFallback);
  const chairFallback=new T.Group();chairFallback.position.set(...layout.chair);
  chairFallback.add(box(T,[1.2,.18,1.1],[0,.7,0],dark),box(T,[1.2,1.5,.16],[0,1.55,.45],dark));vp.scene.add(chairFallback);
  const monitorFallback=box(T,[1.8,1.05,.15],layout.monitor,blue);vp.scene.add(monitorFallback);

  const cable=new T.Mesh(new T.TorusGeometry(1.5,.055,8,30,Math.PI*1.35),dark);cable.rotation.x=Math.PI/2;cable.position.set(...layout.cable);vp.scene.add(cable);

  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[1.0,.8,1.0],material:card,name:'office-boxes',
    transforms:[
      {position:[layout.boxes[0],.4,layout.boxes[2]]},
      {position:[layout.boxes[0]+.85,.42,layout.boxes[2]-.3]},
      {position:[layout.boxes[0]+.25,1.18,layout.boxes[2]-.1],scale:[.8,.8,.8]}
    ]
  });
  inst.createBoxes({
    size:[3.2,.15,1.55],material:wood,name:'office-other-desks',
    transforms:[{position:[3.8,1.15,-2.2]},{position:[7.4,1.15,-1.0]}]
  });

  const worker=await createCharacterController(vp,{x:layout.worker[0],z:layout.worker[2],helmet:false,vest:false,pose:'seated',initial:'seated',rotationY:Math.PI,scale:.9,asset:characterAsset('worker'),appearance:'warm'});
  const tst=await createCharacterController(vp,{x:7.6,z:3.7,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.7,scale:.9,asset:characterAsset('tst'),appearance:'standard'});

  activeMarkers(T,vp,state,{
    'monitor':[layout.monitor[0],1.9,layout.monitor[2]+.15],
    'chair':[layout.chair[0],1.2,layout.chair[2]],
    'cables':[layout.cable[0],.25,layout.cable[2]],
    'boxes':[layout.boxes[0]+.4,1.4,layout.boxes[2]]
  });

  const hud=status(host,'Escritório G1 • carregando postos');
  let ok=0;
  const desk=await loadPack(context,vp,'desk',{position:layout.desk});if(desk){deskFallback.visible=false;ok++}
  const chair=await loadPack(context,vp,'chair',{position:layout.chair});if(chair){chairFallback.visible=false;ok++}
  const monitor=await loadPack(context,vp,'monitor',{position:layout.monitor});if(monitor){monitorFallback.visible=false;ok++}
  hud.textContent=`Escritório G9.3 • variante ${variantId} • sentado ${worker.info().packId??worker.info().kind} • TST ${tst.info().packId??tst.info().kind} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{worker.update(delta,elapsed);tst.update(delta,elapsed);tst.root.rotation.y=2.7+Math.sin(elapsed*.35)*.07});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{worker.dispose();tst.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

async function buildEmergency(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'office',environmentPreset:'office',cameraPosition:[12,6.5,14],target:[0,1.25,0],
    minDistance:5,maxDistance:24,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Escritório administrativo tridimensional para preparação de emergência'
  });
  await vp.init();
  const T=vp.runtime.THREE;addOfficeShell(T,vp);
  const variantId=state.variant?.id||'A';
  const layouts={
    A:{exit:[8.5,1.7,-6.2],ext:[4.8,0,-5.9],block:[7.0,0,-3.8],extension:[-1.5,.04,2.6],sign:[8.5,3.75,-6.12]},
    B:{exit:[8.5,1.7,-6.2],ext:[3.0,0,-5.9],block:[6.2,0,-2.4],extension:[1.0,.04,3.0],sign:[8.0,3.55,-6.12]},
    C:{exit:[8.5,1.7,-6.2],ext:[5.8,0,-5.9],block:[5.7,0,-4.4],extension:[-3.5,.04,2.0],sign:[8.9,3.4,-6.12]}
  };
  const layout=layouts[variantId]||layouts.A;
  const green=mat(T,0x4b9a74,{emissive:0x103728,emissiveIntensity:.16}),red=mat(T,0xc84d46),wood=mat(T,0x7d5a3f),dark=mat(T,0x30373b),yellow=mat(T,0xdeb23b);

  const exitDoor=box(T,[2.4,3.4,.22],layout.exit,green);vp.scene.add(exitDoor);
  const sign=box(T,[1.8,.55,.08],layout.sign,green);vp.scene.add(sign);

  const extFallback=box(T,[.5,1.25,.42],[layout.ext[0],.63,layout.ext[2]],red);vp.scene.add(extFallback);
  const blocker=new T.Group();blocker.position.set(...layout.block);
  blocker.add(box(T,[1.8,.8,1.3],[0,.4,0],wood),box(T,[1.1,.9,.9],[.5,1.18,.1],wood));vp.scene.add(blocker);

  const extension=new T.Mesh(new T.TorusGeometry(1.7,.06,8,32,Math.PI*1.45),dark);extension.rotation.x=Math.PI/2;extension.position.set(...layout.extension);vp.scene.add(extension);
  vp.scene.add(box(T,[.65,.16,.4],[layout.extension[0]+1.1,.12,layout.extension[2]-.3],yellow));

  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[.85,.025,.12],material:green,name:'office-emergency-route',
    transforms:Array.from({length:13},(_,i)=>({position:[-6.5+i*1.05,.025,4.6]}))
  });
  inst.createBoxes({
    size:[3.1,.15,1.5],material:wood,name:'office-emergency-desks',
    transforms:[{position:[-5.5,1.15,-1.8]},{position:[-1.8,1.15,-2.2]}]
  });

  const worker=await createCharacterController(vp,{x:-5.2,z:2.4,helmet:false,vest:false,pose:'walk',initial:'walk',rotationY:-1.0,scale:.9,speed:.7,asset:characterAsset('worker'),appearance:'warm'});
  const tst=await createCharacterController(vp,{x:4.0,z:3.3,helmet:true,vest:true,pose:'inspect',initial:'inspect',rotationY:2.8,scale:.9,asset:characterAsset('tst'),appearance:'standard'});

  activeMarkers(T,vp,state,{
    'exit':[layout.block[0]+.6,1.1,layout.block[2]],
    'extension':[layout.extension[0],.26,layout.extension[2]],
    'extinguisher':[layout.ext[0],1.3,layout.ext[2]+.2],
    'sign':[layout.sign[0],layout.sign[1],layout.sign[2]+.15]
  });

  const hud=status(host,'Escritório G1 • carregando emergência');
  let ok=0;
  const ext=await loadPack(context,vp,'extinguisher',{position:layout.ext});if(ext){extFallback.visible=false;ok++}
  hud.textContent=`Escritório G9.3 • variante ${variantId} • caminhada ${worker.info().packId??worker.info().kind} • TST ${tst.info().packId??tst.info().kind} • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{worker.update(delta,elapsed);tst.update(delta,elapsed);worker.root.position.x=-5.2+Math.sin(elapsed*.3)*.45});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{worker.dispose();tst.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

export async function createOfficeSector3D(host,context,state={}){
  return state.missionId==='emergencia-escritorio'
    ? buildEmergency(host,context,state)
    : buildWorkstations(host,context,state);
}
