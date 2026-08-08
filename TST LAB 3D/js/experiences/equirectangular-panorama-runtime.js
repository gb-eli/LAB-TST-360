import {loadThreeRuntime} from '../graphics/three-runtime.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function panoramaTierCandidates(image360,level='medium',settings=null){
  if(!image360?.tiers||level==='eco'||settings?.panoramaImage360===false)return[];
  const preferred=settings?.panoramaImageTier??level;
  const order={
    medium:['medium'],
    high:['high','medium'],
    ultra:['ultra','high','medium']
  }[preferred]??['medium'];
  return order
    .map(key=>image360.tiers[key]?.src?{key,...image360.tiers[key]}:null)
    .filter(Boolean);
}

export function panoramaTierForQuality(image360,level='medium',settings=null){
  return panoramaTierCandidates(image360,level,settings)[0]??null;
}

function hotspotUv(h,image360){
  const hasImagePoint=Number.isFinite(Number(h?.imageX))&&Number.isFinite(Number(h?.imageY));
  const transform=hasImagePoint?null:image360?.hotspotTransform;
  const u=clamp((hasImagePoint?h.imageX:h.x??50)/100,0,1);
  let v=clamp((hasImagePoint?h.imageY:h.y??50)/100,0,1);
  if(transform){
    const top=Number(transform.top??0);
    const height=Number(transform.height??1);
    v=clamp(top+v*height,0,1);
  }
  return{u,v};
}

export class EquirectangularPanoramaRuntime{
  constructor(host,context,node,{
    onHotspot=null,
    onViewChange=null,
    onFallback=null,
    onCreatePoint=null
  }={}){
    this.host=host;
    this.context=context;
    this.node=node;
    this.onHotspot=onHotspot;
    this.onViewChange=onViewChange;
    this.onFallback=onFallback;
    this.onCreatePoint=onCreatePoint;
    this.runtime=null;
    this.scene=null;
    this.camera=null;
    this.renderer=null;
    this.sphere=null;
    this.texture=null;
    this.hotspotLayer=null;
    this.hotspotButtons=[];
    this.resizeObserver=null;
    this.frame=0;
    this.disposed=false;
    this.dragging=false;
    this.pointerId=null;
    this.startX=0;
    this.startY=0;
    this.startYaw=0;
    this.startPitch=0;
    this.yaw=0;
    this.pitch=0;
    this.fov=72;
    this.listeners=[];
    this.offQuality=null;
    this.loadedTier=null;
  }

  async mount(){
    const tiers=panoramaTierCandidates(this.node.image360,this.context.qualityManager.level,this.context.qualityManager.settings);
    if(!tiers.length)throw new Error('Perfil gráfico sem imagem 360 ativa.');

    this.runtime=await loadThreeRuntime();
    const {THREE}=this.runtime;

    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(this.fov,1,.05,40);
    this.camera.rotation.order='YXZ';

    this.renderer=new THREE.WebGLRenderer({
      antialias:this.context.qualityManager.level!=='medium',
      alpha:false,
      powerPreference:'high-performance'
    });
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.domElement.className='panorama-image360-canvas';
    this.renderer.domElement.setAttribute('aria-label',`${this.node.title} — panorama equiretangular 360`);
    this.host.appendChild(this.renderer.domElement);

    this.hotspotLayer=document.createElement('div');
    this.hotspotLayer.className='panorama-image360-hotspots';
    this.host.appendChild(this.hotspotLayer);

    await this.loadBestTier(tiers);
    this.buildSphere();
    this.buildHotspots();
    this.setFromOffset(this.node.startOffset??0);
    this.bind();

    this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.animate();

    this.offQuality=this.context.events?.on?.('quality:changed',()=>this.handleQualityChange());
    return this;
  }

  async loadBestTier(candidates){
    let lastError=null;
    for(const tier of candidates){
      try{
        await this.loadTier(tier);
        return tier;
      }catch(error){
        lastError=error;
        console.warn(`[TST360 image360] Tier ${tier.key} indisponível; tentando fallback.`,error);
      }
    }
    throw lastError??new Error('Nenhum tier de panorama 360 pôde ser carregado.');
  }

