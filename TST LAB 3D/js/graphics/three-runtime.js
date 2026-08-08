import {EnvironmentManager} from './environment-manager.js';
import {SceneMetrics} from './scene-metrics.js';
import {RealismManager} from './realism-manager.js';
import {ContextualDressingManager} from './contextual-dressing-manager.js';
import {ContextPropManager} from './context-prop-manager.js';
import {ScenicPropManager} from './scenic-prop-manager.js';
import {EnvironmentAtmosphereManager} from './environment-atmosphere-manager.js';
let runtimePromise = null;

export function supportsWebGL(){
  try{
    const canvas=document.createElement('canvas');
    return !!(window.WebGL2RenderingContext&&canvas.getContext('webgl2')) || !!canvas.getContext('webgl');
  }catch{return false}
}

export async function loadThreeRuntime(){
  if(!supportsWebGL()) throw new Error('WebGL não está disponível neste dispositivo/navegador.');
  if(!runtimePromise){
    runtimePromise=Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js')
    ]).then(([THREE,controls])=>({THREE,OrbitControls:controls.OrbitControls})).catch(error=>{
      runtimePromise=null;
      throw error;
    });
  }
  return runtimePromise;
}

function disposeMaterial(material){
  if(!material)return;
  for(const value of Object.values(material)){
    if(value&&typeof value==='object'&&value.isTexture)value.dispose?.();
  }
  material.dispose?.();
}

export class ThreeViewport{
  constructor(host,context,options={}){
    this.host=host;
    this.context=context;
    this.options=options;
    this.runtime=null;
    this.scene=null;
    this.camera=null;
    this.renderer=null;
    this.controls=null;
    this.resizeObserver=null;
    this.frame=0;
    this.clock=null;
    this.mixers=[];
    this.animators=[];
    this.pickables=[];
    this.raycaster=null;
    this.pointer=null;
    this.disposed=false;
    this.offQuality=null;
    this.pointerHandler=null;
    this.managedAssets=[];
    this.lastRenderTime=0;
    this.environment=null;
    this.metrics=null;
    this.realism=null;
    this.dressing=null;
    this.contextProps=null;
    this.scenicProps=null;
    this.atmosphere=null;
  }

