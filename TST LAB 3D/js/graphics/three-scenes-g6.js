
import {ThreeViewport} from './three-runtime.js';
import {createCharacterRig} from './character-rig.js';
import {createCharacterMotion} from './character-motion.js';
import {EffectsManager} from './effects-manager.js';
import {InstancingManager} from './instancing-manager.js';

function material(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.72,metalness:.06,...extra})}
function box(T,size,pos,mat){const m=new T.Mesh(new T.BoxGeometry(...size),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function cylinder(T,r,h,pos,mat,segments=18){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}
function status(host,text){const el=document.createElement('div');el.className='g3-asset-status g6-status';el.textContent=text;host.append(el);return el}
async function asset(context,viewport,pack,id,transform){try{const obj=await context.assetManager.acquireFromPack(pack,id,context.qualityManager.level);viewport.addManagedAsset(obj);if(transform?.position)obj.position.set(...transform.position);if(transform?.rotation)obj.rotation.set(...transform.rotation);if(transform?.scale)obj.scale.set(...transform.scale);return obj}catch(e){console.warn(`[TST360 G6] fallback procedural ${id}`,e);return null}}
function marker(T,id,pos,found=false){const color=found?0x58d68d:0xf06b61,g=new T.Group();g.position.set(...pos);const ring=new T.Mesh(new T.TorusGeometry(.19,.045,8,18),material(T,color,{emissive:color,emissiveIntensity:.2}));ring.rotation.x=Math.PI/2;g.add(ring);const core=new T.Mesh(new T.SphereGeometry(.075,12,8),material(T,0xffffff,{emissive:0xffffff,emissiveIntensity:.2}));g.add(core);g.userData.riskId=id;return g}

export async function createEletricidade3D(host,context,{found=[],onRisk,activeRiskIds=null,variant=null}={}){
  const vp=new ThreeViewport(host,context,{visualProfile:'electrical',environmentPreset:'electrical',cameraPosition:[8.7,5,10.5],target:[0,1.45,0],minDistance:4.5,maxDistance:17,enablePan:true,onPick:onRisk,ariaLabel:'Sala elétrica tridimensional didática para inspeção de riscos'});await vp.init();
  const T=vp.runtime.THREE,effects=new EffectsManager(vp),floorMat=material(T,0x333a3e,{roughness:.95}),wall=material(T,0x344b5b,{roughness:.84}),steel=material(T,0x607987,{metalness:.27,roughness:.58}),dark=material(T,0x23292d),yellow=material(T,0xd4aa38),red=material(T,0xc84e48,{emissive:0x3b0806,emissiveIntensity:.15});
  const floor=new T.Mesh(new T.PlaneGeometry(20,15),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;vp.scene.add(floor);vp.scene.add(box(T,[20,5.5,.22],[0,2.75,-5.1],wall));
  // panel fallbacks
  const p1=new T.Group();p1.position.set(-4,0,-3.9);p1.add(box(T,[2.1,3.1,.72],[0,1.55,0],steel));p1.add(box(T,[1.65,.85,.05],[0,2.15,.39],dark));vp.scene.add(p1);
  const p2=new T.Group();p2.position.set(-1.25,0,-3.9);p2.add(box(T,[2.2,3.1,.72],[0,1.55,0],steel));p2.add(box(T,[1.62,1.9,.05],[0,1.65,.39],dark));vp.scene.add(p2);
  const barrier=new T.Group();barrier.position.set(2.2,0,-1.9);for(const x of[-1.1,1.1])barrier.add(box(T,[.12,1.1,.12],[x,.55,0],yellow));barrier.add(box(T,[2.45,.2,.12],[0,.88,0],yellow));vp.scene.add(barrier);
  const cable=new T.Group();cable.position.set(3.3,0,2.4);cable.add(box(T,[4.6,.14,.75],[0,.07,0],dark));vp.scene.add(cable);
  const sign=box(T,[1.5,.8,.08],[4.4,2.6,-4.95],yellow);vp.scene.add(sign);
  const instancing=new InstancingManager(T,vp.scene);
  instancing.createBoxes({
    size:[.34,.05,.68],
    material:yellow,
    name:'electrical-floor-delimiters',
    castShadow:false,
    transforms:Array.from({length:8},(_,i)=>({position:[-4.6+i*1.15,.035,-1.85]}))
  });
  const worker=createCharacterRig(T,{x:3.1,z:-.8,helmet:true,vest:true,pose:'inspect',rotationY:-1.1});worker.root.scale.setScalar(.88);vp.scene.add(worker.root);const motion=createCharacterMotion(worker,{initial:'inspect'});
  // dynamic warning-only effect near exposed panel, reduced by quality
  effects.sparks({position:[-.7,2.15,-3.45],count:18,radius:.55});effects.beacon({position:[4.4,3.2,-4.55],color:0xffb13b,intensity:.8,distance:5});
  const markers={'open-panel':[-.65,2.1,-3.2],'cable-route':[3.2,.22,2.2],'restricted-access':[2.1,1,-1.8],'working-zone':[-3.8,.2,-1.8],'worker-position':[3.05,1.4,-.7],'warning':[4.35,2.7,-4.55]};
  const activeSet=new Set(activeRiskIds?.length?activeRiskIds:Object.keys(markers));
  const markerOffsets=variant?.markerOffsets3d??{};
  for(const[id,pos]of Object.entries(markers)){
    if(!activeSet.has(id))continue;
    const off=markerOffsets[id]??[0,0,0];
    const finalPos=[pos[0]+(off[0]||0),pos[1]+(off[1]||0),pos[2]+(off[2]||0)];
    const m=marker(T,id,finalPos,found.includes(id));vp.scene.add(m);vp.addPickable(m,id);
  }
  const hud=status(host,'G6 • carregando pack elétrico');const pack='assets/modules/eletricidade/g6/manifest.json';let ok=0;
  const a1=await asset(context,vp,pack,'panel',{position:[-4,0,-3.9]});if(a1){p1.visible=false;ok++}
  const a2=await asset(context,vp,pack,'panel',{position:[-1.25,0,-3.9]});if(a2){p2.visible=false;ok++}
  const ab=await asset(context,vp,pack,'barrier',{position:[2.2,0,-1.9]});if(ab){barrier.visible=false;ok++}
  const ac=await asset(context,vp,pack,'cable_guard',{position:[3.3,0,2.4],scale:[1.65,1,1]});if(ac){cable.visible=false;ok++}
  const as=await asset(context,vp,pack,'warning_sign',{position:[4.4,2.2,-4.9],scale:[1.1,1.1,1.1]});if(as){sign.visible=false;ok++}
  hud.textContent=`G6 • ${ok}/5 instâncias GLB • luz elétrica • efeitos adaptativos • ${context.qualityManager.level}`;
  vp.addAnimator(({delta,elapsed})=>{motion.update(delta,elapsed);worker.root.rotation.y=-1.1+Math.sin(elapsed*.4)*.08});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{motion.dispose();worker.dispose();effects.dispose();instancing.dispose();old()};return{dispose:()=>vp.dispose(),viewport:vp};
}

export async function createIncendio3D(host,context,{stepIndex=0,answers=[]}={}){
  const vp=new ThreeViewport(host,context,{visualProfile:'electrical',contextProps:false,scenicProps:false,atmosphereProfile:'emergency',environmentPreset:'emergency',cameraPosition:[9,5.7,11.5],target:[0,1.4,0],minDistance:5,maxDistance:18,enablePan:true,ariaLabel:'Edificação tridimensional com rotas e fumaça para simulação de evacuação'});await vp.init();
  const T=vp.runtime.THREE,effects=new EffectsManager(vp),floorMat=material(T,0x363a3b,{roughness:.96}),wall=material(T,0xb8b7b0,{roughness:.9}),dark=material(T,0x252b2e),green=material(T,0x3f9f68,{emissive:0x123b24,emissiveIntensity:.25}),red=material(T,0xb9433e,{emissive:0x3b0907,emissiveIntensity:.24});
  const floor=new T.Mesh(new T.PlaneGeometry(20,15),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;vp.scene.add(floor);
  // low walls define two corridors, open roof for inspection
  vp.scene.add(box(T,[20,2.8,.2],[0,1.4,-5],wall));vp.scene.add(box(T,[20,2.8,.2],[0,1.4,5],wall));vp.scene.add(box(T,[.2,2.8,10],[-9.9,1.4,0],wall));
  vp.scene.add(box(T,[.2,2.8,5.5],[-1.4,1.4,-2.25],wall));vp.scene.add(box(T,[.2,2.8,5.2],[3.2,1.4,2.4],wall));
  const doorFallback=new T.Group();doorFallback.position.set(8.8,0,1.5);doorFallback.add(box(T,[1.8,3,.16],[0,1.5,0],green));vp.scene.add(doorFallback);
  const signFallback=box(T,[1.45,.55,.1],[7.8,3.4,1.4],green);vp.scene.add(signFallback);
  const alarmFallback=box(T,[.5,.7,.15],[-7.6,1.8,-4.82],red);vp.scene.add(alarmFallback);
  const extFallback=new T.Group();extFallback.position.set(5.8,0,-3.8);extFallback.add(cylinder(T,.22,.95,[0,.52,0],red));vp.scene.add(extFallback);
  const person=createCharacterRig(T,{x:-7,z:2.6,helmet:false,vest:false,pose:'walk',rotationY:-1.35});person.root.scale.setScalar(.85);vp.scene.add(person.root);const motion=createCharacterMotion(person,{initial:'walk',speed:.9});
  // quality-adaptive smoke becomes denser after initial step, but remains illustrative only
  const smokeCount=stepIndex===0?48:stepIndex===1?90:65;effects.smoke({position:[-1.3,.2,-1.4],spread:[3.3,2.8,2.8],count:smokeCount,size:.42,opacity:.15,rise:.32});
  effects.beacon({position:[-7.6,2.45,-4.35],color:0xff5148,intensity:1.15,distance:7});
  const safeRoute=[[-7,0.16,2.6],[-4.2,.16,3.8],[-.5,.16,3.7],[3.7,.16,3.4],[7.8,.16,1.7],[9,.16,1.5]];effects.routePulse(safeRoute,{color:0x58d68d,speed:.16,count:9});
  if(stepIndex===1)effects.routePulse([[-7,.17,2.4],[-4,.17,1],[-1.2,.17,-1.3]],{color:0xec7063,speed:.12,count:5});
  const hud=status(host,'G6 • carregando pack emergência');const pack='assets/modules/incendio-evacuacao/g6/manifest.json';let ok=0;
  if(await asset(context,vp,pack,'exit_door',{position:[8.8,0,1.5]})){doorFallback.visible=false;ok++}
  if(await asset(context,vp,pack,'exit_sign',{position:[7.8,3.12,1.4]})){signFallback.visible=false;ok++}
  if(await asset(context,vp,pack,'alarm',{position:[-7.6,1.45,-4.82]})){alarmFallback.visible=false;ok++}
  if(await asset(context,vp,pack,'extinguisher_cabinet',{position:[5.8,0,-3.8]})){extFallback.visible=false;ok++}
  hud.textContent=`G6 • ${ok}/4 props GLB • fumaça/rota adaptativas • etapa ${Math.min(stepIndex+1,4)} • ${context.qualityManager.level}`;
  vp.addAnimator(({delta,elapsed})=>{motion.update(delta,elapsed);person.root.position.x=-7+Math.sin(elapsed*.38)*.45});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{motion.dispose();person.dispose();effects.dispose();old()};return{dispose:()=>vp.dispose(),viewport:vp};
}