  async loadTier(tier){
    const {THREE}=this.runtime;
    const source=await new Promise((resolve,reject)=>{
      const loader=new THREE.TextureLoader();
      loader.load(tier.src,resolve,undefined,reject);
    });
    source.colorSpace=THREE.SRGBColorSpace;
    source.minFilter=THREE.LinearFilter;
    source.magFilter=THREE.LinearFilter;
    source.generateMipmaps=true;
    this.texture?.dispose?.();
    this.texture=source;
    this.loadedTier=tier.key;
  }

  buildSphere(){
    const {THREE}=this.runtime;
    const geometry=new THREE.SphereGeometry(10,64,40);
    geometry.scale(-1,1,1);
    const material=new THREE.MeshBasicMaterial({
      map:this.texture,
      side:THREE.FrontSide,
      toneMapped:false
    });
    this.sphere=new THREE.Mesh(geometry,material);
    this.scene.add(this.sphere);
  }

  buildHotspots(){
    this.hotspotLayer.replaceChildren();
    this.hotspotButtons=(this.node.hotspots??[]).map((hotspot,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='panorama-image360-hotspot';
      button.dataset.category=hotspot.category??'note';
      button.dataset.index=String(index);
      button.innerHTML=`<span>${hotspot.action?.type==='node'?'⇢':hotspot.action?.type==='experience'?'↗':index+1}</span><b>${hotspot.label}</b>`;
      button.addEventListener('click',event=>{
        event.stopPropagation();
        this.onHotspot?.(hotspot,index);
      });
      this.hotspotLayer.appendChild(button);
      return{button,hotspot};
    });
  }

  hotspotPosition(hotspot){
    const {THREE}=this.runtime;
    const {u,v}=hotspotUv(hotspot,this.node.image360);
    const phi=u*Math.PI*2;
    const latitude=(.5-v)*Math.PI;
    const r=8.8;
    const cosLat=Math.cos(latitude);
    return new THREE.Vector3(
      Math.cos(phi)*cosLat*r,
      Math.sin(latitude)*r,
      Math.sin(phi)*cosLat*r
    );
  }

  imagePointFromDirection(direction){
    const dir=direction.clone().normalize();
    const phi=(Math.atan2(dir.z,dir.x)+Math.PI*2)%(Math.PI*2);
    const latitude=Math.asin(clamp(dir.y,-1,1));
    return{
      x:phi/(Math.PI*2)*100,
      y:(.5-latitude/Math.PI)*100
    };
  }

  updateHotspots(){
    if(!this.camera||!this.renderer)return;
    const {THREE}=this.runtime;
    const width=this.renderer.domElement.clientWidth||1;
    const height=this.renderer.domElement.clientHeight||1;
    const cameraDirection=new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);

