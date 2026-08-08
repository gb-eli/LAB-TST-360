import {ThreeViewport} from './three-runtime.js';
import {createCharacterRig} from './character-rig.js';
import {createCharacterMotion} from './character-motion.js';
import {SurfaceLibrary} from './surface-library.js';

function box(T,size,pos,mat){const m=new T.Mesh(new T.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function cylinder(T,r,h,pos,mat,segments=18){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function status(host,text){const el=document.createElement('div');el.className='g3-asset-status g7-status';el.textContent=text;host.append(el);return el}
async function asset(context,viewport,pack,id,transform){try{const obj=await context.assetManager.acquireFromPack(pack,id,context.qualityManager.level);viewport.addManagedAsset(obj);if(transform?.position)obj.position.set(...transform.position);if(transform?.rotation)obj.rotation.set(...transform.rotation);if(transform?.scale)obj.scale.set(...transform.scale);return obj}catch(error){console.warn(`[TST360 G7] fallback procedural ${id}`,error);return null}}
function marker(T,id,pos,found=false){const color=found?0x58d68d:0xf0b55e,g=new T.Group();g.position.set(...pos);const ring=new T.Mesh(new T.TorusGeometry(.21,.045,8,20),new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,roughness:.38}));ring.rotation.x=Math.PI/2;g.add(ring);const dot=new T.Mesh(new T.SphereGeometry(.075,12,8),new T.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.35}));g.add(dot);g.userData.riskId=id;g.userData.evidenceId=id;return g}

