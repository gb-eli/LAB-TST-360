import {createCharacterController} from './character-controller.js';
import {characterAsset} from './character-pack-registry.js';
import {listCharacterAppearances} from './character-appearance.js';

const DEFAULT_COUNTS={eco:0,medium:2,high:4,ultra:6};
const DEFAULT_SKINNED={eco:0,medium:0,high:2,ultra:3};
const DEFAULT_DISTANCE={eco:0,medium:11,high:16,ultra:22};

export function populationPlanForQuality(level='medium',qualitySettings={},options={}){
  return{
    level,
    count:options.counts?.[level]??qualitySettings.populationCount??DEFAULT_COUNTS[level]??0,
    skinned:options.skinned?.[level]??qualitySettings.skinnedPopulation??DEFAULT_SKINNED[level]??0,
    activeDistance:options.activeDistance?.[level]??qualitySettings.populationActiveDistance??DEFAULT_DISTANCE[level]??0
  };
}

function hashSeed(value='population'){
  let h=2166136261;
  for(const ch of String(value)){
    h^=ch.charCodeAt(0);
    h=Math.imul(h,16777619);
  }
  return h>>>0;
}

function seeded(seed){
  let value=seed>>>0;
  return()=>((value=(value*1664525+1013904223)>>>0)/4294967296);
}

export class CharacterPopulationManager{
  constructor(viewport,options={}){
    this.viewport=viewport;
    this.context=viewport.context;
    this.options=options;
    this.entries=[];
    this.specs=[];
    this.disposed=false;
    this.expanding=null;
    this.lastLevel=null;
    this.seed=hashSeed(options.seed??options.id??'population');
    this.random=seeded(this.seed);
    this.appearances=options.appearances?.length?options.appearances:listCharacterAppearances();
    this.maxDistance=options.maxDistance??28;
    this.hiddenDistance=options.hiddenDistance??this.maxDistance;
    this.viewport.addAnimator(frame=>this.update(frame));
  }

  settings(){
    const level=this.context.qualityManager.level;
    const base=populationPlanForQuality(level,this.context.qualityManager.settings,this.options);
    return this.options.activityDirector?.populationPlan
      ? this.options.activityDirector.populationPlan(base)
      : base;
  }

  async init(specs=[]){
    this.specs=specs.map((spec,index)=>({...spec,index}));
    await this.ensureCount();
    return this;
  }

  appearanceFor(index,spec){
    if(spec.appearance)return spec.appearance;
    if(!this.appearances.length)return 'standard';
    return this.appearances[(index+(this.seed%this.appearances.length))%this.appearances.length];
  }

  currentSkinned(){
    return this.entries.filter(entry=>entry.controller?.kind==='gltf').length;
  }

  specFor(index){
    const base=this.specs[index%Math.max(1,this.specs.length)]??{};
    const cycle=Math.floor(index/Math.max(1,this.specs.length));
    const offset=base.repeatOffset??[0,0,0];
    return{
      ...base,
      x:(base.x??0)+(offset[0]??0)*cycle,
      y:(base.y??0)+(offset[1]??0)*cycle,
      z:(base.z??0)+(offset[2]??0)*cycle
    };
  }

  async addOne(index,settings){
    if(this.disposed||!this.specs.length)return null;
    const spec=this.specFor(index);
    const shouldSkinned=this.currentSkinned()<settings.skinned;
    const phase=(index*.73)+(this.random()*.45);
    const speed=(spec.speed??1)*(0.88+this.random()*.22);
    const controller=await createCharacterController(this.viewport,{
      x:spec.x??0,y:spec.y??0,z:spec.z??0,
      rotationY:spec.rotationY??0,
      scale:spec.scale??.82,
      initial:spec.state??'idle',
      pose:spec.state??'idle',
      speed,
      helmet:spec.helmet??true,
      vest:spec.vest??false,
      appearance:this.appearanceFor(index,spec),
      asset:shouldSkinned?characterAsset(spec.role??'worker'):undefined
    });
    if(this.disposed){
      controller.dispose();
      return null;
    }
    if(controller.mixer&&phase>0)controller.mixer.setTime?.(phase);
    const entry={
      index,
      controller,
      spec,
      phase,
      active:true,
      visible:true,
      source:controller.info().packId??controller.info().kind,
      base:{x:controller.root.position.x,y:controller.root.position.y,z:controller.root.position.z}
    };
    this.entries.push(entry);
    return entry;
  }

  async ensureCount(){
    if(this.disposed||this.expanding)return this.expanding;
    if(!this.specs.length)return null;
    const settings=this.settings();
    const desired=Math.min(settings.count,this.options.maxCount??6,this.specs.length);
    if(this.entries.length>=desired)return null;
    this.expanding=(async()=>{
      while(!this.disposed&&this.entries.length<desired){
        await this.addOne(this.entries.length,settings);
      }
    })();
    try{await this.expanding}finally{this.expanding=null}
    return null;
  }

  distanceToCamera(root){
    const camera=this.viewport.camera;
    if(!camera||!root)return 0;
    const dx=root.position.x-camera.position.x;
    const dy=root.position.y-camera.position.y;
    const dz=root.position.z-camera.position.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
  }

  animateEntry(entry,delta,elapsed){
    const patrol=entry.spec.patrol;
    if(patrol){
      const amplitude=patrol.amplitude??.45;
      const speed=patrol.speed??.28;
      const value=Math.sin((elapsed+entry.phase)*speed)*amplitude;
      const axis=patrol.axis??'x';
      entry.controller.root.position[axis]=entry.base[axis]+value;
      if(patrol.rotate!==false){
        const sign=Math.cos((elapsed+entry.phase)*speed)>=0?1:-1;
        entry.controller.root.rotation.y=(entry.spec.rotationY??0)+(sign<0?Math.PI:0);
      }
    }
    entry.controller.update(delta,elapsed+entry.phase);
  }

  update({delta,elapsed}){
    if(this.disposed)return;
    const settings=this.settings();
    if(this.lastLevel!==settings.level){
      this.lastLevel=settings.level;
      void this.ensureCount();
    }

    const desired=Math.min(settings.count,this.options.maxCount??6);
    const renderDistance=settings.activeDistance>0
      ? Math.min(this.hiddenDistance,settings.activeDistance+(this.options.renderMargin??6))
      : 0;
    for(const entry of this.entries){
      const allowed=entry.index<desired;
      const distance=this.distanceToCamera(entry.controller.root);
      const visible=allowed&&distance<=renderDistance;
      const active=visible&&settings.activeDistance>0&&distance<=settings.activeDistance;

      entry.controller.root.visible=visible;
      if(entry.controller.contactShadow)entry.controller.contactShadow.visible=visible&&settings.level!=='eco';

      if(active&&!entry.active){entry.controller.resume();entry.active=true}
      if(!active&&entry.active){entry.controller.pause();entry.active=false}
      entry.visible=visible;

      if(active)this.animateEntry(entry,delta,elapsed);
    }
  }

  stats(){
    return{
      created:this.entries.length,
      visible:this.entries.filter(x=>x.visible).length,
      active:this.entries.filter(x=>x.active&&x.visible).length,
      skinned:this.entries.filter(x=>x.controller.kind==='gltf').length,
      procedural:this.entries.filter(x=>x.controller.kind==='procedural').length,
      level:this.context.qualityManager.level
    };
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    for(const entry of this.entries)entry.controller.dispose();
    this.entries.length=0;
    this.specs.length=0;
  }
}

export async function createCharacterPopulation(viewport,specs=[],options={}){
  const manager=new CharacterPopulationManager(viewport,options);
  await manager.init(specs);
  return manager;
}
