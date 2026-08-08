import {ThreeViewport} from '../graphics/three-runtime.js';
import {InstancingManager} from '../graphics/instancing-manager.js';

const ZONES=[
  {id:'construcao',label:'Construção',pos:[-7.5,0,-5.3],size:[5,2.3,4],color:0xb58a48},
  {id:'industria',label:'Indústria',pos:[0,0,-5.3],size:[5.3,3.2,4],color:0x647d8d},
  {id:'porto-logistica',label:'Porto',pos:[7.5,0,-5.3],size:[5.2,2.2,4],color:0x3d7192},
  {id:'saude',label:'Hospital',pos:[-7.5,0,4.9],size:[5,2.8,4],color:0xd8e3e5},
  {id:'escritorio',label:'Escritório',pos:[0,0,4.9],size:[5.2,2.5,4],color:0x7b92a0},
  {id:'almoxarifado',label:'Almoxarifado',pos:[7.5,0,4.9],size:[5.2,2.7,4],color:0x846c52},
  {id:'oficina',label:'Oficina',pos:[-7.5,0,10.6],size:[5,2.0,3],color:0x6b7074},
  {id:'obras-eletricas',label:'Elétrica',pos:[7.5,0,10.6],size:[5,2.2,3],color:0x8b7c48}
];

function mat(T,color,extra={}){return new T.MeshStandardMaterial({color,roughness:.76,metalness:.04,...extra})}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m}

function labelSprite(T,text,color='#ffffff'){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=144;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,640,144);
  ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(8,18,624,108,18);else ctx.rect(8,18,624,108);
  ctx.fillStyle='rgba(6,13,19,.84)';ctx.fill();
  ctx.fillStyle=color;ctx.font='700 38px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,68);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.scale.set(5.3,1.2,1);sprite.userData.__campusTexture=texture;return sprite;
}

function progressMaterials(T,ratio){
  const bg=mat(T,0x263038,{roughness:.86});
  const fillColor=ratio>=1?0x58d68d:ratio>=.5?0x69b8e8:0xd8aa3f;
  const fill=mat(T,fillColor,{emissive:fillColor,emissiveIntensity:.12,roughness:.55});
  return {bg,fill};
}

function makeBuilding(T,zone,stats={completed:0,total:2},is3D=false){
  const group=new T.Group();group.position.set(...zone.pos);group.userData.riskId=`sector:${zone.id}`;
  const [w,h,d]=zone.size;
  const ratio=stats.total?Math.min(1,stats.completed/stats.total):0;
  const body=box(T,[w,h,d],[0,h/2,0],mat(T,zone.color,{roughness:.8}));
  const roofMat=mat(T,is3D?0x3e97c4:0x26343d,{metalness:.12,roughness:.58,emissive:is3D?0x0d3e5a:0x000000,emissiveIntensity:is3D?.22:0});
  const roof=box(T,[w*1.06,.18,d*1.06],[0,h+.09,0],roofMat);roof.userData.__sector3D=is3D;
  const door=box(T,[.85,1.55,.12],[0,.78,d/2+.07],mat(T,0x33596c,{roughness:.4}));
  group.add(body,roof,door);

  const {bg,fill}=progressMaterials(T,ratio);
  const barW=w*.72;
  const back=box(T,[barW,.16,.08],[0,h+.42,d/2+.09],bg);back.castShadow=false;
  const fillW=Math.max(.05,barW*ratio);
  const prog=box(T,[fillW,.11,.09],[-barW/2+fillW/2,h+.42,d/2+.105],fill);prog.castShadow=false;
  group.add(back,prog);

  const suffix=is3D?' • 3D':'';
  const label=labelSprite(T,`${zone.label} ${stats.completed}/${stats.total}${suffix}`,is3D?'#bfefff':'#ffffff');
  label.position.set(0,h+1.06,0);group.add(label);
  return {group,roof,ratio};
}

function makeShuttle(T,color=0x6ca8ca){
  const g=new T.Group();
  g.add(box(T,[1.35,.35,.68],[0,.42,0],mat(T,color,{roughness:.62})));
  g.add(box(T,[.72,.36,.6],[-.15,.75,0],mat(T,0x9cc9dc,{roughness:.3})));
  const tire=mat(T,0x252a2d,{roughness:.96});
  for(const x of[-.42,.42])for(const z of[-.38,.38]){
    const wheel=box(T,[.24,.24,.18],[x,.2,z],tire);g.add(wheel);
  }
  return g;
}