export async function createInvestigation3D(host,context,{found=[],onEvidence,stage='after'}={}){
  const vp=new ThreeViewport(host,context,{visualProfile:'forensic',environmentPreset:'forensic',cameraPosition:[9.2,5.4,10.8],target:[0,1.5,0],minDistance:3.6,maxDistance:17,enablePan:true,captureEnabled:true,onPick:onEvidence,ariaLabel:'Cena tridimensional forense de investigação de acidente com evidências selecionáveis'});await vp.init();
  const T=vp.runtime.THREE,surfaces=new SurfaceLibrary(vp),floor=surfaces.material('concrete'),wall=surfaces.material('paintedWall'),steel=surfaces.material('paintedSteel'),dark=surfaces.material('darkSteel'),wood=surfaces.material('wood'),rubber=surfaces.material('rubber');
  const slab=new T.Mesh(new T.PlaneGeometry(20,15),floor);slab.rotation.x=-Math.PI/2;slab.receiveShadow=true;vp.scene.add(slab);vp.scene.add(box(T,[20,5.6,.22],[0,2.8,-5.05],wall));
  const rubberZone=box(T,[5.6,.025,4.3],[-3.1,.02,-1.2],rubber);vp.scene.add(rubberZone);
  const machineFallback=new T.Group();machineFallback.position.set(-3.2,0,-1.2);machineFallback.add(box(T,[4.1,2.25,2.4],[0,1.15,0],steel));machineFallback.add(cylinder(T,.78,2.52,[0,1.55,1.25],dark,24));machineFallback.children[1].rotation.x=Math.PI/2;vp.scene.add(machineFallback);
  const panelFallback=new T.Group();panelFallback.position.set(-6.8,0,-3.85);panelFallback.add(box(T,[1.4,2.5,.65],[0,1.25,0],steel));panelFallback.add(box(T,[.95,.55,.05],[0,1.7,.36],dark));vp.scene.add(panelFallback);
  const guardFallback=box(T,[3.1,1.35,.12],[-3.2,1.35,.12],new T.MeshStandardMaterial({color:0xd45d54,roughness:.6}));vp.scene.add(guardFallback);
  const desk=box(T,[4.6,.18,1.55],[4.25,1.35,-2.9],wood);vp.scene.add(desk);for(const x of[2.4,6.1])vp.scene.add(box(T,[.16,1.35,.16],[x,.68,-2.9],wood));
  const clipboardFallback=new T.Group();clipboardFallback.position.set(4.15,1.52,-2.8);clipboardFallback.add(box(T,[1.15,.08,.78],[0,0,0],new T.MeshStandardMaterial({color:0xe6dfca,roughness:.78})));vp.scene.add(clipboardFallback);
  const wrenchFallback=new T.Group();wrenchFallback.position.set(.4,.12,2.3);const shaft=box(T,[1.5,.12,.18],[0,0,0],steel);shaft.rotation.y=.25;wrenchFallback.add(shaft);vp.scene.add(wrenchFallback);
  const barrierFallback=new T.Group();barrierFallback.position.set(.2,0,.8);const yellow=new T.MeshStandardMaterial({color:0xe2b83f,roughness:.7});for(const x of[-1.5,1.5])barrierFallback.add(box(T,[.12,1.05,.12],[x,.52,0],yellow));barrierFallback.add(box(T,[3.2,.16,.12],[0,.8,0],yellow));vp.scene.add(barrierFallback);
  const witness=createCharacterRig(T,{x:5.6,z:1.9,helmet:false,vest:true,pose:'idle',rotationY:-1.8});witness.root.scale.setScalar(.88);vp.scene.add(witness.root);const witnessMotion=createCharacterMotion(witness,{initial:'idle'});
  const investigator=createCharacterRig(T,{x:2.2,z:3.4,helmet:true,vest:true,pose:'inspect',rotationY:-2.35});investigator.root.scale.setScalar(.86);vp.scene.add(investigator.root);const investigatorMotion=createCharacterMotion(investigator,{initial:'inspect'});

  const pack='assets/modules/investigacao-acidentes/g7/manifest.json',loaded={};let ok=0;
  loaded.machine=await asset(context,vp,pack,'machine',{position:[-3.2,0,-1.2]});if(loaded.machine){machineFallback.visible=false;ok++}
  loaded.panel=await asset(context,vp,pack,'panel',{position:[-6.8,0,-3.85]});if(loaded.panel){panelFallback.visible=false;ok++}
  loaded.guard=await asset(context,vp,pack,'guard',{position:[-3.2,.7,.12]});if(loaded.guard){guardFallback.visible=false;ok++}
  loaded.wrench=await asset(context,vp,pack,'wrench',{position:[.4,.1,2.3],rotation:[0,.25,0]});if(loaded.wrench){wrenchFallback.visible=false;ok++}
  loaded.clipboard=await asset(context,vp,pack,'clipboard',{position:[4.15,1.5,-2.8]});if(loaded.clipboard){clipboardFallback.visible=false;ok++}
  loaded.barrier=await asset(context,vp,pack,'barrier',{position:[.2,0,.8],scale:[1.15,1,1]});if(loaded.barrier){barrierFallback.visible=false;ok++}

  const evidencePositions={guard:[-3.2,1.55,.5],procedure:[4.15,1.85,-2.45],tool:[.4,.34,2.3],witness:[5.6,1.8,1.9],panel:[-6.8,1.8,-3.35]};
  const markers=new Map();for(const[id,pos]of Object.entries(evidencePositions)){const m=marker(T,id,pos,found.includes(id));markers.set(id,m);vp.scene.add(m);vp.addPickable(m,id)}
  const sceneStatus=status(host,`G7 • ${ok}/6 props GLB • materiais procedurais • reconstrução forense`);
  const stageLight=new T.PointLight(0xe56b61,.8,8,2);stageLight.position.set(-3,3,-.4);vp.scene.add(stageLight);

  function setFound(ids=[]){const set=new Set(ids);for(const[id,m]of markers){const color=set.has(id)?0x58d68d:0xf0b55e;m.children[0].material.color.setHex(color);m.children[0].material.emissive.setHex(color);m.scale.setScalar(set.has(id)?.88:1)}}
  function setStage(next='after'){
    stage=next;const before=next==='before',event=next==='event',after=next==='after';
    const guardObj=loaded.guard||guardFallback;guardObj.visible=before||event;
    const wrenchObj=loaded.wrench||wrenchFallback;wrenchObj.position.set(event ? -1.7 : .4, event ? .16 : .1, event ? .4 : 2.3);
    const barrierObj=loaded.barrier||barrierFallback;barrierObj.visible=after;
    stageLight.color.setHex(before?0x75d69a:event?0xf1a044:0xe56b61);stageLight.intensity=before?.45:event?1.2:.72;
    sceneStatus.textContent=`G7 • ${ok}/6 GLB • reconstrução: ${before?'antes':event?'momento crítico':'pós-ocorrência'} • ${context.qualityManager.level}`;
  }
  let focusTween=null;
  function focusEvidence(id){const pos=evidencePositions[id];if(!pos)return;const target=new T.Vector3(...pos),dir=vp.camera.position.clone().sub(vp.controls.target).normalize();const desired=target.clone().add(dir.multiplyScalar(4.4)).add(new T.Vector3(0,1.1,0));focusTween={t:0,fromPos:vp.camera.position.clone(),fromTarget:vp.controls.target.clone(),toPos:desired,toTarget:target}}
  vp.addAnimator(({delta,elapsed})=>{witnessMotion.update(delta,elapsed);investigatorMotion.update(delta,elapsed);witness.root.rotation.y=-1.8+Math.sin(elapsed*.35)*.08;if(focusTween){focusTween.t=Math.min(1,focusTween.t+delta*2.6);const u=1-Math.pow(1-focusTween.t,3);vp.camera.position.lerpVectors(focusTween.fromPos,focusTween.toPos,u);vp.controls.target.lerpVectors(focusTween.fromTarget,focusTween.toTarget,u);if(focusTween.t>=1)focusTween=null}});
  setFound(found);setStage(stage);
  const old=vp.dispose.bind(vp);vp.dispose=()=>{witnessMotion.dispose();investigatorMotion.dispose();witness.dispose();investigator.dispose();surfaces.dispose();old()};
  return{dispose:()=>vp.dispose(),viewport:vp,setFound,setStage,focusEvidence,capture:(filename='tst360-investigacao-vista.png')=>vp.capturePng(filename)};
}
