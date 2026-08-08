import {ThreeViewport} from './three-runtime.js';
import {InstancingManager} from './instancing-manager.js';
import {createCharacterRig} from './character-rig.js';
import {createCharacterMotion} from './character-motion.js';

const PACK='assets/sectors/almoxarifado/g1/manifest.json';

function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.8,metalness:.04,...extra})}
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
    console.warn(`[TST360 Almoxarifado G1] fallback procedural: ${id}`,error);
    return null;
  }
}
function shell(T,vp){
  const floor=mat(T,0x555d61,{roughness:.95});
  const wall=mat(T,0xc8d0d3,{roughness:.9});
  const ground=new T.Mesh(new T.PlaneGeometry(30,20),floor);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;vp.scene.add(ground);
  vp.scene.add(box(T,[30,6,.25],[0,3,-7.1],wall));
  for(const x of[-10,-3,4,10]){
    const light=new T.PointLight(0xf3f8fa,.38,9,2);light.position.set(x,5,-1);vp.scene.add(light);
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
function addRackRows(T,inst,positions){
  const steel=mat(T,0x667985,{metalness:.22,roughness:.56});
  inst.createBoxes({
    size:[.14,3.3,.14],material:steel,name:'warehouse-rack-posts',
    transforms:positions.flatMap(([x,z])=>[
      {position:[x-1.4,1.65,z-.58]},{position:[x+1.4,1.65,z-.58]},
      {position:[x-1.4,1.65,z+.58]},{position:[x+1.4,1.65,z+.58]}
    ])
  });
  inst.createBoxes({
    size:[3,.1,1.25],material:steel,name:'warehouse-rack-shelves',
    transforms:positions.flatMap(([x,z])=>[.55,1.65,2.75].map(y=>({position:[x,y,z]})))
  });
}
function addBoxes(T,inst,transforms){
  const cardboard=mat(T,0x9d6b3e,{roughness:.88});
  inst.createBoxes({size:[1,1,.9],material:cardboard,name:'warehouse-cartons',transforms});
}

async function buildStorage(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'warehouse',environmentPreset:'industrial',cameraPosition:[13,7.4,15],target:[0,1.4,0],
    minDistance:6,maxDistance:27,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Almoxarifado tridimensional para inspeção de armazenamento e prateleiras'
  });
  await vp.init();
  const T=vp.runtime.THREE;shell(T,vp);
  const variantId=state.variant?.id||'A';
  const layouts={
    A:{focusRack:[-5.3,0,-3.2],stack:[6.2,0,-2.0],aisle:[.4,.04,2.0],high:[-5.3,3.0,-3.0]},
    B:{focusRack:[-3.8,0,-3.4],stack:[7.0,0,-.6],aisle:[1.8,.04,2.8],high:[-3.8,3.1,-3.2]},
    C:{focusRack:[-6.3,0,-2.2],stack:[4.6,0,-3.3],aisle:[-1.0,.04,3.0],high:[-6.3,3.1,-2.0]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x687b86,{metalness:.23,roughness:.55}),card=mat(T,0x9b683b,{roughness:.88}),wood=mat(T,0x805a37,{roughness:.9}),yellow=mat(T,0xd8aa35);

  const inst=new InstancingManager(T,vp.scene);
  addRackRows(T,inst,[[0,-4.1],[4,-4.1],[9,-4.1],[-10,-4.1]]);
  addBoxes(T,inst,[
    {position:[0,.52,-4.05]},{position:[1.0,.52,-4.05]},{position:[4,.52,-4.05]},{position:[5,.52,-4.05]},
    {position:[9,.52,-4.05]},{position:[10,.52,-4.05]},{position:[0,1.6,-4.05],scale:[.85,.85,.85]},
    {position:[4,1.6,-4.05],scale:[.9,.9,.9]},{position:[9,1.6,-4.05],scale:[.8,.8,.8]}
  ]);

  const rackFallback=new T.Group();rackFallback.position.set(...layout.focusRack);
  rackFallback.add(box(T,[3,.12,1.3],[0,.55,0],steel),box(T,[3,.12,1.3],[0,1.65,0],steel),box(T,[3,.12,1.3],[0,2.75,0],steel));
  rackFallback.add(box(T,[.14,3.4,.14],[-1.4,1.7,-.55],steel),box(T,[.14,3.4,.14],[1.4,1.7,-.55],steel));vp.scene.add(rackFallback);

  const stackFallback=new T.Group();stackFallback.position.set(...layout.stack);
  stackFallback.add(box(T,[2.3,.18,1.55],[0,.12,0],wood));
  stackFallback.add(box(T,[1.0,1.0,1.25],[-.52,.78,0],card),box(T,[1.0,1.0,1.25],[.52,.82,.05],card),box(T,[1.6,.8,1.1],[.25,1.72,.08],card));vp.scene.add(stackFallback);

  // material reduzindo corredor
  addBoxes(T,inst,[
    {position:[layout.aisle[0],.5,layout.aisle[2]]},
    {position:[layout.aisle[0]+.85,.48,layout.aisle[2]+.25],scale:[.85,.9,.85]}
  ]);

  // objeto elevado didático
  const highItem=box(T,[.9,.65,.8],[layout.high[0],layout.high[1],layout.high[2]],card);highItem.rotation.z=.09;vp.scene.add(highItem);

  const tst=createCharacterRig(T,{x:10,z:4.2,helmet:false,vest:true,pose:'inspect',rotationY:2.7});tst.root.scale.setScalar(.9);vp.scene.add(tst.root);
  const tstMotion=createCharacterMotion(tst,{initial:'inspect'});

  activeMarkers(T,vp,state,{
    'stack':[layout.stack[0]+.15,2.3,layout.stack[2]],
    'rack':[layout.focusRack[0],2.0,layout.focusRack[2]+.7],
    'aisle':[layout.aisle[0]+.4,.3,layout.aisle[2]],
    'high-item':[layout.high[0],layout.high[1]+.45,layout.high[2]]
  });

  const hud=status(host,'Almoxarifado G1 • carregando armazenamento');
  let ok=0;
  const rack=await loadPack(context,vp,'rack',{position:layout.focusRack});if(rack){rackFallback.visible=false;ok++}
  const stack=await loadPack(context,vp,'pallet-stack',{position:layout.stack});if(stack){stackFallback.visible=false;ok++}
  const carton=await loadPack(context,vp,'carton',{position:layout.high});if(carton){highItem.visible=false;ok++}
  hud.textContent=`Almoxarifado G1 • variante ${variantId} • ${ok}/3 assets GLB • ${inst.stats().instances} instâncias • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{tstMotion.update(delta,elapsed);tst.root.rotation.y=2.7+Math.sin(elapsed*.34)*.07});
  const old=vp.dispose.bind(vp);vp.dispose=()=>{tstMotion.dispose();tst.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

async function buildPicking(host,context,state){
  const vp=new ThreeViewport(host,context,{
    visualProfile:'warehouse',environmentPreset:'industrial',cameraPosition:[13,7.1,15],target:[0,1.3,0],
    minDistance:6,maxDistance:27,enablePan:true,onPick:state.onRisk,
    ariaLabel:'Almoxarifado 3D para inspeção de separação e movimentação de pedidos'
  });
  await vp.init();
  const T=vp.runtime.THREE;shell(T,vp);
  const variantId=state.variant?.id||'A';
  const layouts={
    A:{worker:[-3.4,0,1.2],cart:[2.5,0,2.5],floor:[.3,.08,3.2],reach:[6.0,0,-3.2]},
    B:{worker:[-1.5,0,2.2],cart:[4.4,0,1.6],floor:[1.5,.08,3.8],reach:[7.3,0,-2.4]},
    C:{worker:[-4.8,0,.5],cart:[1.0,0,3.0],floor:[-1.7,.08,2.8],reach:[4.7,0,-3.7]}
  };
  const layout=layouts[variantId]||layouts.A;
  const steel=mat(T,0x687b86,{metalness:.22,roughness:.55}),card=mat(T,0x9d6b3e,{roughness:.88}),dark=mat(T,0x30373b),yellow=mat(T,0xd9aa35);

  const inst=new InstancingManager(T,vp.scene);
  addRackRows(T,inst,[[-8,-4.0],[-3.8,-4.0],[4.5,-4.0],[8.5,-4.0]]);
  addBoxes(T,inst,[
    {position:[-8,.52,-4]},{position:[-3.8,.52,-4]},{position:[4.5,.52,-4]},{position:[8.5,.52,-4]},
    {position:[4.5,1.6,-4],scale:[.82,.82,.82]},{position:[8.5,2.7,-4],scale:[.72,.72,.72]}
  ]);

  const cartFallback=new T.Group();cartFallback.position.set(...layout.cart);
  cartFallback.add(box(T,[1.4,.18,2],[0,.55,0],steel),box(T,[1.35,1.1,.12],[0,1.1,-.88],steel));vp.scene.add(cartFallback);

  const loose=box(T,[1.1,.22,.75],layout.floor,card);loose.rotation.y=.35;vp.scene.add(loose);
  const reachBox=box(T,[.9,.8,.8],[layout.reach[0],2.85,layout.reach[2]],card);vp.scene.add(reachBox);

  const worker=createCharacterRig(T,{x:layout.worker[0],z:layout.worker[2],helmet:false,vest:false,pose:'crouch',rotationY:-1.0});worker.root.scale.setScalar(.9);vp.scene.add(worker.root);
  const motion=createCharacterMotion(worker,{initial:'crouch'});
  const reacher=createCharacterRig(T,{x:layout.reach[0]-1.0,z:layout.reach[2]+.8,helmet:false,vest:false,pose:'reach',rotationY:-1.8});reacher.root.scale.setScalar(.9);vp.scene.add(reacher.root);
  const reachMotion=createCharacterMotion(reacher,{initial:'reach'});
  const tst=createCharacterRig(T,{x:9.5,z:4.1,helmet:false,vest:true,pose:'inspect',rotationY:2.7});tst.root.scale.setScalar(.9);vp.scene.add(tst.root);
  const tstMotion=createCharacterMotion(tst,{initial:'inspect'});

  activeMarkers(T,vp,state,{
    'lift':[layout.worker[0]+.2,1.25,layout.worker[2]],
    'cart':[layout.cart[0],1.2,layout.cart[2]],
    'floor':[layout.floor[0],.28,layout.floor[2]],
    'reach':[layout.reach[0],3.25,layout.reach[2]]
  });

  const hud=status(host,'Almoxarifado G1 • carregando picking');
  let ok=0;
  const cart=await loadPack(context,vp,'picking-cart',{position:layout.cart});if(cart){cartFallback.visible=false;ok++}
  const floorBox=await loadPack(context,vp,'carton',{position:layout.floor,rotation:[0,.35,0],scale:[1,.25,.8]});if(floorBox){loose.visible=false;ok++}
  const topBox=await loadPack(context,vp,'carton',{position:[layout.reach[0],2.35,layout.reach[2]],scale:[.8,.8,.8]});if(topBox){reachBox.visible=false;ok++}
  hud.textContent=`Almoxarifado G1 • variante ${variantId} • ${ok}/3 assets GLB • ${inst.stats().instances} instâncias • ${context.qualityManager.level}`;

  vp.addAnimator(({delta,elapsed})=>{
    motion.update(delta,elapsed);reachMotion.update(delta,elapsed);tstMotion.update(delta,elapsed);
    reacher.root.rotation.y=-1.8+Math.sin(elapsed*.4)*.06;
  });
  const old=vp.dispose.bind(vp);vp.dispose=()=>{motion.dispose();reachMotion.dispose();tstMotion.dispose();worker.dispose();reacher.dispose();tst.dispose();inst.dispose();old()};
  return {dispose:()=>vp.dispose(),viewport:vp};
}

export async function createWarehouseSector3D(host,context,state={}){
  return state.missionId==='separacao-pedidos'
    ? buildPicking(host,context,state)
    : buildStorage(host,context,state);
}