  async init(){
    this.runtime=await loadThreeRuntime();
    const {THREE,OrbitControls}=this.runtime;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(this.options.background??0x0b1520);
    this.scene.fog=this.options.fog===false?null:new THREE.Fog(this.options.fogColor??0x0b1520,12,32);

    this.camera=new THREE.PerspectiveCamera(48,1,.05,100);
    const cp=this.options.cameraPosition??[4,2.7,5.3];
    this.camera.position.set(...cp);

    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:!!this.options.captureEnabled});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.domElement.className='three-canvas';
    this.renderer.domElement.setAttribute('aria-label',this.options.ariaLabel??'Cena tridimensional interativa');
    this.host.replaceChildren(this.renderer.domElement);

    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.enableDamping=true;
    this.controls.dampingFactor=.07;
    this.controls.enablePan=this.options.enablePan??false;
    this.controls.minDistance=this.options.minDistance??2.2;
    this.controls.maxDistance=this.options.maxDistance??11;
    this.controls.maxPolarAngle=Math.PI*.49;
    const target=this.options.target??[0,1.3,0];
    this.controls.target.set(...target);
    this.controls.update();

    this.clock=new THREE.Clock();
    this.raycaster=new THREE.Raycaster();
    this.pointer=new THREE.Vector2();
    this.metrics=new SceneMetrics(this);
    if(this.options.environmentPreset){this.environment=new EnvironmentManager(this,this.options.environmentPreset)}else this.addDefaultLights();
    this.realism=new RealismManager(this);
    if(this.options.visualProfile)this.dressing=new ContextualDressingManager(this,this.options.visualProfile);
    if(this.options.visualProfile&&this.options.contextProps!==false){
      this.contextProps=new ContextPropManager(this,this.options.visualProfile);
    }
    if(this.options.visualProfile&&this.options.scenicProps!==false){
      this.scenicProps=new ScenicPropManager(this,this.options.visualProfile);
    }
    if(this.options.visualProfile&&this.options.atmosphere!==false){
      const atmosphereProfile=this.options.atmosphereProfile??this.options.visualProfile;
      this.atmosphere=new EnvironmentAtmosphereManager(this,atmosphereProfile);
    }
    this.applyQuality();

    this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();

    this.offQuality=this.context.events.on('quality:changed',()=>this.applyQuality());
    this.pointerHandler=(event)=>this.pick(event);
    this.renderer.domElement.addEventListener('pointerdown',this.pointerHandler);
    this.animate();
    return this;
  }

  addDefaultLights(){
    const {THREE}=this.runtime;
    this.scene.add(new THREE.HemisphereLight(0xc8e6ff,0x30291f,1.45));
    const sun=new THREE.DirectionalLight(0xffffff,2.1);
    sun.position.set(5,8,5);
    sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    sun.shadow.camera.near=.1;
    sun.shadow.camera.far=32;
    sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;
    sun.shadow.bias=-.00018;sun.shadow.normalBias=.025;sun.shadow.radius=2;
    this.scene.add(sun);
    this.sun=sun;
  }

  applyQuality(){
    if(!this.renderer)return;
    const q=this.context.qualityManager.settings;
    const ratio=Math.min(window.devicePixelRatio||1,q.pixelRatioCap||1);
    this.renderer.setPixelRatio(ratio);
    this.renderer.shadowMap.enabled=!!q.shadows;
    this.environment?.applyQuality?.();
    this.realism?.applyQuality?.();
    this.dressing?.applyQuality?.();
    void this.contextProps?.applyQuality?.();
    void this.scenicProps?.applyQuality?.();
    this.atmosphere?.applyQuality?.();
    if(this.sun&&!this.environment){
      const level=this.context.qualityManager.level;
      const size=level==='ultra'?2048:level==='high'?1536:level==='medium'?1024:512;
      if(this.sun.shadow.mapSize.width!==size){
        this.sun.shadow.mapSize.set(size,size);
        this.sun.shadow.map?.dispose?.();
        this.sun.shadow.map=null;
      }
      this.sun.shadow.radius=level==='ultra'?3:level==='high'?2.4:1.4;
      this.sun.shadow.normalBias=level==='eco'?.04:.022;
    }
    this.resize();
  }

  resize(){
    if(!this.renderer||!this.camera)return;
    const width=Math.max(1,this.host.clientWidth);
    const height=Math.max(1,this.host.clientHeight||460);
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height,false);
  }

  addAnimator(fn){if(typeof fn==='function')this.animators.push(fn);return fn}
  addManagedAsset(object){if(!object)return object;this.managedAssets.push(object);this.scene?.add(object);return object}
  addPickable(object,riskId){
    if(!object)return object;
    object.userData.riskId=riskId;
    this.pickables.push(object);
    return object;
  }

  pick(event){
    if(!this.options.onPick||!this.pickables.length)return;
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
    this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hits=this.raycaster.intersectObjects(this.pickables,true);
    const hit=hits.find(item=>{
      let node=item.object;
      while(node){if(node.userData?.riskId)return true;node=node.parent}
      return false;
    });
    if(!hit)return;
    let node=hit.object;
    while(node&&!node.userData?.riskId)node=node.parent;
    if(node?.userData?.riskId)this.options.onPick(node.userData.riskId,node);
  }

  targetFps(){
    const level=this.context.qualityManager.level;
    if(level==='eco')return 30;
    if(level==='medium')return 45;
    return 60;
  }

  animate(timestamp=performance.now()){
    if(this.disposed)return;
    this.frame=requestAnimationFrame(time=>this.animate(time));
    if(document.hidden)return;
    const interval=1000/this.targetFps();
    if(timestamp-this.lastRenderTime<interval)return;
    this.lastRenderTime=timestamp;
    const delta=Math.min(this.clock.getDelta(),.1);
    const elapsed=this.clock.elapsedTime;
    this.controls?.update();
    for(const animator of this.animators)animator({delta,elapsed,viewport:this});
    this.atmosphere?.update?.(elapsed);
    this.realism?.update?.();
    this.renderer?.render(this.scene,this.camera);
    this.metrics?.frame(timestamp);
  }


  capturePng(filename='tst360-cena.png'){
    if(!this.renderer||!this.scene||!this.camera)return false;
    try{
      this.renderer.render(this.scene,this.camera);
      const url=this.renderer.domElement.toDataURL('image/png');
      const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
      return true;
    }catch(error){console.warn('[TST360] Falha ao capturar cena 3D',error);return false}
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.offQuality?.();
    if(this.renderer?.domElement&&this.pointerHandler)this.renderer.domElement.removeEventListener('pointerdown',this.pointerHandler);
    this.controls?.dispose();
    this.environment?.dispose?.();
    this.environment=null;
    this.realism?.dispose?.();
    this.realism=null;
    this.atmosphere?.dispose?.();
    this.atmosphere=null;
    this.scenicProps?.dispose?.();
    this.scenicProps=null;
    this.contextProps?.dispose?.();
    this.contextProps=null;
    this.dressing?.dispose?.();
    this.dressing=null;
    for(const asset of this.managedAssets)this.context.assetManager?.release?.(asset);
    this.managedAssets.length=0;
    this.scene?.traverse(object=>{
      if(object.userData?.__assetManaged||object.userData?.__instancedManaged)return;
      object.geometry?.dispose?.();
      if(Array.isArray(object.material))object.material.forEach(disposeMaterial);
      else disposeMaterial(object.material);
    });
    this.metrics?.dispose?.();
    this.metrics=null;
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
    this.host?.replaceChildren();
    this.animators.length=0;
    this.pickables.length=0;
    this.mixers.length=0;
  }
}