export async function createCampus3D(host,context,{onNavigate,progress={},sectors3D=[]}={}){
  const vp=new ThreeViewport(host,context,{
    environmentPreset:'outdoor',cameraPosition:[18,18,22],target:[0,1.4,2.2],
    minDistance:12,maxDistance:38,enablePan:true,
    ariaLabel:'Maquete tridimensional navegável do Campus Virtual TST',
    onPick:id=>{
      if(id==='campus:tools')onNavigate?.({type:'tools'});
      else if(id==='campus:home')onNavigate?.({type:'home'});
      else if(String(id).startsWith('sector:'))onNavigate?.({type:'sector',id:String(id).slice(7)});
    }
  });
  await vp.init();
  const T=vp.runtime.THREE;
  const sector3DSet=new Set(sectors3D);
  vp.scene.fog=new T.Fog(0x10212a,24,55);

  const terrain=new T.Mesh(new T.PlaneGeometry(30,31),mat(T,0x315241,{roughness:.96}));
  terrain.rotation.x=-Math.PI/2;terrain.position.z=2.5;terrain.receiveShadow=true;vp.scene.add(terrain);

  const road=mat(T,0x343c40,{roughness:.95});
  vp.scene.add(box(T,[30,.03,2.5],[0,.025,-.1],road));
  vp.scene.add(box(T,[3.0,.03,31],[0,.026,2.5],road));
  vp.scene.add(box(T,[30,.03,1.8],[0,.027,8.0],road));

  const stripe=mat(T,0xe2be49,{roughness:.85});
  const inst=new InstancingManager(T,vp.scene);
  inst.createBoxes({
    size:[.85,.035,.08],material:stripe,name:'campus-road-dashes',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:25},(_,i)=>({position:[-12+i,.045,-.1]}))
  });
  inst.createBoxes({
    size:[.08,.035,.85],material:stripe,name:'campus-road-dashes-v',castShadow:false,receiveShadow:false,
    transforms:Array.from({length:22},(_,i)=>({position:[0,.046,-7.5+i*1.2]}))
  });

  const animatedRoofs=[];
  let totalCompleted=0,totalMissions=0;
  for(const zone of ZONES){
    const st=progress[zone.id]??{completed:0,total:2,sessions:0};
    totalCompleted+=st.completed||0;totalMissions+=st.total||0;
    const built=makeBuilding(T,zone,st,sector3DSet.has(zone.id));
    vp.scene.add(built.group);vp.addPickable(built.group,`sector:${zone.id}`);
    if(sector3DSet.has(zone.id))animatedRoofs.push(built.roof);
  }

  const central=new T.Group();central.position.set(0,0,1.6);central.userData.riskId='campus:tools';
  const centralBody=box(T,[4.2,3.2,3.2],[0,1.6,0],mat(T,0x326b54,{roughness:.7}));
  const centralRoof=box(T,[4.5,.2,3.5],[0,3.3,0],mat(T,0x58d68d,{emissive:0x103d27,emissiveIntensity:.18}));
  central.add(centralBody,centralRoof);
  const centralLabel=labelSprite(T,'Central TST','#c9ffe0');centralLabel.position.set(0,4.2,0);central.add(centralLabel);
  vp.scene.add(central);vp.addPickable(central,'campus:tools');

  const labs=new T.Group();labs.position.set(0,0,10.6);labs.userData.riskId='campus:home';
  labs.add(box(T,[5.0,2.4,3],[0,1.2,0],mat(T,0x485f7a,{roughness:.72})));
  labs.add(box(T,[5.3,.18,3.3],[0,2.49,0],mat(T,0x26343d)));
  const labsLabel=labelSprite(T,'Laboratórios','#d8eaff');labsLabel.position.set(0,3.4,0);labs.add(labsLabel);
  vp.scene.add(labs);vp.addPickable(labs,'campus:home');

  const treeTrunk=mat(T,0x654a33,{roughness:.95});
  inst.createBoxes({
    size:[.16,1.0,.16],material:treeTrunk,name:'campus-trees',transforms:[
      {position:[-12,.5,-1.8]},{position:[12,.5,-1.8]},{position:[-12,.5,8.7]},{position:[12,.5,8.7]},
      {position:[-4,.5,13.8]},{position:[4,.5,13.8]}
    ]
  });

  // animações ambientais leves por perfil gráfico
  const shuttleA=makeShuttle(T,0x68a8c8);shuttleA.position.set(-12,.02,-.45);vp.scene.add(shuttleA);
  const shuttleB=makeShuttle(T,0xd49a4b);shuttleB.rotation.y=Math.PI/2;shuttleB.position.set(.45,.02,-7);vp.scene.add(shuttleB);

  const hud=document.createElement('div');hud.className='g3-asset-status g5-status';
  hud.textContent=`Campus G8.7 • ${totalCompleted}/${totalMissions} missões • ${sector3DSet.size} setores 3D • ${inst.stats().instances} instâncias • ${context.qualityManager.level}`;
  host.append(hud);

  vp.addAnimator(({elapsed})=>{
    const level=context.qualityManager.level;
    const envEnabled=level!=='eco';
    shuttleA.visible=envEnabled;
    shuttleB.visible=level==='high'||level==='ultra';
    if(shuttleA.visible)shuttleA.position.x=-12+(elapsed*1.05)%24;
    if(shuttleB.visible)shuttleB.position.z=-7+(elapsed*.78)%20;
    const pulse=.16+.08*(.5+.5*Math.sin(elapsed*1.4));
    centralRoof.material.emissiveIntensity=pulse;
    for(let i=0;i<animatedRoofs.length;i++){
      animatedRoofs[i].material.emissiveIntensity=.16+.08*(.5+.5*Math.sin(elapsed*1.2+i*.7));
    }
    central.rotation.y=Math.sin(elapsed*.18)*.025;
  });

  const old=vp.dispose.bind(vp);
  vp.dispose=()=>{
    vp.scene?.traverse(obj=>{
      if(obj.isSprite){
        obj.material?.map?.dispose?.();
        obj.material?.dispose?.();
      }
    });
    inst.dispose();old();
  };
  return {dispose:()=>vp.dispose(),viewport:vp};
}
