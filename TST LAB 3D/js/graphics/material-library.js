function canvasTexture(T,cache,key,draw,size=128){
  if(cache.has(key))return cache.get(key);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d');draw(ctx,size);
  const texture=new T.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.colorSpace=T.SRGBColorSpace;
  texture.needsUpdate=true;
  cache.set(key,texture);
  return texture;
}

function seeded(seed){
  let value=seed>>>0;
  return()=>((value=(value*1664525+1013904223)>>>0)/4294967296);
}

export class MaterialLibrary{
  constructor(viewport){
    this.viewport=viewport;
    this.T=viewport.runtime.THREE;
    this.created=[];
    this.textureCache=new Map();
  }

  texture(kind='concrete'){
    const T=this.T;
    if(kind==='concrete')return canvasTexture(T,this.textureCache,'g9-concrete',(ctx,size)=>{
      ctx.fillStyle='#81888b';ctx.fillRect(0,0,size,size);
      const rnd=seeded(9173);
      for(let i=0;i<1100;i++){
        const g=90+Math.floor(rnd()*70),a=.035+rnd()*.10;
        ctx.fillStyle=`rgba(${g},${g},${g},${a})`;
        const r=.25+rnd()*1.4;ctx.fillRect(rnd()*size,rnd()*size,r,r);
      }
      for(let i=0;i<10;i++){
        ctx.strokeStyle=`rgba(45,50,53,${.03+rnd()*.04})`;ctx.lineWidth=.35+rnd()*.7;
        ctx.beginPath();let x=rnd()*size,y=rnd()*size;ctx.moveTo(x,y);
        for(let s=0;s<4;s++){x+=(rnd()-.5)*24;y+=(rnd()-.5)*18;ctx.lineTo(x,y)}
        ctx.stroke();
      }
    });
    if(kind==='metal')return canvasTexture(T,this.textureCache,'g9-metal',(ctx,size)=>{
      const grad=ctx.createLinearGradient(0,0,size,0);grad.addColorStop(0,'#788188');grad.addColorStop(.5,'#a2a9ad');grad.addColorStop(1,'#6f7980');ctx.fillStyle=grad;ctx.fillRect(0,0,size,size);
      const rnd=seeded(5531);
      for(let i=0;i<180;i++){ctx.fillStyle=`rgba(255,255,255,${.015+rnd()*.035})`;ctx.fillRect(0,rnd()*size,size,.4+rnd()*.7)}
    });
    if(kind==='rubber')return canvasTexture(T,this.textureCache,'g9-rubber',(ctx,size)=>{
      ctx.fillStyle='#282d30';ctx.fillRect(0,0,size,size);
      const rnd=seeded(3319);
      for(let i=0;i<650;i++){const g=32+Math.floor(rnd()*30);ctx.fillStyle=`rgba(${g},${g},${g},${.05+rnd()*.1})`;ctx.fillRect(rnd()*size,rnd()*size,1,1)}
    });

    if(kind==='asphalt')return canvasTexture(T,this.textureCache,'g105-asphalt',(ctx,size)=>{
      ctx.fillStyle='#4b5053';ctx.fillRect(0,0,size,size);const rnd=seeded(11971);
      for(let i=0;i<950;i++){const g=48+Math.floor(rnd()*60);ctx.fillStyle=`rgba(${g},${g},${g},${.04+rnd()*.11})`;const r=.35+rnd()*1.3;ctx.fillRect(rnd()*size,rnd()*size,r,r)}
    });
    if(kind==='tile')return canvasTexture(T,this.textureCache,'g105-tile',(ctx,size)=>{
      ctx.fillStyle='#a9b4b6';ctx.fillRect(0,0,size,size);ctx.strokeStyle='rgba(48,64,68,.22)';ctx.lineWidth=2;
      const step=size/4;for(let x=0;x<=size;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,size);ctx.stroke()}for(let y=0;y<=size;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke()}
    });
    if(kind==='wood')return canvasTexture(T,this.textureCache,'g105-wood',(ctx,size)=>{
      ctx.fillStyle='#72543d';ctx.fillRect(0,0,size,size);const rnd=seeded(16127);
      for(let i=0;i<90;i++){const y=rnd()*size;ctx.strokeStyle=`rgba(45,28,18,${.05+rnd()*.12})`;ctx.lineWidth=.4+rnd()*1.1;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(size*.3,y+(rnd()-.5)*8,size*.7,y+(rnd()-.5)*8,size,y+(rnd()-.5)*4);ctx.stroke()}
    });
    if(kind==='epoxy')return canvasTexture(T,this.textureCache,'g105-epoxy',(ctx,size)=>{
      const grad=ctx.createLinearGradient(0,0,size,size);grad.addColorStop(0,'#637078');grad.addColorStop(.5,'#4f5d65');grad.addColorStop(1,'#68757c');ctx.fillStyle=grad;ctx.fillRect(0,0,size,size);const rnd=seeded(18217);
      for(let i=0;i<180;i++){ctx.fillStyle=`rgba(255,255,255,${.012+rnd()*.028})`;ctx.fillRect(rnd()*size,rnd()*size,1+rnd()*2,.5+rnd())}
    });
    if(kind==='painted')return canvasTexture(T,this.textureCache,'g9-painted',(ctx,size)=>{
      ctx.fillStyle='#b6bfc3';ctx.fillRect(0,0,size,size);
      const rnd=seeded(7727);
      for(let i=0;i<320;i++){ctx.fillStyle=`rgba(255,255,255,${.025+rnd()*.04})`;ctx.fillRect(rnd()*size,rnd()*size,.5+rnd(),.5+rnd())}
    });
    return null;
  }

  create(kind='painted',color=0xffffff,options={}){
    const T=this.T;
    const presets={
      concrete:{roughness:.94,metalness:.01,map:'concrete',repeat:[4,4]},
      steel:{roughness:.48,metalness:.48,map:'metal',repeat:[2,6]},
      paintedMetal:{roughness:.58,metalness:.22,map:'painted',repeat:[3,3]},
      rubber:{roughness:.96,metalness:0,map:'rubber',repeat:[5,5]},
      safety:{roughness:.62,metalness:.08,map:'painted',repeat:[3,3]},
      fabric:{roughness:.95,metalness:0,map:null},
      asphalt:{roughness:.98,metalness:0,map:'asphalt',repeat:[5,5]},
      tile:{roughness:.72,metalness:.02,map:'tile',repeat:[4,4]},
      wood:{roughness:.8,metalness:0,map:'wood',repeat:[4,2]},
      epoxy:{roughness:.52,metalness:.04,map:'epoxy',repeat:[4,4]}
    };
    const p={...(presets[kind]??presets.paintedMetal),...options};
    const texture=p.map?this.texture(p.map):null;
    if(texture&&p.repeat)texture.repeat.set(...p.repeat);
    const material=new T.MeshStandardMaterial({
      color,roughness:p.roughness,metalness:p.metalness,
      map:texture??null,
      emissive:p.emissive??0x000000,
      emissiveIntensity:p.emissiveIntensity??0
    });
    material.userData.g9MaterialKind=kind;
    this.created.push(material);
    return material;
  }

  enhanceMaterial(material,quality='medium',mesh=null){
    if(!material?.isMeshStandardMaterial)return;
    material.userData.g9Enhanced=true;
    const high=quality==='high'||quality==='ultra';
    const isFloor=mesh?.geometry?.type==='PlaneGeometry'&&Math.abs((mesh.rotation?.x??0)+Math.PI/2)<.22;
    if(isFloor&&!material.userData.g9OriginalMapStored){
      material.userData.g9OriginalMap=material.map??null;
      material.userData.g9OriginalMapStored=true;
    }
    if(isFloor&&!material.userData.g9OriginalMap&&high){
      const texture=this.texture('concrete');
      texture.repeat.set(quality==='ultra'?7:5,quality==='ultra'?7:5);
      material.map=texture;
    }else if(isFloor&&!high&&material.userData.g9OriginalMapStored){
      material.map=material.userData.g9OriginalMap??null;
    }
    if(material.map){
      const max=this.viewport.renderer.capabilities.getMaxAnisotropy?.()??1;
      material.map.anisotropy=high?Math.min(max,quality==='ultra'?8:4):1;
    }
    material.envMapIntensity=quality==='eco'?.25:quality==='medium'?.45:quality==='high'?.7:.9;
    if(material.metalness>.15)material.roughness=Math.max(.32,material.roughness??.55);
    material.needsUpdate=true;
  }

  dispose(){
    for(const material of this.created.splice(0))material.dispose?.();
    for(const texture of this.textureCache.values())texture.dispose?.();
    this.textureCache.clear();
  }
}