    for(const entry of this.hotspotButtons){
      const world=this.hotspotPosition(entry.hotspot);
      const direction=world.clone().normalize();
      const visible=cameraDirection.dot(direction)>.12;
      if(!visible){
        entry.button.hidden=true;
        continue;
      }
      const projected=world.clone().project(this.camera);
      const inView=projected.z<1&&Math.abs(projected.x)<=1.18&&Math.abs(projected.y)<=1.18;
      entry.button.hidden=!inView;
      if(inView){
        const x=(projected.x*.5+.5)*width;
        const y=(-projected.y*.5+.5)*height;
        entry.button.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      }
    }
  }

  currentImagePoint(){
    if(!this.camera||!this.runtime)return{x:50,y:50};
    const direction=new this.runtime.THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return this.imagePointFromDirection(direction);
  }

  setFromOffset(offset){
    this.yaw=clamp(offset,0,75)/75*360;
    this.pitch=0;
    this.applyCamera();
  }

  applyCamera(){
    if(!this.camera)return;
    const {THREE}=this.runtime;
    const heading=THREE.MathUtils.degToRad(this.yaw);
    this.camera.rotation.y=-heading-Math.PI/2;
    this.camera.rotation.x=THREE.MathUtils.degToRad(this.pitch);
    this.camera.fov=this.fov;
    this.camera.updateProjectionMatrix();
    this.onViewChange?.({
      yaw:this.yaw,
      pitch:this.pitch,
      fov:this.fov,
      degree:Math.round(((this.yaw%360)+360)%360)
    });
  }

  nudge(deltaDegrees){
    this.yaw=(this.yaw+deltaDegrees+360)%360;
    this.applyCamera();
  }

  reset(){
    this.fov=72;
    this.setFromOffset(this.node.startOffset??0);
  }

  bind(){
    const canvas=this.renderer.domElement;
    const on=(target,event,fn,options)=>{
      target.addEventListener(event,fn,options);
      this.listeners.push(()=>target.removeEventListener(event,fn,options));
    };

    on(canvas,'pointerdown',event=>{
      this.dragging=true;
      this.pointerId=event.pointerId;
      this.startX=event.clientX;
      this.startY=event.clientY;
      this.startYaw=this.yaw;
      this.startPitch=this.pitch;
      canvas.setPointerCapture?.(event.pointerId);
      canvas.classList.add('dragging');
    });

    on(canvas,'pointermove',event=>{
      if(!this.dragging)return;
      const width=Math.max(1,canvas.clientWidth);
      const height=Math.max(1,canvas.clientHeight);
      this.yaw=(this.startYaw-(event.clientX-this.startX)/width*105+360)%360;
      this.pitch=clamp(this.startPitch-(event.clientY-this.startY)/height*70,-62,62);
      this.applyCamera();
    });

    const end=event=>{
      this.dragging=false;
      canvas.classList.remove('dragging');
      try{canvas.releasePointerCapture?.(event.pointerId)}catch{}
    };
    on(canvas,'pointerup',end);
    on(canvas,'pointercancel',end);

    on(canvas,'dblclick',event=>{
      if(!this.onCreatePoint)return;
      const {THREE}=this.runtime;
      const rect=canvas.getBoundingClientRect();
      const ndc=new THREE.Vector3(
        ((event.clientX-rect.left)/Math.max(1,rect.width))*2-1,
        -((event.clientY-rect.top)/Math.max(1,rect.height))*2+1,
        .5
      );
      const direction=ndc.unproject(this.camera).sub(this.camera.position).normalize();
      this.onCreatePoint(this.imagePointFromDirection(direction));
    });

    on(canvas,'wheel',event=>{
      event.preventDefault();
      this.fov=clamp(this.fov+Math.sign(event.deltaY)*4,42,88);
      this.applyCamera();
    },{passive:false});
  }

  async handleQualityChange(){
    if(this.disposed)return;
    const tiers=panoramaTierCandidates(this.node.image360,this.context.qualityManager.level,this.context.qualityManager.settings);
    if(!tiers.length){
      this.onFallback?.('quality-profile');
      return;
    }
    if(tiers[0]?.key===this.loadedTier)return;
    try{
      await this.loadBestTier(tiers);
      if(this.sphere?.material){
        this.sphere.material.map=this.texture;
        this.sphere.material.needsUpdate=true;
      }
    }catch(error){
      console.warn('[TST360 image360] Não foi possível trocar o tier.',error);
    }
  }

  resize(){
    if(!this.renderer||!this.camera)return;
    const rect=this.host.getBoundingClientRect();
    const width=Math.max(1,Math.floor(rect.width));
    const height=Math.max(1,Math.floor(rect.height));
    const cap=this.context.qualityManager.settings.pixelRatioCap??1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,cap));
    this.renderer.setSize(width,height,false);
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
  }

  animate(){
    if(this.disposed)return;
    this.frame=requestAnimationFrame(()=>this.animate());
    this.renderer?.render(this.scene,this.camera);
    this.updateHotspots();
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.offQuality?.();
    for(const off of this.listeners)off();
    this.listeners.length=0;
    for(const entry of this.hotspotButtons)entry.button.remove();
    this.hotspotButtons.length=0;
    if(this.sphere){
      this.sphere.geometry?.dispose?.();
      this.sphere.material?.dispose?.();
      this.sphere.removeFromParent?.();
    }
    this.texture?.dispose?.();
    this.renderer?.dispose?.();
    this.renderer?.domElement?.remove();
    this.hotspotLayer?.remove();
    this.renderer=null;
    this.scene=null;
    this.camera=null;
    this.sphere=null;
    this.texture=null;
  }
}
